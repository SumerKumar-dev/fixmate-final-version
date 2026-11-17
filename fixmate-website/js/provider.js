// FixMate – Dynamic Service Provider Profile Page (Pure Vanilla JavaScript)

import { getTodayISODate } from './booking-manager.js';
import { initProviderBookingDesk } from './provider-dashboard.js';
import { getDemoSession } from './auth-session.js';
import {
  addProviderReview,
  getProviderRatingStats,
  subscribeReviewChanges,
} from './reviews-manager.js';
import {
  clearFieldValidation,
  focusFirstInvalid,
  hideFeedbackBanner,
  runWithSubmitGuard,
  setFieldValidation,
  showFeedbackBanner,
} from './ui-helpers.js';

const PROVIDER_PROFILES = [
  {
    id: 'rajesh-kumar',
    name: 'Rajesh Kumar',
    initials: 'RK',
    avatar: 'assets/images/provider-rajesh.jpg',
    category: 'Electrician',
    location: 'Indiranagar, Bengaluru · 560038',
    areasServed: 'Indiranagar, Ulsoor, Domlur, HAL 2nd Stage (560038, 560008, 560075)',
    experienceYears: 8,
    price: 199,
    availability: 'Available Today · 45 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:00 AM – 8:30 PM IST',
    samplePhone: '+91 98450 21480',
    sampleEmail: 'rajesh.kumar@fixmate.in',
    about:
      'ITI-certified residential electrician with 8 years of hands-on experience across East Bengaluru apartments and independent homes. Specialises in safe MCB distribution panels, inverter backup wiring, ceiling fan mounting, and zero-mess fault tracing.',
    servicesSummary: 'Wiring, MCB Panels, Fans, Lighting & Inverter Setup',
    skills: [
      'Single & Three-Phase Wiring',
      'MCB & RCCB Troubleshooting',
      'Inverter & Battery Setup',
      'Ceiling & Exhaust Fan Mounting',
      'Geyser Power Points',
    ],
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
    areasServed: 'Andheri West, Versova, Juhu, Lokhandwala (400053, 400058, 400049)',
    experienceYears: 11,
    price: 249,
    availability: 'Available Today · 50 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 7:30 AM – 9:00 PM IST',
    samplePhone: '+91 98204 77192',
    sampleEmail: 'suresh.verma@fixmate.in',
    about:
      'Senior residential plumber with 11 years of experience solving concealed CPVC pipe leaks, bathroom mixer installations, and blocked kitchen drains across Western Suburbs in Mumbai without unnecessary tile breakage.',
    servicesSummary: 'Leak Repairs, Taps & Mixers, Drain Clearing & Tank Motors',
    skills: [
      'CPVC & UPVC Pipe Repairs',
      'Jaquar & Kohler Mixer Fittings',
      'Blocked Drain Clearing',
      'Concealed Flush Tank Repair',
      'Overhead Tank Valve Setup',
    ],
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
    areasServed: 'Adyar, Besant Nagar, Thiruvanmiyur, Mylapore (600020, 600041, 600028)',
    experienceYears: 7,
    price: 499,
    availability: 'Available Today · 60 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:30 AM – 8:30 PM IST',
    samplePhone: '+91 98401 66320',
    sampleEmail: 'karthik.nair@fixmate.in',
    about:
      'Factory-trained HVAC technician specialising in inverter split ACs, foam-jet deep coil servicing, nitrogen pressure leak detection, and PCB diagnostics designed for coastal Chennai humidity.',
    servicesSummary: 'Foam-Jet Servicing, Gas Refill, Installation & PCB Repair',
    skills: [
      'Split & Window AC Foam-Jet Wash',
      'R32 & R410A Refrigerant Charging',
      'Nitrogen Leak Testing',
      'Indoor Water Drip Fixing',
      'Inverter PCB Diagnostics',
    ],
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
    areasServed: 'Saket, Malviya Nagar, Hauz Khas, Green Park (110017, 110016, 110049)',
    experienceYears: 6,
    price: 699,
    availability: 'Available Today · Same-day slots',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:00 AM – 7:30 PM IST',
    samplePhone: '+91 98112 50418',
    sampleEmail: 'sunita.devi@fixmate.in',
    about:
      'Leads a trained residential hygiene crew in South Delhi using eco-safe descalers, steam scrubbers, and HEPA vacuums for hard-water bathroom stain removal, kitchen degreasing, and full apartment sanitization.',
    servicesSummary: 'Bathroom Descaling, Kitchen Degreasing & Full Home Cleaning',
    skills: [
      'Hard-Water Scale Removal',
      'Chimney & Hob Degreasing',
      'Upholstery & Sofa Shampooing',
      'Move-In Apartment Sanitization',
      'Eco-Safe Surface Care',
    ],
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
    areasServed: 'Kothrud, Erandwane, Deccan, Warje (411038, 411004, 411052)',
    experienceYears: 10,
    price: 299,
    availability: 'Available Today · 60 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:30 AM – 8:00 PM IST',
    samplePhone: '+91 98230 44195',
    sampleEmail: 'imran.sheikh@fixmate.in',
    about:
      'Precision residential carpenter with 10 years of experience in smart main-door locks, modular kitchen soft-close hinges, wardrobe sliding channels, and flat-pack furniture assembly in West Pune.',
    servicesSummary: 'Door Locks, Wardrobe Hinges, Shelving & Furniture Assembly',
    skills: [
      'Godrej & Smart Lock Fitting',
      'Soft-Close Wardrobe Hinges',
      'Sliding Channel Repairs',
      'Flat-Pack Furniture Assembly',
      'Curtain Rods & Wall Shelves',
    ],
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
    areasServed: 'Banjara Hills, Jubilee Hills, Panjagutta, Somajiguda (500034, 500033, 500082)',
    experienceYears: 9,
    price: 349,
    availability: 'Available Today · 45 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 7:00 AM – 9:30 PM IST',
    samplePhone: '+91 98490 31874',
    sampleEmail: 'vikram.rathore@fixmate.in',
    about:
      'Mobile car and two-wheeler technician equipped with portable battery jump-start packs, OBD-II fault scanners, and genuine spare kits for doorstep vehicle servicing and urgent breakdown recovery.',
    servicesSummary: 'Battery Jump-Start, Bike Servicing, Car Inspection & Breakdown Help',
    skills: [
      'Car & Scooter Battery Jump-Start',
      'OBD-II Engine Fault Scanning',
      'Two-Wheeler Periodic Service',
      'Brake Pad & Clutch Adjustment',
      'Fluid & Filter Replacement',
    ],
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
    areasServed: 'Powai, Chandivali, Vikhroli West (400076, 400072, 400087)',
    experienceYears: 6,
    price: 179,
    availability: 'Next Slot: 3:30 PM',
    availableNow: false,
    workingHours: 'Mon – Sun · 8:30 AM – 8:00 PM IST',
    samplePhone: '+91 98215 62890',
    sampleEmail: 'manoj.tiwari@fixmate.in',
    about:
      'Dependable residential electrician serving Powai high-rises for geyser power points, chandelier mounting, earthing voltage testing, and modular switch upgrades.',
    servicesSummary: 'Geyser Points, Chandeliers, Earthing & Switchboards',
    skills: [
      'Geyser 16A Socket Wiring',
      'Chandelier & Wall Light Mounting',
      'Earthing Voltage Testing',
      'Modular Switch Upgrades',
    ],
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
    areasServed: 'Jayanagar, Basavanagudi, JP Nagar (560041, 560011, 560070)',
    experienceYears: 12,
    price: 329,
    availability: 'Available Today · 55 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sat · 8:30 AM – 7:30 PM IST',
    samplePhone: '+91 98451 89304',
    sampleEmail: 'deepak.kulkarni@fixmate.in',
    about:
      'Master carpenter with 12 years of experience working with solid teak doors, hydraulic storage beds, sliding wardrobes, and custom woodwork repairs in South Bengaluru.',
    servicesSummary: 'Hardwood Doors, Hydraulic Beds, Wardrobes & Hardware',
    skills: [
      'Teak Door Planing & Alignment',
      'Hydraulic Bed Gas-Lift Replacement',
      'Sliding Wardrobe Tracks',
      'Drawer Channels & Handles',
    ],
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
    areasServed: 'Koramangala, HSR Layout, BTM Layout (560034, 560095, 560102)',
    experienceYears: 9,
    price: 449,
    availability: 'Next Slot: 4:00 PM',
    availableNow: false,
    workingHours: 'Mon – Sun · 9:00 AM – 8:30 PM IST',
    samplePhone: '+91 98802 15460',
    sampleEmail: 'arvind.patel@fixmate.in',
    about:
      'Experienced AC technician handling window & split AC servicing, drain pipe flushing, capacitor replacement, and refrigerant gas top-ups across Koramangala and HSR Layout.',
    servicesSummary: 'Window & Split AC Service, Drain Flush & Gas Refill',
    skills: [
      'Window AC Jet Cleaning',
      'Drain Line Unblocking',
      'Compressor Capacitor Check',
      'Gas Charging (R32 / R410A)',
    ],
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
    areasServed: 'Hauz Khas, Green Park, SDA, Saket (110016, 110017, 110029)',
    experienceYears: 8,
    price: 229,
    availability: 'Available Today · 50 mins ETA',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:00 AM – 8:30 PM IST',
    samplePhone: '+91 98180 73241',
    sampleEmail: 'mahesh.yadav@fixmate.in',
    about:
      'South Delhi plumber experienced in cistern repairs, pressure booster pumps, RO inlet connections, and wash basin installations.',
    servicesSummary: 'Cisterns, Booster Pumps, Taps & Basin Installations',
    skills: [
      'Flush Tank & Cistern Repairs',
      'Pressure Pump Setup',
      'RO Water Inlet Fittings',
      'Wash Basin & Drain Trap',
    ],
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
    areasServed: 'Viman Nagar, Kalyani Nagar, Kharadi (411014, 411006, 411032)',
    experienceYears: 7,
    price: 299,
    availability: 'Next Slot: 2:30 PM',
    availableNow: false,
    workingHours: 'Mon – Sun · 8:00 AM – 8:30 PM IST',
    samplePhone: '+91 98501 29487',
    sampleEmail: 'farhan.ansari@fixmate.in',
    about:
      'Doorstep two-wheeler and compact car technician serving Viman Nagar and Kharadi for breakdown checks, oil changes, brake adjustments, and cable replacements.',
    servicesSummary: 'Breakdown Checks, Oil Changes, Brakes & Two-Wheeler Service',
    skills: [
      'Scooter & Bike Periodic Service',
      'Brake Shoe & Disc Cleaning',
      'Clutch & Accelerator Cables',
      'Spark Plug & Battery Check',
    ],
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
    areasServed: 'Whitefield, ITPL, Brookefield, Marathahalli (560066, 560048, 560037)',
    experienceYears: 5,
    price: 749,
    availability: 'Available Today · Same-day slots',
    availableNow: true,
    workingHours: 'Mon – Sun · 8:00 AM – 7:30 PM IST',
    samplePhone: '+91 98456 90213',
    sampleEmail: 'prakash.gowda@fixmate.in',
    about:
      'Upholstery and deep apartment cleaning specialist operating in Whitefield with wet-dry extraction machines for sofas, carpets, mattresses, and move-in sanitization.',
    servicesSummary: 'Sofa Shampooing, Balcony Scrubbing & Move-In Cleaning',
    skills: [
      'Fabric Sofa Shampooing',
      'Mattress & Carpet Extraction',
      'Balcony High-Pressure Scrubbing',
      'Move-In Apartment Cleaning',
    ],
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
  // Set footer year
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

  // Resolve Provider ID from URL query parameter
  const params = new URLSearchParams(window.location.search);
  const hasIdParam = params.has('id');
  const requestedId = (params.get('id') || '').trim();

  let provider = null;
  if (!hasIdParam) {
    provider = PROVIDER_PROFILES[0];
  } else {
    provider = PROVIDER_PROFILES.find((item) => item.id === requestedId) || null;
  }

  const providerHeroCard = document.getElementById('providerHeroCard');
  const providerContentGrid = document.getElementById('providerContentGrid');
  const providerNotFound = document.getElementById('providerNotFound');
  const providerNotFoundMessage = document.getElementById('providerNotFoundMessage');
  const breadcrumbProviderName = document.getElementById('breadcrumbProviderName');

  if (!provider) {
    if (providerHeroCard) providerHeroCard.hidden = true;
    if (providerContentGrid) providerContentGrid.hidden = true;
    if (breadcrumbProviderName) breadcrumbProviderName.textContent = 'Provider Not Found';
    if (providerNotFound) providerNotFound.hidden = false;
    if (providerNotFoundMessage && requestedId) {
      providerNotFoundMessage.textContent = `No service provider profile was found for ID "${requestedId}". Please return to Explore Services to select an active helper.`;
    }
    document.title = 'Provider Not Found – FixMate';
    return;
  }

  // Update page title & breadcrumb
  document.title = `${provider.name} (${provider.category}) – FixMate`;
  if (breadcrumbProviderName) {
    breadcrumbProviderName.textContent = provider.name;
  }

  // Helper: SVG Star (filled or muted outline)
  function createStarSvg(size = 16, filled = true) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M8 1L10.1 5.3L14.8 6L11.4 9.3L12.2 14L8 11.8L3.8 14L4.6 9.3L1.2 6L5.9 5.3L8 1Z'
    );
    path.setAttribute('fill', filled ? '#1D63ED' : '#CBD5E1');
    svg.appendChild(path);
    return svg;
  }

  // 1. Populate Profile Header
  const heroAvatar = document.getElementById('providerHeroAvatar');
  if (heroAvatar) {
    heroAvatar.innerHTML = '';
    if (provider.avatar) {
      const img = document.createElement('img');
      img.src = provider.avatar;
      img.alt = `${provider.name} – ${provider.category}`;
      img.setAttribute('referrerpolicy', 'no-referrer');
      img.addEventListener('error', () => {
        img.remove();
        heroAvatar.textContent = provider.initials;
      });
      heroAvatar.appendChild(img);
    } else {
      heroAvatar.textContent = provider.initials;
    }
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('providerHeroCategory', provider.category);
  setText('providerHeroName', provider.name);
  setText('providerHeroLocation', provider.location);
  setText('providerHeroExp', `${provider.experienceYears} years experience`);
  setText('providerHeroPrice', `From ₹${provider.price}`);

  function renderHeroRating(stats) {
    const heroRatingEl = document.getElementById('providerHeroRating');
    if (!heroRatingEl) return;
    heroRatingEl.innerHTML = '';
    heroRatingEl.appendChild(createStarSvg(15, stats.reviewCount > 0));
    const ratingText = document.createElement('span');
    ratingText.textContent =
      stats.reviewCount > 0
        ? `${stats.averageLabel} (${stats.reviewCount} ${stats.reviewCount === 1 ? 'review' : 'reviews'})`
        : 'No reviews yet';
    heroRatingEl.appendChild(ratingText);
  }

  const heroAvailabilityEl = document.getElementById('providerHeroAvailability');
  if (heroAvailabilityEl) {
    heroAvailabilityEl.textContent = provider.availability;
    heroAvailabilityEl.classList.toggle('is-later', !provider.availableNow);
  }

  // 2. Populate Provider Information Section
  setText('providerAboutText', provider.about);
  setText('infoExperience', `${provider.experienceYears} years of field experience`);
  setText('infoStartingPrice', `₹${provider.price} (inspection visit)`);
  setText('infoServicesSummary', provider.servicesSummary);
  setText('infoAreasServed', provider.areasServed);
  setText('infoWorkingHours', provider.workingHours);
  setText('infoContactDetails', `${provider.samplePhone} · ${provider.sampleEmail}`);

  const skillsListEl = document.getElementById('infoSkillsList');
  if (skillsListEl) {
    skillsListEl.innerHTML = '';
    provider.skills.forEach((skill, idx) => {
      const span = document.createElement('span');
      span.className = 'skill-item-text';
      span.textContent = skill;
      skillsListEl.appendChild(span);

      if (idx < provider.skills.length - 1) {
        const sep = document.createElement('span');
        sep.className = 'meta-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = '·';
        skillsListEl.appendChild(sep);
      }
    });
  }

  // 3. Populate Services & Pricing Cards
  const servicesListEl = document.getElementById('providerServicesList');
  const bookingServiceSelect = document.getElementById('bookingServiceSelect');
  const bookingSidebar = document.getElementById('bookingSidebar');

  if (bookingServiceSelect) {
    bookingServiceSelect.innerHTML = '<option value="">Choose a service</option>';
  }

  if (servicesListEl) {
    servicesListEl.innerHTML = '';
    provider.services.forEach((svc) => {
      const card = document.createElement('article');
      card.className = 'offered-service-card';

      const top = document.createElement('div');
      top.className = 'offered-service-top';

      const title = document.createElement('h3');
      title.className = 'offered-service-name';
      title.textContent = svc.name;

      const price = document.createElement('span');
      price.className = 'offered-service-price';
      price.textContent = `₹${svc.price}`;

      top.appendChild(title);
      top.appendChild(price);

      const desc = document.createElement('p');
      desc.className = 'offered-service-desc';
      desc.textContent = svc.description;

      const footer = document.createElement('div');
      footer.className = 'offered-service-footer';

      const duration = document.createElement('span');
      duration.className = 'offered-service-duration';
      duration.textContent = `Est. ${svc.duration}`;

      const bookBtn = document.createElement('button');
      bookBtn.type = 'button';
      bookBtn.className = 'btn-select-service';
      bookBtn.textContent = 'Book Now';
      bookBtn.addEventListener('click', () => {
        const targetUrl = `booking.html?id=${encodeURIComponent(
          provider.id
        )}&service=${encodeURIComponent(svc.name)}`;
        window.location.href = targetUrl;
      });

      footer.appendChild(duration);
      footer.appendChild(bookBtn);

      card.appendChild(top);
      card.appendChild(desc);
      card.appendChild(footer);
      servicesListEl.appendChild(card);

      if (bookingServiceSelect) {
        const option = document.createElement('option');
        option.value = svc.name;
        option.textContent = `${svc.name} (₹${svc.price})`;
        bookingServiceSelect.appendChild(option);
      }
    });
  }

  // 4. Reviews & Ratings System (locally submitted demo reviews)
  let selectedReviewStarFilter = 'all';
  let chosenFormRating = 0;
  let hoveredFormRating = 0;

  const toggleReviewFormBtn = document.getElementById('toggleReviewFormBtn');
  const addReviewFormCard = document.getElementById('addReviewFormCard');
  const cancelReviewFormBtn = document.getElementById('cancelReviewFormBtn');
  const resetReviewFormBtn = document.getElementById('resetReviewFormBtn');
  const addReviewForm = document.getElementById('addReviewForm');
  const reviewCustomerName = document.getElementById('reviewCustomerName');
  const reviewDescription = document.getElementById('reviewDescription');
  const reviewStarPicker = document.getElementById('reviewStarPicker');
  const starPickerReadout = document.getElementById('starPickerReadout');
  const reviewFormFeedback = document.getElementById('reviewFormFeedback');
  const reviewsFilterBar = document.getElementById('reviewsFilterBar');
  const reviewsEmptyState = document.getElementById('reviewsEmptyState');
  const reviewsEmptyHeading = document.getElementById('reviewsEmptyHeading');
  const reviewsEmptyDesc = document.getElementById('reviewsEmptyDesc');
  const reviewsEmptyActionBtn = document.getElementById('reviewsEmptyActionBtn');

  function setReviewFormOpen(open) {
    if (!addReviewFormCard || !toggleReviewFormBtn) return;
    addReviewFormCard.hidden = !open;
    toggleReviewFormBtn.setAttribute('aria-expanded', String(open));
    toggleReviewFormBtn.textContent = open ? 'Close Review Form' : 'Write a Review';
    if (open && reviewCustomerName) {
      reviewCustomerName.focus();
    }
  }

  function updateStarPickerUI() {
    if (!reviewStarPicker) return;
    const activeVal = hoveredFormRating || chosenFormRating;
    reviewStarPicker.querySelectorAll('.star-pick-btn').forEach((btn) => {
      const val = Number(btn.dataset.starValue || 0);
      btn.classList.toggle('is-filled', val <= activeVal);
      btn.setAttribute('aria-checked', String(val === chosenFormRating));
    });
    if (starPickerReadout) {
      starPickerReadout.textContent =
        chosenFormRating > 0
          ? `${chosenFormRating} out of 5 ${chosenFormRating === 1 ? 'star' : 'stars'}`
          : 'Select rating';
    }
  }

  function clearReviewFormErrors() {
    clearFieldValidation(reviewCustomerName, document.getElementById('reviewNameError'));
    clearFieldValidation(reviewStarPicker, document.getElementById('reviewRatingError'));
    clearFieldValidation(reviewDescription, document.getElementById('reviewDescError'));
  }

  function resetReviewForm() {
    if (addReviewForm) addReviewForm.reset();
    chosenFormRating = 0;
    hoveredFormRating = 0;
    updateStarPickerUI();
    clearReviewFormErrors();
  }

  function renderReviewsAndRatings() {
    const stats = getProviderRatingStats(provider.id);

    // Update Hero + Reviews Summary
    renderHeroRating(stats);
    setText('reviewsOverallScore', stats.reviewCount > 0 ? stats.averageLabel : '0.0');
    setText(
      'reviewsTotalCount',
      stats.reviewCount > 0
        ? `${stats.reviewCount} ${stats.reviewCount === 1 ? 'review' : 'reviews'} (local demo)`
        : 'No reviews yet'
    );

    const overallStarsEl = document.getElementById('reviewsOverallStars');
    if (overallStarsEl) {
      overallStarsEl.innerHTML = '';
      const filledStars = Math.round(stats.averageRating);
      for (let i = 1; i <= 5; i += 1) {
        overallStarsEl.appendChild(createStarSvg(16, i <= filledStars));
      }
    }

    const breakdownListEl = document.getElementById('ratingBreakdownList');
    if (breakdownListEl) {
      breakdownListEl.innerHTML = '';
      stats.breakdown.forEach((row) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'rating-bar-row';

        const label = document.createElement('span');
        label.className = 'rating-bar-label';
        label.textContent = `${row.stars} star`;

        const track = document.createElement('div');
        track.className = 'rating-bar-track';
        const fill = document.createElement('div');
        fill.className = 'rating-bar-fill';
        fill.style.width = `${row.percent}%`;
        track.appendChild(fill);

        const pct = document.createElement('span');
        pct.className = 'rating-bar-percent';
        pct.textContent = `${row.percent}%`;

        rowEl.appendChild(label);
        rowEl.appendChild(track);
        rowEl.appendChild(pct);
        breakdownListEl.appendChild(rowEl);
      });
    }

    // Update Star Filter Tabs
    if (reviewsFilterBar) {
      reviewsFilterBar.querySelectorAll('[data-review-star]').forEach((btn) => {
        const key = btn.dataset.reviewStar || 'all';
        const isActive = selectedReviewStarFilter === key;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
        if (key === 'all') {
          btn.textContent = `All Reviews (${stats.reviewCount})`;
        } else {
          const starNum = Number(key);
          const countObj = stats.breakdown.find((b) => b.stars === starNum);
          btn.textContent = `${starNum} ${starNum === 1 ? 'Star' : 'Stars'} (${countObj ? countObj.count : 0})`;
        }
      });
    }

    const filteredReviews =
      selectedReviewStarFilter === 'all'
        ? stats.reviews
        : stats.reviews.filter((r) => r.rating === Number(selectedReviewStarFilter));

    const reviewsListEl = document.getElementById('customerReviewsList');
    if (reviewsListEl) {
      reviewsListEl.innerHTML = '';
      reviewsListEl.hidden = filteredReviews.length === 0;

      filteredReviews.forEach((review) => {
        const item = document.createElement('article');
        item.className = 'review-item';

        const top = document.createElement('div');
        top.className = 'review-item-top';

        const authorWrap = document.createElement('div');
        authorWrap.className = 'review-author-wrap';

        const author = document.createElement('span');
        author.className = 'review-author-name';
        author.textContent = review.customer;

        const originTag = document.createElement('span');
        originTag.className = 'review-origin-label';
        originTag.textContent = review.isSample ? 'Sample Review' : 'Local Demo Review';

        authorWrap.appendChild(author);
        authorWrap.appendChild(originTag);

        const date = document.createElement('span');
        date.className = 'review-date';
        date.textContent = review.date;

        top.appendChild(authorWrap);
        top.appendChild(date);

        const starsRow = document.createElement('div');
        starsRow.className = 'review-stars-row';
        for (let s = 1; s <= 5; s += 1) {
          starsRow.appendChild(createStarSvg(14, s <= review.rating));
        }
        const ratingValueLabel = document.createElement('span');
        ratingValueLabel.className = 'review-stars-text';
        ratingValueLabel.textContent = `${review.rating}.0 / 5`;
        starsRow.appendChild(ratingValueLabel);

        const comment = document.createElement('p');
        comment.className = 'review-comment';
        comment.textContent = review.comment;

        item.appendChild(top);
        item.appendChild(starsRow);
        item.appendChild(comment);
        reviewsListEl.appendChild(item);
      });
    }

    // Helpful Empty State when no reviews or filtered star has 0 matches
    if (reviewsEmptyState) {
      if (filteredReviews.length === 0) {
        reviewsEmptyState.hidden = false;
        if (stats.reviewCount === 0) {
          if (reviewsEmptyHeading) reviewsEmptyHeading.textContent = 'No reviews available yet';
          if (reviewsEmptyDesc) {
            reviewsEmptyDesc.textContent = `No reviews have been added for ${provider.name} yet. Use Write a Review to submit a local demonstration review.`;
          }
          if (reviewsEmptyActionBtn) reviewsEmptyActionBtn.textContent = 'Write a Review';
        } else {
          if (reviewsEmptyHeading) {
            reviewsEmptyHeading.textContent = `No ${selectedReviewStarFilter}-star reviews yet`;
          }
          if (reviewsEmptyDesc) {
            reviewsEmptyDesc.textContent = `There are currently no ${selectedReviewStarFilter}-star reviews for ${provider.name}.`;
          }
          if (reviewsEmptyActionBtn) reviewsEmptyActionBtn.textContent = 'Show All Reviews';
        }
      } else {
        reviewsEmptyState.hidden = true;
      }
    }
  }

  // Review Form & Filter Events
  if (toggleReviewFormBtn) {
    toggleReviewFormBtn.addEventListener('click', () => {
      const currentlyOpen = addReviewFormCard && !addReviewFormCard.hidden;
      if (reviewFormFeedback) reviewFormFeedback.hidden = true;
      setReviewFormOpen(!currentlyOpen);
    });
  }

  if (cancelReviewFormBtn) {
    cancelReviewFormBtn.addEventListener('click', () => {
      clearReviewFormErrors();
      setReviewFormOpen(false);
    });
  }

  if (resetReviewFormBtn) {
    resetReviewFormBtn.addEventListener('click', () => {
      resetReviewForm();
      if (reviewFormFeedback) reviewFormFeedback.hidden = true;
    });
  }

  if (reviewsEmptyActionBtn) {
    reviewsEmptyActionBtn.addEventListener('click', () => {
      if (selectedReviewStarFilter !== 'all') {
        selectedReviewStarFilter = 'all';
        renderReviewsAndRatings();
      } else {
        setReviewFormOpen(true);
      }
    });
  }

  if (reviewsFilterBar) {
    reviewsFilterBar.querySelectorAll('[data-review-star]').forEach((btn) => {
      btn.addEventListener('click', () => {
        selectedReviewStarFilter = btn.dataset.reviewStar || 'all';
        renderReviewsAndRatings();
      });
    });
  }

  if (reviewStarPicker) {
    const starBtns = Array.from(reviewStarPicker.querySelectorAll('.star-pick-btn'));
    starBtns.forEach((btn, idx) => {
      const val = Number(btn.dataset.starValue || 0);
      btn.addEventListener('mouseenter', () => {
        hoveredFormRating = val;
        updateStarPickerUI();
      });
      btn.addEventListener('mouseleave', () => {
        hoveredFormRating = 0;
        updateStarPickerUI();
      });
      btn.addEventListener('click', () => {
        chosenFormRating = val;
        clearFieldValidation(reviewStarPicker, document.getElementById('reviewRatingError'));
        updateStarPickerUI();
      });
      btn.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
          event.preventDefault();
          const next = starBtns[Math.min(starBtns.length - 1, idx + 1)];
          if (next) {
            chosenFormRating = Number(next.dataset.starValue || 5);
            clearFieldValidation(reviewStarPicker, document.getElementById('reviewRatingError'));
            updateStarPickerUI();
            next.focus();
          }
        } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
          event.preventDefault();
          const prev = starBtns[Math.max(0, idx - 1)];
          if (prev) {
            chosenFormRating = Number(prev.dataset.starValue || 1);
            clearFieldValidation(reviewStarPicker, document.getElementById('reviewRatingError'));
            updateStarPickerUI();
            prev.focus();
          }
        }
      });
    });
  }

  if (reviewCustomerName) {
    reviewCustomerName.addEventListener('input', () =>
      clearFieldValidation(reviewCustomerName, document.getElementById('reviewNameError'))
    );
  }
  if (reviewDescription) {
    reviewDescription.addEventListener('input', () =>
      clearFieldValidation(reviewDescription, document.getElementById('reviewDescError'))
    );
  }

  if (addReviewForm) {
    addReviewForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearReviewFormErrors();
      hideFeedbackBanner(reviewFormFeedback);

      const nameVal = reviewCustomerName ? reviewCustomerName.value.trim() : '';
      const descVal = reviewDescription ? reviewDescription.value.trim() : '';
      let isValid = true;

      if (nameVal.length < 2) {
        setFieldValidation(
          reviewCustomerName,
          document.getElementById('reviewNameError'),
          'Please enter your name (at least 2 characters).'
        );
        isValid = false;
      }
      if (chosenFormRating < 1 || chosenFormRating > 5) {
        setFieldValidation(
          reviewStarPicker,
          document.getElementById('reviewRatingError'),
          'Please choose a star rating from 1 to 5.'
        );
        isValid = false;
      }
      if (descVal.length < 8) {
        setFieldValidation(
          reviewDescription,
          document.getElementById('reviewDescError'),
          'Please write a review description (at least 8 characters).'
        );
        isValid = false;
      }

      if (!isValid) {
        focusFirstInvalid(addReviewForm);
        return;
      }

      const submitBtn = addReviewForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Saving Review...', () => {
        const result = addProviderReview({
          providerId: provider.id,
          customerName: nameVal,
          rating: chosenFormRating,
          comment: descVal,
        });

        if (!result.ok) {
          showFeedbackBanner(reviewFormFeedback, result.error || 'Could not save review.', 'error');
          return;
        }

        selectedReviewStarFilter = 'all';
        resetReviewForm();
        setReviewFormOpen(false);
        renderReviewsAndRatings();

        showFeedbackBanner(
          reviewFormFeedback,
          `Thank you, ${nameVal}! Your ${result.review.rating}-star demonstration review has been saved locally and ${provider.name}'s rating updated to ${result.stats.averageLabel} (${result.stats.reviewCount} reviews).`,
          'success'
        );
      });
    });
  }

  renderReviewsAndRatings();
  subscribeReviewChanges(() => {
    renderReviewsAndRatings();
  });

  // 5. Booking & Contact Sidebar
  setText('sidebarPrice', `₹${provider.price}`);
  const sidebarAvailEl = document.getElementById('sidebarAvailability');
  if (sidebarAvailEl) {
    sidebarAvailEl.textContent = provider.availability;
    sidebarAvailEl.classList.toggle('is-later', !provider.availableNow);
  }

  setText('contactDrawerPhone', `Phone: ${provider.samplePhone}`);
  setText('contactDrawerEmail', `Email: ${provider.sampleEmail}`);
  setText('contactDrawerHours', `Hours: ${provider.workingHours}`);

  const contactProviderBtn = document.getElementById('contactProviderBtn');
  const providerContactDrawer = document.getElementById('providerContactDrawer');
  if (contactProviderBtn && providerContactDrawer) {
    contactProviderBtn.addEventListener('click', () => {
      providerContactDrawer.hidden = !providerContactDrawer.hidden;
    });
  }

  const bookingDateInput = document.getElementById('bookingDateInput');
  const bookingTimeSelect = document.getElementById('bookingTimeSelect');
  const providerBookingForm = document.getElementById('providerBookingForm');
  const providerBookingFeedback = document.getElementById('providerBookingFeedback');

  const todayStr = getTodayISODate();
  if (bookingDateInput) {
    bookingDateInput.min = todayStr;
    bookingDateInput.value = todayStr;
  }

  const clearBookingErrors = () => {
    clearFieldValidation(bookingServiceSelect, document.getElementById('bookingServiceError'));
    clearFieldValidation(bookingDateInput, document.getElementById('bookingDateError'));
    clearFieldValidation(bookingTimeSelect, document.getElementById('bookingTimeError'));
  };

  [
    [bookingServiceSelect, 'bookingServiceError'],
    [bookingDateInput, 'bookingDateError'],
    [bookingTimeSelect, 'bookingTimeError'],
  ].forEach(([field, errId]) => {
    if (field) {
      field.addEventListener('change', () => {
        clearFieldValidation(field, document.getElementById(errId));
        hideFeedbackBanner(providerBookingFeedback);
      });
    }
  });

  if (providerBookingForm) {
    providerBookingForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearBookingErrors();
      hideFeedbackBanner(providerBookingFeedback);

      const selectedService = bookingServiceSelect ? bookingServiceSelect.value : '';
      const selectedDate = bookingDateInput ? bookingDateInput.value : '';
      const selectedTime = bookingTimeSelect ? bookingTimeSelect.value : '';
      let isValid = true;

      if (!selectedService) {
        setFieldValidation(
          bookingServiceSelect,
          document.getElementById('bookingServiceError'),
          'Please select a service from the list.'
        );
        isValid = false;
      }

      if (!selectedDate) {
        setFieldValidation(
          bookingDateInput,
          document.getElementById('bookingDateError'),
          'Please choose a preferred date.'
        );
        isValid = false;
      } else if (selectedDate < todayStr) {
        setFieldValidation(
          bookingDateInput,
          document.getElementById('bookingDateError'),
          'Please choose today or an upcoming date.'
        );
        isValid = false;
      }

      if (!selectedTime) {
        setFieldValidation(
          bookingTimeSelect,
          document.getElementById('bookingTimeError'),
          'Please select a preferred time slot.'
        );
        isValid = false;
      }

      if (!isValid) {
        showFeedbackBanner(
          providerBookingFeedback,
          'Please select a service, date, and time slot before booking.',
          'error'
        );
        focusFirstInvalid(providerBookingForm);
        return;
      }

      const submitBtn = providerBookingForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Opening Booking...', () => {
        const bookingParams = new URLSearchParams({
          id: provider.id,
          service: selectedService,
          date: selectedDate,
          time: selectedTime,
        });
        window.location.href = `booking.html?${bookingParams.toString()}`;
      });
    });
  }

  // 6. Initialize Centralized Provider Booking Management Desk (Demo View)
  const providerDeskEl = document.getElementById('providerBookingDesk');
  const providerDeskLabel = document.getElementById('providerDeskProviderLabel');
  const session = getDemoSession();
  const canManageBookings =
    session &&
    session.role === 'Service Provider' &&
    session.providerId === provider.id;
  const jumpToProviderDesk = document.getElementById('jumpToProviderDesk');
  if (jumpToProviderDesk) jumpToProviderDesk.hidden = !canManageBookings;
  if (providerDeskEl && canManageBookings) {
    providerDeskEl.hidden = false;
    if (providerDeskLabel) {
      providerDeskLabel.textContent = `${provider.name} (${provider.id})`;
    }
    initProviderBookingDesk({
      providerId: provider.id,
      providerName: provider.name,
      rootEl: providerDeskEl,
    });
  }
});
