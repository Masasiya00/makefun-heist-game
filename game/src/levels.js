// Levels: the 5 heists of MIDNIGHT VAULT. One job: static room data —
// walls, covers, patrol routes, cameras, loot, exit, decor. No logic, just maps.
// Playfield interior: x 36..1244, y 88..684. Walls are the room border.

function borderWalls() {
  return [
    { x: 20, y: 72, w: 1240, h: 16, kind: 'wall' },
    { x: 20, y: 684, w: 1240, h: 16, kind: 'wall' },
    { x: 20, y: 72, w: 16, h: 628, kind: 'wall' },
    { x: 1244, y: 72, w: 16, h: 628, kind: 'wall' },
  ];
}

export const LEVELS = [
  {
    name: 'HEIST 1 — GALERI SENJA',
    sub: 'Curi "Lukisan Senja" sebelum kurator pulang. 2 guard, 1 kamera.',
    tip: 'Rute: lorong kiri lewat sofa, atau selip di balik pilar tengah. Kamera atas hanya menyapu koridor tengah.',
    walls: borderWalls(),
    covers: [
      { x: 300, y: 180, w: 130, h: 46, kind: 'sofa', label: 'SOFA' },
      { x: 880, y: 180, w: 130, h: 46, kind: 'sofa', label: 'SOFA' },
      { x: 617, y: 300, w: 46, h: 46, kind: 'pillar', label: '' },
      { x: 420, y: 480, w: 120, h: 42, kind: 'sofa', label: 'BANGKU' },
      { x: 617, y: 540, w: 46, h: 46, kind: 'pillar', label: '' },
    ],
    guards: [
      { path: [[220, 140], [1020, 140], [1020, 300], [220, 300]], pause: 1.2 },
      { path: [[300, 580], [980, 580], [980, 430], [300, 430]], pause: 1.0 },
    ],
    cameras: [
      { x: 640, y: 92, baseAngle: Math.PI / 2, sweep: 0.9, speed: 0.7 },
    ],
    loot: [
      { x: 180, y: 500, kind: 'small' },
      { x: 1100, y: 520, kind: 'small' },
      { x: 640, y: 640, kind: 'small' },
      { x: 320, y: 330, kind: 'medium' },
      { x: 960, y: 330, kind: 'medium' },
      { x: 1140, y: 140, kind: 'diamond', label: 'LUKISAN SENJA' },
    ],
    exit: { x: 44, y: 596, w: 84, h: 72 },
    decor: [
      { kind: 'painting', x: 180, y: 96, w: 90, h: 56, color: '#c96a2b' },
      { kind: 'painting', x: 420, y: 96, w: 70, h: 90, color: '#3f7d6b' },
      { kind: 'painting', x: 880, y: 96, w: 90, h: 56, color: '#7d3f6b' },
      { kind: 'painting', x: 1060, y: 96, w: 70, h: 90, color: '#2b4a7d' },
      { kind: 'plant', x: 90, y: 130, w: 34, h: 40 },
      { kind: 'plant', x: 1150, y: 600, w: 34, h: 40 },
      { kind: 'rug', x: 440, y: 380, w: 400, h: 130 },
    ],
  },
  {
    name: 'HEIST 2 — BANK KECIL MERAH',
    sub: 'Brankas cabang: 3 guard, 2 kamera. Berlian di ruang brankas kanan atas.',
    tip: 'Rute: ventilasi kanan lewat meja teller, atau lorong bawah di belakang pilar. EMP mematikan kedua kamera 8 dtk.',
    walls: borderWalls(),
    covers: [
      { x: 500, y: 140, w: 96, h: 74, kind: 'safe', label: 'BRANKAS' },
      { x: 700, y: 140, w: 96, h: 74, kind: 'safe', label: 'BRANKAS' },
      { x: 300, y: 360, w: 150, h: 52, kind: 'desk', label: 'TELLER' },
      { x: 850, y: 360, w: 150, h: 52, kind: 'desk', label: 'TELLER' },
      { x: 615, y: 500, w: 50, h: 50, kind: 'pillar', label: '' },
    ],
    guards: [
      { path: [[200, 150], [1100, 150], [1100, 260], [200, 260]], pause: 1.0 },
      { path: [[250, 450], [1000, 450], [1000, 560], [250, 560]], pause: 1.4 },
      { path: [[620, 300], [620, 620], [900, 620], [900, 300]], pause: 0.8 },
    ],
    cameras: [
      { x: 1220, y: 150, baseAngle: Math.PI, sweep: 0.8, speed: 0.8 },
      { x: 640, y: 676, baseAngle: -Math.PI / 2, sweep: 0.9, speed: 0.6 },
    ],
    loot: [
      { x: 160, y: 320, kind: 'small' },
      { x: 1120, y: 420, kind: 'small' },
      { x: 640, y: 620, kind: 'small' },
      { x: 380, y: 180, kind: 'medium' },
      { x: 900, y: 560, kind: 'medium' },
      { x: 1150, y: 130, kind: 'diamond', label: 'BERLIAN BANK' },
    ],
    exit: { x: 44, y: 596, w: 84, h: 72 },
    decor: [
      { kind: 'painting', x: 240, y: 96, w: 80, h: 50, color: '#8c1d30' },
      { kind: 'rug', x: 480, y: 300, w: 320, h: 120 },
      { kind: 'plant', x: 90, y: 500, w: 34, h: 40 },
      { kind: 'vaultdoor', x: 1080, y: 100, w: 120, h: 110 },
    ],
  },
  {
    name: 'HEIST 3 — MUSEUM NUSANTARA',
    sub: 'Mahkota Nusantara di etalase tengah atas. 3 guard, 2 kamera, etalase kaca di mana-mana.',
    tip: 'Rute: selip antar etalase, atau putar lewat lorong bawah. Jangan berdiri di koridor tengah saat kamera menyapu.',
    walls: borderWalls(),
    covers: [
      { x: 350, y: 200, w: 110, h: 62, kind: 'case', label: 'ETALASE' },
      { x: 820, y: 200, w: 110, h: 62, kind: 'case', label: 'ETALASE' },
      { x: 350, y: 490, w: 110, h: 62, kind: 'case', label: 'ETALASE' },
      { x: 820, y: 490, w: 110, h: 62, kind: 'case', label: 'ETALASE' },
      { x: 610, y: 340, w: 60, h: 60, kind: 'pillar', label: 'PATUNG' },
    ],
    guards: [
      { path: [[200, 150], [1080, 150], [1080, 280], [200, 280]], pause: 1.1 },
      { path: [[220, 620], [1060, 620], [1060, 430], [220, 430]], pause: 1.0 },
      { path: [[640, 300], [640, 620], [1080, 620], [1080, 300]], pause: 0.9 },
    ],
    cameras: [
      { x: 300, y: 92, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.75 },
      { x: 980, y: 92, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.65 },
    ],
    loot: [
      { x: 170, y: 420, kind: 'small' },
      { x: 1110, y: 420, kind: 'small' },
      { x: 640, y: 620, kind: 'small' },
      { x: 300, y: 330, kind: 'medium' },
      { x: 980, y: 330, kind: 'medium' },
      { x: 640, y: 140, kind: 'diamond', label: 'MAHKOTA NUSANTARA' },
    ],
    exit: { x: 44, y: 596, w: 84, h: 72 },
    decor: [
      { kind: 'painting', x: 520, y: 96, w: 240, h: 34, color: '#c8932a' },
      { kind: 'rug', x: 440, y: 380, w: 400, h: 130 },
      { kind: 'plant', x: 90, y: 130, w: 34, h: 40 },
      { kind: 'plant', x: 1150, y: 130, w: 34, h: 40 },
      { kind: 'artifact', x: 520, y: 300, w: 40, h: 50 },
      { kind: 'artifact', x: 720, y: 300, w: 40, h: 50 },
    ],
  },
  {
    name: 'HEIST 4 — KASINO NEON',
    sub: 'Chip emas & Berlian Neon di meja VIP. 4 guard, 2 kamera, lantai paling ramai.',
    tip: 'Rute: putar lewat meja hijau — meja menahan pandangan. Asap paling berguna di sini.',
    walls: borderWalls(),
    covers: [
      { x: 280, y: 170, w: 160, h: 74, kind: 'table', label: 'MEJA HIJAU' },
      { x: 840, y: 170, w: 160, h: 74, kind: 'table', label: 'MEJA HIJAU' },
      { x: 280, y: 480, w: 160, h: 74, kind: 'table', label: 'MEJA HIJAU' },
      { x: 840, y: 480, w: 160, h: 74, kind: 'table', label: 'MEJA HIJAU' },
      { x: 580, y: 320, w: 120, h: 52, kind: 'desk', label: 'BAR' },
    ],
    guards: [
      { path: [[200, 140], [1080, 140], [1080, 260], [200, 260]], pause: 0.9 },
      { path: [[200, 620], [1080, 620], [1080, 430], [200, 430]], pause: 0.9 },
      { path: [[250, 300], [250, 600], [560, 600], [560, 300]], pause: 0.7 },
      { path: [[1020, 300], [1020, 600], [720, 600], [720, 300]], pause: 0.7 },
    ],
    cameras: [
      { x: 640, y: 92, baseAngle: Math.PI / 2, sweep: 1.1, speed: 0.9 },
      { x: 640, y: 676, baseAngle: -Math.PI / 2, sweep: 1.1, speed: 0.8 },
    ],
    loot: [
      { x: 150, y: 330, kind: 'small' },
      { x: 1130, y: 330, kind: 'small' },
      { x: 640, y: 640, kind: 'small' },
      { x: 480, y: 140, kind: 'medium' },
      { x: 800, y: 600, kind: 'medium' },
      { x: 640, y: 130, kind: 'diamond', label: 'BERLIAN NEON' },
    ],
    exit: { x: 44, y: 596, w: 84, h: 72 },
    decor: [
      { kind: 'painting', x: 500, y: 96, w: 280, h: 26, color: '#ff2e88' },
      { kind: 'rug', x: 440, y: 380, w: 400, h: 130 },
      { kind: 'plant', x: 90, y: 130, w: 34, h: 40 },
      { kind: 'plant', x: 1150, y: 600, w: 34, h: 40 },
      { kind: 'artifact', x: 640, y: 250, w: 34, h: 44 },
    ],
  },
  {
    name: 'HEIST 5 — BRANKAS PUSAT',
    sub: 'Final: Berlian Pusat di tengah laser. 4 guard, 3 kamera, laser aktif.',
    tip: 'Laser menambah alarm kalau tersentuh! Lewat celah laser, atau tunggu EMP lalu lari. Ini ruangan terakhir — habiskan koinmu.',
    walls: borderWalls(),
    covers: [
      { x: 300, y: 200, w: 84, h: 84, kind: 'safe', label: 'VAULT' },
      { x: 896, y: 200, w: 84, h: 84, kind: 'safe', label: 'VAULT' },
      { x: 300, y: 480, w: 84, h: 84, kind: 'safe', label: 'VAULT' },
      { x: 896, y: 480, w: 84, h: 84, kind: 'safe', label: 'VAULT' },
      { x: 580, y: 310, w: 120, h: 120, kind: 'vault', label: 'BRANKAS PUSAT' },
    ],
    guards: [
      { path: [[200, 140], [1080, 140], [1080, 250], [200, 250]], pause: 0.8 },
      { path: [[200, 630], [1080, 630], [1080, 450], [200, 450]], pause: 0.8 },
      { path: [[230, 300], [230, 600], [480, 600], [480, 300]], pause: 0.6 },
      { path: [[1050, 300], [1050, 600], [800, 600], [800, 300]], pause: 0.6 },
    ],
    cameras: [
      { x: 300, y: 92, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.85 },
      { x: 980, y: 92, baseAngle: Math.PI / 2, sweep: 1.0, speed: 0.9 },
      { x: 640, y: 676, baseAngle: -Math.PI / 2, sweep: 1.0, speed: 0.75 },
    ],
    loot: [
      { x: 150, y: 330, kind: 'small' },
      { x: 1130, y: 330, kind: 'small' },
      { x: 640, y: 640, kind: 'small' },
      { x: 420, y: 140, kind: 'medium' },
      { x: 860, y: 620, kind: 'medium' },
      { x: 640, y: 370, kind: 'diamond', label: 'BERLIAN PUSAT' },
    ],
    exit: { x: 44, y: 596, w: 84, h: 72 },
    lasers: [
      { x1: 200, y1: 320, x2: 560, y2: 320, gapAt: 0.55, gapW: 90 },
      { x1: 720, y1: 320, x2: 1080, y2: 320, gapAt: 0.45, gapW: 90 },
      { x1: 200, y1: 460, x2: 560, y2: 460, gapAt: 0.45, gapW: 90 },
      { x1: 720, y1: 460, x2: 1080, y2: 460, gapAt: 0.55, gapW: 90 },
    ],
    decor: [
      { kind: 'painting', x: 500, y: 96, w: 280, h: 26, color: '#ff4040' },
      { kind: 'plant', x: 90, y: 130, w: 34, h: 40 },
      { kind: 'plant', x: 1150, y: 130, w: 34, h: 40 },
      { kind: 'vaultdoor', x: 560, y: 290, w: 160, h: 160 },
    ],
  },
];

export function buildLevel(index) {
  const def = LEVELS[index % LEVELS.length];
  return JSON.parse(JSON.stringify(def));
}
