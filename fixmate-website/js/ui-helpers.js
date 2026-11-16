// FixMate – Shared UI/UX Helpers (Pure Vanilla JavaScript)
// Provides consistent form validation state, submit/double-click guards, and accessible modal focus management.

const lastFocusedMap = new WeakMap();
const activeTrapMap = new WeakMap();

export function setFieldValidation(inputEl, errorEl, message) {
  const hasError = Boolean(message);
  if (errorEl) {
    errorEl.textContent = message || '';
  }
  if (inputEl) {
    inputEl.classList.toggle('is-invalid', hasError);
    if (hasError) {
      inputEl.setAttribute('aria-invalid', 'true');
    } else {
      inputEl.removeAttribute('aria-invalid');
    }
  }
}

export function clearFieldValidation(inputEl, errorEl) {
  setFieldValidation(inputEl, errorEl, '');
}

export function focusFirstInvalid(rootEl) {
  if (!rootEl) return;
  const firstInvalid = rootEl.querySelector(
    '.is-invalid, [aria-invalid="true"]'
  );
  if (firstInvalid && typeof firstInvalid.focus === 'function') {
    firstInvalid.focus();
  }
}

export function showFeedbackBanner(boxEl, message, tone = 'success') {
  if (!boxEl) return;
  boxEl.textContent = message;
  boxEl.classList.remove('is-success', 'is-error', 'is-warning');
  if (tone === 'error') {
    boxEl.classList.add('is-error');
  } else if (tone === 'warning') {
    boxEl.classList.add('is-warning');
  } else {
    boxEl.classList.add('is-success');
  }
  boxEl.hidden = false;
}

export function hideFeedbackBanner(boxEl) {
  if (!boxEl) return;
  boxEl.hidden = true;
  boxEl.textContent = '';
  boxEl.classList.remove('is-success', 'is-error', 'is-warning');
}

export function runWithSubmitGuard(btn, processingText, taskFn, delayMs = 240) {
  if (!btn) {
    return Promise.resolve(taskFn());
  }
  if (btn.dataset.busy === 'true') {
    return Promise.resolve(null);
  }

  btn.dataset.busy = 'true';
  const originalText = btn.textContent;
  const wasDisabled = btn.disabled;

  btn.disabled = true;
  btn.classList.add('is-loading');
  btn.setAttribute('aria-busy', 'true');
  if (processingText) {
    btn.textContent = processingText;
  }

  return new Promise((resolve) => {
    window.setTimeout(() => {
      let result = null;
      try {
        result = taskFn();
      } finally {
        delete btn.dataset.busy;
        btn.classList.remove('is-loading');
        btn.removeAttribute('aria-busy');
        btn.disabled = wasDisabled;
        btn.textContent = originalText;
      }
      resolve(result);
    }, delayMs);
  });
}

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => !el.hidden && el.offsetParent !== null);
}

export function openDialogModal(modalEl, preferredFocusEl = null) {
  if (!modalEl) return;
  if (!lastFocusedMap.has(modalEl) && document.activeElement instanceof HTMLElement) {
    lastFocusedMap.set(modalEl, document.activeElement);
  }

  modalEl.hidden = false;
  document.body.style.overflow = 'hidden';

  if (!activeTrapMap.has(modalEl)) {
    const trapHandler = (event) => {
      if (event.key !== 'Tab' || modalEl.hidden) return;
      const focusables = getFocusableElements(modalEl);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    modalEl.addEventListener('keydown', trapHandler);
    activeTrapMap.set(modalEl, trapHandler);
  }

  window.requestAnimationFrame(() => {
    if (preferredFocusEl && typeof preferredFocusEl.focus === 'function') {
      preferredFocusEl.focus();
      return;
    }
    const focusables = getFocusableElements(modalEl);
    if (focusables.length > 0) {
      focusables[0].focus();
    }
  });
}

export function closeDialogModal(modalEl) {
  if (!modalEl || modalEl.hidden) return;
  modalEl.hidden = true;

  const anyOpenModal = document.querySelector('.modal-backdrop:not([hidden])');
  if (!anyOpenModal) {
    document.body.style.overflow = '';
  }

  const previousTrigger = lastFocusedMap.get(modalEl);
  lastFocusedMap.delete(modalEl);
  if (previousTrigger && typeof previousTrigger.focus === 'function') {
    previousTrigger.focus();
  }
}
