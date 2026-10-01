/**
 * Progressive enhancement for the site's HTML forms.
 *
 * Without JavaScript, each form is a normal HTML POST (to the configured endpoint) or a mailto: form.
 * With JavaScript we add: accessible validation, submit-state feedback, in-page error handling and a
 * redirect to the thank-you page. Nothing here is required for the form to work.
 */

const form_selector = 'form[data-enhanced-form]';

function fieldOf(el: Element): HTMLElement | null {
  return el.closest('[data-field]');
}

function clearErrors(form: HTMLFormElement, summary: HTMLElement | null) {
  form.querySelectorAll<HTMLElement>('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  form.querySelectorAll<HTMLElement>('[data-error]').forEach((el) => {
    el.hidden = true;
    el.textContent = '';
  });
  if (summary) {
    summary.hidden = true;
    summary.querySelector('ul')?.replaceChildren();
  }
}

function labelText(el: HTMLElement): string {
  const field = fieldOf(el);
  const raw = field?.querySelector('label, legend')?.textContent ?? el.getAttribute('name') ?? 'This field';
  return raw.replace(/\*|\(optional\)/g, '').trim();
}

function validate(form: HTMLFormElement, summary: HTMLElement | null): boolean {
  clearErrors(form, summary);
  const invalid = Array.from(form.elements).filter(
    (el): el is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement =>
      'checkValidity' in el && 'willValidate' in el && (el as HTMLInputElement).willValidate && !(el as HTMLInputElement).checkValidity(),
  );
  if (invalid.length === 0) return true;

  const list = summary?.querySelector('ul');
  invalid.forEach((el, i) => {
    el.setAttribute('aria-invalid', 'true');
    const label = labelText(el);
    let message = `${label} is required.`;
    if (el.validity.typeMismatch && el.type === 'email') message = 'Please enter a valid email address.';
    else if (el.type === 'checkbox') message = `Please confirm: ${label}`;
    const slot = fieldOf(el)?.querySelector<HTMLElement>('[data-error]');
    if (slot) {
      slot.id ||= `${el.id || el.name}-error`;
      slot.textContent = message;
      slot.hidden = false;
      el.setAttribute('aria-describedby', [el.getAttribute('aria-describedby'), slot.id].filter(Boolean).join(' '));
    }
    if (list) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${el.id}`;
      a.textContent = message;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        el.focus();
      });
      li.append(a);
      list.append(li);
    }
    void i;
  });
  if (summary) {
    summary.hidden = false;
    summary.focus();
  } else {
    invalid[0].focus();
  }
  return false;
}

function setStatus(form: HTMLFormElement, kind: 'error' | 'info', html: string) {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  if (!status) return;
  status.dataset.kind = kind;
  status.hidden = false;
  status.innerHTML = html;
}

function setBusy(form: HTMLFormElement, busy: boolean) {
  const button = form.querySelector<HTMLButtonElement>('[data-submit]');
  if (!button) return;
  button.disabled = busy;
  button.setAttribute('aria-disabled', String(busy));
  const idle = button.dataset.idleLabel ?? button.textContent ?? '';
  button.dataset.idleLabel = idle;
  button.textContent = busy ? (button.dataset.busyLabel ?? 'Sending…') : idle;
}

function buildMailto(form: HTMLFormElement): string {
  const to = form.dataset.mailto ?? '';
  const subject = form.dataset.subject ?? 'Website message';
  const data = new FormData(form);
  const lines: string[] = [];
  data.forEach((value, key) => {
    if (key.startsWith('_') || key === 'form_type' || typeof value !== 'string' || !value.trim()) return;
    const field = form.querySelector<HTMLElement>(`[name="${key}"]`);
    const label = field ? labelText(field) : key;
    lines.push(`${label}: ${value.trim()}`);
  });
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n\n'))}`;
}

function init(form: HTMLFormElement) {
  const summary = form.querySelector<HTMLElement>('[data-error-summary]');
  form.noValidate = true; // we show our own accessible messages

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const status = form.querySelector<HTMLElement>('[data-form-status]');
    if (status) status.hidden = true;

    if (!validate(form, summary)) return;

    // Honeypot: real people never see or fill this. Pretend success, send nothing.
    const trap = form.querySelector<HTMLInputElement>('input[name="_gotcha"]');
    if (trap && trap.value) {
      window.location.assign(form.dataset.thanks ?? '/thank-you/');
      return;
    }

    if (form.dataset.mode === 'mailto') {
      setStatus(
        form,
        'info',
        `Your email app should open with your message ready to send. If it doesn’t, please email <a href="mailto:${form.dataset.mailto}">${form.dataset.mailto}</a> directly.`,
      );
      window.location.href = buildMailto(form);
      return;
    }

    setBusy(form, true);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      if (response.ok) {
        window.location.assign(form.dataset.thanks ?? '/thank-you/');
        return;
      }
      let detail = '';
      try {
        const json = await response.json();
        detail = json?.errors?.map((e: { message: string }) => e.message).join(' ') ?? '';
      } catch {
        /* ignore */
      }
      throw new Error(detail || `Request failed (${response.status})`);
    } catch {
      setBusy(form, false);
      setStatus(
        form,
        'error',
        `Sorry, your message could not be sent. Nothing was lost on your end, so please try again, or email <a href="mailto:${form.dataset.mailto}">${form.dataset.mailto}</a> directly.`,
      );
      form.querySelector<HTMLElement>('[data-form-status]')?.focus();
    }
  });
}

document.querySelectorAll<HTMLFormElement>(form_selector).forEach(init);
