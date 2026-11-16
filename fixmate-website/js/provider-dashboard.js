// FixMate – Provider Booking Management Module (Pure Vanilla JavaScript)
// Powers Provider Booking Management via js/booking-manager.js using browser localStorage.
// Demonstration stage only: does not provide real-time multi-user sync or server-side authorization.

import {
  BOOKING_STATUSES,
  buildBookingTimeline,
  ensureDemoSeedData,
  filterAndSortBookings,
  formatRupees,
  formatTimestampLabel,
  getProviderBookings,
  getProviderNotifications,
  getProviderStats,
  markNotificationsRead,
  subscribeBookingChanges,
  transitionBookingStatus,
} from './booking-manager.js';
import {
  closeDialogModal,
  openDialogModal,
  runWithSubmitGuard,
  showFeedbackBanner,
} from './ui-helpers.js';

function statusClassName(status) {
  return `is-${String(status || 'pending').toLowerCase()}`;
}

export function initProviderBookingDesk({ providerId, providerName, rootEl }) {
  if (!rootEl || !providerId) return null;

  ensureDemoSeedData();

  const state = {
    providerId,
    providerName: providerName || 'Service Provider',
    statusFilter: 'all',
    searchQuery: '',
    dateFilter: '',
    dateSort: 'newest',
    openDetailsRefId: null,
    pendingConfirm: null,
  };

  // Query elements scoped inside rootEl
  const el = {
    statTotalRequests: rootEl.querySelector('#provStatTotalRequests'),
    statAccepted: rootEl.querySelector('#provStatAccepted'),
    statRejected: rootEl.querySelector('#provStatRejected'),
    statCompleted: rootEl.querySelector('#provStatCompleted'),
    statEarnings: rootEl.querySelector('#provStatEarnings'),
    statEarningsSub: rootEl.querySelector('#provStatEarningsSub'),
    tabsWrap: rootEl.querySelector('#providerStatusTabs'),
    searchInput: rootEl.querySelector('#providerBookingSearch'),
    statusSelect: rootEl.querySelector('#providerBookingStatusFilter'),
    dateInput: rootEl.querySelector('#providerBookingDateFilter'),
    sortSelect: rootEl.querySelector('#providerBookingSort'),
    resetFiltersBtn: rootEl.querySelector('#providerResetFiltersBtn'),
    tableWrap: rootEl.querySelector('#providerBookingsTableWrap'),
    tbody: rootEl.querySelector('#providerBookingsBody'),
    emptyState: rootEl.querySelector('#providerBookingsEmptyState'),
    feedbackBanner: rootEl.querySelector('#providerDeskNotice'),
    notifList: rootEl.querySelector('#providerNotifList'),
    notifBadge: rootEl.querySelector('#providerNotifUnreadCount'),
    markNotifsBtn: rootEl.querySelector('#providerMarkNotifsReadBtn'),
    detailsModal: document.getElementById('providerBookingDetailsModal'),
    detailsRef: document.getElementById('provDetailsModalRef'),
    detailsTitle: document.getElementById('provDetailsModalTitle'),
    detailsGrid: document.getElementById('provDetailsModalGrid'),
    detailsPriceList: document.getElementById('provDetailsModalPriceList'),
    detailsInstructions: document.getElementById('provDetailsModalInstructions'),
    detailsTimeline: document.getElementById('provDetailsModalTimeline'),
    confirmModal: document.getElementById('providerConfirmModal'),
    confirmEyebrow: document.getElementById('providerConfirmEyebrow'),
    confirmTitle: document.getElementById('providerConfirmTitle'),
    confirmDesc: document.getElementById('providerConfirmDesc'),
    confirmSubmitBtn: document.getElementById('providerConfirmSubmitBtn'),
  };

  function showDeskNotice(message, isError = false) {
    showFeedbackBanner(el.feedbackBanner, message, isError ? 'error' : 'success');
  }

  function closeDetailsModal() {
    closeDialogModal(el.detailsModal);
    state.openDetailsRefId = null;
  }

  function closeConfirmModal() {
    closeDialogModal(el.confirmModal);
    state.pendingConfirm = null;
  }

  function renderTimeline(booking) {
    if (!el.detailsTimeline) return;
    el.detailsTimeline.innerHTML = '';
    buildBookingTimeline(booking).forEach((step) => {
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
      el.detailsTimeline.appendChild(li);
    });
  }

  function openBookingDetails(booking) {
    if (!el.detailsModal) return;
    state.openDetailsRefId = booking.referenceId;

    if (el.detailsRef) el.detailsRef.textContent = booking.referenceId;
    if (el.detailsTitle) el.detailsTitle.textContent = booking.serviceName;

    if (el.detailsGrid) {
      el.detailsGrid.innerHTML = '';
      const specs = [
        { label: 'Current Status', value: booking.status },
        {
          label: 'Scheduled Slot',
          value: `${booking.appointmentDate} · ${booking.appointmentTime}`,
        },
        { label: 'Customer Name', value: booking.customerName },
        {
          label: 'Customer Contact',
          value: `+91 ${booking.customerPhone} · ${booking.customerEmail}`,
        },
        { label: 'Service Category', value: booking.serviceCategory || booking.providerCategory },
        { label: 'Service Address', value: booking.serviceAddress },
        { label: 'Booking Created', value: formatTimestampLabel(booking.createdAt) },
        { label: 'Provider ID', value: booking.providerId },
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
        el.detailsGrid.appendChild(cell);
      });
    }

    if (el.detailsPriceList) {
      el.detailsPriceList.innerHTML = '';
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
        el.detailsPriceList.appendChild(rowEl);
      });
    }

    if (el.detailsInstructions) {
      el.detailsInstructions.textContent = booking.instructions
        ? `Customer Instructions: ${booking.instructions}`
        : 'Customer Instructions: None provided.';
    }

    renderTimeline(booking);
    openDialogModal(el.detailsModal);
  }

  function handleStatusAction(booking, targetStatus) {
    const result = transitionBookingStatus({
      bookingId: booking.referenceId,
      targetStatus,
      actorRole: 'provider',
      actorId: state.providerId,
    });

    if (!result.ok) {
      showDeskNotice(result.error || 'Action could not be completed.', true);
      return;
    }

    const actionLabels = {
      Confirmed: `Booking ${booking.referenceId} accepted and marked Confirmed.`,
      Rejected: `Booking ${booking.referenceId} has been Rejected.`,
      Completed: `Booking ${booking.referenceId} marked Completed. Estimated earnings updated.`,
    };

    showDeskNotice(
      actionLabels[targetStatus] || `Booking ${booking.referenceId} updated to ${targetStatus}.`
    );
    refresh();
  }

  function promptStatusAction(booking, targetStatus) {
    if (!el.confirmModal || !el.confirmSubmitBtn) {
      handleStatusAction(booking, targetStatus);
      return;
    }

    const isReject = targetStatus === BOOKING_STATUSES.REJECTED;
    state.pendingConfirm = { booking, targetStatus };

    if (el.confirmEyebrow) {
      el.confirmEyebrow.textContent = isReject ? 'Reject Request' : 'Complete Job';
    }
    if (el.confirmTitle) {
      el.confirmTitle.textContent = isReject
        ? `Reject Booking ${booking.referenceId}?`
        : `Mark Booking ${booking.referenceId} Completed?`;
    }
    if (el.confirmDesc) {
      el.confirmDesc.textContent = isReject
        ? `Are you sure you want to reject ${booking.customerName}'s ${booking.serviceName} request for ${booking.appointmentDate} (${booking.appointmentTime})? This status update cannot be undone.`
        : `Confirm that ${booking.serviceName} for ${booking.customerName} on ${booking.appointmentDate} is finished? Estimated earnings (${formatRupees(booking.totalEstimatedAmount)}) will be added to completed earnings.`;
    }

    el.confirmSubmitBtn.className = isReject ? 'btn-danger-solid' : 'btn-book-provider';
    el.confirmSubmitBtn.textContent = isReject ? 'Yes, Reject Booking' : 'Yes, Mark Completed';

    openDialogModal(el.confirmModal, el.confirmSubmitBtn);
  }

  function renderStats(bookings) {
    const stats = getProviderStats(bookings);
    if (el.statTotalRequests) el.statTotalRequests.textContent = String(stats.totalRequests);
    if (el.statAccepted) el.statAccepted.textContent = String(stats.acceptedBookings);
    if (el.statRejected) el.statRejected.textContent = String(stats.rejectedBookings);
    if (el.statCompleted) el.statCompleted.textContent = String(stats.completedJobs);
    if (el.statEarnings) {
      el.statEarnings.textContent = formatRupees(stats.totalEstimatedEarnings);
    }
    if (el.statEarningsSub) {
      el.statEarningsSub.textContent = `${formatRupees(stats.completedEarnings)} completed · ${formatRupees(stats.confirmedPipeline)} confirmed`;
    }

    // Sync quick status tabs with counts
    if (el.tabsWrap) {
      const counts = {
        all: bookings.length,
        Pending: stats.pendingRequests,
        Confirmed: stats.confirmedBookings,
        Completed: stats.completedJobs,
        Rejected: stats.rejectedBookings,
        Cancelled: stats.cancelledBookings,
      };
      el.tabsWrap.querySelectorAll('[data-prov-tab]').forEach((btn) => {
        const key = btn.dataset.provTab || 'all';
        const isActive = state.statusFilter === key;
        const label =
          key === 'all' ? 'All Requests' : key === 'Pending' ? 'Incoming Pending' : key;
        btn.textContent = `${label} (${counts[key] ?? 0})`;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
    }
  }

  function renderNotifications(bookings) {
    if (!el.notifList) return;
    const events = getProviderNotifications(state.providerId);
    const unreadCount = events.filter((n) => !n.readByProvider).length;

    if (el.notifBadge) {
      el.notifBadge.textContent = String(unreadCount);
      el.notifBadge.hidden = unreadCount === 0;
    }

    el.notifList.innerHTML = '';

    if (events.length === 0) {
      const pendingCount = bookings.filter((b) => b.status === BOOKING_STATUSES.PENDING).length;
      const p = document.createElement('p');
      p.className = 'provider-notif-empty';
      p.textContent =
        pendingCount > 0
          ? `${pendingCount} pending booking request(s) awaiting response for ${state.providerName}.`
          : `No new booking activity notifications for ${state.providerName} yet.`;
      el.notifList.appendChild(p);
      return;
    }

    events.slice(0, 4).forEach((ev) => {
      const item = document.createElement('div');
      item.className = `provider-notif-row ${ev.readByProvider ? '' : 'is-unread'}`.trim();

      const strong = document.createElement('strong');
      strong.textContent = ev.title;

      const msg = document.createElement('span');
      msg.textContent = ev.message;

      const ts = document.createElement('span');
      ts.className = 'dash-notif-time';
      ts.textContent = formatTimestampLabel(ev.createdAt);

      item.appendChild(strong);
      item.appendChild(msg);
      item.appendChild(ts);
      el.notifList.appendChild(item);
    });
  }

  function renderTable(bookings) {
    if (!el.tbody) return;

    const filtered = filterAndSortBookings(bookings, {
      searchQuery: state.searchQuery,
      statusFilter: state.statusFilter,
      dateFilter: state.dateFilter,
      dateSort: state.dateSort,
    });

    el.tbody.innerHTML = '';
    if (el.tableWrap) el.tableWrap.hidden = filtered.length === 0;
    if (el.emptyState) el.emptyState.hidden = filtered.length > 0;

    filtered.forEach((b) => {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.dataset.label = 'Booking ID';
      tdId.className = 'dash-ref-cell';
      tdId.textContent = b.referenceId;

      const tdCustomer = document.createElement('td');
      tdCustomer.dataset.label = 'Customer & Address';
      const cStrong = document.createElement('strong');
      cStrong.textContent = b.customerName;
      const cSub = document.createElement('span');
      cSub.className = 'dash-sub-cell';
      cSub.textContent = `+91 ${b.customerPhone} · ${b.city} ${b.pinCode}`;
      tdCustomer.appendChild(cStrong);
      tdCustomer.appendChild(cSub);

      const tdService = document.createElement('td');
      tdService.dataset.label = 'Service';
      tdService.textContent = b.serviceName;

      const tdSlot = document.createElement('td');
      tdSlot.dataset.label = 'Date & Time';
      tdSlot.textContent = b.appointmentDate;
      const slotSub = document.createElement('span');
      slotSub.className = 'dash-sub-cell';
      slotSub.textContent = b.appointmentTime;
      tdSlot.appendChild(slotSub);

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

      const tdActions = document.createElement('td');
      tdActions.dataset.label = 'Actions';
      const actWrap = document.createElement('div');
      actWrap.className = 'dash-row-actions';

      if (b.status === BOOKING_STATUSES.PENDING) {
        const acceptBtn = document.createElement('button');
        acceptBtn.type = 'button';
        acceptBtn.className = 'btn-table-accept';
        acceptBtn.textContent = 'Accept';
        acceptBtn.addEventListener('click', () =>
          runWithSubmitGuard(acceptBtn, 'Accepting...', () =>
            handleStatusAction(b, BOOKING_STATUSES.CONFIRMED)
          )
        );
        actWrap.appendChild(acceptBtn);

        const rejectBtn = document.createElement('button');
        rejectBtn.type = 'button';
        rejectBtn.className = 'btn-table-cancel';
        rejectBtn.textContent = 'Reject';
        rejectBtn.addEventListener('click', () =>
          promptStatusAction(b, BOOKING_STATUSES.REJECTED)
        );
        actWrap.appendChild(rejectBtn);
      } else if (b.status === BOOKING_STATUSES.CONFIRMED) {
        const completeBtn = document.createElement('button');
        completeBtn.type = 'button';
        completeBtn.className = 'btn-table-accept';
        completeBtn.textContent = 'Mark Completed';
        completeBtn.addEventListener('click', () =>
          promptStatusAction(b, BOOKING_STATUSES.COMPLETED)
        );
        actWrap.appendChild(completeBtn);
      }

      const viewBtn = document.createElement('button');
      viewBtn.type = 'button';
      viewBtn.className = 'btn-table-action';
      viewBtn.textContent = 'View Details';
      viewBtn.addEventListener('click', () => openBookingDetails(b));
      actWrap.appendChild(viewBtn);

      tdActions.appendChild(actWrap);

      tr.appendChild(tdId);
      tr.appendChild(tdCustomer);
      tr.appendChild(tdService);
      tr.appendChild(tdSlot);
      tr.appendChild(tdPrice);
      tr.appendChild(tdStatus);
      tr.appendChild(tdActions);
      el.tbody.appendChild(tr);
    });
  }

  function refresh() {
    const providerBookings = getProviderBookings(state.providerId);
    renderStats(providerBookings);
    renderNotifications(providerBookings);
    renderTable(providerBookings);

    if (state.openDetailsRefId && el.detailsModal && !el.detailsModal.hidden) {
      const updated = providerBookings.find((b) => b.referenceId === state.openDetailsRefId);
      if (updated) openBookingDetails(updated);
    }
  }

  // Bind controls
  if (el.tabsWrap) {
    el.tabsWrap.querySelectorAll('[data-prov-tab]').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.statusFilter = btn.dataset.provTab || 'all';
        if (el.statusSelect) el.statusSelect.value = state.statusFilter;
        refresh();
      });
    });
  }

  if (el.searchInput) {
    el.searchInput.addEventListener('input', () => {
      state.searchQuery = el.searchInput.value;
      renderTable(getProviderBookings(state.providerId));
    });
  }

  if (el.statusSelect) {
    el.statusSelect.addEventListener('change', () => {
      state.statusFilter = el.statusSelect.value;
      refresh();
    });
  }

  if (el.dateInput) {
    el.dateInput.addEventListener('change', () => {
      state.dateFilter = el.dateInput.value;
      renderTable(getProviderBookings(state.providerId));
    });
  }

  if (el.sortSelect) {
    el.sortSelect.addEventListener('change', () => {
      state.dateSort = el.sortSelect.value;
      renderTable(getProviderBookings(state.providerId));
    });
  }

  if (el.resetFiltersBtn) {
    el.resetFiltersBtn.addEventListener('click', () => {
      state.searchQuery = '';
      state.statusFilter = 'all';
      state.dateFilter = '';
      state.dateSort = 'newest';
      if (el.searchInput) el.searchInput.value = '';
      if (el.statusSelect) el.statusSelect.value = 'all';
      if (el.dateInput) el.dateInput.value = '';
      if (el.sortSelect) el.sortSelect.value = 'newest';
      refresh();
    });
  }

  if (el.markNotifsBtn) {
    el.markNotifsBtn.addEventListener('click', () => {
      markNotificationsRead('provider', state.providerId);
      renderNotifications(getProviderBookings(state.providerId));
    });
  }

  if (el.detailsModal) {
    el.detailsModal
      .querySelectorAll('[data-close-modal="providerBookingDetailsModal"]')
      .forEach((btn) => {
        btn.addEventListener('click', closeDetailsModal);
      });
    el.detailsModal.addEventListener('click', (event) => {
      if (event.target === el.detailsModal) closeDetailsModal();
    });
  }

  if (el.confirmModal) {
    el.confirmModal
      .querySelectorAll('[data-close-modal="providerConfirmModal"]')
      .forEach((btn) => {
        btn.addEventListener('click', closeConfirmModal);
      });
    el.confirmModal.addEventListener('click', (event) => {
      if (event.target === el.confirmModal) closeConfirmModal();
    });
  }

  if (el.confirmSubmitBtn) {
    el.confirmSubmitBtn.addEventListener('click', () => {
      const pending = state.pendingConfirm;
      if (!pending) return;
      const processingLabel =
        pending.targetStatus === BOOKING_STATUSES.REJECTED ? 'Rejecting...' : 'Completing...';
      runWithSubmitGuard(el.confirmSubmitBtn, processingLabel, () => {
        closeConfirmModal();
        handleStatusAction(pending.booking, pending.targetStatus);
      });
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (el.confirmModal && !el.confirmModal.hidden) {
        closeConfirmModal();
        return;
      }
      if (el.detailsModal && !el.detailsModal.hidden) {
        closeDetailsModal();
      }
    }
  });

  // Cross-tab & in-page synchronization
  subscribeBookingChanges(({ source }) => {
    refresh();
    if (source === 'storage') {
      showDeskNotice('Booking updates synchronized from another browser tab.');
    }
  });

  refresh();
  return { refresh };
}
