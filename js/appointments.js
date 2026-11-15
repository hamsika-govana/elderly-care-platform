/**
 * SilverCare - Doctor Appointment Management Module
 * Comprehensive appointment scheduling, checklist of questions to ask,
 * doctor contact info, and printable visit preparation guides.
 */

class AppointmentManager {
  constructor() {
    this.currentTab = 'upcoming'; // 'upcoming', 'past'
  }

  renderAppointmentsPage() {
    const listContainer = document.getElementById('appointmentsListContainer');
    if (!listContainer || !window.silverStore) return;

    const apts = window.silverStore.getAppointments();
    const todayStr = new Date().toISOString().split('T')[0];

    let filtered = apts.filter(a => {
      if (this.currentTab === 'upcoming') {
        return a.date >= todayStr || a.status === 'Upcoming';
      } else {
        return a.date < todayStr || a.status === 'Completed' || a.status === 'Canceled';
      }
    });

    // Sort by date
    filtered.sort((a, b) => (this.currentTab === 'upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-icon">🩺</div>
          <h4>No ${this.currentTab === 'upcoming' ? 'Upcoming' : 'Past'} Appointments</h4>
          <p class="text-muted">You have no scheduled visits in this section.</p>
          <button class="btn btn-primary" onclick="window.silverApts.openAddModal()">Schedule New Doctor Visit</button>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(apt => {
      const isPast = apt.status === 'Completed' || apt.date < todayStr;
      const statusBadge = isPast
        ? `<span class="badge badge-neutral">Completed</span>`
        : `<span class="badge badge-success">Upcoming Visit</span>`;

      // Format date for readable display
      const dateParts = apt.date.split('-');
      const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      const readableDate = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      const questionsList = (apt.questionsToAsk || []).map(q => `<li><span class="bullet">💬</span> ${q}</li>`).join('');

      return `
        <div class="apt-card ${isPast ? 'apt-past' : ''}">
          <div class="apt-card-header">
            <div class="apt-doc-info">
              <div class="apt-avatar">🩺</div>
              <div>
                <h3 class="apt-doc-name">${apt.doctorName}</h3>
                <span class="apt-specialty">${apt.specialty}</span>
              </div>
            </div>
            ${statusBadge}
          </div>

          <div class="apt-timing-banner">
            <div class="apt-time-badge">
              <span class="time-icon">📅</span>
              <b>${readableDate}</b> at <b>${apt.time}</b>
            </div>
            <div class="apt-reminder-status">
              ${apt.reminderEnabled ? '🔔 Reminder Active' : '🔕 No Reminder'}
            </div>
          </div>

          <div class="apt-meta-grid">
            <div class="apt-meta-item">
              <span class="meta-label">Clinic / Hospital</span>
              <span class="meta-val">🏥 ${apt.hospital}</span>
            </div>
            <div class="apt-meta-item">
              <span class="meta-label">Location Address</span>
              <span class="meta-val">📍 ${apt.address || 'Springfield Medical District'}</span>
            </div>
            <div class="apt-meta-item">
              <span class="meta-label">Contact Phone</span>
              <span class="meta-val">📞 <a href="tel:${apt.phone || '555-0100'}">${apt.phone || '(555) 010-0000'}</a></span>
            </div>
            <div class="apt-meta-item">
              <span class="meta-label">Purpose of Visit</span>
              <span class="meta-val">${apt.purpose || 'General Consultation'}</span>
            </div>
          </div>

          ${questionsList ? `
            <div class="apt-questions-box">
              <span class="questions-label">📝 Important Questions to Ask Doctor:</span>
              <ul class="questions-list">${questionsList}</ul>
            </div>
          ` : ''}

          ${apt.visitSummary ? `
            <div class="apt-summary-box">
              <span class="summary-label">📋 Post-Visit Doctor Summary:</span>
              <p>${apt.visitSummary}</p>
            </div>
          ` : ''}

          <div class="apt-card-footer">
            <button class="btn btn-sm btn-outline-primary" onclick="window.silverApts.showVisitPreparation('${apt.id}')">
              🖨️ Visit Checklist & Summary
            </button>
            <div class="btn-group">
              <button class="btn btn-sm btn-outline-secondary" onclick="window.silverApts.openEditModal('${apt.id}')">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="window.silverApts.confirmDeleteApt('${apt.id}', '${apt.doctorName}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Add / Edit Modals ---
  openAddModal() {
    const modal = document.getElementById('appointmentModal');
    const form = document.getElementById('appointmentForm');
    const modalTitle = document.getElementById('aptModalTitle');

    if (modal && form) {
      form.reset();
      document.getElementById('aptIdInput').value = '';
      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      document.getElementById('aptDateInput').value = tomorrow.toISOString().split('T')[0];
      document.getElementById('aptTimeInput').value = '10:00';
      modalTitle.textContent = 'Schedule Doctor Appointment';
      modal.classList.add('active');
    }
  }

  openEditModal(id) {
    const apts = window.silverStore.getAppointments();
    const apt = apts.find(a => a.id === id);
    if (!apt) return;

    const modal = document.getElementById('appointmentModal');
    const modalTitle = document.getElementById('aptModalTitle');

    if (modal) {
      document.getElementById('aptIdInput').value = apt.id;
      document.getElementById('aptDoctorNameInput').value = apt.doctorName;
      document.getElementById('aptSpecialtyInput').value = apt.specialty;
      document.getElementById('aptHospitalInput').value = apt.hospital;
      document.getElementById('aptAddressInput').value = apt.address || '';
      document.getElementById('aptPhoneInput').value = apt.phone || '';
      document.getElementById('aptDateInput').value = apt.date;
      document.getElementById('aptTimeInput').value = apt.time;
      document.getElementById('aptPurposeInput').value = apt.purpose || '';
      document.getElementById('aptQuestionsInput').value = Array.isArray(apt.questionsToAsk)
        ? apt.questionsToAsk.join('\n')
        : (apt.questionsToAsk || '');
      document.getElementById('aptReminderCheck').checked = apt.reminderEnabled !== false;

      modalTitle.textContent = `Edit Appointment: ${apt.doctorName}`;
      modal.classList.add('active');
    }
  }

  closeModal() {
    const modal = document.getElementById('appointmentModal');
    if (modal) modal.classList.remove('active');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('aptIdInput').value;

    const questionsRaw = document.getElementById('aptQuestionsInput').value;
    const questionsArray = questionsRaw
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const aptData = {
      doctorName: document.getElementById('aptDoctorNameInput').value.trim(),
      specialty: document.getElementById('aptSpecialtyInput').value.trim(),
      hospital: document.getElementById('aptHospitalInput').value.trim(),
      address: document.getElementById('aptAddressInput').value.trim(),
      phone: document.getElementById('aptPhoneInput').value.trim(),
      date: document.getElementById('aptDateInput').value,
      time: document.getElementById('aptTimeInput').value,
      purpose: document.getElementById('aptPurposeInput').value.trim(),
      questionsToAsk: questionsArray,
      reminderEnabled: document.getElementById('aptReminderCheck').checked
    };

    if (!aptData.doctorName || !aptData.date || !aptData.time) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast('Please provide doctor name, date, and time.', 'warning');
      }
      return;
    }

    if (id) {
      window.silverStore.updateAppointment(id, aptData);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Updated appointment with ${aptData.doctorName}.`, 'success');
      }
    } else {
      window.silverStore.addAppointment(aptData);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Appointment with ${aptData.doctorName} confirmed.`, 'success');
      }
    }

    this.closeModal();
    this.renderAppointmentsPage();
    if (window.silverApp) window.silverApp.renderCurrentPage();
  }

  confirmDeleteApt(id, doctorName) {
    if (confirm(`Cancel and remove appointment with ${doctorName}?`)) {
      window.silverStore.deleteAppointment(id);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Appointment with ${doctorName} removed.`, 'info');
      }
      this.renderAppointmentsPage();
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  // --- Doctor Visit Preparation & Printable Report ---
  showVisitPreparation(aptId) {
    const apts = window.silverStore.getAppointments();
    const apt = apts.find(a => a.id === aptId) || apts[0];
    const profile = window.silverStore.getPatientProfile();
    const meds = window.silverStore.getMedications();
    const vitals = window.silverStore.getVitals();
    const adherence = window.silverStore.calculateAdherence(14);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-card print-modal-card">
        <div class="modal-header">
          <h3>🩺 Doctor Visit Preparation Summary</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body printable-area" id="printableDoctorSummary">
          <div class="print-header">
            <div>
              <h2>SilverCare Comprehensive Patient Report</h2>
              <p>Generated for: <b>${profile.name}</b> (Age ${profile.age}, DOB: ${profile.dob})</p>
              <p>Appointment: <b>${apt.doctorName} (${apt.specialty})</b> on <b>${apt.date} at ${apt.time}</b></p>
            </div>
            <div class="print-hospital-badge">
              <span>🏥 ${apt.hospital}</span>
            </div>
          </div>

          <hr style="margin: 15px 0; border: 0; border-top: 1px solid #E2E8F0;">

          <div class="print-section">
            <h4>1. Current Vitals (Recent Readings)</h4>
            <div class="print-grid">
              <div><b>Blood Pressure:</b> ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg (${vitals.bloodPressure.status})</div>
              <div><b>Fasting Blood Sugar:</b> ${vitals.bloodGlucose.value} mg/dL</div>
              <div><b>Heart Rate:</b> ${vitals.heartRate.value} bpm</div>
              <div><b>14-Day Med Adherence:</b> ${adherence.score}% (${adherence.streak} Days perfect streak)</div>
            </div>
          </div>

          <div class="print-section">
            <h4>2. Known Allergies & Severe Sensitivities</h4>
            <ul>
              ${profile.allergies.map(a => `<li><b style="color: #DC2626;">${a.name}:</b> ${a.severity} (${a.reaction})</li>`).join('')}
            </ul>
          </div>

          <div class="print-section">
            <h4>3. Current Active Medication Regimen (${meds.length} prescriptions)</h4>
            <table class="print-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency & Timing</th>
                  <th>Food Instruction</th>
                  <th>Prescribed By</th>
                </tr>
              </thead>
              <tbody>
                ${meds.map(m => `
                  <tr>
                    <td><b>${m.name}</b></td>
                    <td>${m.dosage}</td>
                    <td>${m.frequency} (${m.timeSlot})</td>
                    <td>${m.foodTiming}</td>
                    <td>${m.prescribedBy}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="print-section">
            <h4>4. Patient Questions Checklist for Today's Visit</h4>
            <ul>
              ${(apt.questionsToAsk || []).map(q => `<li>[ &nbsp; ] ${q}</li>`).join('')}
            </ul>
          </div>

          <div class="print-section" style="margin-top: 15px; font-size: 0.85rem; color: #64748B;">
            <p><b>Physician Notes / Adjustments:</b> ____________________________________________________________________</p>
            <p>SilverCare Platform Emergency Caregiver Contact: ${profile.emergencyContact.name} (${profile.emergencyContact.phone})</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary modal-close-btn">Close</button>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Print Report</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', () => modal.remove());
    });
    document.body.appendChild(modal);
  }
}

// Global appointment manager
window.silverApts = new AppointmentManager();
