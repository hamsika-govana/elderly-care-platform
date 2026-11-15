/**
 * SilverCare - Authentication & Role-Based Access Control (RBAC)
 * Handles login, registration, role-switching for hackathon demos,
 * and permission checks.
 */

class AuthManager {
  constructor() {
    this.currentUser = window.silverStore ? window.silverStore.getCurrentUser() : null;
  }

  getCurrentUser() {
    return window.silverStore ? window.silverStore.getCurrentUser() : this.currentUser;
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : 'guest';
  }

  // --- Quick Role Switcher for Hackathon Demo ---
  switchRole(role) {
    const users = window.silverStore.getUsers();
    let targetUser = users.find(u => u.role === role);

    if (!targetUser) {
      if (role === 'elderly') {
        targetUser = users[0];
      } else if (role === 'caregiver') {
        targetUser = users[1];
      } else if (role === 'family') {
        targetUser = users[2];
      }
    }

    if (targetUser) {
      window.silverStore.setCurrentUser(targetUser);
      this.currentUser = targetUser;

      if (window.silverNotifications) {
        window.silverNotifications.showToast(
          `Switched to ${targetUser.name} (${targetUser.role.toUpperCase()})`,
          'info'
        );
      }

      // Re-render current view or redirect to appropriate dashboard
      window.silverApp.handleAuthChange();
    }
  }

  // --- Normal Login ---
  login(email, password) {
    const users = window.silverStore.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

    if (!user) {
      return { success: false, message: 'No account found with this email address.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Try "password123".' };
    }

    window.silverStore.setCurrentUser(user);
    this.currentUser = user;

    window.silverStore.addNotification({
      type: 'system',
      priority: 'info',
      title: 'Successful Sign-in',
      message: `Signed in as ${user.name} (${user.role}).`
    });

    return { success: true, user };
  }

  // --- Registration ---
  register(formData) {
    const users = window.silverStore.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());

    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    if (!formData.name || formData.name.trim().length < 2) {
      return { success: false, message: 'Please provide a valid full name.' };
    }

    if (!formData.password || formData.password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters long.' };
    }

    const newUser = window.silverStore.registerUser(formData);
    this.currentUser = newUser;

    return { success: true, user: newUser };
  }

  // --- Logout ---
  logout() {
    // Instead of completely leaving empty, we can reset to default elderly guest or redirect to landing/login
    // We clear current user session
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.currentUser = null;

    if (window.silverNotifications) {
      window.silverNotifications.showToast('You have been safely signed out.', 'info');
    }

    window.silverApp.navigateTo('login');
    window.silverApp.updateHeaderUI();
  }

  // --- RBAC Permission Checks ---
  canEditMedications() {
    const role = this.getUserRole();
    // Elderly, Caregivers, and Authorized Family can manage medication schedules
    return role === 'caregiver' || role === 'elderly' || role === 'family';
  }

  canEditHealthProfile() {
    const role = this.getUserRole();
    return role === 'caregiver' || role === 'elderly' || role === 'family';
  }

  canAddCaregiverNotes() {
    const role = this.getUserRole();
    return role === 'caregiver' || role === 'family';
  }

  canTriggerEmergency() {
    return true; // Any authenticated or active user on the elderly platform can trigger SOS
  }
}

// Global auth manager
window.silverAuth = new AuthManager();
