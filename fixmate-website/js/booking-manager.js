// FixMate – Centralized Booking Management System (Pure Vanilla JavaScript)
// Frontend demonstration using browser localStorage. Does not provide real-time multi-user sync or server-side booking security.

export const BOOKINGS_STORAGE_KEY = 'fixmate_demo_bookings';
export const CUSTOMER_PROFILE_KEY = 'fixmate_demo_customer';
export const NOTIFICATIONS_STORAGE_KEY = 'fixmate_demo_notifications';
export const DASHBOARD_SEEDED_FLAG = 'fixmate_demo_dashboard_seeded';
export const CONVENIENCE_FEE = 49;

export const BOOKING_STATUSES = Object.freeze({
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  CANCELLED: 'Cancelled',
  COMPLETED: 'Completed',
});

export const VALID_STATUS_TRANSITIONS = Object.freeze({
  Pending: ['Confirmed', 'Rejected', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Rejected: [],
  Cancelled: [],
  Completed: [],
});

export const DEFAULT_DEMO_PROFILE = Object.freeze({
  fullName: 'Arjun Mehta',
  email: 'arjun.mehta@example.in',
  phone: '9845098765',
  address: 'Flat 302, Palm Grove Residency, 12th Main, Indiranagar',
  city: 'Bengaluru',
  pinCode: '560038',
});

const INITIAL_SEED_BOOKINGS = [
  {
    referenceId: 'FM-2026-814502',
    providerId: 'rajesh-kumar',
    providerName: 'Rajesh Kumar',
    providerCategory: 'Electrician',
    providerLocation: 'Indiranagar, Bengaluru · 560038',
    serviceName: 'Switchboard & Modular Socket Replacement',
    servicePrice: 349,
    additionalCharges: 49,
    totalEstimatedAmount: 398,
    appointmentDate: '2026-11-22',
    appointmentTime: 'Morning (9:00 AM – 11:00 AM)',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.mehta@example.in',
    customerPhone: '9845098765',
    address: 'Flat 302, Palm Grove Residency, 12th Main, Indiranagar',
    city: 'Bengaluru',
    pinCode: '560038',
    instructions: 'Sample pending booking for kitchen 16A socket replacement.',
    status: 'Pending',
    createdAt: '2026-11-16T08:20:00.000Z',
  },
  {
    referenceId: 'FM-2026-702319',
    providerId: 'arvind-patel',
    providerName: 'Arvind Patel',
    providerCategory: 'AC Repair',
    providerLocation: 'Koramangala, Bengaluru · 560034',
    serviceName: 'Indoor Water Leakage Fix',
    servicePrice: 499,
    additionalCharges: 49,
    totalEstimatedAmount: 548,
    appointmentDate: '2026-11-20',
    appointmentTime: 'Afternoon (3:30 PM – 5:30 PM)',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.mehta@example.in',
    customerPhone: '9845098765',
    address: 'Flat 302, Palm Grove Residency, 12th Main, Indiranagar',
    city: 'Bengaluru',
    pinCode: '560038',
    instructions: 'Call security gate intercom 302 on arrival.',
    status: 'Confirmed',
    createdAt: '2026-11-15T11:10:00.000Z',
    acceptedAt: '2026-11-15T12:05:00.000Z',
  },
  {
    referenceId: 'FM-2026-619044',
    providerId: 'deepak-kulkarni',
    providerName: 'Deepak Kulkarni',
    providerCategory: 'Carpenter',
    providerLocation: 'Jayanagar, Bengaluru · 560041',
    serviceName: 'Woodwork Inspection & Door Alignment',
    servicePrice: 329,
    additionalCharges: 49,
    totalEstimatedAmount: 378,
    appointmentDate: '2026-11-08',
    appointmentTime: 'Morning (11:00 AM – 1:00 PM)',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.mehta@example.in',
    customerPhone: '9845098765',
    address: 'Flat 302, Palm Grove Residency, 12th Main, Indiranagar',
    city: 'Bengaluru',
    pinCode: '560038',
    instructions: 'Main teak door hinge alignment.',
    status: 'Completed',
    createdAt: '2026-11-06T10:05:00.000Z',
    acceptedAt: '2026-11-06T10:45:00.000Z',
    completedAt: '2026-11-08T12:30:00.000Z',
  },
  {
    referenceId: 'FM-2026-508812',
    providerId: 'prakash-gowda',
    providerName: 'Prakash Gowda',
    providerCategory: 'Home Cleaning',
    providerLocation: 'Whitefield, Bengaluru · 560066',
    serviceName: 'Balcony & Utility Deep Scrub',
    servicePrice: 649,
    additionalCharges: 49,
    totalEstimatedAmount: 698,
    appointmentDate: '2026-10-29',
    appointmentTime: 'Evening (5:30 PM – 7:30 PM)',
    customerName: 'Arjun Mehta',
    customerEmail: 'arjun.mehta@example.in',
    customerPhone: '9845098765',
    address: 'Flat 302, Palm Grove Residency, 12th Main, Indiranagar',
    city: 'Bengaluru',
    pinCode: '560038',
    instructions: 'Rescheduled due to travel.',
    status: 'Cancelled',
    createdAt: '2026-10-27T16:40:00.000Z',
    cancelledAt: '2026-10-28T09:15:00.000Z',
  },
  {
    referenceId: 'FM-2026-418205',
    providerId: 'karthik-nair',
    providerName: 'Karthik Nair',
    providerCategory: 'AC Repair',
    providerLocation: 'Adyar, Chennai · 600020',
    serviceName: 'Split AC Foam-Jet Deep Servicing',
    servicePrice: 499,
    additionalCharges: 49,
    totalEstimatedAmount: 548,
    appointmentDate: '2026-11-12',
    appointmentTime: 'Morning (11:00 AM – 1:00 PM)',
    customerName: 'Priya Subramanian',
    customerEmail: 'priya.s@example.in',
    customerPhone: '9840112233',
    address: 'Flat 2B, Besant Avenue, Adyar',
    city: 'Chennai',
    pinCode: '600020',
    instructions: 'Sample completed booking record for demonstration.',
    status: 'Completed',
    createdAt: '2026-11-10T09:15:00.000Z',
    acceptedAt: '2026-11-10T10:00:00.000Z',
    completedAt: '2026-11-12T12:15:00.000Z',
  },
  {
    referenceId: 'FM-2026-529104',
    providerId: 'suresh-verma',
    providerName: 'Suresh Verma',
    providerCategory: 'Plumber',
    providerLocation: 'Andheri West, Mumbai · 400053',
    serviceName: 'Tap, Angle Valve & Mixer Replacement',
    servicePrice: 299,
    additionalCharges: 49,
    totalEstimatedAmount: 348,
    appointmentDate: '2026-11-24',
    appointmentTime: 'Afternoon (3:30 PM – 5:30 PM)',
    customerName: 'Amitabh Joshi',
    customerEmail: 'amitabh.j@example.in',
    customerPhone: '9820411223',
    address: '704, Sagarika CHS, Lokhandwala',
    city: 'Mumbai',
    pinCode: '400053',
    instructions: 'Sample confirmed booking record for demonstration.',
    status: 'Confirmed',
    createdAt: '2026-11-15T14:30:00.000Z',
    acceptedAt: '2026-11-15T15:10:00.000Z',
  },
  {
    referenceId: 'FM-2026-903418',
    providerId: 'rajesh-kumar',
    providerName: 'Rajesh Kumar',
    providerCategory: 'Electrician',
    providerLocation: 'Indiranagar, Bengaluru · 560038',
    serviceName: 'Ceiling / Exhaust Fan Installation',
    servicePrice: 249,
    additionalCharges: 49,
    totalEstimatedAmount: 298,
    appointmentDate: '2026-11-23',
    appointmentTime: 'Afternoon (1:30 PM – 3:30 PM)',
    customerName: 'Kavita Deshmukh',
    customerEmail: 'kavita.d@example.in',
    customerPhone: '9880123456',
    address: '14, 6th Cross, HAL 2nd Stage',
    city: 'Bengaluru',
    pinCode: '560008',
    instructions: 'Two BLDC ceiling fans in bedrooms.',
    status: 'Confirmed',
    createdAt: '2026-11-15T16:10:00.000Z',
    acceptedAt: '2026-11-15T16:50:00.000Z',
  },
];

export function getTodayISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatRupees(amount) {
  const numeric = Number(amount);
  const safeValue = Number.isFinite(numeric) ? Math.round(numeric) : 0;
  return `₹${safeValue.toLocaleString('en-IN')}`;
}

export function formatTimestampLabel(isoString) {
  if (!isoString) return 'Recorded';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return String(isoString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function normalizeStatusValue(status) {
  const cleaned = String(status || '').trim().toLowerCase();
  switch (cleaned) {
    case 'confirmed':
      return BOOKING_STATUSES.CONFIRMED;
    case 'rejected':
      return BOOKING_STATUSES.REJECTED;
    case 'cancelled':
    case 'canceled':
      return BOOKING_STATUSES.CANCELLED;
    case 'completed':
      return BOOKING_STATUSES.COMPLETED;
    default:
      return BOOKING_STATUSES.PENDING;
  }
}

function deriveCustomerId(email, phone) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (cleanEmail) return cleanEmail;
  const cleanPhone = String(phone || '').trim();
  return cleanPhone ? `phone:${cleanPhone}` : 'guest-customer';
}

/**
 * Normalizes and migrates older booking records cleanly without losing fields.
 */
export function normalizeBookingRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const refId = String(raw.referenceId || raw.bookingId || '').trim();
  if (!refId) return null;

  const customerEmail = String(raw.customerEmail || '').trim();
  const customerPhone = String(raw.customerPhone || '').trim();
  const address = String(raw.address || '').trim();
  const city = String(raw.city || '').trim();
  const pinCode = String(raw.pinCode || '').trim();
  const constructedAddress = [address, city, pinCode ? `– ${pinCode}` : '']
    .filter(Boolean)
    .join(', ')
    .replace(', –', ' –');

  const servicePrice = Number.isFinite(Number(raw.servicePrice))
    ? Number(raw.servicePrice)
    : 0;
  const additionalCharges = Number.isFinite(Number(raw.additionalCharges))
    ? Number(raw.additionalCharges)
    : CONVENIENCE_FEE;
  const totalEstimatedAmount = Number.isFinite(Number(raw.totalEstimatedAmount))
    ? Number(raw.totalEstimatedAmount)
    : servicePrice + additionalCharges;

  const status = normalizeStatusValue(raw.status);
  const createdAt = raw.createdAt || new Date().toISOString();
  const serviceCategory = String(raw.serviceCategory || raw.providerCategory || '').trim();
  const appointmentDate = String(raw.appointmentDate || raw.bookingDate || '').trim();
  const appointmentTime = String(raw.appointmentTime || raw.bookingTime || '').trim();

  return {
    bookingId: refId,
    referenceId: refId,
    customerId: String(raw.customerId || deriveCustomerId(customerEmail, customerPhone)),
    customerName: String(raw.customerName || 'Customer').trim(),
    customerEmail,
    customerPhone,
    providerId: String(raw.providerId || '').trim(),
    providerName: String(raw.providerName || 'FixMate Specialist').trim(),
    providerCategory: serviceCategory,
    serviceCategory,
    providerLocation: String(raw.providerLocation || '').trim(),
    serviceName: String(raw.serviceName || 'Home Service').trim(),
    address,
    city,
    pinCode,
    serviceAddress: String(raw.serviceAddress || constructedAddress || 'Local Address'),
    appointmentDate,
    bookingDate: appointmentDate,
    appointmentTime,
    bookingTime: appointmentTime,
    servicePrice,
    additionalCharges,
    totalEstimatedAmount,
    instructions: String(raw.instructions || '').trim(),
    status,
    createdAt,
    acceptedAt: raw.acceptedAt || (status === 'Confirmed' || status === 'Completed' ? raw.updatedAt || createdAt : ''),
    rejectedAt: raw.rejectedAt || (status === 'Rejected' ? raw.updatedAt || createdAt : ''),
    cancelledAt: raw.cancelledAt || (status === 'Cancelled' ? raw.updatedAt || createdAt : ''),
    completedAt: raw.completedAt || (status === 'Completed' ? raw.updatedAt || createdAt : ''),
    updatedAt: raw.updatedAt || createdAt,
    statusUpdatedBy: raw.statusUpdatedBy || '',
  };
}

function deduplicateAndMigrateBookings(list) {
  const byRef = new Map();
  if (!Array.isArray(list)) return [];
  list.forEach((item) => {
    const normalized = normalizeBookingRecord(item);
    if (normalized && !byRef.has(normalized.referenceId)) {
      byRef.set(normalized.referenceId, normalized);
    }
  });
  return Array.from(byRef.values());
}

/**
 * Ensures initial seed data exists gracefully without duplicating or erasing user records.
 */
export function ensureDemoSeedData() {
  try {
    const rawBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!rawBookings) {
      const normalizedSeed = deduplicateAndMigrateBookings(INITIAL_SEED_BOOKINGS);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(normalizedSeed));
      localStorage.setItem(DASHBOARD_SEEDED_FLAG, 'true');
      return normalizedSeed;
    }

    const parsed = JSON.parse(rawBookings);
    if (!Array.isArray(parsed)) {
      const fallbackSeed = deduplicateAndMigrateBookings(INITIAL_SEED_BOOKINGS);
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(fallbackSeed));
      return fallbackSeed;
    }

    let migrated = deduplicateAndMigrateBookings(parsed);
    const hasSavedCustomer = Boolean(localStorage.getItem(CUSTOMER_PROFILE_KEY));
    const alreadySeeded = Boolean(localStorage.getItem(DASHBOARD_SEEDED_FLAG));

    if (!hasSavedCustomer && !alreadySeeded) {
      const existingRefs = new Set(migrated.map((b) => b.referenceId));
      const missingSeeds = INITIAL_SEED_BOOKINGS.filter((s) => !existingRefs.has(s.referenceId))
        .map(normalizeBookingRecord)
        .filter(Boolean);
      if (missingSeeds.length > 0) {
        migrated = [...missingSeeds, ...migrated];
      }
      localStorage.setItem(DASHBOARD_SEEDED_FLAG, 'true');
    }

    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return deduplicateAndMigrateBookings(INITIAL_SEED_BOOKINGS);
  }
}

export function loadAllBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      return ensureDemoSeedData();
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return ensureDemoSeedData();
    }
    const migrated = deduplicateAndMigrateBookings(parsed);
    return migrated;
  } catch {
    return deduplicateAndMigrateBookings(INITIAL_SEED_BOOKINGS);
  }
}

export function saveAllBookings(list) {
  const cleanList = deduplicateAndMigrateBookings(list);
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(cleanList));
  } catch {
    // Ignore storage quota errors gracefully
  }
  dispatchBookingsChanged({ reason: 'save' });
  return cleanList;
}

export function loadCustomerProfile() {
  try {
    const raw = localStorage.getItem(CUSTOMER_PROFILE_KEY);
    if (!raw) {
      localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(DEFAULT_DEMO_PROFILE));
      return { ...DEFAULT_DEMO_PROFILE };
    }
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed.fullName || DEFAULT_DEMO_PROFILE.fullName,
      email: parsed.email || DEFAULT_DEMO_PROFILE.email,
      phone: parsed.phone || DEFAULT_DEMO_PROFILE.phone,
      address: parsed.address || DEFAULT_DEMO_PROFILE.address,
      city: parsed.city || DEFAULT_DEMO_PROFILE.city,
      pinCode: parsed.pinCode || DEFAULT_DEMO_PROFILE.pinCode,
    };
  } catch {
    return { ...DEFAULT_DEMO_PROFILE };
  }
}

export function saveCustomerProfile(profileObj) {
  const cleanProfile = {
    fullName: String(profileObj.fullName || '').trim(),
    email: String(profileObj.email || '').trim(),
    phone: String(profileObj.phone || '').trim(),
    address: String(profileObj.address || '').trim(),
    city: String(profileObj.city || '').trim(),
    pinCode: String(profileObj.pinCode || '').trim(),
  };
  try {
    localStorage.setItem(CUSTOMER_PROFILE_KEY, JSON.stringify(cleanProfile));
  } catch {
    // Ignore storage quota errors
  }
  dispatchBookingsChanged({ reason: 'profile' });
  return cleanProfile;
}

export function getCustomerBookings(profile = loadCustomerProfile()) {
  const all = loadAllBookings();
  const emailLower = (profile.email || '').trim().toLowerCase();
  const phoneDigits = (profile.phone || '').trim();

  return all.filter((b) => {
    const bEmail = (b.customerEmail || '').trim().toLowerCase();
    const bPhone = (b.customerPhone || '').trim();
    return (emailLower && bEmail === emailLower) || (phoneDigits && bPhone === phoneDigits);
  });
}

export function getProviderBookings(providerId) {
  const cleanId = String(providerId || '').trim();
  if (!cleanId) return [];
  return loadAllBookings().filter((b) => b.providerId === cleanId);
}

// =========================================================================
// In-App Notifications
// =========================================================================
export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotifications(items) {
  const trimmed = Array.isArray(items) ? items.slice(0, 40) : [];
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors
  }
}

export function pushBookingNotification({
  booking,
  eventType,
  title,
  message,
  audience = 'both',
}) {
  const current = loadNotifications();
  const entry = {
    id: `NTF-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    bookingId: booking.referenceId,
    providerId: booking.providerId,
    customerEmail: booking.customerEmail,
    customerPhone: booking.customerPhone,
    eventType,
    title,
    message,
    audience,
    createdAt: new Date().toISOString(),
    readByCustomer: false,
    readByProvider: false,
  };
  saveNotifications([entry, ...current]);
  return entry;
}

export function getCustomerNotifications(profile = loadCustomerProfile(), includeAll = false) {
  const all = loadNotifications();
  if (includeAll) return all;
  const emailLower = (profile.email || '').trim().toLowerCase();
  const phoneDigits = (profile.phone || '').trim();
  return all.filter((n) => {
    if (n.audience !== 'both' && n.audience !== 'customer') return false;
    const nEmail = (n.customerEmail || '').trim().toLowerCase();
    const nPhone = (n.customerPhone || '').trim();
    return (emailLower && nEmail === emailLower) || (phoneDigits && nPhone === phoneDigits);
  });
}

export function getProviderNotifications(providerId) {
  const cleanId = String(providerId || '').trim();
  if (!cleanId) return [];
  return loadNotifications().filter(
    (n) => (n.audience === 'both' || n.audience === 'provider') && n.providerId === cleanId
  );
}

export function markNotificationsRead(role, identifier) {
  const all = loadNotifications();
  const cleanIdent = String(identifier || '').trim().toLowerCase();
  const updated = all.map((n) => {
    if (role === 'customer') {
      if (!cleanIdent || (n.customerEmail || '').toLowerCase() === cleanIdent) {
        return { ...n, readByCustomer: true };
      }
    } else if (role === 'provider') {
      if (!cleanIdent || (n.providerId || '').toLowerCase() === cleanIdent) {
        return { ...n, readByProvider: true };
      }
    }
    return n;
  });
  saveNotifications(updated);
}

// =========================================================================
// Booking Creation & Strict Status Lifecycle Transitions
// =========================================================================
export function generateUniqueBookingId(existingList = loadAllBookings()) {
  const existingIds = new Set(existingList.map((b) => b.referenceId));
  const year = new Date().getFullYear();
  let candidate = '';
  let attempts = 0;
  do {
    const randPart = Math.floor(100000 + Math.random() * 900000);
    candidate = `FM-${year}-${randPart}`;
    attempts += 1;
  } while (existingIds.has(candidate) && attempts < 25);
  return candidate;
}

export function createBookingRecord(input) {
  const all = loadAllBookings();
  const referenceId = input.referenceId || generateUniqueBookingId(all);
  const nowIso = new Date().toISOString();

  const normalized = normalizeBookingRecord({
    ...input,
    referenceId,
    bookingId: referenceId,
    status: BOOKING_STATUSES.PENDING,
    createdAt: nowIso,
    updatedAt: nowIso,
    statusUpdatedBy: 'customer',
  });

  if (!normalized) {
    return { ok: false, error: 'Invalid booking payload.' };
  }

  // Prevent duplicate booking IDs
  if (all.some((b) => b.referenceId === normalized.referenceId)) {
    return { ok: false, error: 'Duplicate booking reference detected. Please try again.' };
  }

  const updated = [normalized, ...all];
  saveAllBookings(updated);

  pushBookingNotification({
    booking: normalized,
    eventType: 'created',
    audience: 'both',
    title: `New Booking ${normalized.referenceId}`,
    message: `${normalized.serviceName} requested with ${normalized.providerName} on ${normalized.appointmentDate} (${formatRupees(normalized.totalEstimatedAmount)}).`,
  });

  return { ok: true, booking: normalized };
}

/**
 * Evaluates whether a customer can cancel a given booking based on status & date rules.
 */
export function evaluateCustomerCancellation(booking) {
  if (!booking) {
    return { allowed: false, reason: 'Booking record not found.' };
  }
  if (booking.status === BOOKING_STATUSES.COMPLETED) {
    return { allowed: false, reason: 'Completed bookings cannot be cancelled or modified.' };
  }
  if (booking.status === BOOKING_STATUSES.REJECTED) {
    return { allowed: false, reason: 'Rejected bookings are already closed.' };
  }
  if (booking.status === BOOKING_STATUSES.CANCELLED) {
    return { allowed: false, reason: 'This booking is already cancelled.' };
  }
  if (booking.status === BOOKING_STATUSES.PENDING) {
    return { allowed: true, reason: 'Pending request can be cancelled freely.' };
  }
  if (booking.status === BOOKING_STATUSES.CONFIRMED) {
    const today = getTodayISODate();
    if (booking.appointmentDate && booking.appointmentDate < today) {
      return {
        allowed: false,
        reason: 'Confirmed bookings past their scheduled date cannot be cancelled online.',
      };
    }
    return {
      allowed: true,
      reason: 'Confirmed booking is eligible for cancellation prior to completion.',
    };
  }
  return { allowed: false, reason: 'This booking status cannot be cancelled.' };
}

/**
 * Validates and executes a booking status transition across the shared lifecycle.
 */
export function transitionBookingStatus({
  bookingId,
  targetStatus,
  actorRole,
  actorId = '',
}) {
  const cleanTarget = normalizeStatusValue(targetStatus);
  const all = loadAllBookings();
  const index = all.findIndex((b) => b.referenceId === bookingId);

  if (index === -1) {
    return { ok: false, error: `Booking ${bookingId} was not found.` };
  }

  const current = all[index];

  // Prevent duplicate action on same status
  if (current.status === cleanTarget) {
    return {
      ok: false,
      error: `Booking ${bookingId} is already marked as ${cleanTarget}.`,
    };
  }

  // Enforce allowed transition graph
  const allowedTargets = VALID_STATUS_TRANSITIONS[current.status] || [];
  if (!allowedTargets.includes(cleanTarget)) {
    return {
      ok: false,
      error: `Invalid transition: ${current.status} bookings cannot move to ${cleanTarget}.`,
    };
  }

  // Enforce role and ownership authorization rules
  if (
    cleanTarget === BOOKING_STATUSES.CONFIRMED ||
    cleanTarget === BOOKING_STATUSES.REJECTED ||
    cleanTarget === BOOKING_STATUSES.COMPLETED
  ) {
    if (actorRole !== 'provider') {
      return {
        ok: false,
        error: `Only the assigned service provider can mark a booking as ${cleanTarget}.`,
      };
    }
    if (!actorId || current.providerId !== actorId) {
      return {
        ok: false,
        error: 'Providers can only manage bookings assigned to their own provider ID.',
      };
    }
  } else if (cleanTarget === BOOKING_STATUSES.CANCELLED) {
    if (actorRole !== 'customer') {
      return {
        ok: false,
        error: 'Only customers can cancel their booking.',
      };
    }
    const cancelCheck = evaluateCustomerCancellation(current);
    if (!cancelCheck.allowed) {
      return { ok: false, error: cancelCheck.reason };
    }
  }

  const nowIso = new Date().toISOString();
  const updatedRecord = {
    ...current,
    status: cleanTarget,
    updatedAt: nowIso,
    statusUpdatedBy: actorRole,
  };

  if (cleanTarget === BOOKING_STATUSES.CONFIRMED) {
    updatedRecord.acceptedAt = nowIso;
  } else if (cleanTarget === BOOKING_STATUSES.REJECTED) {
    updatedRecord.rejectedAt = nowIso;
  } else if (cleanTarget === BOOKING_STATUSES.CANCELLED) {
    updatedRecord.cancelledAt = nowIso;
  } else if (cleanTarget === BOOKING_STATUSES.COMPLETED) {
    updatedRecord.completedAt = nowIso;
  }

  const nextList = [...all];
  nextList[index] = updatedRecord;
  saveAllBookings(nextList);

  // Emit appropriate in-app notification
  if (cleanTarget === BOOKING_STATUSES.CONFIRMED) {
    pushBookingNotification({
      booking: updatedRecord,
      eventType: 'accepted',
      audience: 'both',
      title: `Booking Accepted · ${updatedRecord.referenceId}`,
      message: `${updatedRecord.providerName} accepted your ${updatedRecord.serviceName} booking for ${updatedRecord.appointmentDate}.`,
    });
  } else if (cleanTarget === BOOKING_STATUSES.REJECTED) {
    pushBookingNotification({
      booking: updatedRecord,
      eventType: 'rejected',
      audience: 'both',
      title: `Booking Rejected · ${updatedRecord.referenceId}`,
      message: `${updatedRecord.providerName} could not accept ${updatedRecord.serviceName} on ${updatedRecord.appointmentDate}.`,
    });
  } else if (cleanTarget === BOOKING_STATUSES.CANCELLED) {
    pushBookingNotification({
      booking: updatedRecord,
      eventType: 'cancelled',
      audience: 'both',
      title: `Booking Cancelled · ${updatedRecord.referenceId}`,
      message: `${updatedRecord.customerName} cancelled ${updatedRecord.serviceName} scheduled for ${updatedRecord.appointmentDate}.`,
    });
  } else if (cleanTarget === BOOKING_STATUSES.COMPLETED) {
    pushBookingNotification({
      booking: updatedRecord,
      eventType: 'completed',
      audience: 'both',
      title: `Service Completed · ${updatedRecord.referenceId}`,
      message: `${updatedRecord.providerName} marked ${updatedRecord.serviceName} (${formatRupees(updatedRecord.totalEstimatedAmount)}) as Completed.`,
    });
  }

  return { ok: true, booking: updatedRecord };
}

// =========================================================================
// Booking Progress Timeline Builder (Status-Aware)
// =========================================================================
export function buildBookingTimeline(booking) {
  if (!booking) return [];
  const status = booking.status;
  const steps = [];

  // 1. Booking Created (Always present)
  steps.push({
    key: 'created',
    title: 'Booking Created',
    detail: `Requested on ${formatTimestampLabel(booking.createdAt)} · ${formatRupees(booking.totalEstimatedAmount)}`,
    state: 'done',
  });

  if (status === BOOKING_STATUSES.PENDING) {
    steps.push({
      key: 'awaiting',
      title: 'Awaiting Provider Response',
      detail: `Sent to ${booking.providerName} (${booking.providerCategory})`,
      state: 'current',
    });
    return steps;
  }

  if (status === BOOKING_STATUSES.REJECTED) {
    steps.push({
      key: 'rejected',
      title: 'Booking Rejected',
      detail: `Declined by ${booking.providerName} · ${formatTimestampLabel(booking.rejectedAt || booking.updatedAt)}`,
      state: 'danger',
    });
    return steps;
  }

  if (status === BOOKING_STATUSES.CANCELLED) {
    if (booking.acceptedAt) {
      steps.push({
        key: 'accepted',
        title: 'Booking Accepted',
        detail: `Accepted by ${booking.providerName} · ${formatTimestampLabel(booking.acceptedAt)}`,
        state: 'done',
      });
      steps.push({
        key: 'scheduled',
        title: 'Service Scheduled',
        detail: `${booking.appointmentDate} · ${booking.appointmentTime}`,
        state: 'done',
      });
    }
    steps.push({
      key: 'cancelled',
      title: 'Booking Cancelled',
      detail: `Cancelled by customer · ${formatTimestampLabel(booking.cancelledAt || booking.updatedAt)}`,
      state: 'danger',
    });
    return steps;
  }

  // Confirmed or Completed
  steps.push({
    key: 'accepted',
    title: 'Booking Accepted',
    detail: `Accepted by ${booking.providerName} · ${formatTimestampLabel(booking.acceptedAt || booking.updatedAt)}`,
    state: 'done',
  });

  steps.push({
    key: 'scheduled',
    title: 'Service Scheduled',
    detail: `${booking.appointmentDate} · ${booking.appointmentTime}`,
    state: status === BOOKING_STATUSES.CONFIRMED ? 'current' : 'done',
  });

  if (status === BOOKING_STATUSES.COMPLETED) {
    steps.push({
      key: 'completed',
      title: 'Service Completed',
      detail: `Marked completed by ${booking.providerName} · ${formatTimestampLabel(booking.completedAt || booking.updatedAt)}`,
      state: 'done',
    });
  }

  return steps;
}

// =========================================================================
// Search, Filter & Sort Helpers
// =========================================================================
export function filterAndSortBookings(
  bookings,
  { searchQuery = '', statusFilter = 'all', dateFilter = '', dateSort = 'newest' } = {}
) {
  const q = String(searchQuery || '').trim().toLowerCase();
  const cleanDate = String(dateFilter || '').trim();

  const filtered = bookings.filter((b) => {
    if (statusFilter && statusFilter !== 'all' && b.status !== statusFilter) {
      return false;
    }
    if (cleanDate && b.appointmentDate !== cleanDate) {
      return false;
    }
    if (q) {
      const hay = `${b.referenceId} ${b.serviceName} ${b.providerName} ${b.customerName} ${b.providerCategory} ${b.city}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    const da = a.appointmentDate || a.createdAt || '';
    const db = b.appointmentDate || b.createdAt || '';
    if (da === db) {
      const ca = a.createdAt || '';
      const cb = b.createdAt || '';
      return dateSort === 'oldest' ? ca.localeCompare(cb) : cb.localeCompare(ca);
    }
    return dateSort === 'oldest' ? da.localeCompare(db) : db.localeCompare(da);
  });
}

// =========================================================================
// Dynamic Statistics Calculators
// =========================================================================
export function getCustomerStats(bookings) {
  const list = Array.isArray(bookings) ? bookings : [];
  const pending = list.filter((b) => b.status === BOOKING_STATUSES.PENDING).length;
  const confirmed = list.filter((b) => b.status === BOOKING_STATUSES.CONFIRMED).length;
  const completed = list.filter((b) => b.status === BOOKING_STATUSES.COMPLETED).length;
  const cancelled = list.filter((b) => b.status === BOOKING_STATUSES.CANCELLED).length;
  const rejected = list.filter((b) => b.status === BOOKING_STATUSES.REJECTED).length;

  return {
    totalBookings: list.length,
    activeBookings: pending + confirmed,
    pendingBookings: pending,
    confirmedBookings: confirmed,
    completedBookings: completed,
    cancelledBookings: cancelled,
    rejectedBookings: rejected,
  };
}

export function getProviderStats(bookings) {
  const list = Array.isArray(bookings) ? bookings : [];
  const pending = list.filter((b) => b.status === BOOKING_STATUSES.PENDING).length;
  const confirmed = list.filter((b) => b.status === BOOKING_STATUSES.CONFIRMED).length;
  const rejected = list.filter((b) => b.status === BOOKING_STATUSES.REJECTED).length;
  const completedJobs = list.filter((b) => b.status === BOOKING_STATUSES.COMPLETED).length;
  const cancelled = list.filter((b) => b.status === BOOKING_STATUSES.CANCELLED).length;

  const acceptedBookings = confirmed + completedJobs;
  const completedEarnings = list
    .filter((b) => b.status === BOOKING_STATUSES.COMPLETED)
    .reduce((sum, b) => sum + (Number(b.totalEstimatedAmount) || 0), 0);
  const confirmedPipeline = list
    .filter((b) => b.status === BOOKING_STATUSES.CONFIRMED)
    .reduce((sum, b) => sum + (Number(b.totalEstimatedAmount) || 0), 0);

  return {
    totalRequests: list.length,
    pendingRequests: pending,
    confirmedBookings: confirmed,
    acceptedBookings,
    rejectedBookings: rejected,
    completedJobs,
    cancelledBookings: cancelled,
    completedEarnings,
    confirmedPipeline,
    totalEstimatedEarnings: completedEarnings + confirmedPipeline,
  };
}

// =========================================================================
// Cross-Tab & In-Page Synchronization
// =========================================================================
export function dispatchBookingsChanged(detail = {}) {
  try {
    window.dispatchEvent(new CustomEvent('fixmate:bookings-updated', { detail }));
  } catch {
    // Ignore in restricted environments
  }
}

export function subscribeBookingChanges(callback) {
  if (typeof callback !== 'function') return () => {};

  const handleStorage = (event) => {
    if (
      !event.key ||
      event.key === BOOKINGS_STORAGE_KEY ||
      event.key === CUSTOMER_PROFILE_KEY ||
      event.key === NOTIFICATIONS_STORAGE_KEY
    ) {
      callback({ source: 'storage', key: event.key });
    }
  };

  const handleCustom = (event) => {
    callback({ source: 'local', detail: event.detail });
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener('fixmate:bookings-updated', handleCustom);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('fixmate:bookings-updated', handleCustom);
  };
}
