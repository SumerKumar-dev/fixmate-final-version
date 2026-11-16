// FixMate – Homepage Interactive Scripts (Vanilla JavaScript)
import {
  clearFieldValidation,
  closeDialogModal,
  focusFirstInvalid,
  openDialogModal,
  runWithSubmitGuard,
  setFieldValidation,
} from './ui-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    selectedLocation: '',
    authMode: 'login',
    signedInUser: null,
  };

  // Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  const heroSearchForm = document.getElementById('heroSearchForm');
  const locationInput = document.getElementById('locationInput');
  const serviceInput = document.getElementById('serviceInput');
  const quickServiceButtons = document.querySelectorAll('[data-quick-service]');

  const filterTabs = document.querySelectorAll('.filter-tab');
  const serviceCards = document.querySelectorAll('.service-card');
  const searchStatusBar = document.getElementById('searchStatusBar');
  const searchStatusText = document.getElementById('searchStatusText');
  const resetSearchBtn = document.getElementById('resetSearchBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  const emptyServicesState = document.getElementById('emptyServicesState');
  const servicesSection = document.getElementById('services');

  const bookingModal = document.getElementById('bookingModal');
  const bookingModalTitle = document.getElementById('bookingModalTitle');
  const bookingServiceName = document.getElementById('bookingServiceName');
  const bookingServicePrice = document.getElementById('bookingServicePrice');
  const bookingLocality = document.getElementById('bookingLocality');
  const bookingCustomerName = document.getElementById('bookingCustomerName');
  const bookingPhone = document.getElementById('bookingPhone');
  const bookingSlot = document.getElementById('bookingSlot');
  const bookingForm = document.getElementById('bookingForm');
  const bookingConfirmation = document.getElementById('bookingConfirmation');
  const bookingConfirmText = document.getElementById('bookingConfirmText');

  const authModal = document.getElementById('authModal');
  const authModalTitle = document.getElementById('authModalTitle');
  const authTabs = document.querySelectorAll('[data-auth-tab]');
  const authNameGroup = document.getElementById('authNameGroup');
  const authFullName = document.getElementById('authFullName');
  const authIdentifier = document.getElementById('authIdentifier');
  const authPassword = document.getElementById('authPassword');
  const authSubmitBtn = document.getElementById('authSubmitBtn');
  const authForm = document.getElementById('authForm');
  const headerAuthArea = document.getElementById('headerAuthArea');

  const contactForm = document.getElementById('contactForm');
  const contactName = document.getElementById('contactName');
  const contactPhone = document.getElementById('contactPhone');
  const contactCity = document.getElementById('contactCity');
  const contactFeedback = document.getElementById('contactFeedback');

  // Set current copyright year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Fallback for broken images
  document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('error', () => {
      img.style.opacity = '0';
    });
  });

  // =========================================================================
  // 1. Mobile Navigation Drawer
  // =========================================================================
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
  // 2. Service Filtering & Hero Search
  // =========================================================================
  function renderServices() {
    const query = state.searchQuery.trim().toLowerCase();
    const activeCat = state.activeCategory;
    let visibleCount = 0;

    serviceCards.forEach((card) => {
      const cardCat = card.dataset.category || '';
      const serviceTitle = (card.dataset.service || '').toLowerCase();
      const keywords = (card.dataset.keywords || '').toLowerCase();

      const matchesCategory = activeCat === 'all' || cardCat === activeCat;
      const matchesQuery =
        !query || serviceTitle.includes(query) || keywords.includes(query);

      const shouldShow = matchesCategory && matchesQuery;
      card.hidden = !shouldShow;
      card.classList.toggle('is-highlighted', Boolean(query && shouldShow));

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (emptyServicesState) {
      emptyServicesState.hidden = visibleCount > 0;
    }

    if (searchStatusBar && searchStatusText) {
      if (query || state.selectedLocation) {
        const parts = [];
        if (query) {
          parts.push(`"${state.searchQuery.trim()}"`);
        } else {
          parts.push('all services');
        }
        if (state.selectedLocation) {
          parts.push(`in ${state.selectedLocation}`);
        }
        searchStatusText.textContent = `Showing ${visibleCount} verified option${visibleCount === 1 ? '' : 's'} for ${parts.join(' ')}`;
        searchStatusBar.hidden = false;
      } else {
        searchStatusBar.hidden = true;
      }
    }
  }

  function resetSearchAndFilters() {
    state.activeCategory = 'all';
    state.searchQuery = '';
    if (serviceInput) serviceInput.value = '';

    filterTabs.forEach((tab) => {
      const isAll = tab.dataset.category === 'all';
      tab.classList.toggle('is-active', isAll);
      tab.setAttribute('aria-selected', String(isAll));
    });

    renderServices();
  }

  filterTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const selectedCat = tab.dataset.category || 'all';
      state.activeCategory = selectedCat;
      filterTabs.forEach((btn) => {
        const active = btn === tab;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-selected', String(active));
      });
      renderServices();
    });
  });

  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      state.selectedLocation = locationInput ? locationInput.value.trim() : '';
      state.searchQuery = serviceInput ? serviceInput.value.trim() : '';
      state.activeCategory = 'all';

      filterTabs.forEach((tab) => {
        const isAll = tab.dataset.category === 'all';
        tab.classList.toggle('is-active', isAll);
        tab.setAttribute('aria-selected', String(isAll));
      });

      renderServices();
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  quickServiceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.quickService || '';
      if (serviceInput) serviceInput.value = chosen;
      state.searchQuery = chosen;
      state.selectedLocation = locationInput ? locationInput.value.trim() : '';
      state.activeCategory = 'all';

      filterTabs.forEach((tab) => {
        const isAll = tab.dataset.category === 'all';
        tab.classList.toggle('is-active', isAll);
        tab.setAttribute('aria-selected', String(isAll));
      });

      renderServices();
      if (servicesSection) {
        servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  document.querySelectorAll('[data-footer-service]').forEach((link) => {
    link.addEventListener('click', () => {
      const chosen = link.dataset.footerService || '';
      if (serviceInput) serviceInput.value = chosen;
      state.searchQuery = chosen;
      state.activeCategory = 'all';
      renderServices();
    });
  });

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', resetSearchAndFilters);
  }

  if (emptyResetBtn) {
    emptyResetBtn.addEventListener('click', resetSearchAndFilters);
  }

  // =========================================================================
  // 3. Modals & Helpers
  // =========================================================================
  function openModal(modal, preferredFocusEl = null) {
    openDialogModal(modal, preferredFocusEl);
  }

  function closeModal(modal) {
    closeDialogModal(modal);
  }

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.closeModal;
      if (targetId) {
        closeModal(document.getElementById(targetId));
      }
    });
  });

  [bookingModal, authModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(bookingModal);
      closeModal(authModal);
      setMobileDrawer(false);
    }
  });

  // =========================================================================
  // 4. Service Booking Flow
  // =========================================================================
  const bookingLocalityError = document.getElementById('bookingLocalityError');
  const bookingNameError = document.getElementById('bookingNameError');
  const bookingPhoneError = document.getElementById('bookingPhoneError');

  function clearBookingErrors() {
    clearFieldValidation(bookingLocality, bookingLocalityError);
    clearFieldValidation(bookingCustomerName, bookingNameError);
    clearFieldValidation(bookingPhone, bookingPhoneError);
  }

  [
    [bookingLocality, bookingLocalityError],
    [bookingCustomerName, bookingNameError],
    [bookingPhone, bookingPhoneError],
  ].forEach(([inputEl, errorEl]) => {
    if (inputEl) {
      inputEl.addEventListener('input', () => clearFieldValidation(inputEl, errorEl));
    }
  });

  document.querySelectorAll('[data-book-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceName = btn.dataset.bookService || 'Home Service';
      const price = btn.dataset.bookPrice || '199';

      if (bookingModalTitle) bookingModalTitle.textContent = `Book ${serviceName}`;
      if (bookingServiceName) bookingServiceName.textContent = serviceName;
      if (bookingServicePrice) bookingServicePrice.textContent = `₹${price}`;

      if (bookingLocality) {
        bookingLocality.value =
          (locationInput && locationInput.value.trim()) || state.selectedLocation || '';
      }
      if (bookingCustomerName && state.signedInUser) {
        bookingCustomerName.value = state.signedInUser;
      }
      if (bookingForm) bookingForm.hidden = false;
      if (bookingConfirmation) bookingConfirmation.hidden = true;
      clearBookingErrors();

      const preferredFocus =
        bookingLocality && !bookingLocality.value ? bookingLocality : bookingCustomerName;
      openModal(bookingModal, preferredFocus);
    });
  });

  if (bookingForm) {
    bookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearBookingErrors();

      const locality = bookingLocality ? bookingLocality.value.trim() : '';
      const name = bookingCustomerName ? bookingCustomerName.value.trim() : '';
      const phone = bookingPhone ? bookingPhone.value.trim() : '';
      let isValid = true;

      if (locality.length < 3) {
        setFieldValidation(
          bookingLocality,
          bookingLocalityError,
          'Please enter your area or street address.'
        );
        isValid = false;
      }
      if (name.length < 2) {
        setFieldValidation(bookingCustomerName, bookingNameError, 'Please enter your full name.');
        isValid = false;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setFieldValidation(
          bookingPhone,
          bookingPhoneError,
          'Enter a valid 10-digit Indian mobile number.'
        );
        isValid = false;
      }

      if (!isValid) {
        focusFirstInvalid(bookingForm);
        return;
      }

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Submitting Request...', () => {
        const selectedService = bookingServiceName ? bookingServiceName.textContent : 'Service';
        const selectedPrice = bookingServicePrice ? bookingServicePrice.textContent : '₹199';
        const chosenSlot = bookingSlot ? bookingSlot.value : 'Express (Within 60 mins)';
        const refCode = `FM-${Math.floor(100000 + Math.random() * 900000)}`;

        bookingForm.hidden = true;
        if (bookingConfirmText) {
          bookingConfirmText.textContent = `Reference ${refCode}: ${selectedService} (${selectedPrice} inspection) scheduled for ${chosenSlot} at ${locality}. Our local helper details will be shared on +91 ${phone}.`;
        }
        if (bookingConfirmation) bookingConfirmation.hidden = false;
        bookingForm.reset();
      });
    });
  }

  // =========================================================================
  // 5. Auth Modal (Login / Register)
  // =========================================================================
  const authNameError = document.getElementById('authNameError');
  const authIdentifierError = document.getElementById('authIdentifierError');
  const authPasswordError = document.getElementById('authPasswordError');

  function clearAuthErrors() {
    clearFieldValidation(authFullName, authNameError);
    clearFieldValidation(authIdentifier, authIdentifierError);
    clearFieldValidation(authPassword, authPasswordError);
  }

  [
    [authFullName, authNameError],
    [authIdentifier, authIdentifierError],
    [authPassword, authPasswordError],
  ].forEach(([inputEl, errorEl]) => {
    if (inputEl) {
      inputEl.addEventListener('input', () => clearFieldValidation(inputEl, errorEl));
    }
  });

  function setAuthMode(mode) {
    state.authMode = mode;
    const isRegister = mode === 'register';

    authTabs.forEach((tab) => {
      const active = tab.dataset.authTab === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });

    if (authModalTitle) {
      authModalTitle.textContent = isRegister ? 'Create your FixMate account' : 'Welcome back';
    }
    if (authNameGroup) {
      authNameGroup.hidden = !isRegister;
    }
    if (authSubmitBtn) {
      authSubmitBtn.textContent = isRegister ? 'Create Account' : 'Login to FixMate';
    }
    clearAuthErrors();
  }

  function attachAuthTriggers() {
    document.querySelectorAll('[data-auth-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMobileDrawer(false);
        setAuthMode(btn.dataset.authOpen || 'login');
        openModal(
          authModal,
          state.authMode === 'register' && authFullName ? authFullName : authIdentifier
        );
      });
    });
  }
  attachAuthTriggers();

  authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      setAuthMode(tab.dataset.authTab || 'login');
    });
  });

  function renderSignedInHeader(displayName) {
    if (!headerAuthArea) return;
    headerAuthArea.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'user-session-badge';

    const greeting = document.createElement('span');
    greeting.textContent = `Hi, ${displayName}`;

    const logoutBtn = document.createElement('button');
    logoutBtn.type = 'button';
    logoutBtn.className = 'btn-ghost';
    logoutBtn.textContent = 'Sign Out';
    logoutBtn.addEventListener('click', () => {
      state.signedInUser = null;
      headerAuthArea.innerHTML = `
        <button type="button" class="btn-ghost" data-auth-open="login">Login</button>
        <button type="button" class="btn-primary" data-auth-open="register">Register</button>
      `;
      attachAuthTriggers();
    });

    wrapper.appendChild(greeting);
    wrapper.appendChild(logoutBtn);
    headerAuthArea.appendChild(wrapper);
  }

  if (authForm) {
    authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearAuthErrors();

      const fullName = authFullName ? authFullName.value.trim() : '';
      const identifier = authIdentifier ? authIdentifier.value.trim() : '';
      const password = authPassword ? authPassword.value : '';
      let isValid = true;

      if (state.authMode === 'register' && fullName.length < 2) {
        setFieldValidation(authFullName, authNameError, 'Please enter your full name.');
        isValid = false;
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isPhone = /^[6-9]\d{9}$/.test(identifier);
      if (!isEmail && !isPhone) {
        setFieldValidation(
          authIdentifier,
          authIdentifierError,
          'Enter a valid email or 10-digit Indian mobile number.'
        );
        isValid = false;
      }

      if (password.length < 6) {
        setFieldValidation(
          authPassword,
          authPasswordError,
          'Password must be at least 6 characters.'
        );
        isValid = false;
      }

      if (!isValid) {
        focusFirstInvalid(authForm);
        return;
      }

      const processingLabel =
        state.authMode === 'register' ? 'Creating Account...' : 'Signing In...';
      runWithSubmitGuard(authSubmitBtn, processingLabel, () => {
        const userLabel =
          state.authMode === 'register'
            ? fullName.split(' ')[0]
            : isEmail
            ? identifier.split('@')[0]
            : `+91 ${identifier.slice(0, 5)}…`;

        state.signedInUser = state.authMode === 'register' ? fullName : userLabel;
        renderSignedInHeader(userLabel);
        authForm.reset();
        closeModal(authModal);
      });
    });
  }

  // =========================================================================
  // 6. Contact / Callback Form Validation
  // =========================================================================
  const contactNameError = document.getElementById('contactNameError');
  const contactPhoneError = document.getElementById('contactPhoneError');
  const contactCityError = document.getElementById('contactCityError');

  function clearContactErrors() {
    clearFieldValidation(contactName, contactNameError);
    clearFieldValidation(contactPhone, contactPhoneError);
    clearFieldValidation(contactCity, contactCityError);
  }

  [
    [contactName, contactNameError],
    [contactPhone, contactPhoneError],
    [contactCity, contactCityError],
  ].forEach(([inputEl, errorEl]) => {
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        clearFieldValidation(inputEl, errorEl);
        if (contactFeedback) contactFeedback.hidden = true;
      });
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearContactErrors();
      if (contactFeedback) contactFeedback.hidden = true;

      const name = contactName ? contactName.value.trim() : '';
      const phone = contactPhone ? contactPhone.value.trim() : '';
      const req = contactCity ? contactCity.value.trim() : '';
      let isValid = true;

      if (name.length < 2) {
        setFieldValidation(contactName, contactNameError, 'Please enter your name.');
        isValid = false;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setFieldValidation(
          contactPhone,
          contactPhoneError,
          'Enter a valid 10-digit mobile number.'
        );
        isValid = false;
      }
      if (req.length < 4) {
        setFieldValidation(
          contactCity,
          contactCityError,
          'Mention your city and the help you need.'
        );
        isValid = false;
      }

      if (!isValid) {
        focusFirstInvalid(contactForm);
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Sending Request...', () => {
        if (contactFeedback) {
          contactFeedback.textContent = `Thank you, ${name}. Our coordinator will call +91 ${phone} within 10 minutes regarding your request.`;
          contactFeedback.hidden = false;
        }
        contactForm.reset();
      });
    });
  }

  // =========================================================================
  // 7. Active Navigation Link on Scroll (Desktop + Mobile)
  // =========================================================================
  const sectionIds = ['home', 'services', 'about', 'contact'];
  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    let currentId = 'home';

    sections.forEach((sec) => {
      if (sec.offsetTop <= scrollPos) {
        currentId = sec.id;
      }
    });

    const targetHref = `#${currentId}`;
    [...navLinks, ...mobileNavLinks].forEach((link) => {
      const href = link.getAttribute('href') || '';
      const isMatch = href === targetHref || (currentId === 'home' && href === 'index.html');
      link.classList.toggle('is-active', isMatch);
      if (isMatch) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNav, { passive: true });
  updateActiveNav();
});
