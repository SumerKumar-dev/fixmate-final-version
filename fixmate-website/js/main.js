// FixMate – Homepage Interactive Scripts (Vanilla JavaScript)
import {
  clearFieldValidation,
  focusFirstInvalid,
  runWithSubmitGuard,
  setFieldValidation,
} from './ui-helpers.js';

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    activeCategory: 'all',
    searchQuery: '',
    selectedLocation: '',
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

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMobileDrawer(false);
  });

  // =========================================================================
  // 3. Protected Booking Navigation
  // =========================================================================
  document.querySelectorAll('[data-book-service]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const providersByCategory = {
        Electrician: 'rajesh-kumar',
        Plumber: 'suresh-verma',
        Carpenter: 'imran-sheikh',
        'AC Repair': 'karthik-nair',
        'Home Cleaning': 'sunita-devi',
        Mechanic: 'vikram-rathore',
      };
      const providerId = providersByCategory[btn.dataset.bookService] || '';
      window.location.href = `booking.html?id=${encodeURIComponent(providerId)}`;
    });
  });

  // =========================================================================
  // 4. Demo Authentication Navigation
  // =========================================================================
  function attachAuthTriggers() {
    document.querySelectorAll('[data-auth-open]').forEach((btn) => {
      btn.addEventListener('click', () => {
        setMobileDrawer(false);
        window.location.href =
          btn.dataset.authOpen === 'register' ? 'register.html' : 'login.html';
      });
    });
  }
  attachAuthTriggers();
  const authForm = document.getElementById('authForm');
  if (authForm) {
    authForm.addEventListener('submit', (event) => {
      event.preventDefault();
      window.location.href = 'login.html';
    });
  }

  // =========================================================================
  // 5. Contact / Callback Form Validation
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
