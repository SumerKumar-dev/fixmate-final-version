// FixMate – Service Booking System (Pure Vanilla JavaScript)
// Demonstration stage: uses centralized booking-manager.js without real payment or backend dispatch.

import {
  CONVENIENCE_FEE,
  createBookingRecord,
  ensureDemoSeedData,
  formatRupees,
  getTodayISODate,
  loadAllBookings,
  loadCustomerProfile,
  saveCustomerProfile,
  subscribeBookingChanges,
} from './booking-manager.js';
import { getProviderRatingStats, subscribeReviewChanges } from './reviews-manager.js';
import {
  clearFieldValidation,
  focusFirstInvalid,
  hideFeedbackBanner,
  runWithSubmitGuard,
  setFieldValidation,
  showFeedbackBanner,
} from './ui-helpers.js';

const BOOKING_PROVIDERS = [
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatar: 'assets/images/provider-rajesh.jpg',
    category: 'Electrician',
    location: 'Indiranagar, Bengaluru · 560038',
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 164,
    price: 199,
    services: [
      {
        name: 'Electrical Inspection & Fault Diagnosis',
        description: 'Complete circuit testing for tripping MCBs, loose sockets, or power drops.',
        price: 199,
        duration: '30–45 mins',
      },
      {
        name: 'Ceiling / Exhaust Fan Installation',
        description: 'Safe mounting, regulator wiring, and balance check for standard or BLDC fans.',
        price: 249,
        duration: '45 mins',
      },
      {
        name: 'Switchboard & Modular Socket Replacement',
        description: 'Replace burnt sockets, 16A power points, or modular switches cleanly.',
        price: 349,
        duration: '45–60 mins',
      },
      {
        name: 'Home Inverter & UPS Wiring Setup',
        description: 'Connect single-battery home inverter to essential room lighting and fan circuits.',
        price: 699,
        duration: '90 mins',
      },
    ],
  },
  {
    id: 'suresh-verma',
    name: 'Suresh Verma',
    initials: 'SV',
    avatar: 'assets/images/provider-suresh.jpg',
    category: 'Plumber',
    location: 'Andheri West, Mumbai · 400053',
    experienceYears: 11,
    rating: 4.9,
    reviewCount: 218,
    price: 249,
    services: [
      {
        name: 'Plumbing Leakage Inspection',
        description: 'Pressure and joint check for damp walls, dripping taps, or concealed leaks.',
        price: 249,
        duration: '30–45 mins',
      },
      {
        name: 'Tap, Angle Valve & Mixer Replacement',
        description: 'Install or replace kitchen sink mixers, health faucets, and brass angle valves.',
        price: 299,
        duration: '45 mins',
      },
      {
        name: 'Blocked Kitchen or Bathroom Drain Clearing',
        description: 'Mechanical snake clearing and trap cleaning for slow or choked drains.',
        price: 449,
        duration: '60 mins',
      },
      {
        name: 'Western Toilet Cistern & Flush Repair',
        description: 'Replace worn siphon valves, inlet floats, and stopcocks for leak-free flushing.',
        price: 399,
        duration: '60 mins',
      },
    ],
  },
  {
    id: 'karthik-nair',
    name: 'Karthik Nair',
    initials: 'KN',
    avatar: 'assets/images/provider-karthik.jpg',
    category: 'AC Repair',
    location: 'Adyar, Chennai · 600020',
    experienceYears: 7,
    rating: 4.8,
    reviewCount: 139,
    price: 499,
    services: [
      {
        name: 'Split AC Foam-Jet Deep Servicing',
        description: 'High-pressure jet wash of evaporator coils, blower, filters, and outdoor unit with jacket cover.',
        price: 499,
        duration: '60 mins',
      },
      {
        name: 'AC No-Cooling & PCB Checkup',
        description: 'Inspect capacitor, compressor amp draw, thermostat sensor, and indoor drainage.',
        price: 349,
        duration: '45 mins',
      },
      {
        name: 'Water Leakage Drain Flush',
        description: 'Pressurised drain line clearing and tray alignment to stop indoor water dripping.',
        price: 499,
        duration: '45–60 mins',
      },
      {
        name: 'Split AC Uninstallation & Shifting',
        description: 'Safe gas pump-down, copper pipe sealing, and indoor/outdoor unit removal.',
        price: 1199,
        duration: '90–120 mins',
      },
    ],
  },
  {
    id: 'sunita-devi',
    name: 'Sunita Devi',
    initials: 'SD',
    avatar: 'assets/images/provider-sunita.jpg',
    category: 'Home Cleaning',
    location: 'Saket, New Delhi · 110017',
    experienceYears: 6,
    rating: 4.9,
    reviewCount: 192,
    price: 699,
    services: [
      {
        name: 'Bathroom Deep Descaling (1 Bathroom)',
        description: 'Scrub tiles, grout, glass partitions, exhaust fan, and chrome fittings cleanly.',
        price: 699,
        duration: '75 mins',
      },
      {
        name: 'Kitchen & Chimney Deep Degreasing',
        description: 'Remove grease from chimney filters, stove area, backsplash tiles, and cabinets.',
        price: 999,
        duration: '2 hours',
      },
      {
        name: '3-Seater Sofa Shampoo & Extraction',
        description: 'Dry vacuuming, stain spotting, and foam shampooing for fabric sofas.',
        price: 799,
        duration: '90 mins',
      },
      {
        name: '2BHK Full Home Deep Sanitization',
        description: 'Complete floor machine scrubbing, windows, bathrooms, kitchen, and dusting.',
        price: 2899,
        duration: '4–5 hours',
      },
    ],
  },
  {
    id: 'imran-sheikh',
    name: 'Imran Sheikh',
    initials: 'IS',
    avatar: '',
    category: 'Carpenter',
    location: 'Kothrud, Pune · 411038',
    experienceYears: 10,
    rating: 4.8,
    reviewCount: 127,
    price: 299,
    services: [
      {
        name: 'Door Lock / Mortise Latch Installation',
        description: 'Accurate chiselling and installation of main door or bedroom mortise locks.',
        price: 299,
        duration: '45–60 mins',
      },
      {
        name: 'Wardrobe Hinge & Channel Alignment',
        description: 'Replace sagging auto-hinges and telescopic drawer channels for smooth closing.',
        price: 349,
        duration: '60 mins',
      },
      {
        name: 'Curtain Rod & Wall Shelf Drilling',
        description: 'Laser-levelled mounting of double curtain brackets, mirrors, or wooden shelves.',
        price: 249,
        duration: '45 mins',
      },
      {
        name: 'Study Table / Wardrobe Assembly',
        description: 'Complete flat-pack furniture assembly with hardware tightening and levelling.',
        price: 599,
        duration: '90–120 mins',
      },
    ],
  },
  {
    id: 'vikram-rathore',
    name: 'Vikram Rathore',
    initials: 'VR',
    avatar: '',
    category: 'Mechanic',
    location: 'Banjara Hills, Hyderabad · 500034',
    experienceYears: 9,
    rating: 4.8,
    reviewCount: 154,
    price: 349,
    services: [
      {
        name: 'Doorstep Car / Bike Battery Jump-Start',
        description: 'Fast battery boost, alternator charging voltage check, and terminal cleaning.',
        price: 349,
        duration: '30 mins',
      },
      {
        name: 'Two-Wheeler Periodic Doorstep Service',
        description: 'Engine oil change, air filter cleaning, brake adjustment, and chain lubrication.',
        price: 499,
        duration: '60 mins',
      },
      {
        name: 'Car Pre-Trip Inspection & Fluid Top-Up',
        description: 'OBD scan, coolant/brake fluid check, tyre pressure, and wiper inspection.',
        price: 699,
        duration: '60 mins',
      },
      {
        name: 'Puncture & Tyre Valve Emergency Fix',
        description: 'Tubeless puncture repair and portable compressor inflation at your parking spot.',
        price: 299,
        duration: '30 mins',
      },
    ],
  },
  {
    id: 'manoj-tiwari',
    name: 'Manoj Tiwari',
    initials: 'MT',
    avatar: '',
    category: 'Electrician',
    location: 'Powai, Mumbai · 400076',
    experienceYears: 6,
    rating: 4.7,
    reviewCount: 98,
    price: 179,
    services: [
      {
        name: 'Standard Electrical Inspection',
        description: 'Check sockets, earthing leakage, and load balance across rooms.',
        price: 179,
        duration: '30 mins',
      },
      {
        name: 'Geyser Power Point & Installation',
        description: 'Dedicated 16A socket wiring and safe wall mounting for storage geysers.',
        price: 449,
        duration: '60 mins',
      },
      {
        name: 'LED Tube / Wall Light Installation',
        description: 'Mount and wire decorative lights, tube lights, or balcony fixtures.',
        price: 199,
        duration: '30–45 mins',
      },
    ],
  },
  {
    id: 'deepak-kulkarni',
    name: 'Deepak Kulkarni',
    initials: 'DK',
    avatar: '',
    category: 'Carpenter',
    location: 'Jayanagar, Bengaluru · 560041',
    experienceYears: 12,
    rating: 4.9,
    reviewCount: 185,
    price: 329,
    services: [
      {
        name: 'Woodwork Inspection & Door Alignment',
        description: 'Plane swollen wooden doors and tighten hinges for smooth latching.',
        price: 329,
        duration: '45 mins',
      },
      {
        name: 'Hydraulic Bed Lift Piston Replacement',
        description: 'Replace worn gas struts on queen or king storage beds safely.',
        price: 549,
        duration: '60 mins',
      },
      {
        name: 'Drawer Channel Replacement',
        description: 'Install smooth soft-close or ball-bearing telescopic channels.',
        price: 399,
        duration: '45–60 mins',
      },
    ],
  },
  {
    id: 'arvind-patel',
    name: 'Arvind Patel',
    initials: 'AP',
    avatar: '',
    category: 'AC Repair',
    location: 'Koramangala, Bengaluru · 560034',
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 112,
    price: 449,
    services: [
      {
        name: 'Window AC Jet Service',
        description: 'Full coil wash, filter cleaning, and cooling temperature verification.',
        price: 449,
        duration: '50 mins',
      },
      {
        name: 'Indoor Water Leakage Fix',
        description: 'Unblock AC drain pipe and level indoor unit.',
        price: 499,
        duration: '45 mins',
      },
      {
        name: 'Complete Gas Refill (R32 / R410A)',
        description: 'Vacuuming, flare nut tightening, and weighed refrigerant charging.',
        price: 2199,
        duration: '90 mins',
      },
    ],
  },
  {
    id: 'mahesh-yadav',
    name: 'Mahesh Yadav',
    initials: 'MY',
    avatar: '',
    category: 'Plumber',
    location: 'Hauz Khas, New Delhi · 110016',
    experienceYears: 8,
    rating: 4.8,
    reviewCount: 141,
    price: 229,
    services: [
      {
        name: 'Plumbing Inspection Visit',
        description: 'Leak, pressure, and drainage check across kitchen and bathrooms.',
        price: 229,
        duration: '30 mins',
      },
      {
        name: 'Flush Tank / Cistern Repair',
        description: 'Replace leaking flush valve or float mechanism cleanly.',
        price: 349,
        duration: '45 mins',
      },
      {
        name: 'Wash Basin & Bottle Trap Installation',
        description: 'Mount ceramic basin, waste coupling, and leak-proof drain trap.',
        price: 499,
        duration: '60 mins',
      },
    ],
  },
  {
    id: 'farhan-ansari',
    name: 'Farhan Ansari',
    initials: 'FA',
    avatar: '',
    category: 'Mechanic',
    location: 'Viman Nagar, Pune · 411014',
    experienceYears: 7,
    rating: 4.7,
    reviewCount: 94,
    price: 299,
    services: [
      {
        name: 'Vehicle Breakdown Visit & Diagnosis',
        description: 'Inspect starting trouble, spark plug, battery, or fuel line at your doorstep.',
        price: 299,
        duration: '30–45 mins',
      },
      {
        name: 'Bike Engine Oil & Filter Change',
        description: 'Drain old oil, clean strainer/filter, and check chain tension.',
        price: 449,
        duration: '45 mins',
      },
      {
        name: 'Brake Pad Cleaning & Adjustment',
        description: 'Inspect front/rear pads, clean drums, and calibrate brake play.',
        price: 349,
        duration: '40 mins',
      },
    ],
  },
  {
    id: 'prakash-gowda',
    name: 'Prakash Gowda',
    initials: 'PG',
    avatar: '',
    category: 'Home Cleaning',
    location: 'Whitefield, Bengaluru · 560066',
    experienceYears: 5,
    rating: 4.8,
    reviewCount: 121,
    price: 749,
    services: [
      {
        name: '3-Seater Sofa Shampoo & Extraction',
        description: 'Deep vacuuming, fabric-safe foam wash, and moisture extraction.',
        price: 749,
        duration: '75 mins',
      },
      {
        name: 'Balcony & Utility Deep Scrub',
        description: 'Remove moss, dust, and pigeon droppings from balcony tiles and railings.',
        price: 649,
        duration: '60 mins',
      },
      {
        name: '3BHK Move-In Sanitization',
        description: 'Full apartment deep clean before shifting in with family.',
        price: 3499,
        duration: '5–6 hours',
      },
    ],
  },
];

document.addEventListener('DOMContentLoaded', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
  const INDIAN_PIN_REGEX = /^[1-9]\d{5}$/;

  // Footer year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Mobile Menu Drawer
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
  // Structured My Bookings Display (Centralized Booking Manager)
  // =========================================================================
  ensureDemoSeedData();

  function renderMyBookingsList() {
    const listEl = document.getElementById('myBookingsList');
    const emptyEl = document.getElementById('emptyBookingsState');
    if (!listEl) return;

    const records = [...loadAllBookings()].sort((a, b) =>
      (b.createdAt || b.appointmentDate || '').localeCompare(
        a.createdAt || a.appointmentDate || ''
      )
    );
    listEl.innerHTML = '';

    if (emptyEl) {
      emptyEl.hidden = records.length > 0;
    }

    records.forEach((rec) => {
      const card = document.createElement('article');
      card.className = 'booking-record-card';

      const top = document.createElement('div');
      top.className = 'booking-record-top';

      const ref = document.createElement('span');
      ref.className = 'booking-record-ref';
      ref.textContent = rec.referenceId;

      const status = document.createElement('span');
      const normalizedStatus = (rec.status || 'Pending').toLowerCase();
      status.className = `booking-status-label is-${normalizedStatus}`;
      status.textContent = `Status: ${rec.status || 'Pending'}`;

      top.appendChild(ref);
      top.appendChild(status);

      const title = document.createElement('h3');
      title.className = 'booking-record-title';
      title.textContent = `${rec.serviceName} · ${rec.providerName}`;

      const meta = document.createElement('p');
      meta.className = 'booking-record-meta';
      meta.textContent = `${rec.providerCategory} · ${rec.appointmentDate} (${rec.appointmentTime}) · ${rec.serviceAddress}`;

      const footer = document.createElement('div');
      footer.className = 'booking-record-footer';

      const estLabel = document.createElement('span');
      estLabel.textContent = 'Estimated Total';

      const estAmount = document.createElement('span');
      estAmount.textContent = formatRupees(rec.totalEstimatedAmount);

      footer.appendChild(estLabel);
      footer.appendChild(estAmount);

      card.appendChild(top);
      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(footer);
      listEl.appendChild(card);
    });
  }

  renderMyBookingsList();
  subscribeBookingChanges(() => {
    renderMyBookingsList();
  });

  // =========================================================================
  // Resolve Provider & Query Parameters
  // =========================================================================
  const params = new URLSearchParams(window.location.search);
  const requestedId = (params.get('id') || '').trim();
  const requestedService = (params.get('service') || '').trim();
  const requestedDate = (params.get('date') || '').trim();
  const requestedTime = (params.get('time') || '').trim();

  const provider = BOOKING_PROVIDERS.find((p) => p.id === requestedId) || null;

  const bookingProviderMissing = document.getElementById('bookingProviderMissing');
  const bookingMissingMessage = document.getElementById('bookingMissingMessage');
  const completeBookingForm = document.getElementById('completeBookingForm');
  const breadcrumbProfileLink = document.getElementById('breadcrumbProfileLink');

  if (!provider) {
    if (completeBookingForm) completeBookingForm.hidden = true;
    if (bookingProviderMissing) bookingProviderMissing.hidden = false;
    if (bookingMissingMessage && requestedId) {
      bookingMissingMessage.textContent = `We could not find a provider matching ID "${requestedId}". Please choose a verified helper from Explore Services.`;
    }
    if (breadcrumbProfileLink) {
      breadcrumbProfileLink.href = 'services.html';
    }
    return;
  }

  if (breadcrumbProfileLink) {
    breadcrumbProfileLink.href = `provider.html?id=${encodeURIComponent(provider.id)}`;
    breadcrumbProfileLink.textContent = provider.name;
  }

  // =========================================================================
  // Populate Selected Provider Details
  // =========================================================================
  const avatarWrap = document.getElementById('bookingProviderAvatar');
  if (avatarWrap) {
    avatarWrap.innerHTML = '';
    if (provider.avatar) {
      const img = document.createElement('img');
      img.className = 'provider-avatar-img';
      img.src = provider.avatar;
      img.alt = `${provider.name} – ${provider.category}`;
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.addEventListener('error', () => {
        img.remove();
        avatarWrap.textContent = provider.initials;
      });
      avatarWrap.appendChild(img);
    } else {
      avatarWrap.textContent = provider.initials;
    }
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('bookingProviderCategory', provider.category);
  setText('bookingProviderName', provider.name);

  function renderProviderMeta() {
    const liveStats = getProviderRatingStats(provider.id);
    const ratingPart =
      liveStats.reviewCount > 0
        ? `★ ${liveStats.averageLabel} (${liveStats.reviewCount} ${liveStats.reviewCount === 1 ? 'review' : 'reviews'})`
        : 'No reviews yet';
    setText(
      'bookingProviderMeta',
      `${provider.location} · ${ratingPart} · ${provider.experienceYears} yrs exp · Starting ₹${provider.price}`
    );
  }

  renderProviderMeta();
  subscribeReviewChanges(renderProviderMeta);
  setText('summaryProviderName', `${provider.name} (${provider.category})`);

  // =========================================================================
  // Step 1: Service Selection & Auto Price Summary
  // =========================================================================
  const bookingServicesRadioList = document.getElementById('bookingServicesRadioList');
  const bookingServiceDate = document.getElementById('bookingServiceDate');
  const timeSlotsContainer = document.getElementById('timeSlotsContainer');
  const bookingFormErrorBanner = document.getElementById('bookingFormErrorBanner');

  const todayStr = getTodayISODate();
  if (bookingServiceDate) {
    bookingServiceDate.min = todayStr;
    bookingServiceDate.value =
      requestedDate && requestedDate >= todayStr ? requestedDate : todayStr;
  }

  let selectedServiceObj = null;

  function updateSummaryCard() {
    if (selectedServiceObj) {
      setText('summaryServiceName', selectedServiceObj.name);
      setText('summaryDuration', selectedServiceObj.duration);
      setText('summaryServicePrice', `₹${selectedServiceObj.price}`);
      setText('summaryExtraFee', `₹${CONVENIENCE_FEE}`);
      setText('summaryTotalAmount', `₹${selectedServiceObj.price + CONVENIENCE_FEE}`);
    } else {
      setText('summaryServiceName', 'Select a service');
      setText('summaryDuration', '—');
      setText('summaryServicePrice', '₹0');
      setText('summaryExtraFee', `₹${CONVENIENCE_FEE}`);
      setText('summaryTotalAmount', `₹${CONVENIENCE_FEE}`);
    }

    const dateVal = bookingServiceDate ? bookingServiceDate.value : '';
    const checkedTime = document.querySelector('input[name="bookingTimeSlot"]:checked');
    const timeVal = checkedTime ? checkedTime.value : '';

    if (dateVal && timeVal) {
      setText('summaryDateTime', `${dateVal} · ${timeVal}`);
    } else if (dateVal) {
      setText('summaryDateTime', `${dateVal} · Choose time slot`);
    } else {
      setText('summaryDateTime', 'Select date & time');
    }
  }

  if (bookingServicesRadioList) {
    bookingServicesRadioList.innerHTML = '';
    provider.services.forEach((svc, index) => {
      const label = document.createElement('label');
      label.className = 'selectable-service-option';

      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'selectedService';
      radio.value = svc.name;

      const isPreselected = requestedService
        ? svc.name.toLowerCase() === requestedService.toLowerCase()
        : index === 0;

      if (isPreselected) {
        radio.checked = true;
        selectedServiceObj = svc;
      }

      radio.addEventListener('change', () => {
        selectedServiceObj = svc;
        clearFieldValidation(
          bookingServicesRadioList,
          document.getElementById('bookingServicePickError')
        );
        hideFeedbackBanner(bookingFormErrorBanner);
        updateSummaryCard();
      });

      const box = document.createElement('span');
      box.className = 'selectable-service-box';

      const left = document.createElement('span');
      const nameSpan = document.createElement('span');
      nameSpan.className = 'selectable-service-name';
      nameSpan.textContent = svc.name;

      const descSpan = document.createElement('span');
      descSpan.className = 'selectable-service-desc';
      descSpan.textContent = svc.description;

      const durSpan = document.createElement('span');
      durSpan.className = 'selectable-service-duration';
      durSpan.textContent = `Estimated duration: ${svc.duration}`;

      left.appendChild(nameSpan);
      left.appendChild(descSpan);
      left.appendChild(durSpan);

      const priceSpan = document.createElement('span');
      priceSpan.className = 'selectable-service-price';
      priceSpan.textContent = `₹${svc.price}`;

      box.appendChild(left);
      box.appendChild(priceSpan);
      label.appendChild(radio);
      label.appendChild(box);
      bookingServicesRadioList.appendChild(label);
    });
  }

  // Pre-select time slot if passed in URL
  const timeRadios = document.querySelectorAll('input[name="bookingTimeSlot"]');
  if (requestedTime) {
    let matchedTime = false;
    timeRadios.forEach((r) => {
      if (r.value.toLowerCase() === requestedTime.toLowerCase()) {
        r.checked = true;
        matchedTime = true;
      }
    });
    // Fallback keyword match (Morning / Afternoon / Evening)
    if (!matchedTime) {
      const periodWord = requestedTime.split(' ')[0].toLowerCase();
      const firstMatch = Array.from(timeRadios).find((r) =>
        r.value.toLowerCase().includes(periodWord)
      );
      if (firstMatch) firstMatch.checked = true;
    }
  }

  timeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      clearFieldValidation(timeSlotsContainer, document.getElementById('bookingTimeSlotError'));
      hideFeedbackBanner(bookingFormErrorBanner);
      updateSummaryCard();
    });
  });

  if (bookingServiceDate) {
    bookingServiceDate.addEventListener('change', () => {
      clearFieldValidation(bookingServiceDate, document.getElementById('bookingServiceDateError'));
      hideFeedbackBanner(bookingFormErrorBanner);
      updateSummaryCard();
    });
  }

  updateSummaryCard();

  // =========================================================================
  // Step 3: Prefill Non-Sensitive Customer Details if Available (Frontend Only)
  // =========================================================================
  const custFullName = document.getElementById('custFullName');
  const custEmail = document.getElementById('custEmail');
  const custPhone = document.getElementById('custPhone');
  const custAddress = document.getElementById('custAddress');
  const custCity = document.getElementById('custCity');
  const custPin = document.getElementById('custPin');
  const custInstructions = document.getElementById('custInstructions');
  const prefillNotice = document.getElementById('prefillNotice');

  if (localStorage.getItem('fixmate_demo_customer')) {
    const savedProfile = loadCustomerProfile();
    let prefilledAny = false;
    if (savedProfile.fullName && custFullName) {
      custFullName.value = savedProfile.fullName;
      prefilledAny = true;
    }
    if (savedProfile.email && custEmail) {
      custEmail.value = savedProfile.email;
      prefilledAny = true;
    }
    if (savedProfile.phone && custPhone) {
      custPhone.value = savedProfile.phone;
      prefilledAny = true;
    }
    if (savedProfile.address && custAddress) {
      custAddress.value = savedProfile.address;
      prefilledAny = true;
    }
    if (savedProfile.city && custCity) {
      custCity.value = savedProfile.city;
    }
    if (savedProfile.pinCode && custPin) {
      custPin.value = savedProfile.pinCode;
    }
    if (prefilledAny && prefillNotice) {
      prefillNotice.hidden = false;
    }
  }

  // Clear inline errors on input
  [
    [custFullName, 'custFullNameError'],
    [custEmail, 'custEmailError'],
    [custPhone, 'custPhoneError'],
    [custAddress, 'custAddressError'],
    [custCity, 'custCityError'],
    [custPin, 'custPinError'],
  ].forEach(([el, errId]) => {
    if (el) {
      el.addEventListener('input', () => {
        clearFieldValidation(el, document.getElementById(errId));
        hideFeedbackBanner(bookingFormErrorBanner);
      });
    }
  });

  // =========================================================================
  // Confirm Booking Submission & Validation
  // =========================================================================
  const bookingConfirmationCard = document.getElementById('bookingConfirmationCard');
  const confirmRefId = document.getElementById('confirmRefId');
  const confirmationDetailsGrid = document.getElementById('confirmationDetailsGrid');

  if (completeBookingForm) {
    completeBookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      hideFeedbackBanner(bookingFormErrorBanner);

      let isValid = true;
      const servicePickErrEl = document.getElementById('bookingServicePickError');
      const serviceDateErrEl = document.getElementById('bookingServiceDateError');
      const timeSlotErrEl = document.getElementById('bookingTimeSlotError');

      if (!selectedServiceObj) {
        setFieldValidation(
          bookingServicesRadioList,
          servicePickErrEl,
          'Please select a service option.'
        );
        isValid = false;
      } else {
        clearFieldValidation(bookingServicesRadioList, servicePickErrEl);
      }

      const dateVal = bookingServiceDate ? bookingServiceDate.value : '';
      if (!dateVal) {
        setFieldValidation(
          bookingServiceDate,
          serviceDateErrEl,
          'Please select a preferred service date.'
        );
        isValid = false;
      } else if (dateVal < todayStr) {
        setFieldValidation(
          bookingServiceDate,
          serviceDateErrEl,
          'Past dates cannot be selected. Choose today or later.'
        );
        isValid = false;
      } else {
        clearFieldValidation(bookingServiceDate, serviceDateErrEl);
      }

      const checkedTime = document.querySelector('input[name="bookingTimeSlot"]:checked');
      const timeVal = checkedTime ? checkedTime.value : '';
      if (!timeVal) {
        setFieldValidation(
          timeSlotsContainer,
          timeSlotErrEl,
          'Please select a Morning, Afternoon, or Evening time slot.'
        );
        isValid = false;
      } else {
        clearFieldValidation(timeSlotsContainer, timeSlotErrEl);
      }

      const nameVal = custFullName ? custFullName.value.trim() : '';
      const emailVal = custEmail ? custEmail.value.trim() : '';
      const phoneVal = custPhone ? custPhone.value.trim() : '';
      const addressVal = custAddress ? custAddress.value.trim() : '';
      const cityVal = custCity ? custCity.value.trim() : '';
      const pinVal = custPin ? custPin.value.trim() : '';
      const instructionsVal = custInstructions ? custInstructions.value.trim() : '';

      const validateTextField = (inputEl, errId, condition, msg) => {
        const errEl = document.getElementById(errId);
        if (!condition) {
          setFieldValidation(inputEl, errEl, msg);
          isValid = false;
        } else {
          clearFieldValidation(inputEl, errEl);
        }
      };

      validateTextField(
        custFullName,
        'custFullNameError',
        nameVal.length >= 2,
        'Please enter your full name.'
      );
      validateTextField(
        custEmail,
        'custEmailError',
        Boolean(emailVal && EMAIL_REGEX.test(emailVal)),
        'Please enter a valid email address.'
      );
      validateTextField(
        custPhone,
        'custPhoneError',
        Boolean(phoneVal && INDIAN_PHONE_REGEX.test(phoneVal)),
        'Enter a valid 10-digit Indian mobile number starting with 6–9.'
      );
      validateTextField(
        custAddress,
        'custAddressError',
        addressVal.length >= 6,
        'Please enter your complete house/flat and street address.'
      );
      validateTextField(
        custCity,
        'custCityError',
        cityVal.length >= 2,
        'Please enter your city.'
      );
      validateTextField(
        custPin,
        'custPinError',
        INDIAN_PIN_REGEX.test(pinVal),
        'Enter a valid 6-digit Indian PIN code.'
      );

      if (!isValid) {
        showFeedbackBanner(
          bookingFormErrorBanner,
          'Please complete all highlighted booking and contact fields above.',
          'error'
        );
        focusFirstInvalid(completeBookingForm);
        return;
      }

      const submitBtn = completeBookingForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Recording Booking...', () => {
        const totalEstimatedAmount = selectedServiceObj.price + CONVENIENCE_FEE;

        const result = createBookingRecord({
          providerId: provider.id,
          providerName: provider.name,
          providerCategory: provider.category,
          serviceCategory: provider.category,
          providerLocation: provider.location,
          serviceName: selectedServiceObj.name,
          servicePrice: selectedServiceObj.price,
          additionalCharges: CONVENIENCE_FEE,
          totalEstimatedAmount,
          appointmentDate: dateVal,
          appointmentTime: timeVal,
          customerName: nameVal,
          customerEmail: emailVal,
          customerPhone: phoneVal,
          address: addressVal,
          city: cityVal,
          pinCode: pinVal,
          instructions: instructionsVal,
        });

        if (!result.ok) {
          showFeedbackBanner(
            bookingFormErrorBanner,
            result.error || 'Could not save booking.',
            'error'
          );
          return;
        }

        const bookingRecord = result.booking;
        saveCustomerProfile({
          fullName: nameVal,
          email: emailVal,
          phone: phoneVal,
          address: addressVal,
          city: cityVal,
          pinCode: pinVal,
        });

        renderMyBookingsList();

        // Render Confirmation Screen
        if (confirmRefId) {
          confirmRefId.textContent = `Booking Reference: ${bookingRecord.referenceId}`;
        }

        if (confirmationDetailsGrid) {
          confirmationDetailsGrid.innerHTML = '';
          const detailItems = [
            { label: 'Service Provider', value: `${provider.name} (${provider.category})` },
            { label: 'Provider Location', value: provider.location },
            { label: 'Selected Service', value: selectedServiceObj.name },
            { label: 'Appointment Slot', value: `${dateVal} · ${timeVal}` },
            { label: 'Service Address', value: `${addressVal}, ${cityVal} – ${pinVal}` },
            { label: 'Customer Contact', value: `${nameVal} · +91 ${phoneVal}` },
            { label: 'Booking Status', value: 'Pending (In-app notification sent)' },
            { label: 'Estimated Total', value: formatRupees(totalEstimatedAmount) },
          ];

          detailItems.forEach((item) => {
            const cell = document.createElement('div');
            const lbl = document.createElement('span');
            lbl.className = 'profile-spec-label';
            lbl.textContent = item.label;

            const val = document.createElement('span');
            val.className = 'profile-spec-value';
            val.textContent = item.value;

            cell.appendChild(lbl);
            cell.appendChild(val);
            confirmationDetailsGrid.appendChild(cell);
          });
        }

        completeBookingForm.hidden = true;
        if (bookingConfirmationCard) {
          bookingConfirmationCard.hidden = false;
          bookingConfirmationCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
});
