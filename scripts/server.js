const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function handleRequest(req, res) {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Root serves index.html (Boutique refondue)
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // If path is a directory: ensure trailing slash, then serve index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    if (!req.url.split('?')[0].endsWith('/')) {
      const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
      res.writeHead(302, { 'Location': req.url.split('?')[0] + '/' + query });
      res.end();
      return;
    }
    filePath = path.join(filePath, 'index.html');
  }

  // Support clean URLs (/catalog -> /catalog.html)
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath = filePath + '.html';
  }

  // Fallback checks inside presentation/ or redesign/
  if (!fs.existsSync(filePath)) {
    const candidatePres = path.join(ROOT_DIR, 'presentation', reqPath);
    const candidateRedesign = path.join(ROOT_DIR, 'redesign', reqPath);

    if (fs.existsSync(candidatePres)) {
      filePath = fs.statSync(candidatePres).isDirectory()
        ? path.join(candidatePres, 'index.html')
        : candidatePres;
    } else if (fs.existsSync(candidateRedesign)) {
      filePath = fs.statSync(candidateRedesign).isDirectory()
        ? path.join(candidateRedesign, 'index.html')
        : candidateRedesign;
    }
  }

  // Security headers & anti-indexation
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Access-Control-Allow-Origin', '*');

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 - Fichier non trouvé : ${reqPath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

const primaryServer = http.createServer(handleRequest);
let primaryPort = parseInt(process.env.PORT, 10) || 4000;

function startPrimaryServer(port) {
  primaryServer.listen(port, () => {
    console.log(`\n===============================================================`);
    console.log(`  ✓ Serveur local Watch & Vintage démarré avec succès !`);
    console.log(`  -------------------------------------------------------------`);
    console.log(`  ➜ Boutique (Site Principal) : http://localhost:${port}/`);
    console.log(`  ➜ Présentation Avant / Après: http://localhost:${port}/presentation/`);
    console.log(`===============================================================\n`);

    // If on port 4000, also try to bind port 3000 as convenience if free
    if (port === 4000 && !process.env.PORT) {
      tryBindSecondary(3000);
    } else if (port === 3000 && !process.env.PORT) {
      tryBindSecondary(4000);
    }
  });
}

function tryBindSecondary(port) {
  const secondary = http.createServer(handleRequest);
  secondary.listen(port, () => {
    console.log(`  [+] Port additionnel ${port} également actif : http://localhost:${port}/`);
  });
  secondary.on('error', () => {
    // Port busy, ignore silently
  });
}

primaryServer.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`! Le port ${primaryPort} est déjà occupé. Tentative sur le port ${primaryPort + 1}...`);
    primaryPort += 1;
    setTimeout(() => startPrimaryServer(primaryPort), 150);
  } else {
    console.error('Erreur serveur :', err.message);
  }
});

startPrimaryServer(primaryPort);

module.exports = primaryServer;
