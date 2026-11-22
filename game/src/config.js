// MIDNIGHT VAULT — shared constants: canvas layout, palette, tools, difficulties, relics.
// One job: every number the rest of the game agrees on lives here, nowhere else.

export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 64;
export const FLOOR_TOP = 72;
export const FLOOR_BOTTOM = 700;
export const FLOOR_LEFT = 20;
export const FLOOR_RIGHT = 1260;
export const BOTTOM_H = 100;

export const PALETTE = {
  floorDark: '#171320',
  floorLight: '#1d1829',
  carpet: '#5e1220',
  carpetEdge: '#8c1d30',
  wall: '#2c2438',
  wallTop: '#453a58',
  coverWood: '#4a3220',
  coverVelvet: '#6e1423',
  coverStone: '#3d3a4d',
  gold: '#f5c542',
  goldDeep: '#c8932a',
  diamond: '#7fe7ff',
  guardCone: 'rgba(245, 197, 66, 0.20)',
  guardConeEdge: 'rgba(245, 197, 66, 0.55)',
  cameraCone: 'rgba(255, 64, 80, 0.16)',
  cameraConeEdge: 'rgba(255, 64, 80, 0.55)',
  thief: '#2b2f45',
  thiefHood: '#e8b23a',
  exitGreen: '#2fd67a',
  alarmLow: '#2fd67a',
  alarmMid: '#f5c542',
  alarmHigh: '#ff4040',
  text: '#f2ead8',
  textDim: '#b8ab8f',
  panel: '#221c2e',
  panelEdge: '#4a3f5e',
};

export const DIFFICULTIES = {
  santai: { label: 'SANTAI', guardSpeed: 52, alarmRate: 0.7, alarmDecay: 8, chaseSpeed: 118, desc: 'Patroli lambat, alarm pelan.' },
  pro: { label: 'PROFESIONAL', guardSpeed: 74, alarmRate: 1.0, alarmDecay: 6, chaseSpeed: 138, desc: 'Patroli standar, alarm normal.' },
  legend: { label: 'LEGEND', guardSpeed: 96, alarmRate: 1.45, alarmDecay: 4, chaseSpeed: 162, desc: 'Patroli cepat, alarm galak.' },
};

// Tools: bought with loot coins. Keys 1-4. Costs are the whole economy.
export const TOOLS = [
  { key: '1', id: 'coin', name: 'KOIN DISTRAKSI', cost: 20, desc: 'Lempar ke titik klik: guard mendekat ke suara.' },
  { key: '2', id: 'smoke', name: 'BOM ASAP', cost: 40, desc: 'Asap 6 dtk di posisimu: cone tidak tembus.' },
  { key: '3', id: 'emp', name: 'EMP', cost: 60, desc: 'Matikan semua kamera 8 dtk.' },
  { key: '4', id: 'lockpick', name: 'LOCKPICK', cost: 30, desc: 'Buka berlian instan (tanpa lockpick: tahan 2,5 dtk).' },
];

export const RELICS = [
  { id: 'silent', name: 'SEPATU SENYAP', desc: '+18% kecepatan gerak, alarm naik 20% lebih lambat.' },
  { id: 'cloak', name: 'JUBAH BAYANGAN', desc: 'Alarm turun 2x lebih cepat saat bersembunyi.' },
  { id: 'magnet', name: 'MAGNET LOOT', desc: 'Radius ambil loot +45 px, koin loot +25%.' },
  { id: 'smoker', name: 'AHLI ASAP', desc: 'Bom asap bertahan +4 dtk, radius +30 px.' },
  { id: 'eagle', name: 'MATA ELANG', desc: 'Lihat jalur patroli guard & jangkauan cone di lantai.' },
  { id: 'steady', name: 'TANGAN STABIL', desc: 'Buka berlian 2x lebih cepat (1,2 dtk).' },
];

export const LOOT_VALUES = {
  small: { points: 50, coins: 10, label: 'Kantong Koin', radius: 10 },
  medium: { points: 150, coins: 25, label: 'Batang Emas', radius: 12 },
  diamond: { points: 500, coins: 50, label: 'BERLIAN UTAMA', radius: 15 },
};

export const THIEF_SPEED = 178;
export const THIEF_RADIUS = 13;
export const GUARD_RANGE = 225;
export const GUARD_HALF_ANGLE = 0.61; // ~35 deg
export const CAMERA_RANGE = 265;
export const CAMERA_HALF_ANGLE = 0.52; // ~30 deg
export const LOCKDOWN_SECONDS = 8;
export const SPOTTED_GRACE_SECONDS = 1.0;

export function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
export function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
export function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
