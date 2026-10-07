const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/presentation/index.html';
  }

  let filePath = path.join(__dirname, '..', reqPath);

  // If path doesn't exist, check inside redesign or presentation
  if (!fs.existsSync(filePath)) {
    const redesignPath = path.join(__dirname, '..', 'redesign', reqPath);
    const presPath = path.join(__dirname, '..', 'presentation', reqPath);
    if (fs.existsSync(redesignPath)) {
      filePath = redesignPath;
    } else if (fs.existsSync(presPath)) {
      filePath = presPath;
    }
  }

  // Set noindex headers as requested
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
