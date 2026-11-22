// Shots: deterministic staged scenes for the 4 screenshots (?shot=cover|play|tools|win).
// One job: pose the game for the camera. Every scene renders from the real game code —
// a loaded heist, real guards, real cones, real loot — posed, then frozen by main.js.

import { createAlarm } from './alarm.js';

function poseGuard(guard, x, y, angle) {
  guard.x = x; guard.y = y; guard.angle = angle;
  guard.state = 'patrol';
  guard.pauseTimer = 999;
}

function poseCamera(cam, angle) {
  cam.angle = angle;
  cam.t = 0;
}

export function stageShot(state, kind, loadHeist) {
  // Nilai ?shot= yang tidak dikenal diabaikan: jangan freeze game di title.
  const known = kind === 'cover' || kind === 'play' || kind === 'tools' || kind === 'win';
  if (!known) return;
  if (kind === 'cover') {
    // Heist 3 (Museum): thief mid-room, 3 guards + yellow cones, 2 red camera cones,
    // diamond sparkling top-centre, alarm ~35%, full HUD.
    loadHeist(2, { silent: true });
    state.thief.x = 640; state.thief.y = 400; state.thief.dir = -Math.PI / 2;
    poseGuard(state.guards[0], 430, 250, 0.45);
    poseGuard(state.guards[1], 870, 540, -2.4);
    poseGuard(state.guards[2], 880, 300, Math.PI * 0.85);
    poseCamera(state.cameras[0], Math.PI / 2 + 0.5);
    poseCamera(state.cameras[1], Math.PI / 2 - 0.5);
    state.alarm = createAlarm();
    state.alarm.value = 35;
    state.coins = 120;
    state.score = 1250;
    state.time = 74;
    state.mode = 'playing';
  } else if (kind === 'play') {
    // Heist 2 (Bank): thief right next to a gold bar, guard closing in, alarm 55%.
    loadHeist(1, { silent: true });
    state.thief.x = 700; state.thief.y = 330; state.thief.dir = Math.PI;
    poseGuard(state.guards[0], 520, 210, 0.3);
    poseGuard(state.guards[1], 760, 500, -1.9);
    poseGuard(state.guards[2], 620, 300, 0.1);
    poseCamera(state.cameras[0], Math.PI + 0.4);
    poseCamera(state.cameras[1], -Math.PI / 2 + 0.4);
    state.alarm = createAlarm();
    state.alarm.value = 55;
    state.alarm.seen = true;
    state.alarm.seenBy = 'GUARD';
    state.coins = 85;
    state.score = 640;
    state.time = 52;
    state.combo = 2;
    state.mode = 'playing';
  } else if (kind === 'tools') {
    // Heist 3: smoke cloud on the thief, cameras EMP'd OFF, tool bar live, alarm low.
    loadHeist(2, { silent: true });
    state.thief.x = 640; state.thief.y = 400; state.thief.dir = 0;
    poseGuard(state.guards[0], 420, 250, 0.5);
    poseGuard(state.guards[1], 860, 540, -2.2);
    poseGuard(state.guards[2], 900, 300, Math.PI);
    state.cameras.forEach((c) => { c.disabledTimer = 8; });
    state.tools.smoke.push({ x: 640, y: 400, r: 110, life: 6 });
    state.tools.empTimer = 8;
    state.tools.selected = 'smoke';
    state.alarm = createAlarm();
    state.alarm.value = 18;
    state.coins = 140;
    state.score = 2100;
    state.time = 118;
    state.mode = 'playing';
  } else if (kind === 'win') {
    // The getaway screen: CLEAN GETAWAY, grade S, score breakdown.
    loadHeist(2, { silent: true });
    state.score = 1870;
    state.lastGrade = { grade: 'S', lootPoints: 1150, timeBonus: 220, ghostBonus: 500, heistScore: 720, timeText: '02:31' };
    state.mode = 'heistWin';
  }
  state.frozen = true;
  state.shotTime = 1.2;
}
