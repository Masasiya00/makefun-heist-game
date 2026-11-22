// Audio: all sounds are procedural WebAudio — no audio files, no network.
// One job: tiny synth blips and stings for pickup, alarm, spotted, caught, win.

export function createAudio() {
  const audio = { ctx: null, muted: false, alarmNodes: null, master: null };
  return audio;
}

export function ensureAudio(audio) {
  if (!audio.ctx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      audio.ctx = new AC();
      audio.master = audio.ctx.createGain();
      audio.master.gain.value = 0.5;
      audio.master.connect(audio.ctx.destination);
    } catch (e) { /* audio unavailable: game stays silent */ }
  }
  if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
}

function tone(audio, freq, dur, type, vol, when = 0, slideTo = 0) {
  if (!audio.ctx || audio.muted) return;
  const t0 = audio.ctx.currentTime + when;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, slideTo), t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function playPickup(audio, kind) {
  if (kind === 'diamond') { tone(audio, 880, 0.12, 'sine', 0.25); tone(audio, 1318, 0.22, 'sine', 0.25, 0.09); tone(audio, 1760, 0.3, 'sine', 0.2, 0.18); }
  else if (kind === 'medium') { tone(audio, 660, 0.1, 'triangle', 0.22); tone(audio, 990, 0.16, 'triangle', 0.2, 0.07); }
  else { tone(audio, 520, 0.08, 'triangle', 0.18); tone(audio, 780, 0.12, 'triangle', 0.16, 0.05); }
}

export function playCoinThrow(audio) { tone(audio, 1200, 0.09, 'square', 0.08, 0, 500); }
export function playCoinClink(audio) { tone(audio, 1900, 0.07, 'sine', 0.14); tone(audio, 2400, 0.1, 'sine', 0.1, 0.05); }
export function playSmoke(audio) { tone(audio, 320, 0.5, 'sawtooth', 0.06, 0, 90); }
export function playEmp(audio) { tone(audio, 1400, 0.4, 'sawtooth', 0.1, 0, 120); tone(audio, 700, 0.3, 'square', 0.06, 0.05, 90); }
export function playLockpick(audio) { tone(audio, 900, 0.06, 'square', 0.1); tone(audio, 1100, 0.06, 'square', 0.1, 0.08); tone(audio, 1400, 0.12, 'square', 0.1, 0.16); }
export function playSpotted(audio) { tone(audio, 220, 0.25, 'sawtooth', 0.22, 0, 440); tone(audio, 440, 0.25, 'sawtooth', 0.18, 0.12, 660); }
export function playCaught(audio) {
  tone(audio, 392, 0.18, 'sawtooth', 0.22); tone(audio, 311, 0.18, 'sawtooth', 0.22, 0.16);
  tone(audio, 233, 0.5, 'sawtooth', 0.24, 0.32, 110);
}
export function playWin(audio) {
  const notes = [523, 659, 784, 1046, 1318];
  notes.forEach((f, i) => tone(audio, f, 0.28, 'triangle', 0.22, i * 0.11));
}
export function playStep(audio) { tone(audio, 140 + Math.random() * 40, 0.05, 'sine', 0.05); }
export function playCameraBeep(audio) { tone(audio, 1150, 0.06, 'square', 0.05); }
export function playClick(audio) { tone(audio, 700, 0.05, 'square', 0.08); }
export function playDenied(audio) { tone(audio, 180, 0.14, 'square', 0.12, 0, 120); }

export function startAlarmLoop(audio) {
  if (!audio.ctx || audio.muted || audio.alarmNodes) return;
  const osc = audio.ctx.createOscillator();
  const gain = audio.ctx.createGain();
  const lfo = audio.ctx.createOscillator();
  const lfoGain = audio.ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.value = 620;
  lfo.type = 'square';
  lfo.frequency.value = 2.2;
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain);
  lfoGain.connect(osc.frequency);
  gain.gain.value = 0.045;
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start();
  lfo.start();
  audio.alarmNodes = { osc, lfo, gain };
}

export function stopAlarmLoop(audio) {
  if (!audio.alarmNodes) return;
  try { audio.alarmNodes.osc.stop(); audio.alarmNodes.lfo.stop(); } catch (e) { /* already stopped */ }
  audio.alarmNodes = null;
}
