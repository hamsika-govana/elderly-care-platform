/**
 * SilverCare - Lightweight Node.js Server & REST API
 * Serves the modern frontend and provides mock REST API endpoints
 * for backend integration.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  // CORS Headers for API calls
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Optional Mock REST API Endpoints
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/api/health') {
      res.writeHead(200);
      res.end(JSON.stringify({ status: 'UP', service: 'SilverCare Platform Backend', timestamp: new Date().toISOString() }));
      return;
    }

    if (req.url === '/api/patient') {
      res.writeHead(200);
      res.end(JSON.stringify({
        id: 'patient-robert',
        name: 'Robert Jenkins',
        age: 74,
        bloodGroup: 'O+',
        adherenceScore: 93,
        streakDays: 5
      }));
      return;
    }

    if (req.url === '/api/emergency/dispatch' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          status: 'DISPATCHED',
          beaconId: 'SOS-' + Date.now(),
          coordinates: '37.7749° N, 122.4194° W',
          smsSentTo: ['(555) 234-5678', '(555) 876-5432']
        }));
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return;
  }

  // Static File Serving
  let safePath = path.normalize(req.url.split('?')[0]);
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  // Security check: ensure path is within directory
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA hash routing
      const indexPath = path.join(PUBLIC_DIR, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Server Error');
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  SilverCare Platform Server running on port ${PORT}`);
  console.log(`  Access URL: http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
