// Tools: the paid kit — coin, smoke, EMP, lockpick. One job: buying + using tools.
// Coins come from loot; every tool has a price, so the player spends to stay unseen.

import { TOOLS } from './config.js';
import { sendGuardTo } from './guards.js';
import { disableAllCameras } from './cameras.js';

export function createTools() {
  return { selected: 'coin', smoke: [], thrownCoins: [], empTimer: 0 };
}

export function toolById(id) {
  return TOOLS.find((t) => t.id === id);
}

// Use the selected tool. Returns a message for the HUD, or null when it cannot fire.
export function useTool(state, id, clickX, clickY) {
  const tool = toolById(id);
  if (!tool) return null;
  if (state.coins < tool.cost) return 'KOIN TIDAK CUKUP!';
  const smoker = state.relics.includes('smoker');
  if (id === 'coin') {
    if (clickX === undefined) return 'KLIK TITIK LEMPARAN!';
    state.coins -= tool.cost;
    state.tools.thrownCoins.push({ x: clickX, y: clickY, life: 3, landed: false, tx: clickX, ty: clickY, sx: state.thief.x, sy: state.thief.y });
    return 'KOIN DILEMPAR!';
  }
  if (id === 'smoke') {
    state.coins -= tool.cost;
    state.tools.smoke.push({ x: state.thief.x, y: state.thief.y, r: smoker ? 120 : 90, life: smoker ? 10 : 6 });
    return 'BOM ASAP!';
  }
  if (id === 'emp') {
    state.coins -= tool.cost;
    disableAllCameras(state.cameras, 8);
    state.tools.empTimer = 8;
    return 'EMP! KAMERA MATI 8 DTK';
  }
  if (id === 'lockpick') {
    const diamond = state.loot.find((l) => l.kind === 'diamond' && !l.taken);
    if (!diamond) return 'TIDAK ADA BERLIAN!';
    const d = Math.hypot(state.thief.x - diamond.x, state.thief.y - diamond.y);
    if (d > 46) return 'DEKATI BERLIAN DULU!'; // sama dengan jangkauan channeling (thief.js)
    state.coins -= tool.cost;
    state.thief.channel = 1; // instant open, resolved by main loop
    return 'LOCKPICK! BRANKAS TERBUKA';
  }
  return null;
}

// Thrown coins fly to their target, clink, and pull nearby guards to investigate.
export function updateTools(state, dt) {
  const tools = state.tools;
  if (tools.empTimer > 0) tools.empTimer -= dt;
  for (let i = tools.smoke.length - 1; i >= 0; i--) {
    tools.smoke[i].life -= dt;
    if (tools.smoke[i].life <= 0) tools.smoke.splice(i, 1);
  }
  for (let i = tools.thrownCoins.length - 1; i >= 0; i--) {
    const c = tools.thrownCoins[i];
    c.life -= dt;
    if (!c.landed) {
      const dx = c.tx - c.x, dy = c.ty - c.y;
      const d = Math.hypot(dx, dy);
      if (d < 12) {
        c.landed = true;
        c.x = c.tx; c.y = c.ty;
        state.audioClink = true;
        state.guards.forEach((g) => {
          if (g.state === 'patrol' && Math.hypot(g.x - c.x, g.y - c.y) < 300) sendGuardTo(g, c.x, c.y);
        });
      } else {
        c.x += (dx / d) * 420 * dt;
        c.y += (dy / d) * 420 * dt;
      }
    }
    if (c.life <= 0) tools.thrownCoins.splice(i, 1);
  }
}
