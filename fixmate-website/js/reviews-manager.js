// FixMate – Centralized Reviews & Ratings Manager (Pure Vanilla JavaScript)
// Frontend demonstration using browser localStorage. Does not claim reviews are verified or server-backed.

export const REVIEWS_STORAGE_KEY = 'fixmate_demo_reviews';

export const SAMPLE_REVIEWS_BY_PROVIDER = Object.freeze({
  'rajesh-kumar': [
    {
      id: 'sample-rk-1',
      providerId: 'rajesh-kumar',
      customer: 'Ananya Iyer',
      rating: 5,
      date: '14 Oct 2026',
      comment:
        'Arrived on time in Indiranagar and fixed our tripping MCB and loose inverter terminal in 25 minutes. Transparent ₹349 billing.',
      isSample: true,
    },
    {
      id: 'sample-rk-2',
      providerId: 'rajesh-kumar',
      customer: 'Siddharth Menon',
      rating: 5,
      date: '02 Oct 2026',
      comment:
        'Installed two BLDC ceiling fans and replaced an old 16A geyser socket neatly without damaging wall paint.',
      isSample: true,
    },
    {
      id: 'sample-rk-3',
      providerId: 'rajesh-kumar',
      customer: 'Meera Krishnan',
      rating: 4,
      date: '19 Sep 2026',
      comment:
        'Polite and thorough with safety testing using a multimeter. Explained the wiring issue clearly.',
      isSample: true,
    },
  ],
  'suresh-verma': [
    {
      id: 'sample-sv-1',
      providerId: 'suresh-verma',
      customer: 'Neha Kulkarni',
      rating: 5,
      date: '18 Oct 2026',
      comment:
        'Solved a stubborn kitchen sink pipe leak in Lokhandwala cleanly. Charged ₹299 for valve replacement with proper seal.',
      isSample: true,
    },
    {
      id: 'sample-sv-2',
      providerId: 'suresh-verma',
      customer: 'Amitabh Joshi',
      rating: 5,
      date: '05 Oct 2026',
      comment:
        'Very experienced plumber. Replaced our concealed flush valve without breaking the bathroom tiles.',
      isSample: true,
    },
    {
      id: 'sample-sv-3',
      providerId: 'suresh-verma',
      customer: 'Ritu Kapoor',
      rating: 5,
      date: '24 Sep 2026',
      comment: 'Punctual arrival and carried all original brass fittings in his kit.',
      isSample: true,
    },
  ],
  'karthik-nair': [
    {
      id: 'sample-kn-1',
      providerId: 'karthik-nair',
      customer: 'Priya Subramanian',
      rating: 5,
      date: '16 Oct 2026',
      comment:
        'Foam-jet servicing made our 3-year-old split AC cool like new again. Zero water mess on the wall.',
      isSample: true,
    },
    {
      id: 'sample-kn-2',
      providerId: 'karthik-nair',
      customer: 'Vigneshwaran R',
      rating: 5,
      date: '04 Oct 2026',
      comment:
        'Diagnosed a faulty outdoor capacitor honestly instead of pushing an unnecessary gas refill.',
      isSample: true,
    },
    {
      id: 'sample-kn-3',
      providerId: 'karthik-nair',
      customer: 'Lakshmi Narayanan',
      rating: 4,
      date: '21 Sep 2026',
      comment: 'Courteous technician and clear ₹499 rate card.',
      isSample: true,
    },
  ],
  'sunita-devi': [
    {
      id: 'sample-sd-1',
      providerId: 'sunita-devi',
      customer: 'Kavita Malhotra',
      rating: 5,
      date: '19 Oct 2026',
      comment:
        'Sunita and her teammate removed years of hard-water stains from our Saket bathroom tiles. Paid ₹699.',
      isSample: true,
    },
    {
      id: 'sample-sd-2',
      providerId: 'sunita-devi',
      customer: 'Raghav Khanna',
      rating: 5,
      date: '07 Oct 2026',
      comment:
        'Booked 2BHK move-in cleaning before shifting. Extremely thorough and brought all machines.',
      isSample: true,
    },
    {
      id: 'sample-sd-3',
      providerId: 'sunita-devi',
      customer: 'Nandini Gupta',
      rating: 5,
      date: '26 Sep 2026',
      comment: 'Kitchen chimney and tiles look brand new. Very reliable crew.',
      isSample: true,
    },
  ],
  'imran-sheikh': [
    {
      id: 'sample-is-1',
      providerId: 'imran-sheikh',
      customer: 'Rohan Deshmukh',
      rating: 5,
      date: '15 Oct 2026',
      comment: 'Aligned three wardrobe doors and replaced a noisy drawer channel in Kothrud.',
      isSample: true,
    },
    {
      id: 'sample-is-2',
      providerId: 'imran-sheikh',
      customer: 'Snehal Patwardhan',
      rating: 5,
      date: '03 Oct 2026',
      comment: 'Fitted our Godrej main door lock cleanly with zero splintering.',
      isSample: true,
    },
    {
      id: 'sample-is-3',
      providerId: 'imran-sheikh',
      customer: 'Prasad Gokhale',
      rating: 4,
      date: '20 Sep 2026',
      comment: 'Quick and clean work, cleaned up sawdust before leaving.',
      isSample: true,
    },
  ],
  'vikram-rathore': [
    {
      id: 'sample-vr-1',
      providerId: 'vikram-rathore',
      customer: 'Sandeep Reddy',
      rating: 5,
      date: '17 Oct 2026',
      comment:
        'Car battery died in basement parking at Banjara Hills. Vikram reached in 35 minutes and jump-started it for ₹349.',
      isSample: true,
    },
    {
      id: 'sample-vr-2',
      providerId: 'vikram-rathore',
      customer: 'Divya Rao',
      rating: 5,
      date: '06 Oct 2026',
      comment:
        'Got my Activa serviced right outside our apartment gate. Honest pricing and genuine oil.',
      isSample: true,
    },
    {
      id: 'sample-vr-3',
      providerId: 'vikram-rathore',
      customer: 'Kiran Verma',
      rating: 4,
      date: '22 Sep 2026',
      comment: 'Checked engine warning light using OBD scanner and cleared a loose sensor issue.',
      isSample: true,
    },
  ],
  'manoj-tiwari': [
    {
      id: 'sample-mt-1',
      providerId: 'manoj-tiwari',
      customer: 'Pooja Deshpande',
      rating: 5,
      date: '11 Oct 2026',
      comment: 'Installed two chandeliers in Hiranandani Powai cleanly and safely.',
      isSample: true,
    },
    {
      id: 'sample-mt-2',
      providerId: 'manoj-tiwari',
      customer: 'Nikhil Shah',
      rating: 4,
      date: '29 Sep 2026',
      comment: 'Fixed a burnt kitchen geyser socket promptly at ₹349.',
      isSample: true,
    },
  ],
  'deepak-kulkarni': [
    {
      id: 'sample-dk-1',
      providerId: 'deepak-kulkarni',
      customer: 'Harish Rao',
      rating: 5,
      date: '13 Oct 2026',
      comment: 'Fixed our jammed teak bedroom door and hydraulic bed lifts in Jayanagar.',
      isSample: true,
    },
    {
      id: 'sample-dk-2',
      providerId: 'deepak-kulkarni',
      customer: 'Suma Hegde',
      rating: 5,
      date: '01 Oct 2026',
      comment: 'Very skilled craftsman and transparent rates.',
      isSample: true,
    },
  ],
  'arvind-patel': [
    {
      id: 'sample-ap-1',
      providerId: 'arvind-patel',
      customer: 'Varun Bhatia',
      rating: 5,
      date: '10 Oct 2026',
      comment: 'Stopped our split AC from dripping water in Koramangala 4th Block.',
      isSample: true,
    },
    {
      id: 'sample-ap-2',
      providerId: 'arvind-patel',
      customer: 'Shreya Nair',
      rating: 4,
      date: '25 Sep 2026',
      comment: 'Good preventive servicing before warm weather.',
      isSample: true,
    },
  ],
  'mahesh-yadav': [
    {
      id: 'sample-my-1',
      providerId: 'mahesh-yadav',
      customer: 'Deepa Chawla',
      rating: 5,
      date: '12 Oct 2026',
      comment: 'Fixed our running bathroom cistern quickly and cleanly.',
      isSample: true,
    },
    {
      id: 'sample-my-2',
      providerId: 'mahesh-yadav',
      customer: 'Gaurav Saxena',
      rating: 5,
      date: '28 Sep 2026',
      comment: 'Replaced wash basin trap and kitchen tap without any mess.',
      isSample: true,
    },
  ],
  'farhan-ansari': [
    {
      id: 'sample-fa-1',
      providerId: 'farhan-ansari',
      customer: 'Tanvi Kulkarni',
      rating: 5,
      date: '09 Oct 2026',
      comment: 'Replaced my scooter clutch cable right in our Viman Nagar society parking.',
      isSample: true,
    },
    {
      id: 'sample-fa-2',
      providerId: 'farhan-ansari',
      customer: 'Abhishek Pawar',
      rating: 4,
      date: '27 Sep 2026',
      comment: 'Prompt doorstep oil change and brake service.',
      isSample: true,
    },
  ],
  'prakash-gowda': [
    {
      id: 'sample-pg-1',
      providerId: 'prakash-gowda',
      customer: 'Nandita Rao',
      rating: 5,
      date: '15 Oct 2026',
      comment: 'Cleaned our L-shaped fabric sofa and balcony in Whitefield spotless for ₹749.',
      isSample: true,
    },
    {
      id: 'sample-pg-2',
      providerId: 'prakash-gowda',
      customer: 'Saurabh Jain',
      rating: 5,
      date: '02 Oct 2026',
      comment: 'Great equipment and polite two-member team.',
      isSample: true,
    },
  ],
});

function formatReviewDate(dateObj = new Date()) {
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeReviewItem(raw, fallbackProviderId = '') {
  if (!raw || typeof raw !== 'object') return null;
  const providerId = String(raw.providerId || fallbackProviderId || '').trim();
  const customer = String(raw.customer || raw.customerName || '').trim();
  const comment = String(raw.comment || raw.description || '').trim();
  const ratingNum = Number(raw.rating);
  if (!providerId || !customer || !comment || !Number.isFinite(ratingNum)) {
    return null;
  }
  const rating = Math.min(5, Math.max(1, Math.round(ratingNum)));
  return {
    id: String(raw.id || `rev-${Date.now()}`),
    providerId,
    customer,
    rating,
    date: String(raw.date || formatReviewDate()),
    comment,
    createdAt: raw.createdAt || '',
    isSample: Boolean(raw.isSample),
  };
}

export function loadStoredReviewsMap() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);

    // Support both { [providerId]: Review[] } and flat Review[]
    if (Array.isArray(parsed)) {
      const grouped = {};
      parsed.forEach((item) => {
        const clean = normalizeReviewItem(item);
        if (clean) {
          if (!grouped[clean.providerId]) grouped[clean.providerId] = [];
          grouped[clean.providerId].push(clean);
        }
      });
      return grouped;
    }

    if (parsed && typeof parsed === 'object') {
      const cleanMap = {};
      Object.entries(parsed).forEach(([pid, list]) => {
        if (!Array.isArray(list)) return;
        const cleanList = list.map((item) => normalizeReviewItem(item, pid)).filter(Boolean);
        if (cleanList.length > 0) {
          cleanMap[pid] = cleanList;
        }
      });
      return cleanMap;
    }

    return {};
  } catch {
    return {};
  }
}

function saveStoredReviewsMap(map) {
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors gracefully
  }
  dispatchReviewsChanged();
}

export function getProviderReviews(providerId, fallbackSamples = null) {
  const cleanId = String(providerId || '').trim();
  if (!cleanId) return [];

  const storedMap = loadStoredReviewsMap();
  const userReviews = Array.isArray(storedMap[cleanId]) ? storedMap[cleanId] : [];

  const sampleSource = Array.isArray(fallbackSamples)
    ? fallbackSamples
    : SAMPLE_REVIEWS_BY_PROVIDER[cleanId] || [];

  const normalizedSamples = sampleSource
    .map((item, idx) =>
      normalizeReviewItem(
        {
          ...item,
          id: item.id || `sample-${cleanId}-${idx + 1}`,
          isSample: true,
        },
        cleanId
      )
    )
    .filter(Boolean);

  // Deduplicate by ID while keeping user-submitted reviews first
  const seen = new Set();
  const combined = [];
  [...userReviews, ...normalizedSamples].forEach((rev) => {
    if (!seen.has(rev.id)) {
      seen.add(rev.id);
      combined.push(rev);
    }
  });

  return combined;
}

export function getProviderRatingStats(providerId, fallbackSamples = null) {
  const reviews = getProviderReviews(providerId, fallbackSamples);
  const reviewCount = reviews.length;

  if (reviewCount === 0) {
    return {
      reviews: [],
      reviewCount: 0,
      averageRating: 0,
      averageLabel: '0.0',
      breakdown: [5, 4, 3, 2, 1].map((stars) => ({ stars, count: 0, percent: 0 })),
    };
  }

  const totalScore = reviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = Number((totalScore / reviewCount).toFixed(1));

  const breakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percent = Math.round((count / reviewCount) * 100);
    return { stars, count, percent };
  });

  return {
    reviews,
    reviewCount,
    averageRating,
    averageLabel: averageRating.toFixed(1),
    breakdown,
  };
}

export function addProviderReview({ providerId, customerName, rating, comment }) {
  const cleanProviderId = String(providerId || '').trim();
  const cleanName = String(customerName || '').trim();
  const cleanComment = String(comment || '').trim();
  const numericRating = Number(rating);

  if (!cleanProviderId) {
    return { ok: false, error: 'Provider ID is missing.' };
  }
  if (cleanName.length < 2) {
    return { ok: false, error: 'Please enter your name (at least 2 characters).' };
  }
  if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
    return { ok: false, error: 'Please select a star rating from 1 to 5.' };
  }
  if (cleanComment.length < 8) {
    return {
      ok: false,
      error: 'Please write a short description of your service experience (at least 8 characters).',
    };
  }

  const newReview = {
    id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    providerId: cleanProviderId,
    customer: cleanName,
    rating: numericRating,
    date: formatReviewDate(new Date()),
    comment: cleanComment,
    createdAt: new Date().toISOString(),
    isSample: false,
  };

  const map = loadStoredReviewsMap();
  const existingForProvider = Array.isArray(map[cleanProviderId]) ? map[cleanProviderId] : [];
  map[cleanProviderId] = [newReview, ...existingForProvider];
  saveStoredReviewsMap(map);

  const stats = getProviderRatingStats(cleanProviderId);
  return { ok: true, review: newReview, stats };
}

export function dispatchReviewsChanged(detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent('fixmate:reviews-updated', { detail }));
  } catch {
    // Ignore in restricted environments
  }
}

export function subscribeReviewChanges(callback) {
  if (typeof callback !== 'function') return () => {};

  const handleStorage = (event) => {
    if (!event.key || event.key === REVIEWS_STORAGE_KEY) {
      callback({ source: 'storage' });
    }
  };
  const handleCustom = (event) => {
    callback({ source: 'local', detail: event.detail });
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('fixmate:reviews-updated', handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('fixmate:reviews-updated', handleCustom);
  };
}
