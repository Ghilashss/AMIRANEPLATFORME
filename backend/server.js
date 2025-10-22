const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/error');

// Charger les variables d'environnement
dotenv.config();

// Connexion à la base de données
connectDB();

// Initialiser Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sécurité
app.use(helmet());

// CORS - Autoriser les requêtes depuis le frontend
app.use(cors({
  origin: [
    'http://localhost:9000', 
    'http://localhost:3000', 
    'http://127.0.0.1:9000',
    'https://amirane.store',      // ✅ Production Hostinger
    'http://amirane.store'         // ✅ HTTP redirect
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging en développement
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting (Configuration développement - Plus permissive)
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // 500 requêtes par IP (augmenté pour développement)
  message: 'Trop de requêtes depuis cette IP, réessayez plus tard'
});
app.use('/api/', limiter);

// Servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/colis', require('./routes/colis'));
app.use('/api/agences', require('./routes/agences'));
app.use('/api/wilayas', require('./routes/wilayas'));
app.use('/api/caisse', require('./routes/caisse'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/frais-livraison', require('./routes/fraisLivraison'));
app.use('/api/livraisons', require('./routes/livraisons'));
app.use('/api/retours', require('./routes/retours'));

// Route de base
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Plateforme de Livraison',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      colis: '/api/colis',
      agences: '/api/agences',
      wilayas: '/api/wilayas'
    }
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestionnaire d'erreurs
app.use(errorHandler);

// Démarrer le serveur
const PORT = process.env.PORT || 1000;

const server = app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   🚀 Serveur démarré en mode ${process.env.NODE_ENV || 'development'}   ║
  ║   📡 Port: ${PORT}                        ║
  ║   🌐 URL: http://localhost:${PORT}        ║
  ╚═══════════════════════════════════════════╝
  `);
});

// Gestion des erreurs non gérées
process.on('unhandledRejection', (err) => {
  console.error(`❌ Erreur non gérée: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM reçu, fermeture du serveur...');
  server.close(() => {
    console.log('✅ Serveur fermé');
  });
});

module.exports = app;
