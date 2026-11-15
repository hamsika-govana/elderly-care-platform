/**
 * SilverCare - Emergency Support & SOS Dispatch System
 * Provides immediate one-touch emergency triggers, accidental-activation safeguards,
 * first-responder medical summaries, and automated family alert broadcasting.
 */

class EmergencyManager {
  constructor() {
    this.countdownTimer = null;
    this.countdownSeconds = 5;
  }

  renderEmergencyPage() {
    const container = document.getElementById('emergencyViewContainer');
    if (!container || !window.silverStore) return;

    const profile = window.silverStore.getPatientProfile();
    const meds = window.silverStore.getMedications();
    const logs = window.silverStore.getDispatchLogs();

    container.innerHTML = `
      <!-- Emergency Header Banner -->
      <div class="emergency-alert-hero">
        <div class="emergency-hero-content">
          <span class="emergency-pill-tag">🚨 24/7 Rapid Emergency Response</span>
          <h1>Emergency Medical Assistance Hub</h1>
          <p>
            If you or Robert are experiencing chest pain, difficulty breathing, sudden numbness, or a severe fall,
            press the Emergency SOS button immediately or dial 911 directly.
          </p>
        </div>

        <!-- Big SOS Action Trigger -->
        <div class="emergency-trigger-box">
          <button class="big-sos-button" id="mainSosButton" onclick="window.silverEmergency.promptSosConfirmation()">
            <span class="sos-icon">🚨</span>
            <span class="sos-text">EMERGENCY SOS</span>
            <span class="sos-sub">Press to dispatch alerts & help</span>
          </button>
          <div class="sos-safety-note">
            <span>🛡️ Protected by 5-second cancellation buffer</span>
          </div>
        </div>
      </div>

      <!-- Quick Dial Emergency Contacts -->
      <div class="emergency-contacts-grid">
        <div class="contact-card contact-card-urgent">
          <div class="contact-header">
            <span class="contact-badge">Immediate Emergency</span>
            <span class="contact-icon">🚑</span>
          </div>
          <h3>Emergency Medical Services</h3>
          <p class="contact-desc">Police, Fire, Paramedic & Ambulance</p>
          <div class="contact-phone-display">Dial 911</div>
          <button class="btn btn-danger btn-block" onclick="window.silverEmergency.simulatePhoneCall('911', 'Emergency Dispatch 911')">
            📞 Call 911 Now
          </button>
        </div>

        <div class="contact-card">
          <div class="contact-header">
            <span class="contact-badge badge-primary">Family Guardian</span>
            <span class="contact-icon">👩</span>
          </div>
          <h3>${profile.emergencyContact.name}</h3>
          <p class="contact-desc">${profile.emergencyContact.relationship} • Resides 1.2 miles away</p>
          <div class="contact-phone-display">${profile.emergencyContact.phone}</div>
          <button class="btn btn-primary btn-block" onclick="window.silverEmergency.simulatePhoneCall('${profile.emergencyContact.phone}', '${profile.emergencyContact.name}')">
            📞 Call Family Member
          </button>
        </div>

        <div class="contact-card">
          <div class="contact-header">
            <span class="contact-badge badge-info">Home Health Nurse</span>
            <span class="contact-icon">👩‍⚕️</span>
          </div>
          <h3>${profile.caregiver.name}</h3>
          <p class="contact-desc">${profile.caregiver.organization}</p>
          <div class="contact-phone-display">${profile.caregiver.phone}</div>
          <button class="btn btn-outline-primary btn-block" onclick="window.silverEmergency.simulatePhoneCall('${profile.caregiver.phone}', '${profile.caregiver.name}')">
            📞 Call Primary Caregiver
          </button>
        </div>

        <div class="contact-card">
          <div class="contact-header">
            <span class="contact-badge badge-neutral">Primary Physician</span>
            <span class="contact-icon">🩺</span>
          </div>
          <h3>${profile.primaryDoctor.name}</h3>
          <p class="contact-desc">${profile.primaryDoctor.specialty}</p>
          <div class="contact-phone-display">${profile.primaryDoctor.phone}</div>
          <button class="btn btn-outline-secondary btn-block" onclick="window.silverEmergency.simulatePhoneCall('${profile.primaryDoctor.phone}', '${profile.primaryDoctor.name}')">
            📞 Call Doctor Clinic
          </button>
        </div>
      </div>

      <!-- Critical First Responder Summary Card -->
      <div class="card first-responder-card">
        <div class="card-header-flex">
          <div>
            <h3>📋 Critical Paramedic & First Responder Medical Dossier</h3>
            <p class="text-muted">Vital information for EMTs and ER doctors during acute medical events</p>
          </div>
          <span class="badge badge-danger">High Priority Medical Info</span>
        </div>

        <div class="responder-grid">
          <div class="responder-col">
            <div class="info-block">
              <span class="label">Patient Full Name:</span>
              <span class="val"><b>${profile.name}</b> (${profile.preferredName})</span>
            </div>
            <div class="info-block">
              <span class="label">Date of Birth & Age:</span>
              <span class="val">${profile.dob} (Age ${profile.age})</span>
            </div>
            <div class="info-block">
              <span class="label">Blood Group:</span>
              <span class="val"><b class="text-danger">${profile.bloodGroup}</b></span>
            </div>
            <div class="info-block">
              <span class="label">Current Living Address:</span>
              <span class="val">📍 ${profile.address}</span>
            </div>
          </div>

          <div class="responder-col">
            <div class="info-block">
              <span class="label">Severe Drug Allergies:</span>
              <div class="allergy-tag-list">
                ${profile.allergies.map(a => `
                  <span class="allergy-tag ${a.severity === 'Severe' ? 'severe' : ''}">
                    ⚠️ ${a.name} (${a.severity}) - ${a.reaction}
                  </span>
                `).join('')}
              </div>
            </div>
            <div class="info-block" style="margin-top: 10px;">
              <span class="label">Chronic Diagnoses:</span>
              <span class="val">${profile.chronicConditions.map(c => c.condition).join(', ')}</span>
            </div>
          </div>

          <div class="responder-col">
            <div class="info-block">
              <span class="label">Preferred ER Hospital:</span>
              <span class="val">🏥 ${profile.emergencyHospital}</span>
            </div>
            <div class="info-block">
              <span class="label">Active Prescriptions:</span>
              <span class="val">${meds.map(m => `<b>${m.name}</b> ${m.dosage}`).join(', ')}</span>
            </div>
            <div class="info-block">
              <span class="label">Advance Directives / DNR:</span>
              <span class="val">On file with Primary Care Physician</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Emergency Dispatch Log -->
      <div class="card" style="margin-top: 25px;">
        <div class="card-header-flex">
          <div>
            <h3>📡 Simulated Emergency Alert Dispatch Log</h3>
            <p class="text-muted">Real-time audit log of SOS signals, automated SMS alerts, and responder pings</p>
          </div>
          <button class="btn btn-sm btn-outline-danger" onclick="window.silverEmergency.testEmergencyTrigger()">
            🧪 Test SOS Beacon (Demo Mode)
          </button>
        </div>

        <div class="dispatch-log-list" id="dispatchLogList">
          ${logs.length > 0 ? logs.map(l => `
            <div class="dispatch-item">
              <div class="dispatch-icon">🚨</div>
              <div class="dispatch-body">
                <div class="dispatch-title">${l.title}</div>
                <div class="dispatch-details">${l.details}</div>
                <div class="dispatch-meta">
                  <span>📍 GPS Coordinates: ${l.coordinates}</span> • <span>🕒 ${l.timestamp}</span>
                </div>
              </div>
              <span class="badge badge-danger">Dispatched</span>
            </div>
          `).join('') : `
            <div class="empty-state-card" style="padding: 20px;">
              <span>🛡️</span>
              <h4>No Active Emergency Signals</h4>
              <p class="text-muted">System is standing by. Press the SOS button above to trigger an emergency broadcast.</p>
            </div>
          `}
        </div>
      </div>
    `;
  }

  // --- SOS Confirmation Dialog with 5-Second Cancellation Buffer ---
  promptSosConfirmation() {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.id = 'sosConfirmModal';
    modal.innerHTML = `
      <div class="modal-card emergency-confirm-card">
        <div class="emergency-modal-header">
          <span class="modal-alarm-icon">🚨</span>
          <h2>EMERGENCY CALL CONFIRMATION</h2>
          <p>Are you sure you want to trigger Emergency Assistance?</p>
        </div>
        <div class="emergency-modal-body">
          <div class="countdown-circle">
            <span class="countdown-num" id="sosCountdownNumber">5</span>
            <span class="countdown-label">Seconds</span>
          </div>
          <p class="emergency-instruction">
            Automated alerts with your exact GPS location will be broadcast to:
          </p>
          <ul class="emergency-targets-list">
            <li>✓ Emily Jenkins (Family Guardian) - SMS & Emergency Call</li>
            <li>✓ Sarah Miller, RN (Primary Caregiver) - Urgent Alarm</li>
            <li>✓ Local Emergency Response Dispatch (911)</li>
          </ul>
        </div>
        <div class="emergency-modal-footer">
          <button class="btn btn-danger btn-lg" id="sosImmediateConfirmBtn">
            🚨 Confirm & Dispatch Immediately
          </button>
          <button class="btn btn-secondary btn-lg" id="sosCancelBtn">
            ❌ Cancel (Accidental Press)
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    if (window.silverAccessibility) {
      window.silverAccessibility.playChime('warning');
      window.silverAccessibility.speak('Emergency confirmation required. Press cancel if this was an accident.');
    }

    this.countdownSeconds = 5;
    const countdownEl = document.getElementById('sosCountdownNumber');

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (countdownEl) countdownEl.textContent = this.countdownSeconds;

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.executeEmergencyDispatch(modal);
      }
    }, 1000);

    // Cancel Button
    document.getElementById('sosCancelBtn').addEventListener('click', () => {
      clearInterval(this.countdownTimer);
      modal.remove();
      if (window.silverNotifications) {
        window.silverNotifications.showToast('Emergency SOS canceled. No alerts were sent.', 'info');
      }
    });

    // Immediate Confirm Button
    document.getElementById('sosImmediateConfirmBtn').addEventListener('click', () => {
      clearInterval(this.countdownTimer);
      this.executeEmergencyDispatch(modal);
    });
  }

  executeEmergencyDispatch(modalElement) {
    if (modalElement) modalElement.remove();

    const profile = window.silverStore.getPatientProfile();

    const dispatchRecord = {
      title: '🚨 CRITICAL EMERGENCY SOS ACTIVATED',
      details: `Emergency distress signal initiated for ${profile.name}. Automated SMS and priority alert sent to ${profile.emergencyContact.name} (${profile.emergencyContact.phone}) and Nurse ${profile.caregiver.name}.`,
      coordinates: '37.7749° N, 122.4194° W (742 Evergreen Terrace, Springfield)',
      triggeredBy: window.silverAuth.getCurrentUser().name
    };

    window.silverStore.logEmergencyDispatch(dispatchRecord);

    window.silverStore.addNotification({
      type: 'emergency',
      priority: 'urgent',
      title: '🚨 EMERGENCY SOS DISPATCHED',
      message: `Emergency distress signal broadcast to Family, Caregiver, and 911.`
    });

    if (window.silverAccessibility) {
      window.silverAccessibility.playChime('sos');
      window.silverAccessibility.speak('Emergency alerts have been broadcast. Help is being notified.');
    }

    if (window.silverNotifications) {
      window.silverNotifications.showToast(
        'Emergency SOS Broadcast Complete. Family & Caregiver notified with GPS coordinates.',
        'urgent',
        '🚨 EMERGENCY ALERT DISPATCHED'
      );
    }

    this.renderEmergencyPage();
  }

  testEmergencyTrigger() {
    this.promptSosConfirmation();
  }

  // --- Simulate Outgoing Phone Call Dialog ---
  simulatePhoneCall(phoneNumber, contactName) {
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.innerHTML = `
      <div class="modal-card phone-call-card">
        <div class="call-avatar-pulse">📞</div>
        <h2>Calling ${contactName}...</h2>
        <p class="call-number">${phoneNumber}</p>
        <p class="text-muted">Simulating secure telecom voice link...</p>
        <div class="call-status-badge">
          <span class="calling-dot"></span> Line Connected (Demo)
        </div>
        <div style="margin-top: 25px;">
          <button class="btn btn-danger btn-lg modal-close-btn">
            End Call
          </button>
        </div>
      </div>
    `;

    modal.querySelector('.modal-close-btn').addEventListener('click', () => {
      modal.remove();
    });

    document.body.appendChild(modal);

    if (window.silverAccessibility) {
      window.silverAccessibility.playChime('alert');
    }
  }
}

// Global emergency manager
window.silverEmergency = new EmergencyManager();
