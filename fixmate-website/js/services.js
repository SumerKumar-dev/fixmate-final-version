// FixMate – Explore Services Page Logic (Pure Vanilla JavaScript)
import { getProviderRatingStats, subscribeReviewChanges } from './reviews-manager.js';
import {
  clearFieldValidation,
  closeDialogModal,
  focusFirstInvalid,
  openDialogModal,
  runWithSubmitGuard,
  setFieldValidation,
} from './ui-helpers.js';

const PROVIDERS = [
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatar: 'assets/images/provider-rajesh.jpg',
    category: 'Electrician',
    location: 'Indiranagar, Bengaluru',
    pinCode: '560038',
    nearbyPins: '560038, 560008, 560075',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 164,
    price: 199,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 1,
    keywords: 'electrician wiring switchboard mcb inverter fan light socket',
    bio: 'ITI-certified residential electrician specialising in safe MCB distribution boards, inverter backups, ceiling fan installations, and fault tracing across East Bengaluru.',
    rates: [
      { label: 'Inspection & Fault Diagnosis', price: '₹199' },
      { label: 'Ceiling Fan / Exhaust Installation', price: '₹249' },
      { label: 'MCB / Switchboard Replacement', price: '₹349' },
    ],
  },
  {
    id: 'suresh-verma',
    name: 'Suresh Verma',
    initials: 'SV',
    avatar: 'assets/images/provider-suresh.jpg',
    category: 'Plumber',
    location: 'Andheri West, Mumbai',
    pinCode: '400053',
    nearbyPins: '400053, 400058, 400049',
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 218,
    price: 249,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 2,
    keywords: 'plumber tap leak pipe bathroom sink drainage mixer valve tank',
    bio: 'Senior plumbing specialist experienced in concealed CPVC pipe leak repairs, Jaquar/Kohler mixer fittings, overhead tank motors, and non-destructive bathroom fixes.',
    rates: [
      { label: 'Leakage Inspection & Assessment', price: '₹249' },
      { label: 'Tap / Angle Valve Replacement', price: '₹299' },
      { label: 'Blocked Kitchen Drain Clearing', price: '₹449' },
    ],
  },
  {
    id: 'karthik-nair',
    name: 'Karthik Nair',
    initials: 'KN',
    avatar: 'assets/images/provider-karthik.jpg',
    category: 'AC Repair',
    location: 'Adyar, Chennai',
    pinCode: '600020',
    nearbyPins: '600020, 600041, 600028',
    experienceYears: 7,
    rating: 4.8,
    reviewCount: 139,
    price: 499,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 3,
    keywords: 'ac repair air conditioner split window foam jet cooling gas refill pcb',
    bio: 'Factory-trained HVAC technician handling inverter split ACs, foam-jet deep coil cleaning, nitrogen leak testing, and genuine refrigerant charging.',
    rates: [
      { label: 'Split AC Foam-Jet Servicing', price: '₹499' },
      { label: 'AC Cooling & PCB Checkup', price: '₹349' },
      { label: 'Split AC Uninstallation / Shifting', price: '₹1,199' },
    ],
  },
  {
    id: 'sunita-devi',
    name: 'Sunita Devi',
    initials: 'SD',
    avatar: 'assets/images/provider-sunita.jpg',
    category: 'Home Cleaning',
    location: 'Saket, New Delhi',
    pinCode: '110017',
    nearbyPins: '110017, 110016, 110049',
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 192,
    price: 699,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 4,
    keywords: 'home cleaning bathroom kitchen chimney sofa deep clean sanitization',
    bio: 'Leads a trained two-person residential hygiene crew equipped with eco-safe descalers, steam scrubbers, and HEPA vacuums for spotless kitchens and bathrooms.',
    rates: [
      { label: '1 Bathroom Deep Descaling', price: '₹699' },
      { label: 'Kitchen & Chimney Degreasing', price: '₹999' },
      { label: '2BHK Full Home Deep Cleaning', price: '₹2,899' },
    ],
  },
  {
    id: 'imran-sheikh',
    name: 'Imran Sheikh',
    initials: 'IS',
    avatar: '',
    category: 'Carpenter',
    location: 'Kothrud, Pune',
    pinCode: '411038',
    nearbyPins: '411038, 411004, 411052',
    experienceYears: 10,
    rating: 4.8,
    reviewCount: 127,
    price: 299,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 5,
    keywords: 'carpenter wood door lock hinge wardrobe cabinet shelf furniture assembly',
    bio: 'Precision woodworker and modular hardware technician skilled in Godrej smart lock installations, soft-close wardrobe hinges, and custom shelving.',
    rates: [
      { label: 'Door Lock / Latch Fitting', price: '₹299' },
      { label: 'Wardrobe Hinge Alignment (Set)', price: '₹349' },
      { label: 'Flat-Pack Furniture Assembly', price: '₹599' },
    ],
  },
  {
    id: 'vikram-rathore',
    name: 'Vikram Rathore',
    initials: 'VR',
    avatar: '',
    category: 'Mechanic',
    location: 'Banjara Hills, Hyderabad',
    pinCode: '500034',
    nearbyPins: '500034, 500033, 500082',
    experienceYears: 9,
    rating: 4.8,
    reviewCount: 154,
    price: 349,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 6,
    keywords: 'mechanic car bike scooter battery jumpstart puncture breakdown brake oil',
    bio: 'Mobile automotive technician carrying OBD-II diagnostic scanners, jump-start packs, and genuine filters for doorstep car and scooter servicing.',
    rates: [
      { label: 'Doorstep Battery Jump-Start', price: '₹349' },
      { label: 'Two-Wheeler Periodic Service', price: '₹499' },
      { label: 'Car Full Inspection & Fluid Top-up', price: '₹699' },
    ],
  },
  {
    id: 'manoj-tiwari',
    name: 'Manoj Tiwari',
    initials: 'MT',
    avatar: '',
    category: 'Electrician',
    location: 'Powai, Mumbai',
    pinCode: '400076',
    nearbyPins: '400076, 400072, 400087',
    experienceYears: 6,
    rating: 4.7,
    reviewCount: 98,
    price: 179,
    availability: 'Next Slot: 3:30 PM',
    availableNow: false,
    recommendedRank: 7,
    keywords: 'electrician chandelier geyser switchboard earthing wiring socket',
    bio: 'Reliable residential electrician focused on geyser connections, modular switches, LED fixture mounting, and apartment earthing diagnostics.',
    rates: [
      { label: 'Standard Home Inspection', price: '₹179' },
      { label: 'Geyser Power Point & Installation', price: '₹449' },
      { label: 'Wall Light / Tube Installation', price: '₹199' },
    ],
  },
  {
    id: 'deepak-kulkarni',
    name: 'Deepak Kulkarni',
    initials: 'DK',
    avatar: '',
    category: 'Carpenter',
    location: 'Jayanagar, Bengaluru',
    pinCode: '560041',
    nearbyPins: '560041, 560011, 560070',
    experienceYears: 12,
    rating: 4.9,
    reviewCount: 185,
    price: 329,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 8,
    keywords: 'carpenter teak door polish drawer channel bed repair curtain rod',
    bio: 'Master carpenter with 12+ years of residential experience in hydraulic bed fittings, sliding wardrobe tracks, and hardwood door adjustments.',
    rates: [
      { label: 'Visit & Woodwork Assessment', price: '₹329' },
      { label: 'Drawer Channel Replacement', price: '₹399' },
      { label: 'Curtain Rod / Blind Mounting', price: '₹249' },
    ],
  },
  {
    id: 'arvind-patel',
    name: 'Arvind Patel',
    initials: 'AP',
    avatar: '',
    category: 'AC Repair',
    location: 'Koramangala, Bengaluru',
    pinCode: '560034',
    nearbyPins: '560034, 560095, 560102',
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 112,
    price: 449,
    availability: 'Next Slot: 4:00 PM',
    availableNow: false,
    recommendedRank: 9,
    keywords: 'ac repair window split servicing water leakage gas refill cooling',
    bio: 'Specialist in resolving AC indoor unit water leakage, compressor capacitor replacements, and pre-summer preventive servicing.',
    rates: [
      { label: 'Window AC Jet Service', price: '₹449' },
      { label: 'Water Leakage Drain Flush', price: '₹499' },
      { label: 'Gas Refill (R32 / R410A)', price: '₹2,199' },
    ],
  },
  {
    id: 'mahesh-yadav',
    name: 'Mahesh Yadav',
    initials: 'MY',
    avatar: '',
    category: 'Plumber',
    location: 'Hauz Khas, New Delhi',
    pinCode: '110016',
    nearbyPins: '110016, 110017, 110029',
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 141,
    price: 229,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 10,
    keywords: 'plumber flush tank cistern tap mixer water motor bathroom leak',
    bio: 'Experienced South Delhi plumber handling concealed flush tank repairs, pressure pump troubleshooting, and RO inlet plumbing.',
    rates: [
      { label: 'Plumbing Inspection Visit', price: '₹229' },
      { label: 'Flush Tank / Cistern Repair', price: '₹349' },
      { label: 'Wash Basin Installation', price: '₹499' },
    ],
  },
  {
    id: 'farhan-ansari',
    name: 'Farhan Ansari',
    initials: 'FA',
    avatar: '',
    category: 'Mechanic',
    location: 'Viman Nagar, Pune',
    pinCode: '411014',
    nearbyPins: '411014, 411006, 411032',
    experienceYears: 7,
    rating: 4.7,
    reviewCount: 94,
    price: 299,
    availability: 'Next Slot: 2:30 PM',
    availableNow: false,
    recommendedRank: 11,
    keywords: 'mechanic bike scooter puncture brake pad clutch cable car check',
    bio: 'Two-wheeler and compact car doorstep mechanic offering urgent puncture fixes, spark plug/clutch cable replacement, and oil changes at home.',
    rates: [
      { label: 'Breakdown Visit & Diagnosis', price: '₹299' },
      { label: 'Bike Engine Oil & Filter Change', price: '₹449' },
      { label: 'Brake Pad Cleaning & Adjustment', price: '₹349' },
    ],
  },
  {
    id: 'prakash-gowda',
    name: 'Prakash Gowda',
    initials: 'PG',
    avatar: '',
    category: 'Home Cleaning',
    location: 'Whitefield, Bengaluru',
    pinCode: '560066',
    nearbyPins: '560066, 560048, 560037',
    experienceYears: 5,
    rating: 4.8,
    reviewCount: 121,
    price: 749,
    availability: 'Available Today',
    availableNow: true,
    recommendedRank: 12,
    keywords: 'home cleaning sofa carpet mattress balcony deep clean sanitization',
    bio: 'Trained upholstery and apartment cleaning specialist using commercial extraction machines for fabric sofas, carpets, and balcony scrubbing.',
    rates: [
      { label: '3-Seater Sofa Shampooing', price: '₹749' },
      { label: 'Balcony & Utility Deep Scrub', price: '₹649' },
      { label: '3BHK Move-In Sanitization', price: '₹3,499' },
    ],
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    serviceQuery: '',
    locationQuery: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'recommended',
    authMode: 'login',
    signedInUser: null,
    activeProfileProvider: null,
  };

  // Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  const filtersForm = document.getElementById('filtersForm');
  const filterServiceQuery = document.getElementById('filterServiceQuery');
  const filterLocationQuery = document.getElementById('filterLocationQuery');
  const filterCategory = document.getElementById('filterCategory');
  const filterMinPrice = document.getElementById('filterMinPrice');
  const filterMaxPrice = document.getElementById('filterMaxPrice');
  const sortProviders = document.getElementById('sortProviders');
  const clearFiltersBtn = document.getElementById('clearFiltersBtn');
  const emptyClearFiltersBtn = document.getElementById('emptyClearFiltersBtn');

  const providersGrid = document.getElementById('providersGrid');
  const providersCountText = document.getElementById('providersCountText');
  const emptyProvidersState = document.getElementById('emptyProvidersState');

  // Modals
  const profileModal = document.getElementById('profileModal');
  const profileModalCategory = document.getElementById('profileModalCategory');
  const profileModalName = document.getElementById('profileModalName');
  const profileModalAvatar = document.getElementById('profileModalAvatar');
  const profileModalRating = document.getElementById('profileModalRating');
  const profileModalLocation = document.getElementById('profileModalLocation');
  const profileModalAvailability = document.getElementById('profileModalAvailability');
  const profileModalBio = document.getElementById('profileModalBio');
  const profileModalExp = document.getElementById('profileModalExp');
  const profileModalPins = document.getElementById('profileModalPins');
  const profileModalPrice = document.getElementById('profileModalPrice');
  const profileModalRates = document.getElementById('profileModalRates');
  const profileBookBtn = document.getElementById('profileBookBtn');

  const bookingModal = document.getElementById('bookingModal');
  const bookingModalTitle = document.getElementById('bookingModalTitle');
  const bookingProviderLabel = document.getElementById('bookingProviderLabel');
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

  // Set footer year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Read optional query params (e.g., services.html?category=Electrician)
  const params = new URLSearchParams(window.location.search);
  const initialCategory = params.get('category');
  if (initialCategory && filterCategory) {
    const optionExists = Array.from(filterCategory.options).some(
      (opt) => opt.value.toLowerCase() === initialCategory.toLowerCase()
    );
    if (optionExists) {
      const matchedOpt = Array.from(filterCategory.options).find(
        (opt) => opt.value.toLowerCase() === initialCategory.toLowerCase()
      );
      if (matchedOpt) {
        filterCategory.value = matchedOpt.value;
        state.category = matchedOpt.value;
      }
    }
  }

  // =========================================================================
  // 1. Mobile Drawer
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
  // 2. Render & Filter Providers
  // =========================================================================
  function createStarIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '15');
    svg.setAttribute('height', '15');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('provider-star-icon');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M8 1L10.1 5.3L14.8 6L11.4 9.3L12.2 14L8 11.8L3.8 14L4.6 9.3L1.2 6L5.9 5.3L8 1Z'
    );
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
    return svg;
  }

  function buildAvatarElement(provider) {
    const wrap = document.createElement('div');
    wrap.className = 'provider-avatar-wrap';

    if (provider.avatar) {
      const img = document.createElement('img');
      img.className = 'provider-avatar-img';
      img.src = provider.avatar;
      img.alt = `${provider.name} – ${provider.category}`;
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.loading = 'lazy';
      img.addEventListener('error', () => {
        img.remove();
        wrap.textContent = provider.initials;
      });
      wrap.appendChild(img);
    } else {
      wrap.textContent = provider.initials;
    }

    return wrap;
  }

  function getFilteredAndSortedProviders() {
    const sQuery = state.serviceQuery.trim().toLowerCase();
    const lQuery = state.locationQuery.trim().toLowerCase();
    const minP = state.minPrice !== '' ? Number(state.minPrice) : null;
    const maxP = state.maxPrice !== '' ? Number(state.maxPrice) : null;

    const filtered = PROVIDERS.filter((provider) => {
      if (state.category !== 'all' && provider.category !== state.category) {
        return false;
      }

      if (sQuery) {
        const haystack = `${provider.name} ${provider.category} ${provider.keywords}`.toLowerCase();
        if (!haystack.includes(sQuery)) {
          return false;
        }
      }

      if (lQuery) {
        const locHaystack = `${provider.location} ${provider.pinCode} ${provider.nearbyPins}`.toLowerCase();
        if (!locHaystack.includes(lQuery)) {
          return false;
        }
      }

      if (minP !== null && !Number.isNaN(minP) && provider.price < minP) {
        return false;
      }

      if (maxP !== null && !Number.isNaN(maxP) && provider.price > maxP) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered];
    if (state.sortBy === 'price-asc') {
      sorted.sort(
        (a, b) =>
          a.price - b.price ||
          getProviderRatingStats(b.id).averageRating - getProviderRatingStats(a.id).averageRating
      );
    } else if (state.sortBy === 'price-desc') {
      sorted.sort(
        (a, b) =>
          b.price - a.price ||
          getProviderRatingStats(b.id).averageRating - getProviderRatingStats(a.id).averageRating
      );
    } else {
      sorted.sort((a, b) => a.recommendedRank - b.recommendedRank);
    }

    return sorted;
  }

  function renderProviders() {
    if (!providersGrid) return;
    const results = getFilteredAndSortedProviders();
    providersGrid.innerHTML = '';

    if (providersCountText) {
      const minP = state.minPrice !== '' ? Number(state.minPrice) : null;
      const maxP = state.maxPrice !== '' ? Number(state.maxPrice) : null;
      const invertedRange =
        minP !== null && maxP !== null && !Number.isNaN(minP) && !Number.isNaN(maxP) && minP > maxP;

      if (invertedRange) {
        providersCountText.textContent = `Showing 0 of ${PROVIDERS.length} verified professionals · Min price (₹${minP}) exceeds max price (₹${maxP})`;
      } else {
        const label = results.length === 1 ? 'verified professional' : 'verified professionals';
        providersCountText.textContent = `Showing ${results.length} of ${PROVIDERS.length} ${label}`;
      }
    }

    if (emptyProvidersState) {
      emptyProvidersState.hidden = results.length > 0;
    }

    results.forEach((provider) => {
      const card = document.createElement('article');
      card.className = 'provider-card';

      // Top Header
      const header = document.createElement('div');
      header.className = 'provider-card-header';
      header.appendChild(buildAvatarElement(provider));

      const identity = document.createElement('div');
      identity.className = 'provider-identity';

      const catLabel = document.createElement('p');
      catLabel.className = 'provider-category-label';
      catLabel.textContent = provider.category;

      const nameEl = document.createElement('h2');
      nameEl.className = 'provider-name';
      nameEl.textContent = provider.name;

      const liveStats = getProviderRatingStats(provider.id);
      const ratingLine = document.createElement('p');
      ratingLine.className = 'provider-rating-line';
      ratingLine.appendChild(createStarIcon());

      const ratingStrong = document.createElement('strong');
      ratingStrong.textContent = liveStats.reviewCount > 0 ? liveStats.averageLabel : '0.0';
      ratingLine.appendChild(ratingStrong);

      const ratingReviews = document.createElement('span');
      ratingReviews.textContent =
        liveStats.reviewCount > 0
          ? `(${liveStats.reviewCount} ${liveStats.reviewCount === 1 ? 'review' : 'reviews'})`
          : '(No reviews yet)';
      ratingLine.appendChild(ratingReviews);

      identity.appendChild(catLabel);
      identity.appendChild(nameEl);
      identity.appendChild(ratingLine);
      header.appendChild(identity);

      // Details list
      const details = document.createElement('div');
      details.className = 'provider-details-list';

      const rows = [
        { key: 'Location', val: `${provider.location} · ${provider.pinCode}` },
        { key: 'Experience', val: `${provider.experienceYears} yrs experience` },
        {
          key: 'Availability',
          val: provider.availability,
          cls: provider.availableNow ? 'detail-val-available' : 'detail-val-later',
        },
      ];

      rows.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'provider-detail-row';

        const keySpan = document.createElement('span');
        keySpan.className = 'detail-key';
        keySpan.textContent = row.key;

        const valSpan = document.createElement('span');
        valSpan.className = `detail-val ${row.cls || ''}`.trim();
        valSpan.textContent = row.val;

        rowEl.appendChild(keySpan);
        rowEl.appendChild(valSpan);
        details.appendChild(rowEl);
      });

      // Price row
      const priceRow = document.createElement('div');
      priceRow.className = 'provider-price-row';

      const priceCaption = document.createElement('span');
      priceCaption.className = 'price-caption';
      priceCaption.textContent = 'Starting inspection';

      const priceAmount = document.createElement('span');
      priceAmount.className = 'price-amount';
      priceAmount.textContent = `₹${provider.price}`;

      priceRow.appendChild(priceCaption);
      priceRow.appendChild(priceAmount);

      // Action buttons
      const actions = document.createElement('div');
      actions.className = 'provider-card-actions';

      const viewBtn = document.createElement('a');
      viewBtn.href = `provider.html?id=${encodeURIComponent(provider.id)}`;
      viewBtn.className = 'btn-outline-card';
      viewBtn.textContent = 'View Profile';

      const bookBtn = document.createElement('button');
      bookBtn.type = 'button';
      bookBtn.className = 'btn-book-provider';
      bookBtn.textContent = 'Book Now';
      bookBtn.addEventListener('click', () => openBookingModal(provider));

      actions.appendChild(viewBtn);
      actions.appendChild(bookBtn);

      card.appendChild(header);
      card.appendChild(details);
      card.appendChild(priceRow);
      card.appendChild(actions);

      providersGrid.appendChild(card);
    });
  }

  function syncFiltersFromInputs() {
    state.serviceQuery = filterServiceQuery ? filterServiceQuery.value : '';
    state.locationQuery = filterLocationQuery ? filterLocationQuery.value : '';
    state.category = filterCategory ? filterCategory.value : 'all';
    state.minPrice = filterMinPrice ? filterMinPrice.value : '';
    state.maxPrice = filterMaxPrice ? filterMaxPrice.value : '';
    state.sortBy = sortProviders ? sortProviders.value : 'recommended';
    renderProviders();
  }

  function clearAllFilters() {
    if (filterServiceQuery) filterServiceQuery.value = '';
    if (filterLocationQuery) filterLocationQuery.value = '';
    if (filterCategory) filterCategory.value = 'all';
    if (filterMinPrice) filterMinPrice.value = '';
    if (filterMaxPrice) filterMaxPrice.value = '';
    if (sortProviders) sortProviders.value = 'recommended';

    state.serviceQuery = '';
    state.locationQuery = '';
    state.category = 'all';
    state.minPrice = '';
    state.maxPrice = '';
    state.sortBy = 'recommended';

    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }

    renderProviders();
  }

  if (filtersForm) {
    filtersForm.addEventListener('submit', (event) => {
      event.preventDefault();
      syncFiltersFromInputs();
    });
  }

  [filterServiceQuery, filterLocationQuery, filterMinPrice, filterMaxPrice].forEach((input) => {
    if (input) {
      input.addEventListener('input', syncFiltersFromInputs);
    }
  });

  [filterCategory, sortProviders].forEach((select) => {
    if (select) {
      select.addEventListener('change', syncFiltersFromInputs);
    }
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  if (emptyClearFiltersBtn) {
    emptyClearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  // =========================================================================
  // 3. Modals Shared Controls
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

  [profileModal, bookingModal, authModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(profileModal);
      closeModal(bookingModal);
      closeModal(authModal);
      setMobileDrawer(false);
    }
  });

  // =========================================================================
  // 4. Provider Profile Modal
  // =========================================================================
  function openProfileModal(provider) {
    state.activeProfileProvider = provider;

    if (profileModalCategory) profileModalCategory.textContent = provider.category;
    if (profileModalName) profileModalName.textContent = provider.name;
    if (profileModalBio) profileModalBio.textContent = provider.bio;
    if (profileModalExp) profileModalExp.textContent = `${provider.experienceYears} years`;
    if (profileModalPins) profileModalPins.textContent = provider.nearbyPins;
    if (profileModalPrice) profileModalPrice.textContent = `₹${provider.price}`;
    if (profileModalLocation) {
      profileModalLocation.textContent = `${provider.location} · PIN ${provider.pinCode}`;
    }
    if (profileModalAvailability) {
      profileModalAvailability.textContent = `Status: ${provider.availability}`;
    }

    if (profileModalRating) {
      const liveStats = getProviderRatingStats(provider.id);
      profileModalRating.innerHTML = '';
      profileModalRating.appendChild(createStarIcon());
      const score = document.createElement('strong');
      score.textContent = liveStats.reviewCount > 0 ? liveStats.averageLabel : '0.0';
      profileModalRating.appendChild(score);
      const count = document.createElement('span');
      count.textContent =
        liveStats.reviewCount > 0
          ? `(${liveStats.reviewCount} ${liveStats.reviewCount === 1 ? 'review' : 'reviews'} · Sample & local demo)`
          : '(No reviews yet)';
      profileModalRating.appendChild(count);
    }

    if (profileModalAvatar) {
      profileModalAvatar.innerHTML = '';
      if (provider.avatar) {
        const img = document.createElement('img');
        img.className = 'provider-avatar-img';
        img.src = provider.avatar;
        img.alt = provider.name;
        img.setAttribute('referrerpolicy', 'no-referrer');
        img.addEventListener('error', () => {
          img.remove();
          profileModalAvatar.textContent = provider.initials;
        });
        profileModalAvatar.appendChild(img);
      } else {
        profileModalAvatar.textContent = provider.initials;
      }
    }

    if (profileModalRates) {
      profileModalRates.innerHTML = '';
      provider.rates.forEach((rate) => {
        const row = document.createElement('div');
        row.className = 'profile-rate-item';

        const nameSpan = document.createElement('span');
        nameSpan.textContent = rate.label;

        const priceSpan = document.createElement('strong');
        priceSpan.textContent = rate.price;

        row.appendChild(nameSpan);
        row.appendChild(priceSpan);
        profileModalRates.appendChild(row);
      });
    }

    openModal(profileModal);
  }

  if (profileBookBtn) {
    profileBookBtn.addEventListener('click', () => {
      const provider = state.activeProfileProvider;
      closeModal(profileModal);
      if (provider) {
        openBookingModal(provider);
      }
    });
  }

  // =========================================================================
  // 5. Booking Modal
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

  function openBookingModal(provider) {
    if (bookingModalTitle) {
      bookingModalTitle.textContent = `Book ${provider.name}`;
    }
    if (bookingProviderLabel) {
      bookingProviderLabel.textContent = `${provider.category} Specialist`;
    }
    if (bookingServiceName) {
      bookingServiceName.textContent = `${provider.name} (${provider.location})`;
    }
    if (bookingServicePrice) {
      bookingServicePrice.textContent = `₹${provider.price}`;
    }
    if (bookingLocality) {
      const typedLoc = filterLocationQuery ? filterLocationQuery.value.trim() : '';
      bookingLocality.value = typedLoc || `${provider.location} ${provider.pinCode}`;
    }
    if (bookingCustomerName && state.signedInUser) {
      bookingCustomerName.value = state.signedInUser;
    }
    if (bookingForm) bookingForm.hidden = false;
    if (bookingConfirmation) bookingConfirmation.hidden = true;
    clearBookingErrors();
    openModal(bookingModal, bookingCustomerName || bookingLocality);
  }

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
        const selectedHelper = bookingServiceName ? bookingServiceName.textContent : 'Helper';
        const selectedPrice = bookingServicePrice ? bookingServicePrice.textContent : '₹199';
        const chosenSlot = bookingSlot ? bookingSlot.value : 'Express (Within 60 mins)';
        const refCode = `FM-${Math.floor(100000 + Math.random() * 900000)}`;

        bookingForm.hidden = true;
        if (bookingConfirmText) {
          bookingConfirmText.textContent = `Reference ${refCode}: ${selectedHelper} (${selectedPrice} starting fee) scheduled for ${chosenSlot} at ${locality}. Confirmation sent to +91 ${phone}.`;
        }
        if (bookingConfirmation) bookingConfirmation.hidden = false;
        bookingForm.reset();
      });
    });
  }

  // =========================================================================
  // 6. Auth Modal (Login / Register)
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

  // Initial render & live review sync
  renderProviders();
  subscribeReviewChanges(() => {
    renderProviders();
    if (state.activeProfileProvider && profileModal && !profileModal.hidden && profileModalRating) {
      const liveStats = getProviderRatingStats(state.activeProfileProvider.id);
      profileModalRating.innerHTML = '';
      profileModalRating.appendChild(createStarIcon());
      const score = document.createElement('strong');
      score.textContent = liveStats.reviewCount > 0 ? liveStats.averageLabel : '0.0';
      profileModalRating.appendChild(score);
      const count = document.createElement('span');
      count.textContent =
        liveStats.reviewCount > 0
          ? `(${liveStats.reviewCount} ${liveStats.reviewCount === 1 ? 'review' : 'reviews'} · Sample & local demo)`
          : '(No reviews yet)';
      profileModalRating.appendChild(count);
    }
  });
});
