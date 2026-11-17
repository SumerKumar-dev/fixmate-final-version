// FixMate – Centralized Reviews & Ratings Manager (Pure Vanilla JavaScript)
// Frontend demonstration using browser localStorage. Does not claim reviews are verified or server-backed.

export const REVIEWS_STORAGE_KEY = 'fixmate_demo_reviews';

function formatReviewDate(dateObj = new Date()) {
  return dateObj.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeReviewItem(raw, fallbackProviderId = '') {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.isSample || String(raw.id || '').startsWith('sample-')) return null;
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

export function removeLegacySampleReviews() {
  try {
    const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const grouped = {};
    const entries = Array.isArray(parsed)
      ? parsed.map((item) => [item && item.providerId, [item]])
      : Object.entries(parsed || {});

    entries.forEach(([providerId, items]) => {
      if (!Array.isArray(items)) return;
      const cleanItems = items
        .map((item) => normalizeReviewItem(item, providerId))
        .filter(Boolean);
      if (cleanItems.length > 0) grouped[providerId] = cleanItems;
    });

    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(grouped));
  } catch {
    try {
      localStorage.removeItem(REVIEWS_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
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

export function getProviderReviews(providerId) {
  const cleanId = String(providerId || '').trim();
  if (!cleanId) return [];

  const storedMap = loadStoredReviewsMap();
  return Array.isArray(storedMap[cleanId]) ? storedMap[cleanId] : [];
}

export function getProviderRatingStats(providerId) {
  const reviews = getProviderReviews(providerId);
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
