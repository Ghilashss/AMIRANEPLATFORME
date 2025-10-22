const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 9000;

// Types MIME
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // ✅ PROXY vers le backend pour les routes API
  if (req.url.startsWith('/api/')) {
    const backendUrl = `http://localhost:1000${req.url}`;
    console.log(`🔄 Proxy vers backend: ${backendUrl}`);

    const proxyReq = http.request(backendUrl, {
      method: req.method,
      headers: req.headers
    }, (backendRes) => {
      res.writeHead(backendRes.statusCode, backendRes.headers);
      backendRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
      console.error('❌ Erreur proxy:', error);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Backend non disponible' }));
    });

    req.pipe(proxyReq);
    return;
  }

  // Nettoyer l'URL en supprimant les query strings (?, #, etc.)
  let urlPath = req.url.split('?')[0].split('#')[0];
  
  // Déterminer le chemin du fichier
  let filePath = '.' + urlPath;
  
  // Si c'est la racine, rediriger vers le dashboard admin
  if (filePath === './' || filePath === '.') {
    filePath = './dashboards/admin/admin-dashboard.html';
  }
  
  // Si c'est un répertoire, chercher index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Déterminer l'extension
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  // Lire et servir le fichier
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <head><title>404 - Fichier non trouvé</title></head>
            <body>
              <h1>404 - Fichier non trouvé</h1>
              <p>Le fichier <code>${req.url}</code> n'existe pas.</p>
              <p><a href="/dashboards/admin/admin-dashboard.html">Dashboard Admin</a></p>
              <p><a href="/dashboards/agent/agent-dashboard.html">Dashboard Agent</a></p>
            </body>
          </html>
        `, 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Erreur serveur: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('\n===============================================');
  console.log('   SERVEUR FRONTEND DÉMARRÉ');
  console.log('===============================================\n');
  console.log(`✅ Serveur HTTP actif sur: http://localhost:${PORT}`);
  console.log('\n📍 Pages disponibles:');
  console.log(`   🔹 Admin:  http://localhost:${PORT}/dashboards/admin/admin-dashboard.html`);
  console.log(`   🔹 Agent:  http://localhost:${PORT}/dashboards/agent/agent-dashboard.html`);
  console.log(`   🔹 Agence: http://localhost:${PORT}/dashboards/agence/agence-dashboard.html`);
  console.log('\n⚠️  Assurez-vous que le backend est démarré sur le port 1000');
  console.log('   👉 Pour démarrer le backend: cd backend && node server.js\n');
  console.log('Appuyez sur Ctrl+C pour arrêter le serveur\n');
});
