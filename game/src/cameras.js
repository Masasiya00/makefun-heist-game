// Cameras: wall-mounted sweepers with red vision cones. One job: sweep + spot.
// A camera is fixed to a wall; its cone sweeps sinusoidally around its base angle.

import { CAMERA_RANGE, CAMERA_HALF_ANGLE, angleDiff, dist } from './config.js';
import { lineBlocked } from './guards.js';

export function createCamera(def) {
  return {
    x: def.x, y: def.y,
    baseAngle: def.baseAngle,
    sweep: def.sweep,
    speed: def.speed,
    t: Math.random() * 6.28,
    angle: def.baseAngle,
    disabledTimer: 0,
    beepTimer: 1 + Math.random() * 2,
  };
}

export function updateCamera(cam, dt) {
  if (cam.disabledTimer > 0) { cam.disabledTimer -= dt; return; }
  cam.t += dt * cam.speed;
  cam.angle = cam.baseAngle + Math.sin(cam.t) * cam.sweep;
  cam.beepTimer -= dt;
}

export function cameraSeesThief(cam, thief, blockers, smoke) {
  if (cam.disabledTimer > 0) return false;
  const d = dist(cam.x, cam.y, thief.x, thief.y);
  if (d > CAMERA_RANGE) return false;
  const toThief = Math.atan2(thief.y - cam.y, thief.x - cam.x);
  if (Math.abs(angleDiff(toThief, cam.angle)) > CAMERA_HALF_ANGLE) return false;
  if (lineBlocked(cam.x, cam.y, thief.x, thief.y, blockers)) return false;
  if (smoke.some((s) => dist(thief.x, thief.y, s.x, s.y) < s.r)) return false;
  return true;
}

export function disableAllCameras(cameras, seconds) {
  cameras.forEach((c) => { c.disabledTimer = seconds; });
}
