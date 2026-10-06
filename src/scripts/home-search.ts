/**
 * Pre-populates the saved-search form from URL parameters (from /find-your-fit/ or a lake/community CTA).
 * Parameters carry preference selections only. Every value is checked against a whitelist before use,
 * so arbitrary text in a link can never end up in a submission.
 */
import { communities } from '../data/communities';
import { lakes } from '../data/lakes';
import { fitQuestions } from '../data/locationFit';

const form = document.querySelector<HTMLFormElement>('#search-form');
if (form) prefill(form);

function list(value: string | null): string[] {
  return (value ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function prefill(form: HTMLFormElement) {
  const params = new URLSearchParams(window.location.search);
  const context: string[] = [];

  const communitySlugs = [...list(params.get('community')), ...list(params.get('communities'))].filter((s) =>
    communities.some((c) => c.slug === s),
  );
  const lakeSlugs = [...list(params.get('lake')), ...list(params.get('lakes'))].filter((s) => lakes.some((l) => l.slug === s));
  // Choosing a lake implies its community (Rockford).
  if (lakeSlugs.length && !communitySlugs.includes('rockford')) communitySlugs.push('rockford');

  const fitPrimary = list(params.get('fit_primary')).filter((s) => communities.some((c) => c.slug === s));
  const fitSecondary = list(params.get('fit_secondary')).filter((s) => communities.some((c) => c.slug === s));
  const fromFit = params.get('from') === 'fit' && fitPrimary.length > 0;

  // Communities: lake/community selection, plus fit results when coming from Find Your Fit.
  const toCheck = new Set<string>(communitySlugs);
  if (fromFit) [...fitPrimary, ...fitSecondary].forEach((s) => toCheck.add(s));
  check(form, 'communities', toCheck);
  check(form, 'lakes', new Set(lakeSlugs));

  const nameOf = (slug: string) => communities.find((c) => c.slug === slug)?.name ?? slug;
  if (lakeSlugs.length) {
    context.push(`Lake interest: ${lakeSlugs.map((s) => lakes.find((l) => l.slug === s)?.name).join(', ')}`);
  } else if (communitySlugs.length && !fromFit) {
    context.push(`Community interest: ${communitySlugs.map(nameOf).join(', ')}`);
  }

  // Fit answers -> hidden fields (human readable summary + raw keys).
  const summary: string[] = [];
  if (fromFit) {
    setHidden(form, 'search_source', 'find_your_fit');
    setHidden(form, 'fit_primary', fitPrimary.map(nameOf).join(', '));
    if (fitSecondary.length) setHidden(form, 'fit_secondary', fitSecondary.map(nameOf).join(', '));
    context.push(`Strongest fit: ${fitPrimary.map(nameOf).join(', ')}`);
    if (fitSecondary.length) context.push(`Also worth exploring: ${fitSecondary.map(nameOf).join(', ')}`);

    for (const q of fitQuestions) {
      const chosen = list(params.get(q.formField)).filter((v) => q.options.some((o) => o.value === v));
      if (!chosen.length) continue;
      setHidden(form, q.formField, chosen.join(','));
      const labels = chosen.map((v) => q.options.find((o) => o.value === v)!.label);
      summary.push(`${q.prompt} ${labels.join('; ')}`);
      if (q.id === 'water') context.push(`Water: ${labels[0]}`);
    }
    setHidden(form, 'fit_summary', summary.join(' | '));
  } else if (lakeSlugs.length) {
    setHidden(form, 'search_source', 'lake_page');
  } else if (communitySlugs.length) {
    setHidden(form, 'search_source', 'community_page');
  }

  // Waterfront preference.
  const waterfront = form.querySelector<HTMLSelectElement>('#search-waterfront');
  if (waterfront) {
    const answer = list(params.get('water_priority'))[0];
    const map: Record<string, string> = {
      waterfront: 'Strongly preferred',
      nearby: 'Open to nearby',
      nice: 'Open to nearby',
      not_important: 'Not necessary',
    };
    const value = (fromFit && map[answer]) || (lakeSlugs.length ? 'Strongly preferred' : '');
    if (value) waterfront.value = value;
  }

  if (context.length) {
    const box = document.querySelector<HTMLElement>('[data-context]');
    const ul = document.querySelector<HTMLElement>('[data-context-list]');
    if (box && ul) {
      ul.replaceChildren(
        ...context.map((text) => {
          const li = document.createElement('li');
          li.textContent = text;
          return li;
        }),
      );
      box.hidden = false;
    }
  }
}

function check(form: HTMLFormElement, name: string, slugs: Set<string>) {
  form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`).forEach((input) => {
    if (slugs.has(input.dataset.slug ?? '')) input.checked = true;
  });
}

function setHidden(form: HTMLFormElement, name: string, value: string) {
  const input = form.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`);
  if (!input) return;
  input.value = value;
  input.disabled = false;
}
