// FixMate – Customer Dashboard (Pure Vanilla JavaScript)
// Frontend demonstration powered by js/booking-manager.js using browser localStorage.

import {
  BOOKING_STATUSES,
  buildBookingTimeline,
  evaluateCustomerCancellation,
  filterAndSortBookings,
  formatRupees,
  formatTimestampLabel,
  getCustomerBookings,
  getCustomerNotifications,
  getCustomerStats,
  loadCustomerProfile,
  markNotificationsRead,
  saveCustomerProfile,
  subscribeBookingChanges,
  transitionBookingStatus,
} from './booking-manager.js';
import {
  clearFieldValidation,
  closeDialogModal,
  focusFirstInvalid,
  hideFeedbackBanner,
  openDialogModal,
  runWithSubmitGuard,
  setFieldValidation,
  showFeedbackBanner,
} from './ui-helpers.js';
import { clearDemoSession, getDemoSession } from './auth-session.js';

document.addEventListener('DOMContentLoaded', () => {
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const INDIAN_PHONE_REGEX = /^[6-9]\d{9}$/;
  const INDIAN_PIN_REGEX = /^[1-9]\d{5}$/;

  const state = {
    activeSection: 'overview',
    searchQuery: '',
    statusFilter: 'all',
    dateFilter: '',
    dateSort: 'newest',
    pendingCancelRefId: null,
    openDetailsRefId: null,
  };

  // Set footer year
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  function getScopedBookings() {
    return getCustomerBookings();
  }

  function getInitials(name) {
    const parts = (name || 'Customer').trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] || ''}${parts[parts.length - 1][0] || ''}`.toUpperCase();
  }

  function statusClassName(status) {
    return `is-${(status || 'pending').toLowerCase()}`;
  }

  function showGlobalNotice(message, isError = false) {
    const dashGlobalNotice = document.getElementById('dashGlobalNotice');
    showFeedbackBanner(dashGlobalNotice, message, isError ? 'error' : 'success');
  }

  // =========================================================================
  // Mobile Sidebar & Section Navigation
  // =========================================================================
  const dashSidebar = document.getElementById('dashSidebar');
  const dashSidebarBackdrop = document.getElementById('dashSidebarBackdrop');
  const dashMobileToggle = document.getElementById('dashMobileToggle');
  const dashSidebarClose = document.getElementById('dashSidebarClose');
  const dashSectionBreadcrumb = document.getElementById('dashSectionBreadcrumb');

  function setSidebarOpen(open) {
    if (!dashSidebar || !dashSidebarBackdrop) return;
    dashSidebar.classList.toggle('is-open', open);
    dashSidebarBackdrop.hidden = !open;
    if (dashMobileToggle) {
      dashMobileToggle.setAttribute('aria-expanded', String(open));
    }
  }

  if (dashMobileToggle) {
    dashMobileToggle.addEventListener('click', () => setSidebarOpen(true));
  }
  if (dashSidebarClose) {
    dashSidebarClose.addEventListener('click', () => setSidebarOpen(false));
  }
  if (dashSidebarBackdrop) {
    dashSidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));
  }

  const SECTION_LABELS = {
    overview: 'Customer Dashboard / Overview',
    bookings: 'Customer Dashboard / My Bookings',
    history: 'Customer Dashboard / Booking History',
    transactions: 'Customer Dashboard / Transaction History',
    profile: 'Customer Dashboard / My Profile',
  };

  function switchSection(sectionKey) {
    state.activeSection = sectionKey;

    document.querySelectorAll('[data-dash-section]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.dashSection === sectionKey);
    });

    ['overview', 'bookings', 'history', 'transactions', 'profile'].forEach((key) => {
      const panel = document.getElementById(`panel-${key}`);
      if (panel) panel.hidden = key !== sectionKey;
    });

    if (dashSectionBreadcrumb) {
      dashSectionBreadcrumb.textContent = SECTION_LABELS[sectionKey] || 'Customer Dashboard';
    }

    setSidebarOpen(false);
  }

  document.querySelectorAll('[data-dash-section]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.dashSection || 'overview';
      switchSection(target);
    });
  });

  const viewAllBookingsLink = document.getElementById('viewAllBookingsLink');
  if (viewAllBookingsLink) {
    viewAllBookingsLink.addEventListener('click', () => switchSection('bookings'));
  }

  const topbarProfileBtn = document.getElementById('topbarProfileBtn');
  if (topbarProfileBtn) {
    topbarProfileBtn.addEventListener('click', () => switchSection('profile'));
  }

  // =========================================================================
  // Notification Popover (In-App Booking Updates)
  // =========================================================================
  const dashNotifBtn = document.getElementById('dashNotifBtn');
  const dashNotifPopover = document.getElementById('dashNotifPopover');
  const dashNotifCount = document.getElementById('dashNotifCount');
  const dashNotifList = document.getElementById('dashNotifList');
  const markNotifsReadBtn = document.getElementById('markNotifsReadBtn');

  if (dashNotifBtn && dashNotifPopover) {
    dashNotifBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      const willOpen = dashNotifPopover.hidden;
      dashNotifPopover.hidden = !willOpen;
      dashNotifBtn.setAttribute('aria-expanded', String(willOpen));
    });

    document.addEventListener('click', (event) => {
      if (
        !dashNotifPopover.hidden &&
        !dashNotifPopover.contains(event.target) &&
        event.target !== dashNotifBtn
      ) {
        dashNotifPopover.hidden = true;
        dashNotifBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  if (markNotifsReadBtn) {
    markNotifsReadBtn.addEventListener('click', () => {
      const profile = loadCustomerProfile();
      const session = getDemoSession();
      markNotificationsRead('customer', session ? session.id : profile.email);
      renderNotifications(getScopedBookings());
    });
  }

  function renderNotifications(bookings) {
    if (!dashNotifList || !dashNotifCount) return;

    const profile = loadCustomerProfile();
    const events = getCustomerNotifications(profile);
    const unreadEvents = events.filter((e) => !e.readByCustomer);

    const activeFallbackCount = bookings.filter(
      (b) => b.status === BOOKING_STATUSES.PENDING || b.status === BOOKING_STATUSES.CONFIRMED
    ).length;

    const badgeCount = unreadEvents.length > 0 ? unreadEvents.length : activeFallbackCount;
    if (badgeCount > 0) {
      dashNotifCount.textContent = String(badgeCount);
      dashNotifCount.hidden = false;
    } else {
      dashNotifCount.hidden = true;
    }

    dashNotifList.innerHTML = '';

    if (events.length === 0 && bookings.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'dash-notif-item';
      empty.textContent = 'No recent booking notifications.';
      dashNotifList.appendChild(empty);
      return;
    }

    if (events.length > 0) {
      events.slice(0, 6).forEach((ev) => {
        const item = document.createElement('div');
        item.className = `dash-notif-item ${ev.readByCustomer ? '' : 'is-unread'}`.trim();

        const strong = document.createElement('strong');
        strong.textContent = ev.title;

        const desc = document.createElement('span');
        desc.textContent = ev.message;

        const time = document.createElement('span');
        time.className = 'dash-notif-time';
        time.textContent = formatTimestampLabel(ev.createdAt);

        item.appendChild(strong);
        item.appendChild(desc);
        item.appendChild(time);
        dashNotifList.appendChild(item);
      });
      return;
    }

    // Fallback summary from active booking statuses if no live notification events logged yet
    bookings.slice(0, 4).forEach((b) => {
      const item = document.createElement('div');
      item.className = 'dash-notif-item';

      const strong = document.createElement('strong');
      strong.textContent = `${b.referenceId} · ${b.status}`;

      const desc = document.createElement('span');
      desc.textContent = `${b.serviceName} (${b.appointmentDate})`;

      item.appendChild(strong);
      item.appendChild(desc);
      dashNotifList.appendChild(item);
    });
  }

  // =========================================================================
  // Modals: Booking Details + Timeline, Cancel Confirmation, Logout
  // =========================================================================
  const bookingDetailsModal = document.getElementById('bookingDetailsModal');
  const cancelBookingModal = document.getElementById('cancelBookingModal');
  const logoutModal = document.getElementById('logoutModal');

  function openModal(modal, preferredFocusEl = null) {
    openDialogModal(modal, preferredFocusEl);
  }

  function closeModal(modal) {
    closeDialogModal(modal);
    if (modal === bookingDetailsModal) {
      state.openDetailsRefId = null;
    }
  }

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.closeModal;
      if (id) closeModal(document.getElementById(id));
    });
  });

  [bookingDetailsModal, cancelBookingModal, logoutModal].forEach((modal) => {
    if (!modal) return;
    modal.addEventListener('click', (event) => {
      if (event.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal(bookingDetailsModal);
      closeModal(cancelBookingModal);
      closeModal(logoutModal);
      setSidebarOpen(false);
      if (dashNotifPopover) dashNotifPopover.hidden = true;
    }
  });

  [document.getElementById('sidebarLogoutBtn'), document.getElementById('topbarLogoutBtn')].forEach(
    (btn) => {
      if (btn) {
        btn.addEventListener('click', () => openModal(logoutModal));
      }
    }
  );

  const confirmLogoutBtn = document.getElementById('confirmLogoutBtn');
  if (confirmLogoutBtn) {
    confirmLogoutBtn.addEventListener('click', () => {
      clearDemoSession();
      window.location.replace('index.html');
    });
  }

  function renderTimelineInto(container, booking) {
    if (!container) return;
    container.innerHTML = '';
    const steps = buildBookingTimeline(booking);

    steps.forEach((step) => {
      const li = document.createElement('li');
      li.className = `booking-timeline-step is-${step.state}`;

      const marker = document.createElement('span');
      marker.className = 'timeline-marker';
      marker.setAttribute('aria-hidden', 'true');

      const body = document.createElement('div');
      body.className = 'timeline-body';

      const title = document.createElement('strong');
      title.className = 'timeline-title';
      title.textContent = step.title;

      const detail = document.createElement('span');
      detail.className = 'timeline-detail';
      detail.textContent = step.detail;

      body.appendChild(title);
      body.appendChild(detail);

      li.appendChild(marker);
      li.appendChild(body);
      container.appendChild(li);
    });
  }

  function openBookingDetailsModal(booking) {
    state.openDetailsRefId = booking.referenceId;
    const refEl = document.getElementById('detailsModalRef');
    const titleEl = document.getElementById('detailsModalTitle');
    const gridEl = document.getElementById('detailsModalGrid');
    const priceListEl = document.getElementById('detailsModalPriceList');
    const instructionsEl = document.getElementById('detailsModalInstructionsWrap');
    const timelineEl = document.getElementById('detailsModalTimeline');

    if (refEl) refEl.textContent = booking.referenceId;
    if (titleEl) titleEl.textContent = booking.serviceName;

    if (gridEl) {
      gridEl.innerHTML = '';
      const specs = [
        { label: 'Booking Status', value: booking.status },
        {
          label: 'Date & Time',
          value: `${booking.appointmentDate} · ${booking.appointmentTime}`,
        },
        {
          label: 'Customer',
          value: `${booking.customerName} (+91 ${booking.customerPhone})`,
        },
        { label: 'Customer Email', value: booking.customerEmail },
        {
          label: 'Service Provider',
          value: `${booking.providerName} (${booking.providerCategory})`,
        },
        { label: 'Provider Location', value: booking.providerLocation || 'Local Zone' },
        { label: 'Service Address', value: booking.serviceAddress },
        { label: 'Booking Created', value: formatTimestampLabel(booking.createdAt) },
      ];

      specs.forEach((s) => {
        const cell = document.createElement('div');
        const lbl = document.createElement('span');
        lbl.className = 'profile-spec-label';
        lbl.textContent = s.label;

        const val = document.createElement('span');
        val.className = 'profile-spec-value';
        val.textContent = s.value;

        cell.appendChild(lbl);
        cell.appendChild(val);
        gridEl.appendChild(cell);
      });
    }

    if (priceListEl) {
      priceListEl.innerHTML = '';
      const rows = [
        { label: booking.serviceName, amount: formatRupees(booking.servicePrice) },
        {
          label: 'Safety & Convenience Fee',
          amount: formatRupees(booking.additionalCharges ?? 49),
        },
        {
          label: 'Total Estimated Amount',
          amount: formatRupees(booking.totalEstimatedAmount),
        },
      ];
      rows.forEach((r) => {
        const rowEl = document.createElement('div');
        rowEl.className = 'profile-rate-item';
        const l = document.createElement('span');
        l.textContent = r.label;
        const a = document.createElement('strong');
        a.textContent = r.amount;
        rowEl.appendChild(l);
        rowEl.appendChild(a);
        priceListEl.appendChild(rowEl);
      });
    }

    if (instructionsEl) {
      instructionsEl.textContent = booking.instructions
        ? `Additional Instructions: ${booking.instructions}`
        : 'Additional Instructions: None provided.';
    }

    renderTimelineInto(timelineEl, booking);
    openModal(bookingDetailsModal);
  }

  // Cancel Eligible Booking
  const cancelModalDesc = document.getElementById('cancelModalDesc');
  const confirmCancelBookingBtn = document.getElementById('confirmCancelBookingBtn');

  function promptCancelBooking(booking) {
    const check = evaluateCustomerCancellation(booking);
    if (!check.allowed) {
      showGlobalNotice(check.reason, true);
      return;
    }
    state.pendingCancelRefId = booking.referenceId;
    if (cancelModalDesc) {
      const statusNote =
        booking.status === BOOKING_STATUSES.CONFIRMED
          ? 'This booking is currently Confirmed. Cancelling will notify the service provider in this demonstration.'
          : 'Cancelling will update the status to Cancelled in local demonstration storage.';
      cancelModalDesc.textContent = `Cancel booking ${booking.referenceId} (${booking.serviceName} with ${booking.providerName} on ${booking.appointmentDate})? ${statusNote}`;
    }
    openModal(cancelBookingModal, confirmCancelBookingBtn);
  }

  if (confirmCancelBookingBtn) {
    confirmCancelBookingBtn.addEventListener('click', () => {
      const targetRef = state.pendingCancelRefId;
      if (!targetRef) return;

      runWithSubmitGuard(confirmCancelBookingBtn, 'Cancelling...', () => {
        const result = transitionBookingStatus({
          bookingId: targetRef,
          targetStatus: BOOKING_STATUSES.CANCELLED,
          actorRole: 'customer',
          actorId: (getDemoSession() || {}).id || '',
        });

        state.pendingCancelRefId = null;
        closeModal(cancelBookingModal);

        if (!result.ok) {
          showGlobalNotice(result.error || 'Could not cancel booking.', true);
          return;
        }

        refreshDashboard();
        showGlobalNotice(
          `Booking ${targetRef} has been cancelled. Status synchronized across local demonstration views.`
        );
      });
    });
  }

  // =========================================================================
  // Render Status Tabs, Overview, My Bookings & Booking History
  // =========================================================================
  function syncStatusTabsUI(bookings) {
    const counts = {
      all: bookings.length,
      Pending: bookings.filter((b) => b.status === BOOKING_STATUSES.PENDING).length,
      Confirmed: bookings.filter((b) => b.status === BOOKING_STATUSES.CONFIRMED).length,
      Completed: bookings.filter((b) => b.status === BOOKING_STATUSES.COMPLETED).length,
      Cancelled: bookings.filter((b) => b.status === BOOKING_STATUSES.CANCELLED).length,
      Rejected: bookings.filter((b) => b.status === BOOKING_STATUSES.REJECTED).length,
    };

    document.querySelectorAll('[data-status-tab]').forEach((btn) => {
      const key = btn.dataset.statusTab || 'all';
      const isActive = state.statusFilter === key;
      const label = key === 'all' ? 'All' : key;
      btn.textContent = `${label} (${counts[key] ?? 0})`;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });
  }

  function renderOverview(bookings) {
    const stats = getCustomerStats(bookings);

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v);
    };

    setVal('statTotalBookings', stats.totalBookings);
    setVal('statActiveBookings', stats.activeBookings);
    setVal(
      'statActiveSub',
      `${stats.pendingBookings} Pending · ${stats.confirmedBookings} Confirmed`
    );
    setVal('statCompletedBookings', stats.completedBookings);
    setVal('statCancelledBookings', stats.cancelledBookings);
    setVal('statCancelledSub', `${stats.rejectedBookings} Rejected by provider`);

    const tbody = document.getElementById('recentBookingsBody');
    const wrap = document.getElementById('recentBookingsWrap');
    const empty = document.getElementById('overviewEmptyState');
    const emptyHeading = empty ? empty.querySelector('h3') : null;
    if (!tbody) return;

    tbody.innerHTML = '';
    const recent = [...bookings]
      .sort((a, b) =>
        (b.createdAt || b.appointmentDate || '').localeCompare(
          a.createdAt || a.appointmentDate || ''
        )
      )
      .slice(0, 5);

    if (wrap) wrap.hidden = recent.length === 0;
    if (empty) empty.hidden = recent.length > 0;
    if (emptyHeading) emptyHeading.textContent = "You haven't booked any services yet.";

    recent.forEach((b) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.dataset.label = 'Booking ID';
      tdId.className = 'dash-ref-cell';
      tdId.textContent = b.referenceId;

      const tdSvc = document.createElement('td');
      tdSvc.dataset.label = 'Service & Provider';
      const sStrong = document.createElement('strong');
      sStrong.textContent = b.serviceName;
      const pSub = document.createElement('span');
      pSub.className = 'dash-sub-cell';
      pSub.textContent = `${b.providerName} · ${b.providerCategory}`;
      tdSvc.appendChild(sStrong);
      tdSvc.appendChild(pSub);

      const tdDt = document.createElement('td');
      tdDt.dataset.label = 'Date & Time';
      tdDt.textContent = b.appointmentDate;
      const tSub = document.createElement('span');
      tSub.className = 'dash-sub-cell';
      tSub.textContent = b.appointmentTime;
      tdDt.appendChild(tSub);

      const tdPrice = document.createElement('td');
      tdPrice.dataset.label = 'Est. Amount';
      tdPrice.className = 'dash-price-cell';
      tdPrice.textContent = formatRupees(b.totalEstimatedAmount);

      const tdStatus = document.createElement('td');
      tdStatus.dataset.label = 'Status';
      const stSpan = document.createElement('span');
      stSpan.className = `dash-status-text ${statusClassName(b.status)}`;
      stSpan.textContent = b.status;
      tdStatus.appendChild(stSpan);

      const tdAct = document.createElement('td');
      tdAct.dataset.label = 'Action';
      const actWrap = document.createElement('div');
      actWrap.className = 'dash-row-actions';

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'btn-table-action';
      viewBtn.textContent = 'View Details';
      viewBtn.addEventListener('click', () => openBookingDetailsModal(b));
      actWrap.appendChild(viewBtn);

      if (evaluateCustomerCancellation(b).allowed) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-table-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => promptCancelBooking(b));
        actWrap.appendChild(cancelBtn);
      }

      tdAct.appendChild(actWrap);

      tr.appendChild(tdId);
      tr.appendChild(tdSvc);
      tr.appendChild(tdDt);
      tr.appendChild(tdPrice);
      tr.appendChild(tdStatus);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }

  function renderMyBookings(bookings) {
    const tbody = document.getElementById('myBookingsBody');
    const wrap = document.getElementById('myBookingsTableWrap');
    const empty = document.getElementById('myBookingsEmptyState');
    const emptyHeading = empty ? empty.querySelector('h3') : null;
    if (!tbody) return;

    syncStatusTabsUI(bookings);

    const sorted = filterAndSortBookings(bookings, {
      searchQuery: state.searchQuery,
      statusFilter: state.statusFilter,
      dateFilter: state.dateFilter,
      dateSort: state.dateSort,
    });

    tbody.innerHTML = '';
    if (wrap) wrap.hidden = sorted.length === 0;
    if (empty) empty.hidden = sorted.length > 0;
    if (emptyHeading) {
      emptyHeading.textContent =
        bookings.length === 0
          ? "You haven't booked any services yet."
          : 'No matching bookings';
    }

    sorted.forEach((b) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.dataset.label = 'Booking ID';
      tdId.className = 'dash-ref-cell';
      tdId.textContent = b.referenceId;

      const tdSvc = document.createElement('td');
      tdSvc.dataset.label = 'Service & Provider';
      const sStrong = document.createElement('strong');
      sStrong.textContent = b.serviceName;
      const pSub = document.createElement('span');
      pSub.className = 'dash-sub-cell';
      pSub.textContent = `${b.providerName} · ${b.providerCategory}`;
      tdSvc.appendChild(sStrong);
      tdSvc.appendChild(pSub);

      const tdLoc = document.createElement('td');
      tdLoc.dataset.label = 'Location';
      tdLoc.textContent = `${b.city} · ${b.pinCode}`;

      const tdDt = document.createElement('td');
      tdDt.dataset.label = 'Date & Time';
      tdDt.textContent = b.appointmentDate;
      const tSub = document.createElement('span');
      tSub.className = 'dash-sub-cell';
      tSub.textContent = b.appointmentTime;
      tdDt.appendChild(tSub);

      const tdPrice = document.createElement('td');
      tdPrice.dataset.label = 'Est. Price';
      tdPrice.className = 'dash-price-cell';
      tdPrice.textContent = formatRupees(b.totalEstimatedAmount);

      const tdStatus = document.createElement('td');
      tdStatus.dataset.label = 'Status';
      const stSpan = document.createElement('span');
      stSpan.className = `dash-status-text ${statusClassName(b.status)}`;
      stSpan.textContent = b.status;
      tdStatus.appendChild(stSpan);

      const tdAct = document.createElement('td');
      tdAct.dataset.label = 'Actions';
      const actWrap = document.createElement('div');
      actWrap.className = 'dash-row-actions';

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'btn-table-action';
      viewBtn.textContent = 'View Details';
      viewBtn.addEventListener('click', () => openBookingDetailsModal(b));
      actWrap.appendChild(viewBtn);

      if (evaluateCustomerCancellation(b).allowed) {
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn-table-cancel';
        cancelBtn.textContent = 'Cancel Booking';
        cancelBtn.addEventListener('click', () => promptCancelBooking(b));
        actWrap.appendChild(cancelBtn);
      }

      tdAct.appendChild(actWrap);

      tr.appendChild(tdId);
      tr.appendChild(tdSvc);
      tr.appendChild(tdLoc);
      tr.appendChild(tdDt);
      tr.appendChild(tdPrice);
      tr.appendChild(tdStatus);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }

  function renderBookingHistory(bookings) {
    const tbody = document.getElementById('historyBookingsBody');
    const wrap = document.getElementById('historyTableWrap');
    const empty = document.getElementById('historyEmptyState');
    if (!tbody) return;

    const historyItems = bookings
      .filter(
        (b) =>
          b.status === BOOKING_STATUSES.COMPLETED ||
          b.status === BOOKING_STATUSES.CANCELLED ||
          b.status === BOOKING_STATUSES.REJECTED
      )
      .sort((a, b) => (b.appointmentDate || '').localeCompare(a.appointmentDate || ''));

    tbody.innerHTML = '';
    if (wrap) wrap.hidden = historyItems.length === 0;
    if (empty) empty.hidden = historyItems.length > 0;

    historyItems.forEach((b) => {
      const tr = document.createElement('tr');

      const tdSvc = document.createElement('td');
      tdSvc.dataset.label = 'Service Name';
      const sStrong = document.createElement('strong');
      sStrong.textContent = b.serviceName;
      const rSub = document.createElement('span');
      rSub.className = 'dash-sub-cell';
      rSub.textContent = b.referenceId;
      tdSvc.appendChild(sStrong);
      tdSvc.appendChild(rSub);

      const tdProv = document.createElement('td');
      tdProv.dataset.label = 'Provider Name';
      tdProv.textContent = b.providerName;

      const tdDate = document.createElement('td');
      tdDate.dataset.label = 'Booking Date';
      tdDate.textContent = b.appointmentDate;

      const tdPrice = document.createElement('td');
      tdPrice.dataset.label = 'Amount (₹)';
      tdPrice.className = 'dash-price-cell';
      tdPrice.textContent = formatRupees(b.totalEstimatedAmount);

      const tdStatus = document.createElement('td');
      tdStatus.dataset.label = 'Final Status';
      const stSpan = document.createElement('span');
      stSpan.className = `dash-status-text ${statusClassName(b.status)}`;
      stSpan.textContent = b.status;
      tdStatus.appendChild(stSpan);

      const tdAct = document.createElement('td');
      tdAct.dataset.label = 'Action';
      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'btn-table-action';
      viewBtn.textContent = 'View Details';
      viewBtn.addEventListener('click', () => openBookingDetailsModal(b));
      tdAct.appendChild(viewBtn);

      tr.appendChild(tdSvc);
      tr.appendChild(tdProv);
      tr.appendChild(tdDate);
      tr.appendChild(tdPrice);
      tr.appendChild(tdStatus);
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  }

  // Filter controls
  const bookingSearchInput = document.getElementById('bookingSearchInput');
  const bookingStatusFilter = document.getElementById('bookingStatusFilter');
  const bookingDateFilter = document.getElementById('bookingDateFilter');
  const bookingDateSort = document.getElementById('bookingDateSort');
  const resetBookingsFiltersBtn = document.getElementById('resetBookingsFiltersBtn');

  document.querySelectorAll('[data-status-tab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.statusFilter = btn.dataset.statusTab || 'all';
      if (bookingStatusFilter) bookingStatusFilter.value = state.statusFilter;
      renderMyBookings(getScopedBookings());
    });
  });

  if (bookingSearchInput) {
    bookingSearchInput.addEventListener('input', () => {
      state.searchQuery = bookingSearchInput.value;
      renderMyBookings(getScopedBookings());
    });
  }

  if (bookingStatusFilter) {
    bookingStatusFilter.addEventListener('change', () => {
      state.statusFilter = bookingStatusFilter.value;
      renderMyBookings(getScopedBookings());
    });
  }

  if (bookingDateFilter) {
    bookingDateFilter.addEventListener('change', () => {
      state.dateFilter = bookingDateFilter.value;
      renderMyBookings(getScopedBookings());
    });
  }

  if (bookingDateSort) {
    bookingDateSort.addEventListener('change', () => {
      state.dateSort = bookingDateSort.value;
      renderMyBookings(getScopedBookings());
    });
  }

  if (resetBookingsFiltersBtn) {
    resetBookingsFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.statusFilter = 'all';
      state.dateFilter = '';
      state.dateSort = 'newest';
      if (bookingSearchInput) bookingSearchInput.value = '';
      if (bookingStatusFilter) bookingStatusFilter.value = 'all';
      if (bookingDateFilter) bookingDateFilter.value = '';
      if (bookingDateSort) bookingDateSort.value = 'newest';
      renderMyBookings(getScopedBookings());
    });
  }

  // =========================================================================
  // My Profile View & Edit (Non-sensitive data only)
  // =========================================================================
  const editProfileBtn = document.getElementById('editProfileBtn');
  const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');
  const profileViewGrid = document.getElementById('profileViewGrid');
  const profileEditForm = document.getElementById('profileEditForm');
  const profileSaveFeedback = document.getElementById('profileSaveFeedback');

  const profEditName = document.getElementById('profEditName');
  const profEditEmail = document.getElementById('profEditEmail');
  const profEditPhone = document.getElementById('profEditPhone');
  const profEditAddress = document.getElementById('profEditAddress');
  const profEditCity = document.getElementById('profEditCity');
  const profEditPin = document.getElementById('profEditPin');

  function renderProfileUI() {
    const profile = loadCustomerProfile();
    const initials = getInitials(profile.fullName);
    const firstName = profile.fullName.split(' ')[0] || 'Customer';

    const setText = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setText('welcomeHeading', `Welcome Back, ${profile.fullName}!`);
    setText('topbarCustomerName', firstName);
    setText('topbarAvatarInitials', initials);
    setText('profileAvatarInitials', initials);
    setText('profileDisplayName', profile.fullName);
    setText(
      'profileDisplaySub',
      `Customer Account${profile.city ? ` · ${profile.city}` : ''}`
    );

    setText('profViewName', profile.fullName);
    setText('profViewEmail', profile.email);
    setText('profViewPhone', `+91 ${profile.phone}`);
    setText('profViewAddress', profile.address);
    setText('profViewCity', profile.city);
    setText('profViewPin', profile.pinCode);

    if (profEditName) profEditName.value = profile.fullName;
    if (profEditEmail) profEditEmail.value = profile.email;
    if (profEditPhone) profEditPhone.value = profile.phone;
    if (profEditAddress) profEditAddress.value = profile.address;
    if (profEditCity) profEditCity.value = profile.city;
    if (profEditPin) profEditPin.value = profile.pinCode;
  }

  function setProfileEditMode(editing) {
    if (profileViewGrid) profileViewGrid.hidden = editing;
    if (profileEditForm) profileEditForm.hidden = !editing;
    if (editProfileBtn) editProfileBtn.hidden = editing;
  }

  function clearProfileErrors() {
    [
      [profEditName, 'profEditNameError'],
      [profEditEmail, 'profEditEmailError'],
      [profEditPhone, 'profEditPhoneError'],
      [profEditAddress, 'profEditAddressError'],
      [profEditCity, 'profEditCityError'],
      [profEditPin, 'profEditPinError'],
    ].forEach(([inputEl, errId]) => {
      clearFieldValidation(inputEl, document.getElementById(errId));
    });
  }

  [
    [profEditName, 'profEditNameError'],
    [profEditEmail, 'profEditEmailError'],
    [profEditPhone, 'profEditPhoneError'],
    [profEditAddress, 'profEditAddressError'],
    [profEditCity, 'profEditCityError'],
    [profEditPin, 'profEditPinError'],
  ].forEach(([inputEl, errId]) => {
    if (inputEl) {
      inputEl.addEventListener('input', () => {
        clearFieldValidation(inputEl, document.getElementById(errId));
        hideFeedbackBanner(profileSaveFeedback);
      });
    }
  });

  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      clearProfileErrors();
      hideFeedbackBanner(profileSaveFeedback);
      setProfileEditMode(true);
      if (profEditName) profEditName.focus();
    });
  }

  if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener('click', () => {
      clearProfileErrors();
      renderProfileUI();
      setProfileEditMode(false);
    });
  }

  if (profileEditForm) {
    profileEditForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearProfileErrors();
      hideFeedbackBanner(profileSaveFeedback);

      const fullName = profEditName ? profEditName.value.trim() : '';
      const email = profEditEmail ? profEditEmail.value.trim() : '';
      const phone = profEditPhone ? profEditPhone.value.trim() : '';
      const address = profEditAddress ? profEditAddress.value.trim() : '';
      const city = profEditCity ? profEditCity.value.trim() : '';
      const pinCode = profEditPin ? profEditPin.value.trim() : '';

      let isValid = true;
      const validateField = (inputEl, errId, ok, msg) => {
        const errEl = document.getElementById(errId);
        if (!ok) {
          setFieldValidation(inputEl, errEl, msg);
          isValid = false;
        } else {
          clearFieldValidation(inputEl, errEl);
        }
      };

      validateField(
        profEditName,
        'profEditNameError',
        fullName.length >= 2,
        'Please enter your full name.'
      );
      validateField(
        profEditEmail,
        'profEditEmailError',
        Boolean(email && EMAIL_REGEX.test(email)),
        'Please enter a valid email address.'
      );
      validateField(
        profEditPhone,
        'profEditPhoneError',
        Boolean(phone && INDIAN_PHONE_REGEX.test(phone)),
        'Enter a valid 10-digit Indian mobile number.'
      );
      validateField(
        profEditAddress,
        'profEditAddressError',
        address.length >= 5,
        'Please enter your saved street address.'
      );
      validateField(
        profEditCity,
        'profEditCityError',
        city.length >= 2,
        'Please enter your city.'
      );
      validateField(
        profEditPin,
        'profEditPinError',
        INDIAN_PIN_REGEX.test(pinCode),
        'Enter a valid 6-digit Indian PIN code.'
      );

      if (!isValid) {
        focusFirstInvalid(profileEditForm);
        return;
      }

      const submitBtn = profileEditForm.querySelector('button[type="submit"]');
      runWithSubmitGuard(submitBtn, 'Saving Profile...', () => {
        saveCustomerProfile({ fullName, email, phone, address, city, pinCode });
        renderProfileUI();
        setProfileEditMode(false);
        refreshDashboard();

        showFeedbackBanner(
          profileSaveFeedback,
          'Profile details updated in local demonstration storage.',
          'success'
        );
      });
    });
  }

  function refreshDashboard() {
    renderProfileUI();
    const scopedBookings = getScopedBookings();
    renderNotifications(scopedBookings);
    renderOverview(scopedBookings);
    renderMyBookings(scopedBookings);
    renderBookingHistory(scopedBookings);

    // If details modal is open and its booking updated via another tab, refresh it live
    if (state.openDetailsRefId && bookingDetailsModal && !bookingDetailsModal.hidden) {
      const updatedTarget = scopedBookings.find((b) => b.referenceId === state.openDetailsRefId);
      if (updatedTarget) {
        openBookingDetailsModal(updatedTarget);
      }
    }
  }

  refreshDashboard();

  // Listen for booking changes from other tabs / pages (e.g., Provider Booking Desk or Booking Page)
  subscribeBookingChanges(({ source }) => {
    refreshDashboard();
    if (source === 'storage') {
      showGlobalNotice('Booking records synchronized from another browser tab.');
    }
  });
});
