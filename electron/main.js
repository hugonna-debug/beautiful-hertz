const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

let localServer;

/**
 * Starts a lightweight, self-contained local HTTP web server
 * to serve the built game assets without CORS/file-protocol restrictions.
 */
function startLocalServer(callback) {
  const server = http.createServer((req, res) => {
    // Strip query parameters or hashes from request URL
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    let filePath = path.join(__dirname, '../dist', decodeURIComponent(parsedUrl.pathname));

    // If directory/root, fallback to index.html
    if (filePath.endsWith('/') || parsedUrl.pathname === '/') {
      filePath = path.join(filePath, 'index.html');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.wav': 'audio/wav',
      '.mp3': 'audio/mpeg',
      '.ico': 'image/x-icon'
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          // Fallback to index.html for SPA client-side routing
          fs.readFile(path.join(__dirname, '../dist/index.html'), (err, indexContent) => {
            if (err) {
              res.writeHead(504, { 'Content-Type': 'text/plain' });
              res.end('Game client not built. Please run "npm run build" first.');
            } else {
              res.writeHead(200, { 'Content-Type': 'text/html' });
              res.end(indexContent, 'utf-8');
            }
          });
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${error.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  // Listen on any available random free port to prevent conflict
  server.listen(0, '127.0.0.1', () => {
    const port = server.address().port;
    callback(port, server);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: 'MIN-MAXXED — Standalone Desktop Client',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    icon: path.join(__dirname, '../public/favicon.ico')
  });

  win.setMenuBarVisibility(false);

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    startLocalServer((port, server) => {
      localServer = server;
      win.loadURL(`http://127.0.0.1:${port}`);
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (localServer) {
    localServer.close();
  }
  if (process.platform !== 'darwin') app.quit();
});
