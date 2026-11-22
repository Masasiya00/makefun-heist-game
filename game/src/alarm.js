// Alarm: the 0-100 meter that decides lockdowns. One job: rise when seen, fall when hidden.
// Lockdown turns every guard into a chaser for a fixed window; surviving it drops the alarm.

import { LOCKDOWN_SECONDS, SPOTTED_GRACE_SECONDS, clamp } from './config.js';

export function createAlarm() {
  return {
    value: 0,
    seen: false,          // any watcher currently has eyes on the thief
    seenBy: '',           // 'GUARD' | 'CAMERA' for the HUD label
    spotted: false,       // thief was just noticed (grace banner)
    spottedTimer: 0,
    lockdown: false,
    lockdownTimer: 0,
    everSpotted: false,   // kills the ghost bonus for this heist
    graceTimer: 0,        // sisa grace saat pertama terlihat; alarm tidak naik selama ini
  };
}

export function updateAlarm(alarm, dt, diff, relics, anySeen, seenBy) {
  const hasCloak = relics.includes('cloak');
  const hasSilent = relics.includes('silent');
  const wasSeen = alarm.seen;
  alarm.seen = anySeen;
  alarm.seenBy = anySeen ? seenBy : '';

  if (alarm.lockdown) {
    alarm.lockdownTimer -= dt;
    if (alarm.lockdownTimer <= 0) {
      alarm.lockdown = false;
      alarm.value = 58; // survived the swarm: heat drops, patrols resume
    }
    return;
  }

  if (anySeen) {
    // Grace period: transisi tidak-terlihat -> terlihat memberi 1,0 dtk
    // sebelum alarm mulai naik; sembunyi lagi me-reset grace.
    if (!wasSeen) alarm.graceTimer = SPOTTED_GRACE_SECONDS;
    if (!alarm.spotted) {
      alarm.spotted = true;
      alarm.spottedTimer = 1.0;
      alarm.everSpotted = true;
    }
    if (alarm.graceTimer > 0) {
      // Grace tepat 1,0 dtk: sisa dt setelah grace habis tetap menaikkan alarm.
      alarm.graceTimer -= dt;
      const riseDt = alarm.graceTimer < 0 ? -alarm.graceTimer : 0;
      if (alarm.graceTimer < 0) alarm.graceTimer = 0;
      if (riseDt > 0) {
        const rate = (seenBy === 'CAMERA' ? 22 : 30) * diff.alarmRate * (hasSilent ? 0.8 : 1);
        alarm.value = clamp(alarm.value + rate * riseDt, 0, 100);
      }
    } else {
      const rate = (seenBy === 'CAMERA' ? 22 : 30) * diff.alarmRate * (hasSilent ? 0.8 : 1);
      alarm.value = clamp(alarm.value + rate * dt, 0, 100);
    }
  } else {
    alarm.graceTimer = 0;
    const decay = diff.alarmDecay * (hasCloak ? 2 : 1);
    alarm.value = clamp(alarm.value - decay * dt, 0, 100);
  }

  if (alarm.spottedTimer > 0) alarm.spottedTimer -= dt;
  // Jangan matikan banner spotted selama thief masih terlihat — kalau tidak,
  // banner berkedip dan suara spotted berulang tiap kali timer habis.
  if (alarm.spottedTimer <= 0 && !anySeen) alarm.spotted = false;

  if (alarm.value >= 100) {
    alarm.lockdown = true;
    alarm.lockdownTimer = LOCKDOWN_SECONDS;
  }
}

export function alarmColor(value) {
  if (value < 40) return '#2fd67a';
  if (value < 70) return '#f5c542';
  return '#ff4040';
}
