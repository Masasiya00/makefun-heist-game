# ◆ MIDNIGHT VAULT — Heist Game

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Masasiya00/makefun-heist-game/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Masasiya00/makefun-heist-game/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

Top-down stealth heist game: lewati guard & kamera, curi semua loot wajib, kabur lewat EXIT sebelum alarm 100% memicu LOCKDOWN.

**5 heists** (Galeri Senja → Bank Kecil Merah → Museum Nusantara → Kasino Neon → Brankas Pusat, dengan laser di final), **3 difficulty** (Santai / Profesional / Legend), **4 tools berbayar** (Koin Distraksi 20, Bom Asap 40, EMP 60, Lockpick 30), **6 relic** antar-heist, skor + combo + bonus GHOST 500 kalau tidak pernah terlihat, dan Endless mode setelah Heist 5.

## Cara main

Buka `game/index.html` lewat static server apa pun (mis. `python3 -m http.server` di dalam `game/`), lalu main di desktop Chrome. Tanpa network request — semua file lokal.

- **WASD / Panah** — gerak. Berdiri diam di dekat berlian untuk membobol (2,5 dtk).
- **Klik** — pakai tool yang dipilih. **1-4** — pilih tool (1 koin: klik titik lemparan, 2 asap, 3 EMP, 4 lockpick dekat berlian).
- **P / Esc** — pause. **M** — suara. **R** — ulang heist.
- Guard punya vision cone kuning, kamera cone merah. Ketahuan = alarm naik; sembunyi di balik cover/sofa/brankas = alarm turun. Alarm 100% = LOCKDOWN 8 dtk, guard mengejar — selamat atau tertangkap.
- Ambil semua loot wajib (batang emas + berlian), lalu masuk EXIT hijau untuk CLEAN GETAWAY + grade S/A/B/C.

## Struktur source

`game/src/` satu file satu job: `config.js` (konstanta + tools + difficulty), `levels.js` (5 ruangan), `thief.js`, `guards.js` (patroli + cone + deteksi), `cameras.js`, `loot.js`, `tools.js`, `alarm.js`, `audio.js` (suara prosedural WebAudio), `render.js`, `hud.js`, `shots.js` (scene staged `?shot=cover|play|tools|win`), `main.js` (loop + state). Vanilla canvas 2D, tanpa library.
