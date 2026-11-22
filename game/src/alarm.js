// Alarm: the 0-100 meter that decides lockdowns. One job: rise when seen, fall when hidden.
// Lockdown turns every guard into a chaser for a fixed window; surviving it drops the alarm.

import { LOCKDOWN_SECONDS, clamp } from './config.js';

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
  };
}

export function updateAlarm(alarm, dt, diff, relics, anySeen, seenBy) {
  const hasCloak = relics.includes('cloak');
  const hasSilent = relics.includes('silent');
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
    if (!alarm.spotted) {
      alarm.spotted = true;
      alarm.spottedTimer = 1.0;
      alarm.everSpotted = true;
    }
    const rate = (seenBy === 'CAMERA' ? 22 : 30) * diff.alarmRate * (hasSilent ? 0.8 : 1);
    alarm.value = clamp(alarm.value + rate * dt, 0, 100);
  } else {
    const decay = diff.alarmDecay * (hasCloak ? 2 : 1);
    alarm.value = clamp(alarm.value - decay * dt, 0, 100);
  }

  if (alarm.spottedTimer > 0) {
    alarm.spottedTimer -= dt;
    if (alarm.spottedTimer <= 0) alarm.spotted = false;
  }

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
