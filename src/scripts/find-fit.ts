/**
 * Find Your West Michigan Fit: client-side only. Nothing is sent anywhere while answering.
 * Branching: the water-setting question appears only when water is a top priority. Progress and Back
 * follow the questions the visitor actually sees. Without JavaScript the questions remain visible and a
 * <noscript> note explains alternatives.
 */
import { fitQuestions } from '../data/locationFit';
import { computeFit, toSearchParams, visibleQuestions, type Answers, type FitResult } from '../utils/fit';

const form = document.querySelector<HTMLFormElement>('#fit-form');
if (form) init(form);

function init(form: HTMLFormElement) {
  const steps = new Map(
    Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-step]')).map((el) => [el.dataset.step!, el]),
  );
  const nav = form.querySelector<HTMLElement>('[data-nav]')!;
  const progressWrap = form.querySelector<HTMLElement>('[data-progress-wrap]')!;
  const progress = form.querySelector<HTMLElement>('[data-progress]')!;
  const bar = form.querySelector<HTMLElement>('[data-bar]')!;
  const error = form.querySelector<HTMLElement>('[data-error]')!;
  const back = form.querySelector<HTMLButtonElement>('[data-back]')!;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const results = document.querySelector<HTMLElement>('#fit-results')!;

  /** Questions actually visited, in order, so Back retraces the visitor's real path. */
  let history: string[] = [];
  let current = fitQuestions[0].id;

  nav.hidden = false;
  progressWrap.hidden = false;

  function readAnswers(): Answers {
    const answers: Answers = {};
    for (const q of fitQuestions) {
      const checked = Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${q.id}"]:checked`)).map((i) => i.value);
      answers[q.id] = q.type === 'multi' ? checked : checked[0];
    }
    return answers;
  }

  const visibleIds = () => visibleQuestions(readAnswers()).map((q) => q.id);

  function updateProgress() {
    const ids = visibleIds();
    const n = Math.max(ids.indexOf(current), 0) + 1;
    progress.textContent = `Question ${n} of ${ids.length}`;
    bar.style.width = `${(n / ids.length) * 100}%`;
    next.textContent = ids[ids.length - 1] === current ? 'Show my results' : 'Next';
  }

  function show(id: string, moveFocus = true) {
    current = id;
    steps.forEach((el, key) => (el.hidden = key !== id));
    back.hidden = history.length === 0;
    error.hidden = true;
    updateProgress();
    if (moveFocus) steps.get(id)?.querySelector<HTMLElement>('legend')?.focus();
  }

  form.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    error.hidden = true;
    if (input.type === 'checkbox') {
      const max = Number(input.dataset.max || 3);
      const group = Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${input.name}"]`));
      const count = group.filter((g) => g.checked).length;
      group.forEach((g) => (g.disabled = !g.checked && count >= max));
    }
    // If water is no longer a priority, clear the branch so a stale answer can't linger.
    if (input.name === 'priorities' && !visibleIds().includes('water_type')) {
      form.querySelectorAll<HTMLInputElement>('input[name="water_type"]').forEach((r) => (r.checked = false));
    }
    updateProgress();
  });

  back.addEventListener('click', () => {
    const previous = history.pop();
    if (previous) show(previous);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Enter on a choice advances, like Next.
    const answers = readAnswers();
    const q = fitQuestions.find((x) => x.id === current)!;
    const answered = ([] as string[]).concat(answers[current] ?? []).length > 0;
    if (q.required && !answered) {
      error.textContent = q.type === 'multi' ? 'Please choose at least one to continue.' : 'Please choose an answer to continue.';
      error.hidden = false;
      steps.get(current)?.querySelector<HTMLElement>('input:not(:disabled)')?.focus();
      return;
    }
    const ids = visibleIds();
    const nextId = ids[ids.indexOf(current) + 1];
    if (nextId) {
      history.push(current);
      show(nextId);
    } else {
      showResults(answers);
    }
  });

  results.querySelector('[data-edit]')?.addEventListener('click', () => {
    results.hidden = true;
    form.hidden = false;
    history = [];
    show(fitQuestions[0].id);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function showResults(answers: Answers) {
    const outcome = computeFit(answers);
    const cards = results.querySelector<HTMLElement>('[data-cards]')!;
    const template = document.querySelector<HTMLTemplateElement>('#fit-card-template')!;
    cards.replaceChildren(...outcome.results.map((r) => renderCard(template, r, answers, outcome)));

    results.querySelector<HTMLElement>('[data-lakes]')!.hidden = !outcome.showRockfordLakes;
    results.querySelector<HTMLElement>('[data-water-note]')!.hidden = !outcome.waterPriority;
    results.querySelector<HTMLAnchorElement>('[data-search-link]')!.href = `/home-search/?${toSearchParams(answers, outcome).toString()}`;

    form.hidden = true;
    results.hidden = false;
    results.querySelector<HTMLElement>('h2')?.focus();
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  show(current, false);
}

function renderCard(
  template: HTMLTemplateElement,
  r: FitResult,
  answers: Answers,
  outcome: ReturnType<typeof computeFit>,
): DocumentFragment {
  const node = template.content.cloneNode(true) as DocumentFragment;
  const card = node.querySelector<HTMLElement>('[data-card]')!;
  card.dataset.community = r.slug;
  if (r.rank === 1) card.classList.add('fit-card--lead');
  node.querySelector('[data-name]')!.textContent = r.name;
  node.querySelector('[data-pos]')!.textContent = `— ${r.position.toLowerCase()}`;
  node.querySelector('[data-summary]')!.textContent = r.explanation;

  node.querySelector('[data-why]')!.replaceChildren(
    ...r.why.map((w) => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = `${w.lead}: `;
      li.append(strong, document.createTextNode(w.text));
      return li;
    }),
  );
  node.querySelector('[data-know]')!.replaceChildren(
    ...r.know.map((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }),
  );
  node.querySelector('[data-tour]')!.textContent = r.tour;

  const search = node.querySelector<HTMLAnchorElement>('[data-search]')!;
  search.href = `/home-search/?${toSearchParams(answers, outcome, r.slug).toString()}`;
  search.textContent = `Send me homes that fit ${r.name}`;

  const link = node.querySelector<HTMLAnchorElement>('[data-link]')!;
  link.href = `/communities/${r.slug}/`;
  link.textContent = `Read my ${r.name} guide`;
  return node;
}
