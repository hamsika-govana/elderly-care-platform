/**
 * SilverCare - Smart Reminder & Notification Center
 * Handles toast popups, scheduled reminders, simulated email/SMS dispatches,
 * and audio chime integration.
 */

class NotificationManager {
  constructor() {
    this.toastContainer = null;
    this.init();
  }

  init() {
    this.createToastContainer();
    this.updateBadge();

    // Listen for custom notification events
    window.addEventListener('silvercare_notification_added', (e) => {
      this.updateBadge();
      const notif = e.detail;
      if (notif.priority === 'urgent' || notif.type === 'missed_dose') {
        this.showToast(notif.message, 'warning', notif.title);
        if (window.silverAccessibility) {
          window.silverAccessibility.playChime('warning');
        }
      }
    });

    // Check for simulated reminders every 45 seconds
    this.reminderTimer = setInterval(() => {
      this.checkUpcomingReminders();
    }, 45000);
  }

  createToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.toastContainer = container;
  }

  showToast(message, type = 'info', title = '') {
    if (!this.toastContainer) this.createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'error' || type === 'urgent') icon = '🚨';

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-body">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-text">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close Notification">&times;</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    });

    this.toastContainer.appendChild(toast);

    // Play chime sound
    if (window.silverAccessibility) {
      if (type === 'success') window.silverAccessibility.playChime('success');
      else if (type === 'warning' || type === 'urgent') window.silverAccessibility.playChime('alert');
      else window.silverAccessibility.playChime('alert');
    }

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  updateBadge() {
    const badge = document.getElementById('navNotificationBadge');
    if (!badge || !window.silverStore) return;

    const unreadCount = window.silverStore.getNotifications().filter(n => !n.read).length;
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.style.display = 'inline-flex';
    } else {
      badge.style.display = 'none';
    }
  }

  checkUpcomingReminders() {
    if (!window.silverStore) return;
    const todayLogs = window.silverStore.getDoseLogs().filter(
      l => l.date === new Date().toISOString().split('T')[0] && l.status === 'pending'
    );

    // If there is any pending dose, trigger a gentle nudge occasionally
    if (todayLogs.length > 0) {
      const nextDose = todayLogs[0];
      // Check time
      // For demonstration, let's keep it gentle
    }
  }

  // --- Hackathon Simulation Actions ---
  simulateDoseReminder() {
    const meds = window.silverStore.getMedications();
    const sampleMed = meds[0] || { name: 'Lisinopril', dosage: '10 mg', instructions: 'Take with water' };

    window.silverStore.addNotification({
      type: 'medication',
      priority: 'high',
      title: `⏰ Medication Due Now: ${sampleMed.name}`,
      message: `It is time to take ${sampleMed.name} (${sampleMed.dosage}). ${sampleMed.instructions || 'Take with water.'}`
    });

    this.showToast(
      `Time for ${sampleMed.name} (${sampleMed.dosage}). Please take with water.`,
      'warning',
      '⏰ Medication Due Now'
    );

    if (window.silverAccessibility) {
      window.silverAccessibility.speak(`Time to take your medication: ${sampleMed.name}, ${sampleMed.dosage}.`);
    }

    this.renderNotificationsPage();
  }

  simulateMissedDose() {
    const todayLogs = window.silverStore.getDoseLogs().filter(
      l => l.date === new Date().toISOString().split('T')[0]
    );
    const target = todayLogs.find(l => l.status === 'pending') || todayLogs[0];

    if (target) {
      window.silverStore.markDoseStatus(target.id, 'missed', 'Dose automatically flagged as missed (over 60m delayed)');
      this.showToast(
        `Alert dispatched to Caregiver Sarah & Family: ${target.medName} was missed!`,
        'urgent',
        '⚠️ Missed Dose Alert'
      );
      this.renderNotificationsPage();
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  simulateEmailDispatch(recipient = 'emily.daughter@silvercare.com', subject = 'Daily Medication Summary for Robert Jenkins') {
    const adherence = window.silverStore.calculateAdherence(7);
    const meds = window.silverStore.getMedications();

    const emailContent = `
=============================================
SILVERCARE AUTOMATED HEALTH DIGEST
=============================================
To: ${recipient}
Subject: ${subject}
Date: ${new Date().toLocaleString()}

Dear Family & Care Team,

Here is today's healthcare status for Robert Jenkins (Age 74):

- 7-Day Adherence Score: ${adherence.score}% (${adherence.taken} doses taken, ${adherence.missed} missed)
- Adherence Streak: ${adherence.streak} Days
- Active Medications: ${meds.length}
- Low Stock Notice: Atorvastatin (6 tablets remaining - refill needed)
- Upcoming Appointment: Dr. Angela Martinez (Tomorrow, 10:30 AM)

Emergency Contact Hotline: (555) 234-5678
Platform Link: https://silvercare.health/dashboard

DISCLAIMER: Informational reminder only. Does not replace professional medical advice.
=============================================
    `;

    // Show simulated dispatch modal
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>✉️ Simulated Email Dispatch Log</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p class="text-muted" style="margin-bottom: 12px;">
            The following automated notification was formatted and dispatched to the patient's family & primary caregiver:
          </p>
          <pre class="email-preview-box">${emailContent.trim()}</pre>
          <div class="badge badge-success" style="margin-top: 10px;">
            ✓ Successfully simulated SMTP handoff to ${recipient}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary modal-close-btn">Close Preview</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', () => modal.remove());
    });
    document.body.appendChild(modal);

    this.showToast(`Simulated email sent to ${recipient}`, 'success');
  }

  // --- Render Notifications View ---
  renderNotificationsPage(filter = 'all') {
    const container = document.getElementById('notificationsListContainer');
    if (!container || !window.silverStore) return;

    let notifs = window.silverStore.getNotifications();
    if (filter !== 'all') {
      notifs = notifs.filter(n => n.type === filter);
    }

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">🔔</div>
          <h4>No Notifications Found</h4>
          <p class="text-muted">You are all caught up! No recent alerts in this category.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => {
      let icon = '🔔';
      if (n.type === 'medication') icon = '💊';
      else if (n.type === 'missed_dose') icon = '⚠️';
      else if (n.type === 'appointment') icon = '🩺';
      else if (n.type === 'refill') icon = '📦';
      else if (n.type === 'caregiver') icon = '👩‍⚕️';
      else if (n.type === 'emergency') icon = '🚨';

      const unreadClass = !n.read ? 'unread' : '';
      const priorityClass = n.priority || 'info';

      return `
        <div class="notification-card ${unreadClass} priority-${priorityClass}">
          <div class="notif-icon-col">${icon}</div>
          <div class="notif-content-col">
            <div class="notif-header">
              <span class="notif-title">${n.title}</span>
              <span class="notif-time">${n.timestamp}</span>
            </div>
            <p class="notif-message">${n.message}</p>
          </div>
          <div class="notif-actions-col">
            ${!n.read ? `<span class="badge badge-primary">New</span>` : `<span class="badge badge-neutral">Read</span>`}
          </div>
        </div>
      `;
    }).join('');

    this.updateBadge();
  }
}

// Global notification manager
window.silverNotifications = new NotificationManager();
