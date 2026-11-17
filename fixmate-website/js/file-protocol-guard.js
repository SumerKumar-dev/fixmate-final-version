(() => {
  const params = new URLSearchParams(window.location.search);
  const hadSensitiveParams = params.has('password') || params.has('identifier');
  if (hadSensitiveParams) {
    params.delete('password');
    params.delete('identifier');
    const query = params.toString();
    const safeUrl = `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`;
    try {
      window.history.replaceState(null, document.title, safeUrl);
    } catch {
      window.location.replace(safeUrl);
    }
  }

  const forms = [...document.querySelectorAll('form')];
  if (window.location.protocol === 'file:') {
    forms.forEach((form) => {
      form.addEventListener(
        'submit',
        (event) => {
          event.preventDefault();
          event.stopImmediatePropagation();
        },
        true
      );
    });

    const feedback =
      document.getElementById('loginFeedback') ||
      document.getElementById('registerFeedback');
    if (feedback) {
      feedback.textContent =
        'FixMate was opened as a local file, so Chrome blocks its JavaScript modules. Open the project with VS Code Live Server at a localhost address before signing in or registering.';
      feedback.classList.add('is-warning');
      feedback.hidden = false;
    }
    return;
  }

  let modulesReady = false;
  let modulesFailed = false;
  forms.forEach((form) => {
    let submitQueued = false;
    form.addEventListener(
      'submit',
      (event) => {
        if (modulesReady) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (modulesFailed || submitQueued) return;
        submitQueued = true;
        const submitter = event.submitter;
        moduleLoad.then(() => {
          submitQueued = false;
          if (!modulesReady || !form.isConnected) return;
          if (submitter) form.requestSubmit(submitter);
          else form.requestSubmit();
        });
      },
      true
    );
  });

  const feedback =
    document.getElementById('loginFeedback') ||
    document.getElementById('registerFeedback');
  const moduleLoad = import('./auth-session.js')
    .then(() => import('./auth.js'))
    .then(() => {
      modulesReady = true;
    })
    .catch((error) => {
      modulesFailed = true;
      if (feedback) {
        feedback.textContent =
          'FixMate could not load its authentication scripts. Open this page from a localhost or HTTPS address and reload.';
        feedback.classList.add('is-error');
        feedback.hidden = false;
      }
      console.error('FixMate authentication modules failed to load.', error);
    });
})();
