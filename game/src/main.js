// MIDNIGHT VAULT — main loop + state machine. One job: wire every module together.
// States: title → briefing → playing ⇄ paused → heistWin → relic → … → win / defeat.
// ?shot=cover|play|tools|win&seed=N stages a frozen scene for screenshots.

import { VIEW_W, VIEW_H, DIFFICULTIES, TOOLS, RELICS, LOOT_VALUES, clamp } from './config.js';
import { buildLevel } from './levels.js';
import { createInput, moveVector, consumePress, consumeClick, clearTransient } from './input.js';
import { createThief, moveThief, updateChannel } from './thief.js';
import { createGuard, updateGuard, guardSeesThief, guardTouchesThief } from './guards.js';
import { createCamera, updateCamera, cameraSeesThief } from './cameras.js';
import { createLoot, lootRemaining, allRequiredTaken, collectTouchLoot, addFloat, updateFloats } from './loot.js';
import { createTools, useTool, updateTools } from './tools.js';
import { createAlarm, updateAlarm } from './alarm.js';
import { createAudio, ensureAudio, playPickup, playCoinThrow, playCoinClink, playSmoke, playEmp, playLockpick, playSpotted, playCaught, playWin, playStep, playCameraBeep, playClick, playDenied, startAlarmLoop, stopAlarmLoop } from './audio.js';
import { createSprites, drawRoom } from './render.js';
import { drawTopBar, drawBottomBar, drawBanner, drawTitle, drawBriefing, drawPause, drawRelicChoice, drawHeistWin, drawFinalWin, drawDefeat, titleLayout, relicLayout } from './hud.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = createInput(canvas);
const audio = createAudio();
const sprites = createSprites();

function newState() {
  return {
    mode: 'title',
    difficulty: 'pro',
    levelIndex: 0,
    level: null,
    guards: [],
    cameras: [],
    loot: [],
    thief: null,
    coins: 60,
    score: 0,
    combo: 0,
    comboTimer: 0,
    time: 0,
    alarm: createAlarm(),
    tools: createTools(),
    relics: [],
    floats: [],
    lastGrade: null,
    totalGhosts: 0,
    endless: false,
    loop: 0,
    frozen: false,
    shot: null,
    shotTime: 0,
    relicChoices: [],
    caughtReason: '',
    laserCooldown: 0,
    audioClink: false,
    msg: '',
    msgTimer: 0,
    stepTimer: 0,
  };
}

let state = newState();

function loopMul() {
  return 1 + state.loop * 0.15;
}

function loadHeist(index, opts = {}) {
  state.levelIndex = index;
  state.level = buildLevel(index);
  state.guards = state.level.guards.map(createGuard);
  state.cameras = state.level.cameras.map(createCamera);
  state.loot = createLoot(state.level.loot);
  state.thief = createThief(150, 630);
  state.time = 0;
  state.combo = 0;
  state.comboTimer = 0;
  state.alarm = createAlarm();
  state.tools = createTools();
  state.floats = [];
  state.laserCooldown = 0;
  state.msg = '';
  state.msgTimer = 0;
  stopAlarmLoop(audio);
  if (!opts.silent) state.mode = 'briefing';
}

function startGame() {
  state = newState();
  state.difficulty = state.difficulty; // keep chosen difficulty (set on title)
  loadHeist(0);
}

function gradeFor(time, ghost) {
  if (ghost && time < 120) return 'S';
  if (ghost || time < 150) return 'A';
  if (time < 240) return 'B';
  return 'C';
}

function heistWin() {
  const lootPoints = state.loot.filter((l) => l.taken).reduce((s, l) => s + LOOT_VALUES[l.kind].points, 0);
  const timeBonus = Math.max(0, 300 - Math.floor(state.time) * 2);
  const ghost = !state.alarm.everSpotted;
  const ghostBonus = ghost ? 500 : 0;
  const heistScore = lootPoints + timeBonus + ghostBonus;
  const mm = String(Math.floor(state.time / 60)).padStart(2, '0');
  const ss = String(Math.floor(state.time % 60)).padStart(2, '0');
  state.lastGrade = { grade: gradeFor(state.time, ghost), lootPoints, timeBonus, ghostBonus, heistScore, timeText: `${mm}:${ss}` };
  state.score += heistScore;
  if (ghost) state.totalGhosts++;
  playWin(audio);
  stopAlarmLoop(audio);
  state.mode = 'heistWin';
}

function defeat(reason) {
  state.caughtReason = reason;
  state.mode = 'defeat';
  playCaught(audio);
  stopAlarmLoop(audio);
}

function pickRelics() {
  const pool = RELICS.filter((r) => !state.relics.includes(r.id));
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function collectLoot(l) {
  const mult = state.comboTimer > 0 ? 2 : 1;
  state.combo = state.comboTimer > 0 ? state.combo + 1 : 1;
  state.comboTimer = 5;
  const points = LOOT_VALUES[l.kind].points * mult;
  const coins = Math.round(LOOT_VALUES[l.kind].coins * (state.relics.includes('magnet') ? 1.25 : 1));
  state.score += points;
  state.coins += coins;
  addFloat(state.floats, l.x, l.y - 20, `+${points}`, l.kind === 'diamond' ? '#7fe7ff' : '#f5c542');
  playPickup(audio, l.kind);
}

function pointInRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  t = clamp(t, 0, 1);
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function updatePlaying(dt) {
  const diff = DIFFICULTIES[state.difficulty];
  const S = state;
  S.time += dt;

  // Movement.
  const mv = moveVector(input);
  const speedMul = S.relics.includes('silent') ? 1.18 : 1;
  const blockers = [...S.level.walls, ...S.level.covers];
  moveThief(S.thief, mv.x, mv.y, dt, blockers, speedMul);
  if (S.thief.moving) {
    S.stepTimer -= dt;
    if (S.stepTimer <= 0) { S.stepTimer = 0.34; playStep(audio); }
  }

  // Diamond vault channeling.
  const opened = updateChannel(S.thief, S.loot, dt, 2.5, S.relics);
  if (opened) collectLoot(opened);

  // Touch loot.
  const magnetBonus = S.relics.includes('magnet') ? 45 : 0;
  collectTouchLoot(S.loot, S.thief, magnetBonus).forEach(collectLoot);

  // Lasers (Heist 5): crossing a beam spikes the alarm.
  if (S.level.lasers) {
    S.laserCooldown -= dt;
    for (const L of S.level.lasers) {
      const gx = L.x1 + (L.x2 - L.x1) * L.gapAt;
      const inGap = Math.abs(S.thief.x - gx) < L.gapW / 2;
      if (!inGap && distToSegment(S.thief.x, S.thief.y, L.x1, L.y1, L.x2, L.y2) < 12 && S.laserCooldown <= 0) {
        S.alarm.value = clamp(S.alarm.value + 18, 0, 100);
        S.laserCooldown = 1;
        S.msg = 'LASER! ALARM +18';
        S.msgTimer = 1.2;
        playSpotted(audio);
      }
    }
  }

  // Combo decay.
  if (S.comboTimer > 0) {
    S.comboTimer -= dt;
    if (S.comboTimer <= 0) S.combo = 0;
  }

  // Cameras sweep + beep.
  S.cameras.forEach((c) => {
    updateCamera(c, dt);
    if (c.beepTimer <= 0) { c.beepTimer = 2.5 + Math.random(); playCameraBeep(audio); }
  });

  // Detection: guards first, then cameras.
  const smoke = S.tools.smoke;
  let seen = false, seenBy = '';
  for (const g of S.guards) {
    if (guardSeesThief(g, S.thief, blockers, smoke)) { seen = true; seenBy = 'GUARD'; break; }
  }
  if (!seen) {
    for (const c of S.cameras) {
      if (cameraSeesThief(c, S.thief, blockers, smoke)) { seen = true; seenBy = 'CAMERA'; break; }
    }
  }
  const wasSpotted = S.alarm.spotted;
  updateAlarm(S.alarm, dt, diff, S.relics, seen, seenBy);
  if (S.alarm.spotted && !wasSpotted) playSpotted(audio);

  // Alarm siren while hot.
  if (S.alarm.value >= 70 || S.alarm.lockdown) startAlarmLoop(audio);
  else stopAlarmLoop(audio);

  // Guards move (chase during lockdown).
  S.guards.forEach((g) => updateGuard(g, dt, diff, loopMul(), S.thief, blockers, smoke, S.alarm.lockdown, seen));

  // Caught?
  if (S.alarm.lockdown) {
    for (const g of S.guards) {
      if (guardTouchesThief(g, S.thief)) { defeat('Guard menangkapmu saat lockdown. Lain kali, jangan sampai alarm 100%.'); return; }
    }
  } else if (S.alarm.value >= 70) {
    for (const g of S.guards) {
      if (g.state === 'chase' && guardTouchesThief(g, S.thief)) { defeat('Guard menangkapmu. Alarm sudah di atas 70% — sembunyi dulu.'); return; }
    }
  }

  // Tools.
  updateTools(S, dt);
  if (S.audioClink) { S.audioClink = false; playCoinClink(audio); }

  updateFloats(S.floats, dt);
  if (S.msgTimer > 0) S.msgTimer -= dt;

  // Exit: only when all required loot is taken.
  const ex = S.level.exit;
  if (allRequiredTaken(S.loot) && pointInRect(S.thief.x, S.thief.y, ex)) heistWin();
}

function useSelectedTool(click) {
  const id = state.tools.selected;
  const before = state.coins;
  const msg = useTool(state, id, click ? click.x : undefined, click ? click.y : undefined);
  if (msg) { state.msg = msg; state.msgTimer = 1.6; }
  if (state.coins < before) {
    if (id === 'coin') playCoinThrow(audio);
    if (id === 'smoke') playSmoke(audio);
    if (id === 'emp') playEmp(audio);
    if (id === 'lockpick') playLockpick(audio);
  } else if (msg && (msg.includes('TIDAK') || msg.includes('KOIN') || msg.includes('DEKATI'))) {
    playDenied(audio);
  }
}

function handlePlayingKeys() {
  if (consumePress(input, 'p') || consumePress(input, 'Escape')) { state.mode = 'paused'; playClick(audio); return; }
  if (consumePress(input, 'r')) { loadHeist(state.levelIndex); return; }
  for (const tool of TOOLS) {
    if (consumePress(input, tool.key)) {
      state.tools.selected = tool.id;
      playClick(audio);
      if (tool.id !== 'coin') useSelectedTool(null);
      return;
    }
  }
  const click = consumeClick(input);
  if (click) {
    ensureAudio(audio);
    if (click.y > 72 && click.y < 700) useSelectedTool(click);
  }
}

function handleClickRects(rects, fn) {
  const click = consumeClick(input);
  if (!click) return false;
  for (const r of rects) {
    if (pointInRect(click.x, click.y, r)) { fn(r); return true; }
  }
  return false;
}

function update(dt) {
  // Global: mute toggle.
  if (consumePress(input, 'm')) {
    audio.muted = !audio.muted;
    if (audio.muted) stopAlarmLoop(audio);
  }

  if (state.mode === 'title') {
    const layout = titleLayout();
    const click = consumeClick(input);
    if (click) {
      ensureAudio(audio);
      for (const b of layout.difficulties) {
        if (pointInRect(click.x, click.y, b)) { state.difficulty = b.id; playClick(audio); }
      }
      if (pointInRect(click.x, click.y, layout.start)) {
        playClick(audio);
        const d = state.difficulty;
        state = newState();
        state.difficulty = d;
        loadHeist(0);
      }
    }
    if (consumePress(input, 'Enter')) {
      ensureAudio(audio);
      const d = state.difficulty;
      state = newState();
      state.difficulty = d;
      loadHeist(0);
    }
    return;
  }

  if (state.mode === 'briefing') {
    if (consumePress(input, 'Enter')) { ensureAudio(audio); state.mode = 'playing'; playClick(audio); return; }
    handleClickRects([{ x: 440, y: 430, w: 400, h: 64 }], () => { ensureAudio(audio); state.mode = 'playing'; playClick(audio); });
    return;
  }

  if (state.mode === 'playing') { handlePlayingKeys(); updatePlaying(dt); return; }

  if (state.mode === 'paused') {
    if (consumePress(input, 'p') || consumePress(input, 'Escape') || consumePress(input, 'Enter')) { state.mode = 'playing'; return; }
    if (consumePress(input, 'r')) { loadHeist(state.levelIndex); return; }
    consumeClick(input);
    return;
  }

  if (state.mode === 'relic') {
    handleClickRects(relicLayout(state.relicChoices), (r) => {
      state.relics.push(r.id);
      playClick(audio);
      state.levelIndex++;
      loadHeist(state.levelIndex);
    });
    return;
  }

  if (state.mode === 'heistWin') {
    if (consumePress(input, 'Enter') || consumeClick(input)) {
      playClick(audio);
      if (state.levelIndex + 1 >= 5 && !state.endless) {
        state.mode = 'win';
      } else if (state.levelIndex + 1 >= 5 && state.endless) {
        state.loop++;
        state.levelIndex = 0;
        loadHeist(0);
      } else {
        state.relicChoices = pickRelics();
        state.mode = 'relic';
      }
    }
    return;
  }

  if (state.mode === 'win') {
    if (consumePress(input, 'Enter')) {
      state.endless = true;
      state.loop = 0;
      state.levelIndex = 0;
      loadHeist(0);
      return;
    }
    if (consumePress(input, 'r')) { const d = state.difficulty; state = newState(); state.difficulty = d; loadHeist(0); }
    consumeClick(input);
    return;
  }

  if (state.mode === 'defeat') {
    if (consumePress(input, 'r') || consumeClick(input)) {
      playClick(audio);
      loadHeist(state.levelIndex);
    }
  }
}

function render(time) {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);
  ctx.fillStyle = '#0b0812';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  if (state.mode === 'title') { drawTitle(ctx, state, input.mouse); return; }
  if (!state.level) return;
  drawRoom(ctx, state, sprites, time);
  drawTopBar(ctx, state);
  drawBottomBar(ctx, state);
  if (state.msgTimer > 0) {
    ctx.fillStyle = '#f5c542';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.msg, 640, 120);
  }
  if (state.mode === 'playing' && state.alarm.spotted && !state.alarm.lockdown) {
    drawBanner(ctx, 'TERLIHAT!', `Guard / kamera melihatmu — sembunyi di balik cover! Alarm ${Math.round(state.alarm.value)}%`, '#ff4040');
  } else if (state.mode === 'playing' && state.alarm.lockdown) {
    drawBanner(ctx, 'LOCKDOWN!', `Bertahan ${Math.ceil(state.alarm.lockdownTimer)} dtk atau lari ke EXIT!`, '#ff4040');
  } else if (state.mode === 'playing' && state.tools.empTimer > 0) {
    ctx.fillStyle = '#7fe7ff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`EMP AKTIF — kamera mati ${Math.ceil(state.tools.empTimer)} dtk`, 640, 660);
  }
  if (state.mode === 'briefing') drawBriefing(ctx, state, input.mouse);
  else if (state.mode === 'paused') drawPause(ctx, state);
  else if (state.mode === 'relic') drawRelicChoice(ctx, state, input.mouse, state.relicChoices);
  else if (state.mode === 'heistWin') drawHeistWin(ctx, state);
  else if (state.mode === 'win') drawFinalWin(ctx, state);
  else if (state.mode === 'defeat') drawDefeat(ctx, state);
  const lootLeft = lootRemaining(state.loot);
  if (state.mode === 'playing' && lootLeft > 0) {
    ctx.fillStyle = 'rgba(242,234,216,0.85)';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`LOOT WAJIB TERSISA: ${lootLeft} — ambil semua, lalu ke EXIT hijau`, 24, 692);
  }
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
  last = now;
  if (!state.frozen) update(dt);
  else clearTransient(input);
  render(state.frozen ? state.shotTime : now / 1000);
  requestAnimationFrame(frame);
}

// Boot: title screen, or a staged shot scene for screenshots.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  state.shot = shot;
  loadHeist(0, { silent: true });
  stageShot(state, shot, (i, opts) => loadHeist(i, opts));
} else {
  loadHeist(0, { silent: true });
  state.mode = 'title';
}
requestAnimationFrame(frame);
