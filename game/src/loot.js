// Loot: pickups, the diamond vault target, floating score text. One job: loot state.
// Small + medium loot is grabbed on touch; the diamond needs channeling (thief.js)
// or a lockpick. Required loot (medium + diamond) gates the exit.

import { LOOT_VALUES, dist } from './config.js';

export function createLoot(defs) {
  return defs.map((d) => ({
    x: d.x, y: d.y, kind: d.kind,
    label: d.label || LOOT_VALUES[d.kind].label,
    taken: false,
    bob: Math.random() * 6.28,
    required: d.kind !== 'small',
  }));
}

export function lootRemaining(loot) {
  return loot.filter((l) => l.required && !l.taken).length;
}

export function allRequiredTaken(loot) {
  return lootRemaining(loot) === 0;
}

// Touch pickups for small/medium loot. Returns an array of collected loot.
export function collectTouchLoot(loot, thief, magnetBonus) {
  const got = [];
  for (const l of loot) {
    if (l.taken || l.kind === 'diamond') continue;
    const reach = LOOT_VALUES[l.kind].radius + thief.r + magnetBonus;
    if (dist(thief.x, thief.y, l.x, l.y) < reach) {
      l.taken = true;
      got.push(l);
    }
  }
  return got;
}

export function addFloat(floats, x, y, text, color) {
  floats.push({ x, y, text, color, life: 1.2 });
}

export function updateFloats(floats, dt) {
  for (let i = floats.length - 1; i >= 0; i--) {
    floats[i].life -= dt;
    floats[i].y -= 34 * dt;
    if (floats[i].life <= 0) floats.splice(i, 1);
  }
}
