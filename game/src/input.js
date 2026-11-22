// Input: keyboard + mouse state for MIDNIGHT VAULT. One job: raw device state only.
// The game loop reads this; no game logic lives here.

export function createInput(canvas) {
  const input = {
    keys: new Set(),
    mouse: { x: 0, y: 0, clicked: false, clickX: 0, clickY: 0 },
    pressed: new Set(), // keys pressed since last consume
  };

  function canvasPos(e) {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * sx, y: (e.clientY - rect.top) * sy };
  }

  window.addEventListener('keydown', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
    if (!e.repeat) input.pressed.add(k);
    input.keys.add(k);
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    input.keys.delete(k);
  });
  canvas.addEventListener('mousemove', (e) => {
    const p = canvasPos(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
  });
  canvas.addEventListener('mousedown', (e) => {
    const p = canvasPos(e);
    input.mouse.x = p.x;
    input.mouse.y = p.y;
    input.mouse.clicked = true;
    input.mouse.clickX = p.x;
    input.mouse.clickY = p.y;
  });
  window.addEventListener('blur', () => input.keys.clear());
  return input;
}

export function moveVector(input) {
  let x = 0, y = 0;
  if (input.keys.has('a') || input.keys.has('ArrowLeft')) x -= 1;
  if (input.keys.has('d') || input.keys.has('ArrowRight')) x += 1;
  if (input.keys.has('w') || input.keys.has('ArrowUp')) y -= 1;
  if (input.keys.has('s') || input.keys.has('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
  return { x, y };
}

export function consumePress(input, key) {
  if (input.pressed.has(key)) { input.pressed.delete(key); return true; }
  return false;
}

export function consumeClick(input) {
  if (input.mouse.clicked) {
    input.mouse.clicked = false;
    return { x: input.mouse.clickX, y: input.mouse.clickY };
  }
  return null;
}

export function clearTransient(input) {
  input.pressed.clear();
  input.mouse.clicked = false;
}
