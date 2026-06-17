const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3001;
const ROOT = __dirname;

const MIME = {
  '.html':'.html','.css':'text/css','.js':'application/javascript',
  '.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg',
  '.gif':'image/gif','.svg':'image/svg+xml','.webp':'image/webp',
  '.ico':'image/x-icon','.woff2':'font/woff2','.woff':'font/woff',
};

http.createServer((req, res) => {
  const url   = new URL(req.url, `http://localhost:${PORT}`);
  const qs    = url.pathname;

  // ── CORS header ──
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/save — write index.html ──
  if (req.method === 'POST' && qs === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const dest = path.join(ROOT, 'index.html');
      fs.writeFile(dest, body, 'utf8', err => {
        if (err) {
          res.writeHead(500, {'Content-Type':'application/json'});
          res.end(JSON.stringify({ ok: false, error: err.message }));
        } else {
          res.writeHead(200, {'Content-Type':'application/json'});
          res.end(JSON.stringify({ ok: true }));
          console.log('[saved] index.html');
        }
      });
    });
    return;
  }

  // ── GET — serve static files ──
  let filePath = qs === '/' ? '/index.html' : qs;
  filePath = path.join(ROOT, filePath.split('?')[0]);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain'});
      res.end('404 Not Found: ' + qs);
      return;
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'text/plain';
    res.writeHead(200, {'Content-Type': mime.includes('/') ? mime : 'text/html'});
    res.end(data);
  });

}).listen(PORT, () => {
  console.log('');
  console.log('  Macanria Admin Server siap.');
  console.log('');
  console.log('  Admin panel  →  http://localhost:' + PORT + '/admin.html');
  console.log('  Website      →  http://localhost:' + PORT + '/');
  console.log('');
  console.log('  Tekan Ctrl+C untuk stop.');
  console.log('');
});
