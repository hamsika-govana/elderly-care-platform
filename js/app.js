/**
 * SilverCare - Main Application Bootstrap & Client-Side Router
 * Coordinates page navigation, view rendering, state synchronisation,
 * and user interactions.
 */

class SilverApp {
  constructor() {
    this.currentPage = 'dashboard';
    this.calendarCurrentMonth = new Date().getMonth();
    this.calendarCurrentYear = new Date().getFullYear();
    this.init();
  }

  init() {
    // Listen for hash changes
    window.addEventListener('hashchange', () => this.handleRouting());

    // Setup DOM event listeners once loaded
    document.addEventListener('DOMContentLoaded', () => {
      this.bindGlobalEvents();
      this.handleRouting();
    });
  }

  // --- Router & Page Switching ---
  handleRouting() {
    const rawHash = window.location.hash.replace('#', '') || 'landing';
    const [page, param] = rawHash.split('/');

    const validPages = [
      'landing', 'login', 'register', 'dashboard',
      'medications', 'appointments', 'caregiver',
      'profile', 'notifications', 'emergency', 'calendar'
    ];

    const targetPage = validPages.includes(page) ? page : 'landing';
    this.navigateTo(targetPage, false);
  }

  navigateTo(pageId, updateHash = true) {
    this.currentPage = pageId;

    if (updateHash) {
      window.location.hash = pageId;
      return;
    }

    // Hide all view pages
    document.querySelectorAll('.view-page').forEach(view => {
      view.classList.remove('active');
    });

    // Show target view
    const targetEl = document.getElementById(`view-${pageId}`);
    if (targetEl) {
      targetEl.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    this.updateHeaderUI();
    this.renderCurrentPage();
  }

  // --- Update Navigation & Role UI ---
  updateHeaderUI() {
    const currentUser = window.silverAuth ? window.silverAuth.getCurrentUser() : null;
    const isAuth = !!currentUser;
    const role = currentUser ? currentUser.role : 'guest';

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(link => {
      const pageTarget = link.getAttribute('data-page');
      link.classList.toggle('active', pageTarget === this.currentPage);
    });

    // Toggle landing/auth nav items
    const authNav = document.getElementById('authNavLinks');
    const guestNav = document.getElementById('guestNavLinks');
    const roleSwitcher = document.getElementById('roleSwitcherWrapper');
    const userProfileDropdown = document.getElementById('userProfileDropdown');
    const currentUserName = document.getElementById('headerUserName');
    const currentUserRole = document.getElementById('headerUserRole');
    const currentUserAvatar = document.getElementById('headerUserAvatar');

    if (isAuth && this.currentPage !== 'landing' && this.currentPage !== 'login' && this.currentPage !== 'register') {
      if (authNav) authNav.style.display = 'flex';
      if (guestNav) guestNav.style.display = 'none';
      if (roleSwitcher) roleSwitcher.style.display = 'flex';
      if (userProfileDropdown) userProfileDropdown.style.display = 'flex';

      if (currentUserName) currentUserName.textContent = currentUser.name;
      if (currentUserRole) currentUserRole.textContent = role.toUpperCase();
      if (currentUserAvatar) currentUserAvatar.textContent = currentUser.avatar || '👤';

      // Update role selector active state
      const roleSelect = document.getElementById('quickRoleSelect');
      if (roleSelect) roleSelect.value = role;

      // Adjust tabs visibility based on role
      const caregiverNavLink = document.getElementById('navLinkCaregiver');
      if (caregiverNavLink) {
        if (role === 'caregiver' || role === 'family') {
          caregiverNavLink.style.display = 'inline-flex';
        } else {
          // Elderly can still see family link
          caregiverNavLink.style.display = 'inline-flex';
        }
      }
    } else {
      if (authNav && (this.currentPage === 'landing' || this.currentPage === 'login' || this.currentPage === 'register')) {
        authNav.style.display = 'none';
      }
      if (guestNav) guestNav.style.display = 'flex';
      if (roleSwitcher && (this.currentPage === 'landing' || this.currentPage === 'login')) {
        roleSwitcher.style.display = 'none';
      }
    }

    if (window.silverNotifications) {
      window.silverNotifications.updateBadge();
    }
  }

  handleAuthChange() {
    this.updateHeaderUI();
    const role = window.silverAuth.getUserRole();

    // If on caregiver dashboard but role is elderly, can stay or switch
    if (this.currentPage === 'caregiver' && role === 'elderly') {
      this.navigateTo('dashboard');
    } else if (this.currentPage === 'dashboard' && (role === 'caregiver' || role === 'family')) {
      // Keep on dashboard or let them view patient dashboard
      this.renderCurrentPage();
    } else {
      this.renderCurrentPage();
    }
  }

  // --- Render Page Content ---
  renderCurrentPage() {
    switch (this.currentPage) {
      case 'dashboard':
        this.renderElderlyDashboard();
        break;
      case 'medications':
        if (window.silverMeds) window.silverMeds.renderMedicationsPage();
        break;
      case 'appointments':
        if (window.silverApts) window.silverApts.renderAppointmentsPage();
        break;
      case 'caregiver':
        if (window.silverCaregiver) window.silverCaregiver.renderCaregiverPage();
        break;
      case 'profile':
        this.renderHealthProfile();
        break;
      case 'notifications':
        if (window.silverNotifications) window.silverNotifications.renderNotificationsPage();
        break;
      case 'emergency':
        if (window.silverEmergency) window.silverEmergency.renderEmergencyPage();
        break;
      case 'calendar':
        this.renderCalendarView();
        break;
      case 'login':
      case 'register':
      case 'landing':
        // Static structure or forms
        break;
    }
  }

  // --- Elderly Dashboard Renderer ---
  renderElderlyDashboard() {
    const profile = window.silverStore.getPatientProfile();
    const user = window.silverAuth.getCurrentUser();
    const meds = window.silverStore.getMedications();
    const vitals = window.silverStore.getVitals();
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = window.silverStore.getDoseLogs().filter(l => l.date === todayStr);
    const adherence = window.silverStore.calculateAdherence(7);
    const apts = window.silverStore.getAppointments().filter(a => a.status === 'Upcoming');

    // Greeting by time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const welcomeEl = document.getElementById('dashWelcomeGreeting');
    if (welcomeEl) {
      welcomeEl.textContent = `${greeting}, ${profile.preferredName || profile.name}!`;
    }

    const dateEl = document.getElementById('dashCurrentDate');
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Adherence Ring / Progress Bar
    const completedDoses = todayLogs.filter(l => l.status === 'taken').length;
    const totalDoses = todayLogs.length || meds.length;
    const progressPercent = totalDoses > 0 ? Math.round((completedDoses / totalDoses) * 100) : 100;

    const progressFill = document.getElementById('dashTodayProgressFill');
    const progressLabel = document.getElementById('dashTodayProgressLabel');
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (progressLabel) progressLabel.textContent = `${completedDoses} of ${totalDoses} doses completed (${progressPercent}%)`;

    const scoreNumber = document.getElementById('dashAdherenceScoreNum');
    if (scoreNumber) scoreNumber.textContent = `${adherence.score}%`;

    const streakBadge = document.getElementById('dashStreakBadge');
    if (streakBadge) streakBadge.textContent = `${adherence.streak} Day Perfect Streak 🔥`;

    // Render Today's Scheduled Medication Cards
    this.renderTodayMedicationCards(todayLogs);

    // Next Doctor Appointment Card
    const aptCard = document.getElementById('dashNextAptCard');
    if (aptCard) {
      if (apts.length > 0) {
        const nextApt = apts[0];
        aptCard.innerHTML = `
          <div class="dash-apt-item">
            <div class="apt-time-badge">
              <span class="apt-day">${nextApt.date}</span>
              <span class="apt-clock">🕒 ${nextApt.time}</span>
            </div>
            <div class="apt-details">
              <h4>${nextApt.doctorName}</h4>
              <p class="apt-spec">🩺 ${nextApt.specialty}</p>
              <p class="apt-hosp">🏥 ${nextApt.hospital}</p>
              <p class="apt-purpose">Reason: ${nextApt.purpose || 'Health Checkup'}</p>
            </div>
            <div class="apt-actions">
              <button class="btn btn-sm btn-outline-primary" onclick="window.silverApts.showVisitPreparation('${nextApt.id}')">
                Checklist
              </button>
              <a href="tel:${nextApt.phone || '555-0100'}" class="btn btn-sm btn-primary">
                📞 Call Clinic
              </a>
            </div>
          </div>
        `;
      } else {
        aptCard.innerHTML = `
          <div class="empty-state-mini">
            <span>🩺</span>
            <p>No upcoming appointments this week.</p>
            <button class="btn btn-sm btn-outline-primary" onclick="window.silverApp.navigateTo('appointments')">Schedule One</button>
          </div>
        `;
      }
    }

    // Daily Health Routine & Vitals
    const bpEl = document.getElementById('dashVitalBP');
    const sugarEl = document.getElementById('dashVitalSugar');
    const waterEl = document.getElementById('dashVitalWater');
    const stepsEl = document.getElementById('dashVitalSteps');

    if (bpEl) bpEl.textContent = `${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`;
    if (sugarEl) sugarEl.textContent = `${vitals.bloodGlucose.value} mg/dL`;
    if (waterEl) waterEl.textContent = `${vitals.waterIntake.current} / ${vitals.waterIntake.target} glasses`;
    if (stepsEl) stepsEl.textContent = `${vitals.steps.current.toLocaleString()} steps`;
  }

  // --- Render Today's Medication Cards by Slot ---
  renderTodayMedicationCards(todayLogs) {
    const container = document.getElementById('todayMedicationsSchedule');
    if (!container) return;

    if (todayLogs.length === 0) {
      container.innerHTML = `
        <div class="empty-state-card">
          <div class="empty-icon">✅</div>
          <h4>No Medications Scheduled for Today</h4>
          <p class="text-muted">You are completely done or no doses were logged.</p>
        </div>
      `;
      return;
    }

    // Group logs by time slot
    const slots = ['Morning', 'Afternoon', 'Evening', 'Bedtime'];
    const slotEmojis = { Morning: '🌅', Afternoon: '☀️', Evening: '🌇', Bedtime: '🌙' };

    let html = '';

    slots.forEach(slot => {
      const slotDoses = todayLogs.filter(d => d.timeSlot === slot);
      if (slotDoses.length === 0) return;

      html += `
        <div class="schedule-slot-group">
          <div class="slot-header">
            <span class="slot-emoji">${slotEmojis[slot] || '🕒'}</span>
            <span class="slot-title">${slot} Schedule</span>
            <span class="slot-count">(${slotDoses.length} medicine${slotDoses.length > 1 ? 's' : ''})</span>
          </div>

          <div class="slot-med-list">
            ${slotDoses.map(dose => {
              const isTaken = dose.status === 'taken';
              const isMissed = dose.status === 'missed';
              const isSnoozed = dose.status === 'snoozed';

              let statusBadge = '<span class="badge badge-warning">Due Now</span>';
              if (isTaken) statusBadge = `<span class="badge badge-success">✓ Taken at ${dose.takenTime || 'Scheduled Time'}</span>`;
              if (isMissed) statusBadge = '<span class="badge badge-danger">⚠️ Missed / Skipped</span>';
              if (isSnoozed) statusBadge = '<span class="badge badge-neutral">⏰ Snoozed (15m)</span>';

              return `
                <div class="today-dose-card ${isTaken ? 'dose-taken' : ''} ${isMissed ? 'dose-missed' : ''}">
                  <div class="dose-card-main">
                    <div class="dose-icon-wrap ${isTaken ? 'icon-done' : ''}">
                      ${isTaken ? '✓' : '💊'}
                    </div>
                    <div class="dose-info">
                      <div class="dose-name-row">
                        <h4 class="dose-name">${dose.medName}</h4>
                        <span class="dose-strength">${dose.dosage}</span>
                        ${statusBadge}
                      </div>
                      <div class="dose-timing-line">
                        <span>🕒 Scheduled: <b>${dose.scheduledTime}</b></span> •
                        <span>📋 Note: ${dose.notes || 'Take with water'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="dose-card-actions">
                    ${!isTaken ? `
                      <button class="btn btn-take-med" onclick="window.silverMeds.markDoseTaken('${dose.id}')" aria-label="Mark ${dose.medName} as taken">
                        <span class="btn-icon">✓</span> Mark as Taken
                      </button>
                      <button class="btn btn-outline-secondary btn-sm" onclick="window.silverMeds.snoozeDose('${dose.id}')" title="Remind me in 15 minutes">
                        ⏰ Snooze 15m
                      </button>
                      <button class="btn btn-outline-danger btn-sm" onclick="window.silverMeds.skipDose('${dose.id}')" title="Skip dose">
                        Skip
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-outline-secondary" onclick="window.silverMeds.skipDose('${dose.id}')" title="Undo / Change Status">
                        Change Status
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  // --- Health Profile Renderer ---
  renderHealthProfile() {
    const profile = window.silverStore.getPatientProfile();
    const canEdit = window.silverAuth.canEditHealthProfile();
    const role = window.silverAuth.getUserRole();

    const banner = document.getElementById('profileRbacBanner');
    if (banner) {
      let roleDesc = '';
      if (role === 'elderly') roleDesc = 'You are viewing your own personal healthcare dossier.';
      else if (role === 'caregiver') roleDesc = 'Caregiver Access: You have authorized clinical permissions to view and update this health record.';
      else if (role === 'family') roleDesc = 'Family Member Access: Authorized guardian access for healthcare coordination.';
      banner.innerHTML = `
        <div class="alert-banner alert-info">
          <span>🔒 <b>Secure Health Profile:</b> ${roleDesc} All medical details are encrypted and private.</span>
        </div>
      `;
    }

    // Populate profile inputs
    document.getElementById('profNameInput').value = profile.name || '';
    document.getElementById('profPreferredInput').value = profile.preferredName || '';
    document.getElementById('profDobInput').value = profile.dob || '';
    document.getElementById('profAgeInput').value = profile.age || '';
    document.getElementById('profBloodGroupInput').value = profile.bloodGroup || 'O+';
    document.getElementById('profHeightInput').value = profile.height || '';
    document.getElementById('profWeightInput').value = profile.weight || '';
    document.getElementById('profPhoneInput').value = profile.phone || '';
    document.getElementById('profAddressInput').value = profile.address || '';
    document.getElementById('profInsuranceInput').value = profile.insuranceProvider || '';
    document.getElementById('profPolicyInput').value = profile.insurancePolicyId || '';
    document.getElementById('profHospitalInput').value = profile.emergencyHospital || '';

    // Emergency Contact
    document.getElementById('profContactNameInput').value = profile.emergencyContact.name || '';
    document.getElementById('profContactRelInput').value = profile.emergencyContact.relationship || '';
    document.getElementById('profContactPhoneInput').value = profile.emergencyContact.phone || '';

    // Primary Physician
    document.getElementById('profDocNameInput').value = profile.primaryDoctor.name || '';
    document.getElementById('profDocSpecInput').value = profile.primaryDoctor.specialty || '';
    document.getElementById('profDocPhoneInput').value = profile.primaryDoctor.phone || '';

    // Caregiver Info
    document.getElementById('profNurseNameInput').value = profile.caregiver.name || '';
    document.getElementById('profNurseOrgInput').value = profile.caregiver.organization || '';
    document.getElementById('profNursePhoneInput').value = profile.caregiver.phone || '';

    // Allergies List
    const allergyContainer = document.getElementById('profileAllergiesList');
    if (allergyContainer) {
      allergyContainer.innerHTML = profile.allergies.map((a, idx) => `
        <div class="allergy-item-badge">
          <span class="allergy-name">⚠️ <b>${a.name}</b></span>
          <span class="badge ${a.severity === 'Severe' ? 'badge-danger' : 'badge-warning'}">${a.severity}</span>
          <span class="allergy-reaction">(${a.reaction})</span>
          ${canEdit ? `<button class="btn-remove-tag" onclick="window.silverApp.removeAllergy(${idx})" title="Remove">&times;</button>` : ''}
        </div>
      `).join('');
    }

    // Chronic Conditions List
    const condContainer = document.getElementById('profileConditionsList');
    if (condContainer) {
      condContainer.innerHTML = profile.chronicConditions.map((c, idx) => `
        <div class="condition-item-badge">
          <span class="condition-name">🏥 <b>${c.condition}</b></span>
          <span class="badge badge-neutral">Since ${c.diagnosedYear}</span>
          <span class="condition-status">${c.status}</span>
          ${canEdit ? `<button class="btn-remove-tag" onclick="window.silverApp.removeCondition(${idx})" title="Remove">&times;</button>` : ''}
        </div>
      `).join('');
    }

    document.getElementById('profLifestyleInput').value = profile.lifestyleNotes || '';
  }

  saveHealthProfile(e) {
    e.preventDefault();
    const current = window.silverStore.getPatientProfile();

    const updated = {
      ...current,
      name: document.getElementById('profNameInput').value.trim(),
      preferredName: document.getElementById('profPreferredInput').value.trim(),
      dob: document.getElementById('profDobInput').value,
      age: parseInt(document.getElementById('profAgeInput').value, 10) || current.age,
      bloodGroup: document.getElementById('profBloodGroupInput').value,
      height: document.getElementById('profHeightInput').value.trim(),
      weight: document.getElementById('profWeightInput').value.trim(),
      phone: document.getElementById('profPhoneInput').value.trim(),
      address: document.getElementById('profAddressInput').value.trim(),
      insuranceProvider: document.getElementById('profInsuranceInput').value.trim(),
      insurancePolicyId: document.getElementById('profPolicyInput').value.trim(),
      emergencyHospital: document.getElementById('profHospitalInput').value.trim(),
      emergencyContact: {
        ...current.emergencyContact,
        name: document.getElementById('profContactNameInput').value.trim(),
        relationship: document.getElementById('profContactRelInput').value.trim(),
        phone: document.getElementById('profContactPhoneInput').value.trim()
      },
      primaryDoctor: {
        ...current.primaryDoctor,
        name: document.getElementById('profDocNameInput').value.trim(),
        specialty: document.getElementById('profDocSpecInput').value.trim(),
        phone: document.getElementById('profDocPhoneInput').value.trim()
      },
      caregiver: {
        ...current.caregiver,
        name: document.getElementById('profNurseNameInput').value.trim(),
        organization: document.getElementById('profNurseOrgInput').value.trim(),
        phone: document.getElementById('profNursePhoneInput').value.trim()
      },
      lifestyleNotes: document.getElementById('profLifestyleInput').value.trim()
    };

    window.silverStore.updatePatientProfile(updated);
    if (window.silverNotifications) {
      window.silverNotifications.showToast('Healthcare Profile changes saved securely.', 'success');
    }
  }

  addAllergyPrompt() {
    const name = prompt('Allergy or Drug Name (e.g. Aspirin, Latex):');
    if (!name) return;
    const severity = prompt('Severity level (Severe, Moderate, or Mild):', 'Severe');
    const reaction = prompt('Typical physical reaction (e.g. Hives, Swelling):', 'Skin rash');

    const profile = window.silverStore.getPatientProfile();
    profile.allergies.push({ name, severity: severity || 'Moderate', reaction: reaction || 'Allergic reaction' });
    window.silverStore.updatePatientProfile(profile);
    this.renderHealthProfile();
  }

  removeAllergy(index) {
    const profile = window.silverStore.getPatientProfile();
    profile.allergies.splice(index, 1);
    window.silverStore.updatePatientProfile(profile);
    this.renderHealthProfile();
  }

  addConditionPrompt() {
    const condition = prompt('Medical Condition or Diagnosis (e.g. Asthma, Osteoporosis):');
    if (!condition) return;
    const year = prompt('Year Diagnosed:', '2022');
    const status = prompt('Current management status (e.g. Inhaler, Monitored):', 'Active treatment');

    const profile = window.silverStore.getPatientProfile();
    profile.chronicConditions.push({ condition, diagnosedYear: year || '2022', status: status || 'Managed' });
    window.silverStore.updatePatientProfile(profile);
    this.renderHealthProfile();
  }

  removeCondition(index) {
    const profile = window.silverStore.getPatientProfile();
    profile.chronicConditions.splice(index, 1);
    window.silverStore.updatePatientProfile(profile);
    this.renderHealthProfile();
  }

  // --- Interactive Calendar View Renderer ---
  renderCalendarView() {
    const titleEl = document.getElementById('calendarMonthYearTitle');
    const gridEl = document.getElementById('calendarDaysGrid');
    if (!titleEl || !gridEl) return;

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    titleEl.textContent = `${monthNames[this.calendarCurrentMonth]} ${this.calendarCurrentYear}`;

    const firstDay = new Date(this.calendarCurrentYear, this.calendarCurrentMonth, 1).getDay();
    const daysInMonth = new Date(this.calendarCurrentYear, this.calendarCurrentMonth + 1, 0).getDate();

    const meds = window.silverStore.getMedications();
    const apts = window.silverStore.getAppointments();
    const today = new Date();
    const isCurrentMonth = today.getMonth() === this.calendarCurrentMonth && today.getFullYear() === this.calendarCurrentYear;

    let cellsHtml = '';

    // Blank cells before first day
    for (let i = 0; i < firstDay; i++) {
      cellsHtml += `<div class="calendar-day-cell cell-empty"></div>`;
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today.getDate();
      const dateStr = `${this.calendarCurrentYear}-${String(this.calendarCurrentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

      // Appointments on this day
      const dayApts = apts.filter(a => a.date === dateStr);

      cellsHtml += `
        <div class="calendar-day-cell ${isToday ? 'cell-today' : ''}" onclick="window.silverApp.showCalendarDayDetails('${dateStr}', ${day})">
          <div class="cal-day-header">
            <span class="day-number">${day}</span>
            ${isToday ? `<span class="today-dot" title="Today">Today</span>` : ''}
          </div>

          <div class="cal-events-wrap">
            ${dayApts.map(a => `
              <div class="cal-event-pill event-apt" title="${a.doctorName} (${a.time})">
                🩺 <b>${a.time}</b> ${a.doctorName}
              </div>
            `).join('')}

            <!-- Daily med scheduled marker -->
            <div class="cal-event-pill event-med">
              💊 ${meds.length} Meds Scheduled
            </div>
          </div>
        </div>
      `;
    }

    gridEl.innerHTML = cellsHtml;
  }

  calendarPrevMonth() {
    this.calendarCurrentMonth--;
    if (this.calendarCurrentMonth < 0) {
      this.calendarCurrentMonth = 11;
      this.calendarCurrentYear--;
    }
    this.renderCalendarView();
  }

  calendarNextMonth() {
    this.calendarCurrentMonth++;
    if (this.calendarCurrentMonth > 11) {
      this.calendarCurrentMonth = 0;
      this.calendarCurrentYear++;
    }
    this.renderCalendarView();
  }

  showCalendarDayDetails(dateStr, dayNum) {
    const meds = window.silverStore.getMedications();
    const apts = window.silverStore.getAppointments().filter(a => a.date === dateStr);

    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>📅 Schedule for ${dateStr}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="section-divider">
            <h4>🩺 Doctor Appointments (${apts.length})</h4>
            ${apts.length > 0 ? apts.map(a => `
              <div class="apt-item-card" style="margin-top: 8px;">
                <b>${a.doctorName}</b> (${a.specialty}) at ${a.time}<br>
                <small>${a.hospital} • ${a.purpose}</small>
              </div>
            `).join('') : '<p class="text-muted">No appointments on this date.</p>'}
          </div>

          <div class="section-divider" style="margin-top: 15px;">
            <h4>💊 Scheduled Daily Medications (${meds.length})</h4>
            <div class="cal-med-list" style="margin-top: 8px;">
              ${meds.map(m => `
                <div class="cal-med-row">
                  <span><b>${m.name}</b> (${m.dosage})</span>
                  <span>🕒 ${m.timeSlot} (${m.exactTime || '--:--'})</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary modal-close-btn">Close</button>
        </div>
      </div>
    `;

    modal.querySelectorAll('.modal-close-btn').forEach(b => {
      b.addEventListener('click', () => modal.remove());
    });
    document.body.appendChild(modal);
  }

  // --- Quick Water Intake increment ---
  incrementWater() {
    const vitals = window.silverStore.getVitals();
    vitals.waterIntake.current = Math.min(12, (vitals.waterIntake.current || 0) + 1);
    window.silverStore.updateVitals({ waterIntake: vitals.waterIntake.current });

    if (window.silverNotifications) {
      window.silverNotifications.showToast(`Hydration logged: ${vitals.waterIntake.current} of ${vitals.waterIntake.target} glasses.`, 'success');
    }
    if (window.silverAccessibility) {
      window.silverAccessibility.playChime('success');
    }
    this.renderCurrentPage();
  }

  // --- Global Event Listeners ---
  bindGlobalEvents() {
    // Navigation clicks
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const page = el.getAttribute('data-page');
        this.navigateTo(page);
      });
    });

    // Quick role dropdown switcher
    const roleSelect = document.getElementById('quickRoleSelect');
    if (roleSelect) {
      roleSelect.addEventListener('change', (e) => {
        window.silverAuth.switchRole(e.target.value);
      });
    }

    // High Contrast toggle
    const hcBtn = document.getElementById('highContrastToggle');
    if (hcBtn) {
      hcBtn.addEventListener('click', () => {
        window.silverAccessibility.toggleHighContrast();
      });
    }

    // Simplified Mode toggle
    const smBtn = document.getElementById('simplifiedModeToggle');
    if (smBtn) {
      smBtn.addEventListener('click', () => {
        window.silverAccessibility.toggleSimplifiedMode();
      });
    }

    // Font Size Buttons
    document.querySelectorAll('[data-font-size]').forEach(btn => {
      btn.addEventListener('click', () => {
        window.silverAccessibility.setFontSize(btn.getAttribute('data-font-size'));
      });
    });

    // Read Schedule Aloud Button
    const ttsBtn = document.getElementById('readScheduleAloudBtn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        window.silverAccessibility.speakTodaySchedule();
      });
    }

    // Form Submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmailInput').value;
        const password = document.getElementById('loginPasswordInput').value;
        const res = window.silverAuth.login(email, password);
        if (res.success) {
          if (window.silverNotifications) {
            window.silverNotifications.showToast(`Welcome back, ${res.user.name}!`, 'success');
          }
          this.navigateTo('dashboard');
        } else {
          const errEl = document.getElementById('loginErrorMessage');
          if (errEl) {
            errEl.textContent = res.message;
            errEl.style.display = 'block';
          }
        }
      });
    }

    const regForm = document.getElementById('registrationForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          name: document.getElementById('regNameInput').value.trim(),
          email: document.getElementById('regEmailInput').value.trim(),
          password: document.getElementById('regPasswordInput').value,
          role: document.getElementById('regRoleSelect').value,
          phone: document.getElementById('regPhoneInput').value.trim(),
          address: document.getElementById('regAddressInput').value.trim()
        };
        const res = window.silverAuth.register(data);
        if (res.success) {
          if (window.silverNotifications) {
            window.silverNotifications.showToast(`Account created for ${res.user.name}. Welcome!`, 'success');
          }
          this.navigateTo('dashboard');
        } else {
          const errEl = document.getElementById('regErrorMessage');
          if (errEl) {
            errEl.textContent = res.message;
            errEl.style.display = 'block';
          }
        }
      });
    }

    const medForm = document.getElementById('medicationForm');
    if (medForm) {
      medForm.addEventListener('submit', (e) => window.silverMeds.handleFormSubmit(e));
    }

    const aptForm = document.getElementById('appointmentForm');
    if (aptForm) {
      aptForm.addEventListener('submit', (e) => window.silverApts.handleFormSubmit(e));
    }

    const careNoteForm = document.getElementById('careNoteForm');
    if (careNoteForm) {
      careNoteForm.addEventListener('submit', (e) => window.silverCaregiver.handleNoteSubmit(e));
    }

    const vitalsForm = document.getElementById('vitalsForm');
    if (vitalsForm) {
      vitalsForm.addEventListener('submit', (e) => window.silverCaregiver.handleVitalsSubmit(e));
    }

    const profileForm = document.getElementById('healthProfileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.saveHealthProfile(e));
    }

    // Modal Close Backdrop clicks
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) modal.classList.remove('active');
      });
    });
  }
}

// Instantiate App
window.silverApp = new SilverApp();
