/**
 * SilverCare - Family & Caregiver Dashboard Module
 * Enables caregivers and family members to monitor adherence,
 * post care updates, track vitals, and coordinate seamlessly.
 */

class CaregiverManager {
  constructor() {
    this.init();
  }

  init() {
    // nothing blocking
  }

  renderCaregiverPage() {
    const container = document.getElementById('caregiverViewContainer');
    if (!container || !window.silverStore) return;

    const profile = window.silverStore.getPatientProfile();
    const adherence = window.silverStore.calculateAdherence(7);
    const vitals = window.silverStore.getVitals();
    const notes = window.silverStore.getCaregiverNotes();
    const meds = window.silverStore.getMedications();
    const currentUser = window.silverAuth ? window.silverAuth.getCurrentUser() : null;

    // Check recent missed doses
    const logs = window.silverStore.getDoseLogs();
    const missedLogs = logs.filter(l => l.status === 'missed').slice(0, 5);

    // Calculate 7-day chart data
    const dayLabels = [];
    const dayValues = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      dayLabels.push(dayName);

      const dayLogs = logs.filter(l => l.date === dateStr);
      if (dayLogs.length === 0) {
        dayValues.push(100);
      } else {
        const taken = dayLogs.filter(l => l.status === 'taken').length;
        const total = dayLogs.filter(l => l.status === 'taken' || l.status === 'missed').length;
        dayValues.push(total > 0 ? Math.round((taken / total) * 100) : 100);
      }
    }

    container.innerHTML = `
      <!-- Patient Header Card -->
      <div class="caregiver-patient-banner">
        <div class="patient-avatar-box">👴</div>
        <div class="patient-main-info">
          <div class="patient-name-row">
            <h2>${profile.name}</h2>
            <span class="badge badge-primary">Age ${profile.age} • ${profile.bloodGroup}</span>
            <span class="badge badge-success">Care Plan Active</span>
          </div>
          <p class="patient-sub-details">
            📍 ${profile.address} &nbsp;|&nbsp; 📞 ${profile.phone} &nbsp;|&nbsp; 🏥 ${profile.emergencyHospital}
          </p>
        </div>
        <div class="care-team-pills">
          <div class="care-pill">
            <span class="pill-role">Primary Caregiver:</span>
            <span class="pill-name">👩‍⚕️ ${profile.caregiver.name}</span>
          </div>
          <div class="care-pill">
            <span class="pill-role">Family Guardian:</span>
            <span class="pill-name">👩 ${profile.emergencyContact.name}</span>
          </div>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="caregiver-metrics-grid">
        <!-- Adherence Score Card -->
        <div class="metric-card adherence-card">
          <div class="metric-card-header">
            <h3>Medication Adherence (7 Days)</h3>
            <span class="badge badge-info">${adherence.streak} Days Streak 🔥</span>
          </div>
          <div class="adherence-circle-wrap">
            <div class="adherence-circle" style="background: conic-gradient(#10B981 ${adherence.score * 3.6}deg, #E2E8F0 0deg);">
              <div class="adherence-inner">
                <span class="adherence-number">${adherence.score}%</span>
                <span class="adherence-sub">Compliance</span>
              </div>
            </div>
            <div class="adherence-stats-breakdown">
              <div class="stat-row">
                <span class="stat-dot dot-green"></span>
                <span class="stat-label">Taken on time:</span>
                <span class="stat-count"><b>${adherence.taken}</b> doses</span>
              </div>
              <div class="stat-row">
                <span class="stat-dot dot-red"></span>
                <span class="stat-label">Missed doses:</span>
                <span class="stat-count"><b>${adherence.missed}</b> doses</span>
              </div>
              <div class="stat-row">
                <span class="stat-dot dot-amber"></span>
                <span class="stat-label">Pending today:</span>
                <span class="stat-count"><b>${adherence.pending}</b> doses</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Weekly Adherence Trend Bar Chart -->
        <div class="metric-card">
          <div class="metric-card-header">
            <h3>Weekly Compliance Trend</h3>
            <span class="badge badge-neutral">Target: 90%+</span>
          </div>
          <div class="trend-chart-container">
            ${dayLabels.map((day, idx) => {
              const val = dayValues[idx];
              const isBelow = val < 80;
              return `
                <div class="trend-bar-col">
                  <span class="bar-val-label">${val}%</span>
                  <div class="trend-bar-track">
                    <div class="trend-bar-fill ${isBelow ? 'fill-warning' : 'fill-primary'}" style="height: ${val}%;"></div>
                  </div>
                  <span class="bar-day-label">${day}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Current Vitals Card -->
        <div class="metric-card vitals-summary-card">
          <div class="metric-card-header">
            <h3>Recent Health Vitals</h3>
            <button class="btn btn-sm btn-outline-primary" onclick="window.silverCaregiver.openVitalsModal()">+ Log Vitals</button>
          </div>
          <div class="vitals-mini-grid">
            <div class="vital-tile">
              <div class="vital-tile-icon">❤️</div>
              <div class="vital-tile-data">
                <span class="vital-tile-title">Blood Pressure</span>
                <span class="vital-tile-value">${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} <small>mmHg</small></span>
                <span class="vital-badge badge-success">${vitals.bloodPressure.status}</span>
              </div>
            </div>
            <div class="vital-tile">
              <div class="vital-tile-icon">🩸</div>
              <div class="vital-tile-data">
                <span class="vital-tile-title">Blood Glucose</span>
                <span class="vital-tile-value">${vitals.bloodGlucose.value} <small>mg/dL</small></span>
                <span class="vital-badge badge-neutral">${vitals.bloodGlucose.status}</span>
              </div>
            </div>
            <div class="vital-tile">
              <div class="vital-tile-icon">💧</div>
              <div class="vital-tile-data">
                <span class="vital-tile-title">Hydration</span>
                <span class="vital-tile-value">${vitals.waterIntake.current} / ${vitals.waterIntake.target} <small>glasses</small></span>
                <span class="vital-badge badge-info">On Track</span>
              </div>
            </div>
            <div class="vital-tile">
              <div class="vital-tile-icon">👟</div>
              <div class="vital-tile-data">
                <span class="vital-tile-title">Daily Steps</span>
                <span class="vital-tile-value">${vitals.steps.current.toLocaleString()} <small>steps</small></span>
                <span class="vital-badge badge-neutral">Garden walk</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Two-Column Workflow Section -->
      <div class="caregiver-split-layout">
        <!-- Left: Shared Care Team Notes & Updates -->
        <div class="split-col">
          <div class="card notes-hub-card">
            <div class="card-header-flex">
              <div>
                <h3>👩‍⚕️ Care Team Communication & Notes</h3>
                <p class="text-muted">Shared log between Nurse Sarah, Emily (Daughter), and Doctors</p>
              </div>
              <button class="btn btn-sm btn-primary" onclick="window.silverCaregiver.openNewNoteModal()">+ Add Note</button>
            </div>

            <div class="notes-feed-list">
              ${notes.map(n => `
                <div class="note-feed-item">
                  <div class="note-avatar">${n.avatar || '📝'}</div>
                  <div class="note-body">
                    <div class="note-header-line">
                      <span class="note-author">${n.author}</span>
                      <span class="badge ${n.role === 'Caregiver' ? 'badge-primary' : 'badge-info'}">${n.role}</span>
                      <span class="note-time">${n.timestamp}</span>
                    </div>
                    <h4 class="note-title">${n.title}</h4>
                    <p class="note-content">${n.content}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Right: Real-time Caregiver Alerts & Quick Actions -->
        <div class="split-col">
          <div class="card alerts-hub-card">
            <div class="card-header-flex">
              <div>
                <h3>⚠️ Caregiver Alert System</h3>
                <p class="text-muted">Automated notifications on missed doses and refill triggers</p>
              </div>
            </div>

            <div class="missed-alerts-list">
              ${missedLogs.length > 0 ? missedLogs.map(m => `
                <div class="missed-alert-item">
                  <div class="alert-icon">⚠️</div>
                  <div class="alert-info">
                    <span class="alert-title">Missed Dose: ${m.medName} (${m.dosage})</span>
                    <span class="alert-sub">Scheduled for ${m.timeSlot} on ${m.date}</span>
                    <span class="alert-reason text-muted">${m.notes || 'Unconfirmed dose'}</span>
                  </div>
                  <button class="btn btn-xs btn-outline-primary" onclick="window.silverMeds.markDoseTaken('${m.id}')">
                    Mark Resolved
                  </button>
                </div>
              `).join('') : `
                <div class="empty-state-card" style="padding: 20px;">
                  <span style="font-size: 2rem;">🎉</span>
                  <h4>Zero Missed Doses!</h4>
                  <p class="text-muted">Robert is 100% compliant with his medications today.</p>
                </div>
              `}
            </div>

            <div class="caregiver-quick-actions" style="margin-top: 20px;">
              <h4>Quick Care Actions</h4>
              <div class="action-btn-row">
                <button class="btn btn-outline-primary" onclick="window.silverNotifications.simulateEmailDispatch('emily.daughter@silvercare.com')">
                  ✉️ Email Family Summary
                </button>
                <button class="btn btn-outline-warning" onclick="window.silverNotifications.simulateMissedDose()">
                  ⚠️ Simulate Missed Dose Alert
                </button>
                <button class="btn btn-outline-success" onclick="window.silverApts.showVisitPreparation()">
                  🖨️ Generate Doctor Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --- Add Note Modal ---
  openNewNoteModal() {
    const modal = document.getElementById('careNoteModal');
    const form = document.getElementById('careNoteForm');
    if (modal && form) {
      form.reset();
      modal.classList.add('active');
    }
  }

  closeNoteModal() {
    const modal = document.getElementById('careNoteModal');
    if (modal) modal.classList.remove('active');
  }

  handleNoteSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('noteTitleInput').value.trim();
    const content = document.getElementById('noteContentInput').value.trim();

    if (!title || !content) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast('Please provide both title and note content.', 'warning');
      }
      return;
    }

    window.silverStore.addCaregiverNote({ title, content });
    if (window.silverNotifications) {
      window.silverNotifications.showToast('Care note added to patient record.', 'success');
    }

    this.closeNoteModal();
    this.renderCaregiverPage();
  }

  // --- Log Vitals Modal ---
  openVitalsModal() {
    const modal = document.getElementById('vitalsModal');
    if (modal) {
      const vitals = window.silverStore.getVitals();
      document.getElementById('systolicInput').value = vitals.bloodPressure.systolic;
      document.getElementById('diastolicInput').value = vitals.bloodPressure.diastolic;
      document.getElementById('glucoseInput').value = vitals.bloodGlucose.value;
      document.getElementById('waterInput').value = vitals.waterIntake.current;
      document.getElementById('stepsInput').value = vitals.steps.current;
      modal.classList.add('active');
    }
  }

  closeVitalsModal() {
    const modal = document.getElementById('vitalsModal');
    if (modal) modal.classList.remove('active');
  }

  handleVitalsSubmit(e) {
    e.preventDefault();
    const sys = document.getElementById('systolicInput').value;
    const dia = document.getElementById('diastolicInput').value;
    const glucose = document.getElementById('glucoseInput').value;
    const water = document.getElementById('waterInput').value;
    const steps = document.getElementById('stepsInput').value;

    window.silverStore.updateVitals({
      systolic: sys,
      diastolic: dia,
      bloodGlucose: glucose,
      waterIntake: water,
      steps: steps
    });

    if (window.silverNotifications) {
      window.silverNotifications.showToast('Health vitals updated successfully.', 'success');
    }

    this.closeVitalsModal();
    this.renderCaregiverPage();
    if (window.silverApp) window.silverApp.renderCurrentPage();
  }
}

// Global caregiver manager
window.silverCaregiver = new CaregiverManager();
