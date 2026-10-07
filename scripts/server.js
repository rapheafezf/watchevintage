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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Root goes directly to presentation
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/presentation/index.html';
  }

  let filePath = path.join(ROOT_DIR, reqPath);

  // If path is a directory, serve its index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
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
});

let currentPort = parseInt(process.env.PORT, 10) || 4000;

function listen(port) {
  server.listen(port, () => {
    console.log(`\n===============================================================`);
    console.log(`  ✓ Serveur local Watch & Vintage démarré avec succès !`);
    console.log(`  -------------------------------------------------------------`);
    console.log(`  ➜ Page de Présentation : http://localhost:${port}/`);
    console.log(`  ➜ Boutique Refondue     : http://localhost:${port}/redesign/`);
    console.log(`===============================================================\n`);
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`! Le port ${currentPort} est déjà occupé. Tentative sur le port ${currentPort + 1}...`);
    currentPort += 1;
    setTimeout(() => listen(currentPort), 150);
  } else {
    console.error('Erreur serveur :', err.message);
  }
});

listen(currentPort);
