/**
 * Find Your West Michigan Fit: client-side only. Nothing is sent anywhere while answering.
 * Without JavaScript the questions simply remain visible and a <noscript> note explains alternatives.
 */
import { fitQuestions } from '../data/locationFit';
import { computeFit, missingRequired, toSearchParams, type Answers } from '../utils/fit';

const form = document.querySelector<HTMLFormElement>('#fit-form');
if (form) init(form);

function init(form: HTMLFormElement) {
  const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-step]'));
  const nav = form.querySelector<HTMLElement>('[data-nav]')!;
  const progressWrap = form.querySelector<HTMLElement>('[data-progress-wrap]')!;
  const progress = form.querySelector<HTMLElement>('[data-progress]')!;
  const bar = form.querySelector<HTMLElement>('[data-bar]')!;
  const error = form.querySelector<HTMLElement>('[data-error]')!;
  const back = form.querySelector<HTMLButtonElement>('[data-back]')!;
  const next = form.querySelector<HTMLButtonElement>('[data-next]')!;
  const results = document.querySelector<HTMLElement>('#fit-results')!;
  let current = 0;

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

  function show(index: number, moveFocus = true) {
    current = Math.max(0, Math.min(index, steps.length - 1));
    steps.forEach((s, i) => (s.hidden = i !== current));
    progress.textContent = `Question ${current + 1} of ${steps.length}`;
    bar.style.width = `${((current + 1) / steps.length) * 100}%`;
    back.hidden = current === 0;
    next.textContent = current === steps.length - 1 ? 'Show my results' : 'Next';
    error.hidden = true;
    if (moveFocus) steps[current].querySelector<HTMLElement>('legend')?.focus();
  }

  // Limit multi-select questions to their maximum.
  form.addEventListener('change', (e) => {
    const input = e.target as HTMLInputElement;
    if (input.type !== 'checkbox') return;
    const max = Number(input.dataset.max || 3);
    const group = Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${input.name}"]`));
    const count = group.filter((g) => g.checked).length;
    group.forEach((g) => (g.disabled = !g.checked && count >= max));
    error.hidden = true;
  });

  back.addEventListener('click', () => show(current - 1));

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Enter on a radio advances, like Next.
    const q = fitQuestions[current];
    const answers = readAnswers();
    if (q.required && missingRequired({ [q.id]: answers[q.id] }, [q]).length) {
      error.textContent = 'Please choose an answer to continue.';
      error.hidden = false;
      steps[current].querySelector<HTMLElement>('input:not(:disabled)')?.focus();
      return;
    }
    if (current < steps.length - 1) show(current + 1);
    else showResults(answers);
  });

  results.querySelector('[data-edit]')?.addEventListener('click', () => {
    results.hidden = true;
    form.hidden = false;
    show(0);
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  function showResults(answers: Answers) {
    const outcome = computeFit(answers);
    const cards = results.querySelector<HTMLElement>('[data-cards]')!;
    const template = document.querySelector<HTMLTemplateElement>('#fit-card-template')!;
    cards.replaceChildren();

    for (const r of outcome.results) {
      const node = template.content.cloneNode(true) as DocumentFragment;
      const card = node.querySelector<HTMLElement>('[data-card]')!;
      if (r.rank === 1) card.classList.add('fit-card--lead');
      node.querySelector('[data-rank]')!.textContent = r.rank === 1 ? 'Strongest fit' : 'Also worth exploring';
      node.querySelector('[data-name]')!.textContent = r.name;
      node.querySelector('[data-why]')!.textContent = r.explanation;
      fill(node.querySelector('[data-matches]')!, r.matches, node.querySelector('[data-matches-block]')!);
      fill(node.querySelector('[data-considerations]')!, r.considerations, node.querySelector('[data-considerations-block]')!);
      const link = node.querySelector<HTMLAnchorElement>('[data-link]')!;
      link.href = `/communities/${r.slug}/`;
      link.textContent = `Read my ${r.name} guide`;
      cards.append(node);
    }

    results.querySelector<HTMLElement>('[data-lakes]')!.hidden = !outcome.showRockfordLakes;
    results.querySelector<HTMLElement>('[data-water-note]')!.hidden = !outcome.waterPriority;
    results.querySelector<HTMLAnchorElement>('[data-search-link]')!.href = `/home-search/?${toSearchParams(answers, outcome).toString()}`;

    form.hidden = true;
    results.hidden = false;
    results.querySelector<HTMLElement>('h2')?.focus();
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  show(0, false);
}

function fill(list: Element, items: string[], block: Element) {
  list.replaceChildren(
    ...items.map((text) => {
      const li = document.createElement('li');
      li.textContent = text.charAt(0).toUpperCase() + text.slice(1);
      return li;
    }),
  );
  (block as HTMLElement).hidden = items.length === 0;
}
