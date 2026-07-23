# ⚔️ MIN-MAXXED (Feature-Creep Clicker Game)

A high-performance, responsive 2D RPG clicker & LPC character builder game built with **React 19**, **Vite**, **TypeScript**, and **Express**. Featuring real-time arena combat, 2-point equipment vector anchoring, modular character customization, and live dev tool pipelines.

---

## 🚀 Quick Start (Development Mode)

### Prerequisites
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher

### Installation & Launch
```bash
# Install dependencies
npm install

# Run Vite local development server (with Anchor Studio & Dev Pipeline)
npm run dev
```
Open **`http://localhost:5174`** (or port specified in terminal) to play the game and access developer tools.

### Additional Scripts
- `npm run build`: Build production assets for deployment
- `npm run test`: Run unit test suite (Vitest)
- `npm run start`: Launch Express backend server for Firestore & asset API sync

---

## 🛠️ Developer Tools (`DEV_MODE_ONLY`)

The **dev** branch includes exclusive developer tools for rapid sprite workflow and asset pipeline management:

1. **⚓ Anchor Studio (Mode 1 & Mode 2)**
   - **Mode 1 (Arena Animation Scrubber)**: Frame-by-frame vector handle $(x, y)$ and orientation tip vector $(\text{tipX}, \text{tipY})$ editor locked to player combat actions (`slashEast`). Saves directly to `public/assets/handsockets_overrides.json`.
   - **Mode 2 (Weapon Sprite Batch Anchoring)**: Rapid batch marking for custom weapon grip points with 1-click confirmation (`Enter` key advance).

2. **📁 Unverified Asset Ingestion Pipeline**
   - Place raw weapon image files (`.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.gif`) into `public/assets/unverified_weapons/`.
   - **Multi-Weapon Sheet Splitting**: Automatic background saturation/brightness filtering detects checkerboard & solid backgrounds, extracting individual weapon sprites cleanly into transparent PNGs.
   - Moves tagged items to `public/assets/anchored_weapons/` with sidecar `.anchor.json` metadata files.

---

## 🌐 Live Deployments

- 🚀 **Google Cloud Run:** [https://min-maxxed-288113474432.us-central1.run.app](https://min-maxxed-288113474432.us-central1.run.app)
- 🌐 **Firebase Hosting:** [https://stellar-display-496111-n4.web.app](https://stellar-display-496111-n4.web.app)

---

## 📜 Branch Strategy

- **`dev`**: Active development branch containing all source code, tests, and `DEV_MODE_ONLY` tooling.
- **`main`**: Production branch containing the clean, optimized game build without dev tools or pipeline scripts.
