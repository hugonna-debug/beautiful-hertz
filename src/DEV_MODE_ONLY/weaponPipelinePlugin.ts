/**
 * DEV_MODE_ONLY: Vite plugin that adds dev server API routes for the weapon
 * anchor pipeline. Provides endpoints to list, move, and skip weapon sprites
 * between unverified_weapons/ and anchored_weapons/ folders.
 * 
 * This plugin is ONLY active during dev server mode (not production builds).
 */
import fs from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

const ASSETS_DIR = path.resolve(__dirname, '../../public/assets');
const UNVERIFIED_DIR = path.join(ASSETS_DIR, 'unverified_weapons');
const ANCHORED_DIR = path.join(ASSETS_DIR, 'anchored_weapons');
const SKIPPED_DIR = path.join(ASSETS_DIR, 'skipped_weapons');

// Ensure directories exist
[UNVERIFIED_DIR, ANCHORED_DIR, SKIPPED_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

export function weaponPipelinePlugin(): Plugin {
  return {
    name: 'dev-weapon-pipeline',
    apply: 'serve', // Only active in dev mode
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/dev-api/weapons')) return next();

        // ── GET /dev-api/weapons/unverified ─────────────────────────
        if (req.method === 'GET' && req.url === '/dev-api/weapons/unverified') {
          const files = fs.readdirSync(UNVERIFIED_DIR)
            .filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f))
            .sort()
            .map(name => ({
              name,
              url: `/assets/unverified_weapons/${name}`,
            }));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ count: files.length, weapons: files }));
          return;
        }

        // ── GET /dev-api/weapons/anchored ───────────────────────────
        if (req.method === 'GET' && req.url === '/dev-api/weapons/anchored') {
          const files = fs.readdirSync(ANCHORED_DIR)
            .filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f))
            .sort()
            .map(name => {
              // Try to load anchor JSON sidecar
              const jsonPath = path.join(ANCHORED_DIR, name.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, '.anchor.json'));
              let anchor = null;
              if (fs.existsSync(jsonPath)) {
                try { anchor = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')); } catch {}
              }
              return {
                name,
                url: `/assets/anchored_weapons/${name}`,
                anchor,
              };
            });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ count: files.length, weapons: files }));
          return;
        }

        // ── POST /dev-api/weapons/anchor ────────────────────────────
        // Body: { filename: string, anchor: { baseX, baseY, tipX, tipY, angle, distance } }
        if (req.method === 'POST' && req.url === '/dev-api/weapons/anchor') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename, anchor } = JSON.parse(body);
              if (!filename) throw new Error('Missing filename');

              const srcPath = path.join(UNVERIFIED_DIR, filename);
              const destPath = path.join(ANCHORED_DIR, filename);

              if (!fs.existsSync(srcPath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `File not found: ${filename}` }));
                return;
              }

              // Move sprite to anchored folder
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);

              // Save anchor metadata as sidecar JSON
              const jsonFilename = filename.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, '.anchor.json');
              const jsonPath = path.join(ANCHORED_DIR, jsonFilename);
              fs.writeFileSync(jsonPath, JSON.stringify({
                filename,
                anchoredAt: new Date().toISOString(),
                ...anchor,
              }, null, 2));

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ 
                success: true, 
                message: `Anchored: ${filename}`,
                newUrl: `/assets/anchored_weapons/${filename}`,
              }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── POST /dev-api/weapons/skip ──────────────────────────────
        // Body: { filename: string }
        if (req.method === 'POST' && req.url === '/dev-api/weapons/skip') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename } = JSON.parse(body);
              if (!filename) throw new Error('Missing filename');

              const srcPath = path.join(UNVERIFIED_DIR, filename);
              const destPath = path.join(SKIPPED_DIR, filename);

              if (!fs.existsSync(srcPath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `File not found: ${filename}` }));
                return;
              }

              // Move to skipped folder
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Skipped: ${filename}` }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── POST /dev-api/weapons/unskip ────────────────────────────
        // Body: { filename: string } — move back from skipped to unverified
        if (req.method === 'POST' && req.url === '/dev-api/weapons/unskip') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename } = JSON.parse(body);
              const srcPath = path.join(SKIPPED_DIR, filename);
              const destPath = path.join(UNVERIFIED_DIR, filename);
              if (!fs.existsSync(srcPath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `Not in skipped: ${filename}` }));
                return;
              }
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Unskipped: ${filename}` }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── GET /dev-api/weapons/skipped ────────────────────────────
        if (req.method === 'GET' && req.url === '/dev-api/weapons/skipped') {
          const files = fs.readdirSync(SKIPPED_DIR)
            .filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f))
            .sort()
            .map(name => ({
              name,
              url: `/assets/skipped_weapons/${name}`,
            }));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ count: files.length, weapons: files }));
          return;
        }

        // ── POST /dev-api/weapons/unanchor ──────────────────────────
        // Body: { filename: string } — move back from anchored to unverified
        if (req.method === 'POST' && req.url === '/dev-api/weapons/unanchor') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename } = JSON.parse(body);
              const srcPath = path.join(ANCHORED_DIR, filename);
              const destPath = path.join(UNVERIFIED_DIR, filename);
              const jsonFilename = filename.replace(/\.(png|jpg|jpeg|gif|webp|bmp)$/i, '.anchor.json');
              const jsonPath = path.join(ANCHORED_DIR, jsonFilename);

              if (!fs.existsSync(srcPath)) {
                res.statusCode = 404;
                res.end(JSON.stringify({ error: `Not in anchored: ${filename}` }));
                return;
              }
              fs.copyFileSync(srcPath, destPath);
              fs.unlinkSync(srcPath);
              if (fs.existsSync(jsonPath)) fs.unlinkSync(jsonPath);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: `Unanchored: ${filename}` }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        // ── GET /dev-api/weapons/stats ──────────────────────────────
        if (req.method === 'GET' && req.url === '/dev-api/weapons/stats') {
          const unverified = fs.readdirSync(UNVERIFIED_DIR).filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f)).length;
          const anchored = fs.readdirSync(ANCHORED_DIR).filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f)).length;
          const skipped = fs.readdirSync(SKIPPED_DIR).filter(f => /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(f)).length;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ unverified, anchored, skipped, total: unverified + anchored + skipped }));
          return;
        }

        next();
      });

      // ── Hand Socket API (Animation Editor → Arena) ──────────────────
      const HANDSOCKETS_JSON = path.resolve(__dirname, '../../public/assets/handsockets_overrides.json');

      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/dev-api/handsockets')) return next();

        // ── GET /dev-api/handsockets ────────────────────────────────
        // Load saved hand socket overrides
        if (req.method === 'GET' && req.url === '/dev-api/handsockets') {
          if (fs.existsSync(HANDSOCKETS_JSON)) {
            const data = fs.readFileSync(HANDSOCKETS_JSON, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
          } else {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ slashEast: [] }));
          }
          return;
        }

        // ── POST /dev-api/handsockets ───────────────────────────────
        // Save hand socket overrides from animation editor
        // Body: { slashEast: [ { x, y, angle, renderOrder, pivotX, pivotY }, ... ] }
        if (req.method === 'POST' && req.url === '/dev-api/handsockets') {
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const data = JSON.parse(body);
              fs.writeFileSync(HANDSOCKETS_JSON, JSON.stringify(data, null, 2));
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Hand sockets saved', path: HANDSOCKETS_JSON }));
            } catch (err: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}
