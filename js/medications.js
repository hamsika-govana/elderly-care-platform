/**
 * SilverCare - Medication Management Module
 * Comprehensive medication tracking, scheduling, dose logging,
 * inventory refills, and adherence calculations.
 */

class MedicationManager {
  constructor() {
    this.currentFilter = 'all';
    this.searchQuery = '';
  }

  // --- Render Medication Management View ---
  renderMedicationsPage() {
    const listContainer = document.getElementById('medicationsListGrid');
    if (!listContainer || !window.silverStore) return;

    const meds = window.silverStore.getMedications();
    const canEdit = window.silverAuth ? window.silverAuth.canEditMedications() : true;

    // Filter by search query and time filter
    let filtered = meds.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          m.category.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                          m.prescribedBy.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchTime = this.currentFilter === 'all' || m.timeSlot.toLowerCase() === this.currentFilter.toLowerCase();
      return matchSearch && matchTime;
    });

    // Check low stock
    const lowStockMeds = meds.filter(m => (m.pillsRemaining || 0) <= 7);
    const lowStockBanner = document.getElementById('medLowStockBanner');
    if (lowStockBanner) {
      if (lowStockMeds.length > 0) {
        lowStockBanner.style.display = 'block';
        lowStockBanner.innerHTML = `
          <div class="alert-banner alert-warning">
            <div class="alert-icon">⚠️</div>
            <div class="alert-content">
              <strong>Low Supply Warning:</strong> ${lowStockMeds.map(m => `<b>${m.name}</b> (${m.pillsRemaining} pills left)`).join(', ')}.
              Please request pharmacy refills.
            </div>
            <button class="btn btn-sm btn-outline-warning" onclick="window.silverMeds.quickRefillAllLowStock()">Refill All (+30)</button>
          </div>
        `;
      } else {
        lowStockBanner.style.display = 'none';
      }
    }

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state-card" style="grid-column: 1 / -1;">
          <div class="empty-icon">💊</div>
          <h4>No Medications Found</h4>
          <p class="text-muted">No medicines match your current filter or search criteria.</p>
          ${canEdit ? `<button class="btn btn-primary" onclick="window.silverMeds.openAddModal()">Add Your First Medication</button>` : ''}
        </div>
      `;
      return;
    }

    listContainer.innerHTML = filtered.map(med => {
      const pillsLeft = med.pillsRemaining || 0;
      const isLowStock = pillsLeft <= 7;
      const stockBadge = isLowStock
        ? `<span class="badge badge-warning">Low Stock: ${pillsLeft} left</span>`
        : `<span class="badge badge-neutral">${pillsLeft} pills left</span>`;

      let timeIcon = '🌅';
      if (med.timeSlot === 'Afternoon') timeIcon = '☀️';
      else if (med.timeSlot === 'Evening') timeIcon = '🌇';
      else if (med.timeSlot === 'Bedtime') timeIcon = '🌙';

      return `
        <div class="med-card" style="border-top: 4px solid ${med.color || '#3B82F6'};">
          <div class="med-card-header">
            <div class="med-title-row">
              <span class="med-icon" style="background: ${med.color || '#3B82F6'}15; color: ${med.color || '#3B82F6'};">
                ${timeIcon}
              </span>
              <div>
                <h3 class="med-name">${med.name}</h3>
                <span class="med-category">${med.category} • ${med.dosage}</span>
              </div>
            </div>
            ${stockBadge}
          </div>

          <div class="med-details-grid">
            <div class="detail-item">
              <span class="detail-label">Schedule</span>
              <span class="detail-val"><b>${med.timeSlot}</b> (${med.exactTime || '--:--'})</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Frequency</span>
              <span class="detail-val">${med.frequency}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Food Timing</span>
              <span class="detail-val">${med.foodTiming || 'Anytime'}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Prescribed By</span>
              <span class="detail-val">${med.prescribedBy || 'Primary Physician'}</span>
            </div>
          </div>

          <div class="med-instructions-box">
            <span class="instruction-icon">📋</span>
            <span>${med.instructions || 'Take as instructed by your doctor.'}</span>
          </div>

          <div class="med-card-footer">
            <div class="stock-progress-wrap">
              <div class="stock-progress-label">
                <span>Supply</span>
                <span>${pillsLeft} / ${med.totalRefill || 30}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${isLowStock ? 'fill-warning' : 'fill-primary'}"
                     style="width: ${Math.min(100, Math.round((pillsLeft / (med.totalRefill || 30)) * 100))}%;"></div>
              </div>
            </div>

            <div class="med-action-buttons">
              <button class="btn btn-sm btn-outline-primary" onclick="window.silverMeds.quickRefill('${med.id}')" title="Replenish stock (+30 pills)">
                Refill +30
              </button>
              ${canEdit ? `
                <button class="btn btn-sm btn-outline-secondary" onclick="window.silverMeds.openEditModal('${med.id}')" title="Edit Medication Details">
                  ✏️ Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="window.silverMeds.confirmDeleteMed('${med.id}', '${med.name}')" title="Delete Medication">
                  🗑️
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // --- Quick Refill ---
  quickRefill(medId) {
    const med = window.silverStore.refillMedication(medId, 30);
    if (med) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Refilled +30 tablets for ${med.name}. Stock is now ${med.pillsRemaining}.`, 'success');
      }
      this.renderMedicationsPage();
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  quickRefillAllLowStock() {
    const meds = window.silverStore.getMedications();
    meds.forEach(m => {
      if ((m.pillsRemaining || 0) <= 7) {
        window.silverStore.refillMedication(m.id, 30);
      }
    });
    if (window.silverNotifications) {
      window.silverNotifications.showToast('All low-stock prescriptions have been replenished (+30 each).', 'success');
    }
    this.renderMedicationsPage();
  }

  // --- Add / Edit Modals ---
  openAddModal() {
    const modal = document.getElementById('medicationModal');
    const form = document.getElementById('medicationForm');
    const modalTitle = document.getElementById('medModalTitle');

    if (modal && form) {
      form.reset();
      document.getElementById('medIdInput').value = '';
      modalTitle.textContent = 'Add New Medication';
      modal.classList.add('active');
    }
  }

  openEditModal(id) {
    const meds = window.silverStore.getMedications();
    const med = meds.find(m => m.id === id);
    if (!med) return;

    const modal = document.getElementById('medicationModal');
    const modalTitle = document.getElementById('medModalTitle');

    if (modal) {
      document.getElementById('medIdInput').value = med.id;
      document.getElementById('medNameInput').value = med.name;
      document.getElementById('medDosageInput').value = med.dosage;
      document.getElementById('medCategoryInput').value = med.category;
      document.getElementById('medFrequencySelect').value = med.frequency;
      document.getElementById('medTimeSlotSelect').value = med.timeSlot;
      document.getElementById('medExactTimeInput').value = med.exactTime || '08:00';
      document.getElementById('medFoodTimingInput').value = med.foodTiming || '';
      document.getElementById('medPillsRemainingInput').value = med.pillsRemaining || 30;
      document.getElementById('medPrescribedByInput').value = med.prescribedBy || '';
      document.getElementById('medInstructionsInput').value = med.instructions || '';
      document.getElementById('medColorSelect').value = med.color || '#3B82F6';

      modalTitle.textContent = `Edit Medication: ${med.name}`;
      modal.classList.add('active');
    }
  }

  closeModal() {
    const modal = document.getElementById('medicationModal');
    if (modal) modal.classList.remove('active');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('medIdInput').value;

    const medData = {
      name: document.getElementById('medNameInput').value.trim(),
      dosage: document.getElementById('medDosageInput').value.trim(),
      category: document.getElementById('medCategoryInput').value.trim() || 'General Medicine',
      frequency: document.getElementById('medFrequencySelect').value,
      timeSlot: document.getElementById('medTimeSlotSelect').value,
      exactTime: document.getElementById('medExactTimeInput').value || '08:00',
      foodTiming: document.getElementById('medFoodTimingInput').value.trim() || 'Take as needed',
      pillsRemaining: parseInt(document.getElementById('medPillsRemainingInput').value, 10) || 30,
      prescribedBy: document.getElementById('medPrescribedByInput').value.trim() || 'Primary Care Physician',
      instructions: document.getElementById('medInstructionsInput').value.trim(),
      color: document.getElementById('medColorSelect').value || '#3B82F6'
    };

    if (!medData.name || !medData.dosage) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast('Please enter medicine name and dosage.', 'warning');
      }
      return;
    }

    if (id) {
      window.silverStore.updateMedication(id, medData);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Updated ${medData.name} successfully.`, 'success');
      }
    } else {
      window.silverStore.addMedication(medData);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Added ${medData.name} to medication schedule.`, 'success');
      }
    }

    this.closeModal();
    this.renderMedicationsPage();
    if (window.silverApp) window.silverApp.renderCurrentPage();
  }

  confirmDeleteMed(id, name) {
    if (confirm(`Are you sure you want to remove ${name} from the active medication list?`)) {
      window.silverStore.deleteMedication(id);
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`${name} has been removed.`, 'info');
      }
      this.renderMedicationsPage();
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  // --- Today's Schedule Interaction (Mark Taken, Skip, Snooze) ---
  markDoseTaken(logId) {
    const updated = window.silverStore.markDoseStatus(logId, 'taken');
    if (updated) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Well done! ${updated.medName} recorded as taken.`, 'success');
      }
      if (window.silverAccessibility) {
        window.silverAccessibility.playChime('success');
      }
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  snoozeDose(logId) {
    const updated = window.silverStore.markDoseStatus(logId, 'snoozed');
    if (updated) {
      if (window.silverNotifications) {
        window.silverNotifications.showToast(`Snoozed ${updated.medName} for 15 minutes.`, 'info');
      }
      if (window.silverApp) window.silverApp.renderCurrentPage();
    }
  }

  skipDose(logId) {
    const reason = prompt('Reason for skipping dose (optional):', 'Feeling unwell / doctor advised pause');
    if (reason !== null) {
      const updated = window.silverStore.markDoseStatus(logId, 'missed', reason);
      if (updated) {
        if (window.silverNotifications) {
          window.silverNotifications.showToast(`Dose marked as skipped: ${updated.medName}`, 'warning');
        }
        if (window.silverApp) window.silverApp.renderCurrentPage();
      }
    }
  }
}

// Global medication manager
window.silverMeds = new MedicationManager();
