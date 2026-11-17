import { getDemoSession, getProfileStorageKey } from './auth-session.js';

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

const LEGACY_SEED_REFERENCE_IDS = new Set([
  'FM-2026-814502',
  'FM-2026-702319',
  'FM-2026-619044',
  'FM-2026-508812',
  'FM-2026-418205',
  'FM-2026-529104',
  'FM-2026-903418',
]);

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

function loadCleanBookings() {
  try {
    const rawBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!rawBookings) return [];
    const parsed = JSON.parse(rawBookings);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(BOOKINGS_STORAGE_KEY);
      return [];
    }

    const migrated = deduplicateAndMigrateBookings(
      parsed.filter(
        (item) => !item || !LEGACY_SEED_REFERENCE_IDS.has(String(item.referenceId || item.bookingId || ''))
      )
    );
    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    try {
      localStorage.removeItem(BOOKINGS_STORAGE_KEY);
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
    return [];
  }
}

/**
 * Removes only known legacy demo records; never creates bookings.
 */
export function ensureDemoSeedData() {
  const bookings = loadCleanBookings();
  try {
    localStorage.removeItem(DASHBOARD_SEEDED_FLAG);
    const legacyProfile = JSON.parse(localStorage.getItem(CUSTOMER_PROFILE_KEY) || 'null');
    if (
      legacyProfile &&
      legacyProfile.fullName === 'Arjun Mehta' &&
      legacyProfile.email === 'arjun.mehta@example.in'
    ) {
      localStorage.removeItem(CUSTOMER_PROFILE_KEY);
    }
    const notifications = loadNotifications();
    const cleanedNotifications = notifications.filter(
      (item) => !LEGACY_SEED_REFERENCE_IDS.has(String(item.bookingId || ''))
    );
    if (cleanedNotifications.length !== notifications.length) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cleanedNotifications));
    }
  } catch {
    // Missing or malformed legacy data is treated as empty.
  }
  return bookings;
}

export function loadAllBookings() {
  return loadCleanBookings();
}

export function saveAllBookings(list) {
  const cleanList = deduplicateAndMigrateBookings(list);
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(cleanList));
  dispatchBookingsChanged({ reason: 'save' });
  return cleanList;
}

function getSessionProfileDefaults(session) {
  const identifier = String(session && session.identifier ? session.identifier : '');
  const email = identifier.includes('@') ? identifier : '';
  const phone = /^[6-9]\d{9}$/.test(identifier) ? identifier : '';
  const displayName = email
    ? email
        .split('@')[0]
        .split(/[._-]+/)
        .filter(Boolean)
        .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
        .join(' ')
    : 'Customer';
  return {
    fullName: (session && session.displayName) || displayName,
    email,
    phone,
    address: '',
    city: '',
    pinCode: '',
  };
}

export function loadCustomerProfile() {
  const session = getDemoSession();
  const defaults = getSessionProfileDefaults(session);
  if (!session || session.role !== 'Customer') return defaults;
  try {
    const raw = localStorage.getItem(getProfileStorageKey(session));
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return {
      fullName: parsed.fullName || defaults.fullName,
      email: parsed.email || defaults.email,
      phone: parsed.phone || defaults.phone,
      address: parsed.address || '',
      city: parsed.city || '',
      pinCode: parsed.pinCode || '',
    };
  } catch {
    return defaults;
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
  const session = getDemoSession();
  if (!session || session.role !== 'Customer') {
    return cleanProfile;
  }
  localStorage.setItem(getProfileStorageKey(session), JSON.stringify(cleanProfile));
  dispatchBookingsChanged({ reason: 'profile' });
  return cleanProfile;
}

export function getCustomerBookings() {
  const session = getDemoSession();
  if (!session || session.role !== 'Customer') return [];
  return loadAllBookings().filter((booking) => booking.customerId === session.id);
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
    customerId: booking.customerId,
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

export function getCustomerNotifications(profile = loadCustomerProfile()) {
  const all = loadNotifications();
  const session = getDemoSession();
  if (!session || session.role !== 'Customer') return [];
  return all.filter((n) => {
    if (n.audience !== 'both' && n.audience !== 'customer') return false;
    if (n.customerId) return n.customerId === session.id;
    const email = (profile.email || '').trim().toLowerCase();
    const phone = (profile.phone || '').trim();
    return Boolean(
      (email && n.customerEmail === email) ||
        (phone && n.customerPhone === phone)
    );
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
      if (
        !cleanIdent ||
        n.customerId === cleanIdent ||
        (n.customerEmail || '').toLowerCase() === cleanIdent
      ) {
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
  try {
    saveAllBookings(updated);
  } catch {
    return {
      ok: false,
      error: 'Could not save your booking in this browser. Check storage availability and try again.',
    };
  }

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
    if (!actorId || current.customerId !== actorId) {
      return {
        ok: false,
        error: 'Customers can only cancel their own bookings.',
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
  try {
    saveAllBookings(nextList);
  } catch {
    return {
      ok: false,
      error: 'Could not save this booking update in the browser. Please try again.',
    };
  }

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

  return {
    totalRequests: list.length,
    pendingRequests: pending,
    confirmedBookings: confirmed,
    acceptedBookings,
    rejectedBookings: rejected,
    completedJobs,
    cancelledBookings: cancelled,
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
      event.key.startsWith(`${CUSTOMER_PROFILE_KEY}:`) ||
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
