/**
 * SilverCare - Accessibility & Voice Synthesis Engine
 * Provides font scaling, high-contrast mode, simplified view, audio chimes,
 * and Text-to-Speech schedule narration for elderly users.
 */

class AccessibilityManager {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.audioCtx = null;
    this.init();
  }

  init() {
    const settings = window.silverStore ? window.silverStore.getSettings() : { accessibility: {} };
    const acc = settings.accessibility || {};

    if (acc.fontSize) {
      this.setFontSize(acc.fontSize, false);
    }
    if (acc.highContrast) {
      this.toggleHighContrast(true, false);
    }
    if (acc.simplifiedMode) {
      this.toggleSimplifiedMode(true, false);
    }
  }

  // --- Web Audio Chime (Offline, Zero-Asset) ---
  playChime(type = 'success') {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'success') {
        // Cheerful 2-tone chime (C5 -> G5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'alert' || type === 'reminder') {
        // Gentle bell pulse (E5 -> A5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(659.25, now);
        osc.frequency.setValueAtTime(880.00, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (type === 'sos' || type === 'warning') {
        // High attention alert
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.2);
        osc.frequency.setValueAtTime(440, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        osc.start(now);
        osc.stop(now + 0.6);
      }
    } catch (e) {
      console.warn('Audio chime note:', e);
    }
  }

  // --- Font Size Adjustment ---
  setFontSize(size, save = true) {
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-xlarge');
    root.classList.add(`font-${size}`);

    // Update active button state in accessibility controls
    document.querySelectorAll('[data-font-size]').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-font-size') === size);
    });

    if (save && window.silverStore) {
      window.silverStore.updateSettings({ accessibility: { fontSize: size } });
    }
  }

  // --- High Contrast Mode ---
  toggleHighContrast(forceState = null, save = true) {
    const root = document.documentElement;
    const currentState = root.classList.contains('high-contrast');
    const newState = forceState !== null ? forceState : !currentState;

    root.classList.toggle('high-contrast', newState);

    const toggleBtn = document.getElementById('highContrastToggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', newState);
      toggleBtn.setAttribute('aria-pressed', String(newState));
    }

    if (save && window.silverStore) {
      window.silverStore.updateSettings({ accessibility: { highContrast: newState } });
    }
    return newState;
  }

  // --- Simplified Elderly Mode ---
  toggleSimplifiedMode(forceState = null, save = true) {
    const root = document.documentElement;
    const currentState = root.classList.contains('simplified-mode');
    const newState = forceState !== null ? forceState : !currentState;

    root.classList.toggle('simplified-mode', newState);

    const toggleBtn = document.getElementById('simplifiedModeToggle');
    if (toggleBtn) {
      toggleBtn.classList.toggle('active', newState);
      toggleBtn.setAttribute('aria-pressed', String(newState));
    }

    if (save && window.silverStore) {
      window.silverStore.updateSettings({ accessibility: { simplifiedMode: newState } });
    }
    return newState;
  }

  // --- Text-To-Speech (TTS) Voice Assistant ---
  speak(text) {
    if (!this.speechSynthesis) {
      console.warn('Speech synthesis not supported on this browser.');
      return;
    }

    // Cancel ongoing speech
    this.speechSynthesis.cancel();

    if (!text || text.trim() === '') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower, clearer for elderly
    utterance.pitch = 1.0;

    // Pick a natural English voice if available
    const voices = this.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David')));
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    // Animate speech visualizer if present
    const ttsStatus = document.getElementById('ttsActiveStatus');
    if (ttsStatus) {
      ttsStatus.style.display = 'inline-flex';
      utterance.onend = () => { ttsStatus.style.display = 'none'; };
      utterance.onerror = () => { ttsStatus.style.display = 'none'; };
    }

    this.speechSynthesis.speak(utterance);
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    const ttsStatus = document.getElementById('ttsActiveStatus');
    if (ttsStatus) {
      ttsStatus.style.display = 'none';
    }
  }

  // Speak today's schedule aloud
  speakTodaySchedule() {
    if (!window.silverStore) return;
    const profile = window.silverStore.getPatientProfile();
    const todayLogs = window.silverStore.getDoseLogs().filter(l => l.date === new Date().toISOString().split('T')[0]);
    const pendingDoses = todayLogs.filter(l => l.status === 'pending');
    const completedDoses = todayLogs.filter(l => l.status === 'taken');

    let speechText = `Hello ${profile.preferredName || profile.name}. Here is your health update for today. `;

    if (completedDoses.length > 0) {
      speechText += `You have successfully completed ${completedDoses.length} dose${completedDoses.length > 1 ? 's' : ''}. Great job! `;
    }

    if (pendingDoses.length > 0) {
      speechText += `You have ${pendingDoses.length} upcoming dose${pendingDoses.length > 1 ? 's' : ''}. `;
      pendingDoses.forEach(d => {
        speechText += `${d.medName}, ${d.dosage}, scheduled for ${d.timeSlot}. `;
      });
    } else {
      speechText += `All your scheduled medications for today are completed! `;
    }

    const apts = window.silverStore.getAppointments().filter(a => a.status === 'Upcoming');
    if (apts.length > 0) {
      const nextApt = apts[0];
      speechText += `Your next doctor appointment is with ${nextApt.doctorName} on ${nextApt.date} at ${nextApt.time}.`;
    }

    this.speak(speechText);
  }
}

// Global accessibility manager
window.silverAccessibility = new AccessibilityManager();
