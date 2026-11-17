// FixMate – Login & Registration Frontend Validation (Pure Vanilla JavaScript)
// Note: Frontend validation only. No passwords are stored in localStorage or sessionStorage.
import {
  closeDialogModal,
  focusFirstInvalid,
  hideFeedbackBanner,
  openDialogModal,
  runWithSubmitGuard,
  setFieldValidation,
  showFeedbackBanner,
} from './ui-helpers.js';
import { saveDemoSession } from './auth-session.js';

document.addEventListener('DOMContentLoaded', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
  const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

  // Set current copyright year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // =========================================================================
  // 1. Mobile Navigation Drawer
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function setMobileDrawer(open) {
    if (!mobileMenuBtn || !mobileDrawer) return;
    mobileDrawer.hidden = !open;
    mobileMenuBtn.setAttribute('aria-expanded', String(open));
    mobileMenuBtn.setAttribute(
      'aria-label',
      open ? 'Close navigation menu' : 'Open navigation menu'
    );
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      setMobileDrawer(!isOpen);
    });
  }

  mobileNavLinks.forEach((link) => {
    link.addEventListener('click', () => setMobileDrawer(false));
  });

  // =========================================================================
  // 2. Show / Hide Password Toggles
  // =========================================================================
  document.querySelectorAll('[data-toggle-password]').forEach((toggleBtn) => {
    toggleBtn.addEventListener('click', () => {
      const targetId = toggleBtn.getAttribute('data-toggle-password');
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;

      const isHidden = input.type === 'password';
      input.type = isHidden ? 'text' : 'password';
      toggleBtn.setAttribute('aria-pressed', String(isHidden));
      toggleBtn.setAttribute(
        'aria-label',
        isHidden ? 'Hide password' : 'Show password'
      );

      const eyeIcon = toggleBtn.querySelector('.icon-eye');
      const eyeOffIcon = toggleBtn.querySelector('.icon-eye-off');
      if (eyeIcon && eyeOffIcon) {
        eyeIcon.hidden = isHidden;
        eyeOffIcon.hidden = !isHidden;
      }
    });
  });

  // Helper functions for field errors & feedback
  function setFieldError(inputEl, errorEl, message) {
    setFieldValidation(inputEl, errorEl, message);
  }

  function showFeedback(boxEl, message, isSuccess) {
    showFeedbackBanner(boxEl, message, isSuccess ? 'success' : 'error');
  }

  function hideFeedback(boxEl) {
    hideFeedbackBanner(boxEl);
  }

  function isValidEmailOrIndianPhone(value) {
    const cleaned = value.trim();
    return EMAIL_REGEX.test(cleaned) || INDIAN_PHONE_REGEX.test(cleaned);
  }

  // =========================================================================
  // 3. Login Page Logic (login.html)
  // =========================================================================
  const loginForm = document.getElementById('loginForm');
  const loginIdentifier = document.getElementById('loginIdentifier');
  const loginPassword = document.getElementById('loginPassword');
  const loginRole = document.getElementById('loginRole');
  const loginProviderGroup = document.getElementById('loginProviderGroup');
  const loginProviderId = document.getElementById('loginProviderId');
  const loginProviderError = document.getElementById('loginProviderError');
  const loginIdentifierError = document.getElementById('loginIdentifierError');
  const loginPasswordError = document.getElementById('loginPasswordError');
  const loginFeedback = document.getElementById('loginFeedback');

  if (loginRole && loginProviderGroup) {
    loginRole.addEventListener('change', () => {
      const isProvider = loginRole.value === 'Service Provider';
      loginProviderGroup.hidden = !isProvider;
      if (!isProvider) setFieldError(loginProviderId, loginProviderError, '');
    });
  }

  if (loginIdentifier) {
    loginIdentifier.addEventListener('input', () => {
      setFieldError(loginIdentifier, loginIdentifierError, '');
      hideFeedback(loginFeedback);
    });
  }

  if (loginPassword) {
    loginPassword.addEventListener('input', () => {
      setFieldError(loginPassword, loginPasswordError, '');
      hideFeedback(loginFeedback);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
      event.preventDefault();
      hideFeedback(loginFeedback);

      const identifierVal = loginIdentifier ? loginIdentifier.value.trim() : '';
      const passwordVal = loginPassword ? loginPassword.value : '';
      let isValid = true;

      if (!identifierVal) {
        setFieldError(
          loginIdentifier,
          loginIdentifierError,
          'Please enter your email address or 10-digit mobile number.'
        );
        isValid = false;
      } else if (!isValidEmailOrIndianPhone(identifierVal)) {
        setFieldError(
          loginIdentifier,
          loginIdentifierError,
          'Enter a valid email or 10-digit Indian mobile number (starting with 6–9).'
        );
        isValid = false;
      } else {
        setFieldError(loginIdentifier, loginIdentifierError, '');
      }

      if (!passwordVal) {
        setFieldError(loginPassword, loginPasswordError, 'Please enter your password.');
        isValid = false;
      } else if (passwordVal.length < 8) {
        setFieldError(
          loginPassword,
          loginPasswordError,
          'Password must be at least 8 characters long.'
        );
        isValid = false;
      } else {
        setFieldError(loginPassword, loginPasswordError, '');
      }

      if (!isValid) {
        showFeedback(loginFeedback, 'Please fix the highlighted fields above and try again.', false);
        focusFirstInvalid(loginForm);
        return;
      }

      const role = loginRole ? loginRole.value : 'Customer';
      const providerId = loginProviderId ? loginProviderId.value : '';
      if (role === 'Service Provider' && !providerId) {
        setFieldError(loginProviderId, loginProviderError, 'Choose a provider profile to continue.');
        return;
      }

      const submitBtn = loginForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Signing In...', () => {
        const normalizedIdentifier = identifierVal.toLowerCase();
        const displayName = normalizedIdentifier.includes('@')
          ? normalizedIdentifier
              .split('@')[0]
              .split(/[._-]+/)
              .filter(Boolean)
              .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
              .join(' ')
          : 'Customer';

        try {
          saveDemoSession({
            id:
              role === 'Customer'
                ? normalizedIdentifier.includes('@')
                  ? normalizedIdentifier
                  : `phone:${normalizedIdentifier}`
                : `provider:${providerId}`,
            identifier: normalizedIdentifier,
            displayName,
            role,
            providerId: role === 'Service Provider' ? providerId : '',
          });
        } catch {
          showFeedback(loginFeedback, 'Could not start a demo session in this browser.', false);
          return;
        }

        const params = new URLSearchParams(window.location.search);
        const requestedDestination = params.get('redirect') || '';
        const safeDestination = (() => {
          try {
            const target = new URL(requestedDestination, window.location.href);
            if (target.origin !== window.location.origin) return '';
            const page = target.pathname.split('/').pop();
            if (
              role === 'Customer' &&
              (page === 'booking.html' || page === 'customer-dashboard.html')
            ) {
              return `${page}${target.search}${target.hash}`;
            }
            if (
              role === 'Service Provider' &&
              page === 'provider.html' &&
              target.hash === '#providerBookingDesk'
            ) {
              return `${page}${target.search}${target.hash}`;
            }
          } catch {
            return '';
          }
          return '';
        })();

        const defaultDestination =
          role === 'Customer'
            ? 'customer-dashboard.html'
            : `provider.html?id=${encodeURIComponent(providerId)}#providerBookingDesk`;
        window.location.replace(safeDestination || defaultDestination);
      });
    });
  }

  const loginParams = new URLSearchParams(window.location.search);
  if (loginParams.get('reason') === 'booking') {
    showFeedback(loginFeedback, 'Please log in to book a service.', false);
  } else if (loginParams.get('reason') === 'dashboard') {
    showFeedback(loginFeedback, 'Please log in to access this dashboard.', false);
  }

  // Inline Forgot Password Panel
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const forgotPanel = document.getElementById('forgotPanel');
  const closeForgotPanelBtn = document.getElementById('closeForgotPanelBtn');
  const forgotForm = document.getElementById('forgotForm');
  const forgotIdentifier = document.getElementById('forgotIdentifier');
  const forgotError = document.getElementById('forgotError');
  const forgotFeedback = document.getElementById('forgotFeedback');

  if (forgotPasswordBtn && forgotPanel) {
    forgotPasswordBtn.addEventListener('click', () => {
      forgotPanel.hidden = !forgotPanel.hidden;
      if (!forgotPanel.hidden && forgotIdentifier) {
        forgotIdentifier.focus();
      }
    });
  }

  if (closeForgotPanelBtn && forgotPanel) {
    closeForgotPanelBtn.addEventListener('click', () => {
      forgotPanel.hidden = true;
    });
  }

  if (forgotIdentifier) {
    forgotIdentifier.addEventListener('input', () => {
      setFieldError(forgotIdentifier, forgotError, '');
      hideFeedback(forgotFeedback);
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (event) => {
      event.preventDefault();
      hideFeedback(forgotFeedback);
      const val = forgotIdentifier ? forgotIdentifier.value.trim() : '';

      if (!val || !isValidEmailOrIndianPhone(val)) {
        setFieldError(
          forgotIdentifier,
          forgotError,
          'Enter a valid email address or 10-digit Indian mobile number.'
        );
        focusFirstInvalid(forgotForm);
        return;
      }

      setFieldError(forgotIdentifier, forgotError, '');
      const submitBtn = forgotForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Sending Link...', () => {
        showFeedback(
          forgotFeedback,
          'Password reset is not available in this frontend demo. Use the demo Login form to preview a session.',
          false
        );
        forgotForm.reset();
      });
    });
  }

  // =========================================================================
  // 4. Registration Page Logic (register.html)
  // =========================================================================
  const registerForm = document.getElementById('registerForm');
  const registerName = document.getElementById('registerName');
  const registerEmail = document.getElementById('registerEmail');
  const registerPhone = document.getElementById('registerPhone');
  const registerPassword = document.getElementById('registerPassword');
  const registerConfirmPassword = document.getElementById('registerConfirmPassword');
  const termsCheckbox = document.getElementById('termsCheckbox');

  const registerNameError = document.getElementById('registerNameError');
  const registerEmailError = document.getElementById('registerEmailError');
  const registerPhoneError = document.getElementById('registerPhoneError');
  const registerPasswordError = document.getElementById('registerPasswordError');
  const registerConfirmError = document.getElementById('registerConfirmError');
  const registerTermsError = document.getElementById('registerTermsError');
  const registerFeedback = document.getElementById('registerFeedback');
  const providerNoteBanner = document.getElementById('providerNoteBanner');

  // Account type toggle info
  document.querySelectorAll('input[name="accountType"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (providerNoteBanner) {
        providerNoteBanner.hidden = radio.value !== 'Service Provider';
      }
    });
  });

  // Clear inline errors on input
  [
    [registerName, registerNameError],
    [registerEmail, registerEmailError],
    [registerPhone, registerPhoneError],
    [registerPassword, registerPasswordError],
    [registerConfirmPassword, registerConfirmError],
  ].forEach(([inputEl, errorEl]) => {
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        setFieldError(inputEl, errorEl, '');
        hideFeedback(registerFeedback);
      });
    }
  });

  if (termsCheckbox) {
    termsCheckbox.addEventListener('change', () => {
      setFieldError(termsCheckbox, registerTermsError, '');
      hideFeedback(registerFeedback);
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      hideFeedback(registerFeedback);

      const fullName = registerName ? registerName.value.trim() : '';
      const email = registerEmail ? registerEmail.value.trim() : '';
      const phone = registerPhone ? registerPhone.value.trim() : '';
      const password = registerPassword ? registerPassword.value : '';
      const confirmPassword = registerConfirmPassword ? registerConfirmPassword.value : '';
      const termsAccepted = termsCheckbox ? termsCheckbox.checked : false;
      const selectedTypeEl = document.querySelector('input[name="accountType"]:checked');
      const accountType = selectedTypeEl ? selectedTypeEl.value : 'Customer';

      let isValid = true;

      if (fullName.length < 2) {
        setFieldError(registerName, registerNameError, 'Please enter your full name (at least 2 characters).');
        isValid = false;
      } else {
        setFieldError(registerName, registerNameError, '');
      }

      if (!email || !EMAIL_REGEX.test(email)) {
        setFieldError(registerEmail, registerEmailError, 'Please enter a valid email address.');
        isValid = false;
      } else {
        setFieldError(registerEmail, registerEmailError, '');
      }

      if (!phone || !INDIAN_PHONE_REGEX.test(phone)) {
        setFieldError(
          registerPhone,
          registerPhoneError,
          'Enter a valid 10-digit Indian mobile number starting with 6–9.'
        );
        isValid = false;
      } else {
        setFieldError(registerPhone, registerPhoneError, '');
      }

      if (!password || !PASSWORD_REGEX.test(password)) {
        setFieldError(
          registerPassword,
          registerPasswordError,
          'Password must be at least 8 characters and include letters and a number.'
        );
        isValid = false;
      } else {
        setFieldError(registerPassword, registerPasswordError, '');
      }

      if (!confirmPassword) {
        setFieldError(registerConfirmPassword, registerConfirmError, 'Please confirm your password.');
        isValid = false;
      } else if (confirmPassword !== password) {
        setFieldError(registerConfirmPassword, registerConfirmError, 'Passwords do not match.');
        isValid = false;
      } else {
        setFieldError(registerConfirmPassword, registerConfirmError, '');
      }

      if (!termsAccepted) {
        setFieldError(
          termsCheckbox,
          registerTermsError,
          'You must accept the Terms and Conditions to continue.'
        );
        isValid = false;
      } else {
        setFieldError(termsCheckbox, registerTermsError, '');
      }

      if (!isValid) {
        showFeedback(
          registerFeedback,
          'Please review and correct the highlighted fields before submitting.',
          false
        );
        focusFirstInvalid(registerForm);
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Creating Account...', () => {
        showFeedback(
          registerFeedback,
          `No account was created for ${fullName} (${accountType}, +91 ${phone}). This frontend demo does not register accounts or store passwords.`,
          false
        );

        // Reset sensitive password inputs without storing anything
        if (registerPassword) registerPassword.value = '';
        if (registerConfirmPassword) registerConfirmPassword.value = '';
      });
    });
  }

  // Terms Summary Modal on register.html
  const termsModal = document.getElementById('termsModal');
  const openTermsBtn = document.getElementById('openTermsBtn');

  if (openTermsBtn && termsModal) {
    openTermsBtn.addEventListener('click', () => {
      openDialogModal(termsModal);
    });
  }

  document.querySelectorAll('[data-close-modal="termsModal"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      closeDialogModal(termsModal);
    });
  });

  if (termsModal) {
    termsModal.addEventListener('click', (event) => {
      if (event.target === termsModal) {
        closeDialogModal(termsModal);
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setMobileDrawer(false);
      closeDialogModal(termsModal);
    }
  });
});
