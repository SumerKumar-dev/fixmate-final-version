import { ensureDemoSeedData } from './booking-manager.js';
import { removeLegacySampleReviews } from './reviews-manager.js';

// FixMate – Frontend-only demo session and page access checks.
export const DEMO_SESSION_KEY = 'fixmate_demo_session';

const CUSTOMER_PAGE = 'customer-dashboard.html';

export function getDemoSession() {
  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (
      !session ||
      typeof session.id !== 'string' ||
      !session.id ||
      !['Customer', 'Service Provider'].includes(session.role)
    ) {
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function saveDemoSession(session) {
  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
}

export function clearDemoSession() {
  sessionStorage.removeItem(DEMO_SESSION_KEY);
}

export function getProfileStorageKey(session = getDemoSession()) {
  return session
    ? `fixmate_demo_customer:${encodeURIComponent(session.id.toLowerCase())}`
    : 'fixmate_demo_customer';
}

function currentDestination() {
  return `${window.location.pathname.split('/').pop()}${window.location.search}${window.location.hash}`;
}

function loginUrl(destination, reason) {
  const params = new URLSearchParams({ redirect: destination, reason });
  return `login.html?${params.toString()}`;
}

function providerDashboardUrl(session) {
  const providerId = session && session.providerId ? session.providerId : '';
  return `provider.html?id=${encodeURIComponent(providerId)}#providerBookingDesk`;
}

function navigateForRole(session) {
  window.location.replace(
    session.role === 'Customer' ? CUSTOMER_PAGE : providerDashboardUrl(session)
  );
}

function updateNavigation(session) {
  document
    .querySelectorAll('.nav-link[href="customer-dashboard.html"], .mobile-nav-link[href="customer-dashboard.html"]')
    .forEach((link) => {
      if (session.role === 'Service Provider') {
        link.href = providerDashboardUrl(session);
        link.textContent = 'Provider Dashboard';
      }
    });

  document.querySelectorAll('.header-actions, .mobile-drawer-actions').forEach((area) => {
    area.replaceChildren();

    const dashboardLink = document.createElement('a');
    dashboardLink.className = 'btn-ghost';
    dashboardLink.href =
      session.role === 'Customer' ? CUSTOMER_PAGE : providerDashboardUrl(session);
    dashboardLink.textContent =
      session.role === 'Customer' ? 'My Bookings' : 'Provider Dashboard';

    const logoutButton = document.createElement('button');
    logoutButton.type = 'button';
    logoutButton.className = 'btn-primary';
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', () => {
      clearDemoSession();
      window.location.replace('index.html');
    });

    area.append(dashboardLink, logoutButton);
  });
}

function protectPage(session) {
  const page = window.location.pathname.split('/').pop();
  const providerDashboardRequested =
    page === 'provider.html' && window.location.hash === '#providerBookingDesk';
  const requiredRole =
    page === 'booking.html' || page === CUSTOMER_PAGE
      ? 'Customer'
      : providerDashboardRequested
        ? 'Service Provider'
        : '';

  if (!requiredRole) return;

  const destination = currentDestination();
  if (!session) {
    const reason = page === 'booking.html' ? 'booking' : 'dashboard';
    window.location.replace(loginUrl(destination, reason));
    return;
  }

  if (session.role !== requiredRole) {
    navigateForRole(session);
  }
}

function initializeSessionNavigation() {
  ensureDemoSeedData();
  removeLegacySampleReviews();
  const session = getDemoSession();
  protectPage(session);
  if (session) updateNavigation(session);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSessionNavigation, { once: true });
} else {
  initializeSessionNavigation();
}

window.addEventListener('hashchange', () => protectPage(getDemoSession()));
