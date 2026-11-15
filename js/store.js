/**
 * SilverCare - Central Data Store & LocalStorage Persistence
 * Provides realistic pre-seeded data, reactive state, and full CRUD helpers.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'silvercare_current_user',
  USERS: 'silvercare_users',
  PATIENT_PROFILE: 'silvercare_patient_profile',
  MEDICATIONS: 'silvercare_medications',
  DOSE_LOGS: 'silvercare_dose_logs',
  APPOINTMENTS: 'silvercare_appointments',
  CAREGIVER_NOTES: 'silvercare_caregiver_notes',
  NOTIFICATIONS: 'silvercare_notifications',
  VITALS: 'silvercare_vitals',
  SETTINGS: 'silvercare_settings',
  DISPATCH_LOGS: 'silvercare_dispatch_logs'
};

// Helper: Format date strings relative to today
function getFormattedDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

// Initial Seed Data
const DEFAULT_USERS = [
  {
    id: 'user-robert',
    email: 'robert@silvercare.com',
    password: 'password123',
    name: 'Robert Jenkins',
    role: 'elderly',
    avatar: '👴',
    age: 74,
    phone: '(555) 789-0123',
    address: '742 Evergreen Terrace, Springfield',
    primaryDoctor: 'Dr. Angela Martinez',
    emergencyContact: 'Emily Jenkins (Daughter) - (555) 234-5678'
  },
  {
    id: 'user-sarah',
    email: 'sarah.nurse@silvercare.com',
    password: 'password123',
    name: 'Sarah Miller, RN',
    role: 'caregiver',
    avatar: '👩‍⚕️',
    title: 'Certified Geriatric Care Specialist',
    phone: '(555) 876-5432',
    assignedPatient: 'Robert Jenkins'
  },
  {
    id: 'user-emily',
    email: 'emily.daughter@silvercare.com',
    password: 'password123',
    name: 'Emily Jenkins',
    role: 'family',
    avatar: '👩',
    relationship: 'Daughter (Primary Guardian)',
    phone: '(555) 234-5678',
    assignedPatient: 'Robert Jenkins'
  }
];

const DEFAULT_PROFILE = {
  id: 'patient-robert',
  name: 'Robert Jenkins',
  preferredName: 'Bob',
  dob: '1952-04-18',
  age: 74,
  gender: 'Male',
  bloodGroup: 'O+',
  height: `5' 10" (178 cm)`,
  weight: '168 lbs (76 kg)',
  address: '742 Evergreen Terrace, Springfield, IL',
  phone: '(555) 789-0123',
  insuranceProvider: 'Medicare Advantage Blue Cross',
  insurancePolicyId: 'MED-94021-X7',
  emergencyHospital: 'St. Mary Memorial Hospital - Emergency Department (1.8 miles away)',
  emergencyContact: {
    name: 'Emily Jenkins',
    relationship: 'Daughter',
    phone: '(555) 234-5678',
    altPhone: '(555) 998-3344',
    address: '124 Blossom Lane, Springfield, IL'
  },
  caregiver: {
    name: 'Sarah Miller, RN',
    organization: 'SilverCare Home Health Services',
    phone: '(555) 876-5432',
    dutyHours: 'Mon - Fri, 8:00 AM - 4:00 PM'
  },
  primaryDoctor: {
    name: 'Dr. Angela Martinez',
    specialty: 'Cardiologist & Internal Medicine',
    clinic: 'City Heart & Wellness Center',
    phone: '(555) 998-1234'
  },
  allergies: [
    { name: 'Penicillin', severity: 'Severe', reaction: 'Anaphylaxis risk & hives' },
    { name: 'Codeine', severity: 'Moderate', reaction: 'Severe nausea & dizziness' },
    { name: 'Sulfa Drugs', severity: 'Mild', reaction: 'Skin rash & itchiness' }
  ],
  chronicConditions: [
    { condition: 'Hypertension (High Blood Pressure)', diagnosedYear: '2015', status: 'Managed with Lisinopril' },
    { condition: 'Type 2 Diabetes Mellitus', diagnosedYear: '2018', status: 'Diet & Metformin' },
    { condition: 'Mild Osteoarthritis (Right Knee)', diagnosedYear: '2021', status: 'Physical therapy' },
    { condition: 'Hyperlipidemia', diagnosedYear: '2017', status: 'Atorvastatin' }
  ],
  lifestyleNotes: 'Walks 20-30 minutes daily in garden. Wears hearing aid in left ear. Prefers morning reminders with voice prompt.'
};

const DEFAULT_MEDICATIONS = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    dosage: '10 mg',
    form: 'Tablet',
    category: 'Blood Pressure',
    frequency: 'Once Daily',
    timeSlot: 'Morning',
    exactTime: '08:00',
    foodTiming: 'After breakfast with water',
    startDate: getFormattedDate(-120),
    endDate: getFormattedDate(245),
    prescribedBy: 'Dr. Angela Martinez',
    pillsRemaining: 24,
    totalRefill: 30,
    color: '#3B82F6', // Blue
    instructions: 'Take 1 tablet every morning after breakfast. Do not stop without consulting doctor.'
  },
  {
    id: 'med-2',
    name: 'Metformin',
    dosage: '500 mg',
    form: 'Tablet',
    category: 'Blood Sugar / Diabetes',
    frequency: 'Twice Daily',
    timeSlot: 'Morning', // first dose
    exactTime: '08:30',
    foodTiming: 'With morning meal',
    startDate: getFormattedDate(-90),
    endDate: getFormattedDate(275),
    prescribedBy: 'Dr. Robert Chen (Endocrinologist)',
    pillsRemaining: 38,
    totalRefill: 60,
    color: '#10B981', // Green
    instructions: 'Take with food to minimize gastrointestinal discomfort.'
  },
  {
    id: 'med-3',
    name: 'Metformin (Evening Dose)',
    dosage: '500 mg',
    form: 'Tablet',
    category: 'Blood Sugar / Diabetes',
    frequency: 'Twice Daily',
    timeSlot: 'Evening',
    exactTime: '18:30',
    foodTiming: 'With evening meal',
    startDate: getFormattedDate(-90),
    endDate: getFormattedDate(275),
    prescribedBy: 'Dr. Robert Chen (Endocrinologist)',
    pillsRemaining: 38,
    totalRefill: 60,
    color: '#10B981', // Green
    instructions: 'Evening dose taken with dinner.'
  },
  {
    id: 'med-4',
    name: 'Vitamin D3 & Calcium',
    dosage: '1000 IU / 500 mg',
    form: 'Softgel',
    category: 'Bone Health & Immunity',
    frequency: 'Once Daily',
    timeSlot: 'Afternoon',
    exactTime: '13:00',
    foodTiming: 'After lunch',
    startDate: getFormattedDate(-60),
    endDate: getFormattedDate(300),
    prescribedBy: 'Dr. Sarah Lin (Geriatrician)',
    pillsRemaining: 42,
    totalRefill: 60,
    color: '#F59E0B', // Amber
    instructions: 'Take after midday lunch for optimal absorption.'
  },
  {
    id: 'med-5',
    name: 'Atorvastatin',
    dosage: '20 mg',
    form: 'Tablet',
    category: 'Cholesterol',
    frequency: 'Once Daily',
    timeSlot: 'Bedtime',
    exactTime: '21:30',
    foodTiming: 'Before sleep',
    startDate: getFormattedDate(-150),
    endDate: getFormattedDate(215),
    prescribedBy: 'Dr. Angela Martinez',
    pillsRemaining: 6, // Low stock triggers refill alert!
    totalRefill: 30,
    color: '#8B5CF6', // Purple
    instructions: 'Take 1 tablet at night. Avoid grapefruit juice.'
  }
];

// Generate past 7 days of realistic dose adherence logs
function generateSeedDoseLogs() {
  const logs = [];
  const todayStr = getFormattedDate(0);

  // Past 6 days
  for (let i = 6; i >= 1; i--) {
    const dateStr = getFormattedDate(-i);
    // 5 scheduled doses per day
    DEFAULT_MEDICATIONS.forEach((med, idx) => {
      // 93% adherence rate simulation (1 or 2 missed in past week)
      const isMissed = (i === 3 && idx === 3) || (i === 5 && idx === 4);
      logs.push({
        id: `log-${dateStr}-${med.id}`,
        medId: med.id,
        medName: med.name,
        dosage: med.dosage,
        date: dateStr,
        timeSlot: med.timeSlot,
        scheduledTime: med.exactTime,
        takenTime: isMissed ? null : med.exactTime,
        status: isMissed ? 'missed' : 'taken',
        takenBy: isMissed ? null : 'Robert Jenkins',
        notes: isMissed ? 'Dose missed due to afternoon family outing' : 'Taken on time'
      });
    });
  }

  // Today's doses
  // Morning doses taken
  logs.push({
    id: `log-${todayStr}-med-1`,
    medId: 'med-1',
    medName: 'Lisinopril',
    dosage: '10 mg',
    date: todayStr,
    timeSlot: 'Morning',
    scheduledTime: '08:00',
    takenTime: '08:05',
    status: 'taken',
    takenBy: 'Robert Jenkins',
    notes: 'Taken with water after oatmeal'
  });
  logs.push({
    id: `log-${todayStr}-med-2`,
    medId: 'med-2',
    medName: 'Metformin',
    dosage: '500 mg',
    date: todayStr,
    timeSlot: 'Morning',
    scheduledTime: '08:30',
    takenTime: '08:32',
    status: 'taken',
    takenBy: 'Robert Jenkins',
    notes: 'Taken with breakfast'
  });
  // Afternoon pending
  logs.push({
    id: `log-${todayStr}-med-4`,
    medId: 'med-4',
    medName: 'Vitamin D3 & Calcium',
    dosage: '1000 IU / 500 mg',
    date: todayStr,
    timeSlot: 'Afternoon',
    scheduledTime: '13:00',
    takenTime: null,
    status: 'pending',
    takenBy: null,
    notes: 'Due after lunch'
  });
  // Evening pending
  logs.push({
    id: `log-${todayStr}-med-3`,
    medId: 'med-3',
    medName: 'Metformin (Evening Dose)',
    dosage: '500 mg',
    date: todayStr,
    timeSlot: 'Evening',
    scheduledTime: '18:30',
    takenTime: null,
    status: 'pending',
    takenBy: null,
    notes: 'Due with dinner'
  });
  // Bedtime pending
  logs.push({
    id: `log-${todayStr}-med-5`,
    medId: 'med-5',
    medName: 'Atorvastatin',
    dosage: '20 mg',
    date: todayStr,
    timeSlot: 'Bedtime',
    scheduledTime: '21:30',
    takenTime: null,
    status: 'pending',
    takenBy: null,
    notes: 'Due before sleep'
  });

  return logs;
}

const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt-1',
    doctorName: 'Dr. Angela Martinez',
    specialty: 'Cardiology & Heart Health',
    hospital: 'City Heart Institute & Wellness Center',
    address: 'Suite 400, 100 Medical Center Parkway, Springfield',
    phone: '(555) 998-1234',
    date: getFormattedDate(1), // Tomorrow!
    time: '10:30',
    purpose: 'Routine 6-Month Cardiology & Blood Pressure Review',
    questionsToAsk: [
      'Should I continue Lisinopril 10mg if morning systolic pressure stays below 120?',
      'Is my cholesterol panel due for repeat lab testing?',
      'Are there any interactions with over-the-counter supplements?'
    ],
    reminderEnabled: true,
    status: 'Upcoming'
  },
  {
    id: 'apt-2',
    doctorName: 'Dr. Robert Chen',
    specialty: 'Endocrinology / Diabetes Specialist',
    hospital: 'Metro Diabetic & Endocrine Clinic',
    address: '220 Health Plaza, Springfield',
    phone: '(555) 887-4321',
    date: getFormattedDate(8), // Next week
    time: '14:15',
    purpose: 'HbA1c Follow-Up & Glucose Monitoring Review',
    questionsToAsk: [
      'Can we adjust Metformin timing to reduce mild afternoon fatigue?',
      'Review continuous fasting glucose trend of 105 mg/dL'
    ],
    reminderEnabled: true,
    status: 'Upcoming'
  },
  {
    id: 'apt-3',
    doctorName: 'Dr. David Wu',
    specialty: 'Ophthalmology & Senior Eye Care',
    hospital: 'ClearVision Senior Eye Center',
    address: '55 Vision Blvd, Springfield',
    phone: '(555) 345-6789',
    date: getFormattedDate(24),
    time: '11:00',
    purpose: 'Annual Diabetic Retinal Screening & Glaucoma Check',
    questionsToAsk: [
      'Evaluate bifocal reading prescription update',
      'Check for mild dry eye relief drops'
    ],
    reminderEnabled: true,
    status: 'Upcoming'
  },
  {
    id: 'apt-4',
    doctorName: 'Dr. Sarah Lin',
    specialty: 'Geriatric Primary Care',
    hospital: 'Springfield Senior Health Pavilion',
    address: '300 Elder Care Way, Springfield',
    phone: '(555) 234-9000',
    date: getFormattedDate(-14), // Past visit
    time: '09:30',
    purpose: 'Annual Senior Wellness Examination & Mobility Assessment',
    questionsToAsk: ['Routine blood work review', 'Flu vaccine booster'],
    reminderEnabled: false,
    status: 'Completed',
    visitSummary: 'Patient Robert in good overall vitality. Knee mobility steady. Prescribed Vitamin D3 1000 IU daily.'
  }
];

const DEFAULT_CAREGIVER_NOTES = [
  {
    id: 'note-1',
    author: 'Sarah Miller, RN',
    role: 'Caregiver',
    avatar: '👩‍⚕️',
    timestamp: 'Today at 09:15 AM',
    title: 'Morning Vitals & Medication Check',
    content: 'Morning Lisinopril and Metformin taken on time after oatmeal breakfast. Blood Pressure recorded at 118/76 mmHg. Robert had great energy and enjoyed a 20-minute walk in the garden.'
  },
  {
    id: 'note-2',
    author: 'Emily Jenkins',
    role: 'Family',
    avatar: '👩',
    timestamp: 'Yesterday at 05:45 PM',
    title: 'Grocery Drop-off & Pill Organizer Refill',
    content: 'Visited Dad and brought fresh groceries (low-sodium soups, fruits, oats). Checked pill box and noticed Atorvastatin only has 6 tablets left. Requested pharmacy refill.'
  },
  {
    id: 'note-3',
    author: 'Sarah Miller, RN',
    role: 'Caregiver',
    avatar: '👩‍⚕️',
    timestamp: '2 days ago at 03:30 PM',
    title: 'Cardiology Appointment Preparation',
    content: 'Prepared health summary printout for Dr. Martinez visit tomorrow. Recorded last 14 days of BP readings to show the doctor.'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'appointment',
    priority: 'high',
    title: 'Upcoming Doctor Appointment Tomorrow',
    message: 'Dr. Angela Martinez (Cardiology) at City Heart Institute, Tomorrow at 10:30 AM.',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'notif-2',
    type: 'refill',
    priority: 'warning',
    title: 'Low Medication Stock Warning',
    message: 'Atorvastatin 20mg has only 6 pills remaining. Please refill prescription soon.',
    timestamp: '3 hours ago',
    read: false
  },
  {
    id: 'notif-3',
    type: 'medication',
    priority: 'info',
    title: 'Morning Doses Completed',
    message: 'Lisinopril 10mg and Metformin 500mg marked as taken by Robert Jenkins.',
    timestamp: '08:32 AM',
    read: true
  },
  {
    id: 'notif-4',
    type: 'system',
    priority: 'info',
    title: 'Weekly Health Summary Ready',
    message: 'Robert achieved 93% medication adherence this week! 5-day perfect streak maintained.',
    timestamp: 'Yesterday',
    read: true
  }
];

const DEFAULT_VITALS = {
  bloodPressure: { systolic: 118, diastolic: 76, unit: 'mmHg', status: 'Optimal', lastUpdated: 'Today, 8:45 AM' },
  bloodGlucose: { value: 104, unit: 'mg/dL', status: 'Normal (Fasting)', lastUpdated: 'Today, 8:15 AM' },
  heartRate: { value: 72, unit: 'bpm', status: 'Normal Resting', lastUpdated: 'Today, 8:45 AM' },
  waterIntake: { current: 5, target: 8, unit: 'Glasses (250ml)', lastUpdated: 'Today, 11:30 AM' },
  steps: { current: 2340, target: 4000, unit: 'Steps', lastUpdated: 'Today, 12:00 PM' }
};

const DEFAULT_SETTINGS = {
  accessibility: {
    fontSize: 'normal', // normal, large, xlarge
    highContrast: false,
    simplifiedMode: false,
    voiceAnnouncements: true,
    soundEffects: true
  },
  notifications: {
    sound: true,
    emailAlerts: true,
    smsAlerts: true,
    caregiverAlertsOnMissed: true,
    reminderMinutesBefore: 15
  }
};

// Store Class providing full CRUD and LocalStorage synchronization
class Store {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.resetToDefaults();
    }
  }

  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0])); // Robert Jenkins by default
    localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(DEFAULT_PROFILE));
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(DEFAULT_MEDICATIONS));
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(generateSeedDoseLogs()));
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(DEFAULT_APPOINTMENTS));
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_NOTES, JSON.stringify(DEFAULT_CAREGIVER_NOTES));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(DEFAULT_VITALS));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.DISPATCH_LOGS, JSON.stringify([]));
  }

  // --- Auth / User Methods ---
  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || DEFAULT_USERS[0];
    } catch {
      return DEFAULT_USERS[0];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || DEFAULT_USERS;
    } catch {
      return DEFAULT_USERS;
    }
  }

  registerUser(userData) {
    const users = this.getUsers();
    const newUser = {
      id: `user-${Date.now()}`,
      ...userData,
      avatar: userData.role === 'elderly' ? '👴' : userData.role === 'caregiver' ? '👩‍⚕️' : '👨‍👩‍👧'
    };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.setCurrentUser(newUser);
    return newUser;
  }

  // --- Profile Methods ---
  getPatientProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PATIENT_PROFILE)) || DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  updatePatientProfile(updatedProfile) {
    localStorage.setItem(STORAGE_KEYS.PATIENT_PROFILE, JSON.stringify(updatedProfile));
  }

  // --- Medication Methods ---
  getMedications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MEDICATIONS)) || DEFAULT_MEDICATIONS;
    } catch {
      return DEFAULT_MEDICATIONS;
    }
  }

  addMedication(medData) {
    const meds = this.getMedications();
    const newMed = {
      id: `med-${Date.now()}`,
      ...medData,
      pillsRemaining: parseInt(medData.pillsRemaining || 30, 10),
      totalRefill: parseInt(medData.totalRefill || 30, 10),
      color: medData.color || '#3B82F6'
    };
    meds.push(newMed);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));

    // Also add pending dose log for today if it matches today's schedule
    const todayStr = getFormattedDate(0);
    this.addDoseLog({
      id: `log-${todayStr}-${newMed.id}`,
      medId: newMed.id,
      medName: newMed.name,
      dosage: newMed.dosage,
      date: todayStr,
      timeSlot: newMed.timeSlot,
      scheduledTime: newMed.exactTime || '12:00',
      takenTime: null,
      status: 'pending',
      takenBy: null,
      notes: newMed.instructions || 'Scheduled dose'
    });

    this.addNotification({
      type: 'medication',
      priority: 'info',
      title: 'New Medication Added',
      message: `${newMed.name} (${newMed.dosage}) added to schedule by ${this.getCurrentUser().name}.`
    });

    return newMed;
  }

  updateMedication(id, updatedData) {
    const meds = this.getMedications();
    const index = meds.findIndex(m => m.id === id);
    if (index !== -1) {
      meds[index] = { ...meds[index], ...updatedData };
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));
      return meds[index];
    }
    return null;
  }

  deleteMedication(id) {
    let meds = this.getMedications();
    const medToDelete = meds.find(m => m.id === id);
    meds = meds.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));

    if (medToDelete) {
      this.addNotification({
        type: 'medication',
        priority: 'warning',
        title: 'Medication Removed',
        message: `${medToDelete.name} was removed from the regimen by ${this.getCurrentUser().name}.`
      });
    }
  }

  refillMedication(id, count = 30) {
    const meds = this.getMedications();
    const med = meds.find(m => m.id === id);
    if (med) {
      med.pillsRemaining = (med.pillsRemaining || 0) + count;
      med.totalRefill = Math.max(med.totalRefill || 30, med.pillsRemaining);
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));

      this.addNotification({
        type: 'refill',
        priority: 'info',
        title: 'Medication Refilled',
        message: `${med.name} replenished by +${count} pills (Stock: ${med.pillsRemaining}).`
      });
      return med;
    }
    return null;
  }

  // --- Dose Logging & Adherence Methods ---
  getDoseLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DOSE_LOGS)) || [];
    } catch {
      return [];
    }
  }

  addDoseLog(log) {
    const logs = this.getDoseLogs();
    logs.push(log);
    localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
  }

  markDoseStatus(logId, status, notes = '') {
    const logs = this.getDoseLogs();
    const index = logs.findIndex(l => l.id === logId);
    const currentUser = this.getCurrentUser();

    if (index !== -1) {
      logs[index].status = status;
      logs[index].notes = notes || logs[index].notes;

      if (status === 'taken') {
        const now = new Date();
        logs[index].takenTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        logs[index].takenBy = currentUser.name;

        // Decrement pill count in medication stock
        const meds = this.getMedications();
        const med = meds.find(m => m.id === logs[index].medId);
        if (med && med.pillsRemaining > 0) {
          med.pillsRemaining -= 1;
          localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(meds));

          // Check if low stock
          if (med.pillsRemaining <= 7) {
            this.addNotification({
              type: 'refill',
              priority: 'warning',
              title: `Low Stock: ${med.name}`,
              message: `Only ${med.pillsRemaining} pills remaining for ${med.name}. Request a refill soon.`
            });
          }
        }

        this.addNotification({
          type: 'medication',
          priority: 'info',
          title: 'Dose Recorded',
          message: `${logs[index].medName} (${logs[index].dosage}) marked as taken by ${currentUser.name}.`
        });
      } else if (status === 'missed') {
        logs[index].takenTime = null;
        this.addNotification({
          type: 'missed_dose',
          priority: 'urgent',
          title: `⚠️ Alert: Missed Dose - ${logs[index].medName}`,
          message: `Scheduled dose for ${logs[index].medName} (${logs[index].dosage}) was missed or skipped.`
        });
      } else if (status === 'snoozed') {
        this.addNotification({
          type: 'medication',
          priority: 'info',
          title: `Reminder Snoozed: ${logs[index].medName}`,
          message: `Dose reminder postponed by 15 minutes.`
        });
      }

      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(logs));
      return logs[index];
    }
    return null;
  }

  calculateAdherence(days = 7) {
    const logs = this.getDoseLogs();
    const cutoffDate = getFormattedDate(-days);
    const recentLogs = logs.filter(l => l.date >= cutoffDate);

    if (recentLogs.length === 0) return { score: 100, taken: 0, missed: 0, total: 0, streak: 5 };

    const taken = recentLogs.filter(l => l.status === 'taken').length;
    const missed = recentLogs.filter(l => l.status === 'missed').length;
    const pending = recentLogs.filter(l => l.status === 'pending').length;
    const completedOrMissed = taken + missed;

    const score = completedOrMissed > 0 ? Math.round((taken / completedOrMissed) * 100) : 100;

    // Calculate streak
    let streak = 0;
    for (let i = 0; i < 14; i++) {
      const d = getFormattedDate(-i);
      const dayLogs = logs.filter(l => l.date === d);
      if (dayLogs.length === 0) continue;
      const dayMissed = dayLogs.filter(l => l.status === 'missed').length;
      if (dayMissed === 0) {
        streak++;
      } else {
        break;
      }
    }

    return {
      score,
      taken,
      missed,
      pending,
      total: recentLogs.length,
      streak: Math.max(streak, 4)
    };
  }

  // --- Appointment Methods ---
  getAppointments() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || DEFAULT_APPOINTMENTS;
    } catch {
      return DEFAULT_APPOINTMENTS;
    }
  }

  addAppointment(aptData) {
    const apts = this.getAppointments();
    const newApt = {
      id: `apt-${Date.now()}`,
      ...aptData,
      status: aptData.status || 'Upcoming',
      reminderEnabled: aptData.reminderEnabled !== false,
      questionsToAsk: Array.isArray(aptData.questionsToAsk)
        ? aptData.questionsToAsk
        : (aptData.questionsToAsk ? aptData.questionsToAsk.split('\n').filter(Boolean) : [])
    };
    apts.push(newApt);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apts));

    this.addNotification({
      type: 'appointment',
      priority: 'high',
      title: 'New Appointment Scheduled',
      message: `Appointment with ${newApt.doctorName} on ${newApt.date} at ${newApt.time}.`
    });

    return newApt;
  }

  updateAppointment(id, updatedData) {
    const apts = this.getAppointments();
    const index = apts.findIndex(a => a.id === id);
    if (index !== -1) {
      apts[index] = { ...apts[index], ...updatedData };
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apts));
      return apts[index];
    }
    return null;
  }

  deleteAppointment(id) {
    let apts = this.getAppointments();
    const apt = apts.find(a => a.id === id);
    apts = apts.filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(apts));

    if (apt) {
      this.addNotification({
        type: 'appointment',
        priority: 'warning',
        title: 'Appointment Canceled',
        message: `Appointment with ${apt.doctorName} was removed.`
      });
    }
  }

  // --- Caregiver Notes & Team Log ---
  getCaregiverNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CAREGIVER_NOTES)) || DEFAULT_CAREGIVER_NOTES;
    } catch {
      return DEFAULT_CAREGIVER_NOTES;
    }
  }

  addCaregiverNote(noteData) {
    const notes = this.getCaregiverNotes();
    const user = this.getCurrentUser();
    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newNote = {
      id: `note-${Date.now()}`,
      author: user.name,
      role: user.role === 'caregiver' ? 'Caregiver' : user.role === 'family' ? 'Family' : 'Elderly',
      avatar: user.avatar || (user.role === 'caregiver' ? '👩‍⚕️' : '👨‍👩‍👧'),
      timestamp: timeFormatted,
      title: noteData.title || 'Care Update',
      content: noteData.content
    };
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.CAREGIVER_NOTES, JSON.stringify(notes));

    this.addNotification({
      type: 'caregiver',
      priority: 'info',
      title: 'New Caregiver Note Added',
      message: `${user.name} posted: "${newNote.title}"`
    });

    return newNote;
  }

  // --- Notifications & Reminders ---
  getNotifications() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  }

  addNotification(notif) {
    const list = this.getNotifications();
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      priority: notif.priority || 'info',
      ...notif
    };
    list.unshift(newNotif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));

    // Dispatch global event so UI badges update dynamically
    window.dispatchEvent(new CustomEvent('silvercare_notification_added', { detail: newNotif }));
    return newNotif;
  }

  markAllNotificationsRead() {
    const list = this.getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
  }

  clearNotifications() {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));
  }

  // --- Vitals & Health Routine ---
  getVitals() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.VITALS)) || DEFAULT_VITALS;
    } catch {
      return DEFAULT_VITALS;
    }
  }

  updateVitals(vitalsData) {
    const current = this.getVitals();
    const nowStr = 'Today, ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (vitalsData.systolic && vitalsData.diastolic) {
      const sys = parseInt(vitalsData.systolic, 10);
      const dia = parseInt(vitalsData.diastolic, 10);
      let status = 'Optimal';
      if (sys > 135 || dia > 88) status = 'Elevated';
      if (sys > 150 || dia > 95) status = 'High Alert';
      current.bloodPressure = { systolic: sys, diastolic: dia, unit: 'mmHg', status, lastUpdated: nowStr };
    }

    if (vitalsData.bloodGlucose) {
      const bg = parseInt(vitalsData.bloodGlucose, 10);
      let status = 'Normal (Fasting)';
      if (bg > 125) status = 'Elevated';
      if (bg < 70) status = 'Low (Hypo)';
      current.bloodGlucose = { value: bg, unit: 'mg/dL', status, lastUpdated: nowStr };
    }

    if (vitalsData.waterIntake !== undefined) {
      current.waterIntake.current = parseInt(vitalsData.waterIntake, 10);
      current.waterIntake.lastUpdated = nowStr;
    }

    if (vitalsData.steps !== undefined) {
      current.steps.current = parseInt(vitalsData.steps, 10);
      current.steps.lastUpdated = nowStr;
    }

    localStorage.setItem(STORAGE_KEYS.VITALS, JSON.stringify(current));
    return current;
  }

  // --- Emergency Dispatch Logs ---
  getDispatchLogs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DISPATCH_LOGS)) || [];
    } catch {
      return [];
    }
  }

  logEmergencyDispatch(dispatchData) {
    const logs = this.getDispatchLogs();
    const entry = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      ...dispatchData
    };
    logs.unshift(entry);
    localStorage.setItem(STORAGE_KEYS.DISPATCH_LOGS, JSON.stringify(logs));
    return entry;
  }

  // --- Settings ---
  getSettings() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  updateSettings(newSettings) {
    const current = this.getSettings();
    const merged = {
      ...current,
      ...newSettings,
      accessibility: { ...current.accessibility, ...(newSettings.accessibility || {}) },
      notifications: { ...current.notifications, ...(newSettings.notifications || {}) }
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    return merged;
  }
}

// Global store instance
window.silverStore = new Store();
