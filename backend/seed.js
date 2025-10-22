const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Wilaya = require('./models/Wilaya');
const Agence = require('./models/Agence');

// Charger les variables d'environnement
dotenv.config();

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Données de test pour les wilayas (quelques exemples)
const wilayas = [
  { code: '01', nom: 'Adrar', fraisLivraison: { domicile: 800, stopDesk: 600 }, delaiLivraison: '3-5 jours' },
  { code: '02', nom: 'Chlef', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '03', nom: 'Laghouat', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '04', nom: 'Oum El Bouaghi', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '05', nom: 'Batna', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '06', nom: 'Béjaïa', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '07', nom: 'Biskra', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '08', nom: 'Béchar', fraisLivraison: { domicile: 900, stopDesk: 700 }, delaiLivraison: '4-6 jours' },
  { code: '09', nom: 'Blida', fraisLivraison: { domicile: 500, stopDesk: 350 }, delaiLivraison: '24-48h' },
  { code: '10', nom: 'Bouira', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '11', nom: 'Tamanrasset', fraisLivraison: { domicile: 1200, stopDesk: 1000 }, delaiLivraison: '5-7 jours' },
  { code: '12', nom: 'Tébessa', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '3-4 jours' },
  { code: '13', nom: 'Tlemcen', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '14', nom: 'Tiaret', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '15', nom: 'Tizi Ouzou', fraisLivraison: { domicile: 550, stopDesk: 400 }, delaiLivraison: '2-3 jours' },
  { code: '16', nom: 'Alger', fraisLivraison: { domicile: 500, stopDesk: 350 }, delaiLivraison: '24-48h' },
  { code: '17', nom: 'Djelfa', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '18', nom: 'Jijel', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '19', nom: 'Sétif', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '20', nom: 'Saïda', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '21', nom: 'Skikda', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '22', nom: 'Sidi Bel Abbès', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '23', nom: 'Annaba', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '24', nom: 'Guelma', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '25', nom: 'Constantine', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '26', nom: 'Médéa', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '27', nom: 'Mostaganem', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '28', nom: 'M\'Sila', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '29', nom: 'Mascara', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '30', nom: 'Ouargla', fraisLivraison: { domicile: 800, stopDesk: 650 }, delaiLivraison: '3-5 jours' },
  { code: '31', nom: 'Oran', fraisLivraison: { domicile: 550, stopDesk: 400 }, delaiLivraison: '2-3 jours' },
  { code: '32', nom: 'El Bayadh', fraisLivraison: { domicile: 800, stopDesk: 650 }, delaiLivraison: '3-5 jours' },
  { code: '33', nom: 'Illizi', fraisLivraison: { domicile: 1200, stopDesk: 1000 }, delaiLivraison: '5-7 jours' },
  { code: '34', nom: 'Bordj Bou Arreridj', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '35', nom: 'Boumerdès', fraisLivraison: { domicile: 550, stopDesk: 400 }, delaiLivraison: '24-48h' },
  { code: '36', nom: 'El Tarf', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '37', nom: 'Tindouf', fraisLivraison: { domicile: 1200, stopDesk: 1000 }, delaiLivraison: '5-7 jours' },
  { code: '38', nom: 'Tissemsilt', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '39', nom: 'El Oued', fraisLivraison: { domicile: 750, stopDesk: 600 }, delaiLivraison: '3-4 jours' },
  { code: '40', nom: 'Khenchela', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '41', nom: 'Souk Ahras', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '42', nom: 'Tipaza', fraisLivraison: { domicile: 550, stopDesk: 400 }, delaiLivraison: '24-48h' },
  { code: '43', nom: 'Mila', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '44', nom: 'Aïn Defla', fraisLivraison: { domicile: 600, stopDesk: 450 }, delaiLivraison: '2-3 jours' },
  { code: '45', nom: 'Naâma', fraisLivraison: { domicile: 850, stopDesk: 700 }, delaiLivraison: '3-5 jours' },
  { code: '46', nom: 'Aïn Témouchent', fraisLivraison: { domicile: 700, stopDesk: 550 }, delaiLivraison: '2-4 jours' },
  { code: '47', nom: 'Ghardaïa', fraisLivraison: { domicile: 800, stopDesk: 650 }, delaiLivraison: '3-5 jours' },
  { code: '48', nom: 'Relizane', fraisLivraison: { domicile: 650, stopDesk: 500 }, delaiLivraison: '2-3 jours' },
  { code: '49', nom: 'El M\'ghair', fraisLivraison: { domicile: 800, stopDesk: 650 }, delaiLivraison: '3-5 jours' },
  { code: '50', nom: 'El Meniaa', fraisLivraison: { domicile: 900, stopDesk: 750 }, delaiLivraison: '4-6 jours' },
  { code: '51', nom: 'Ouled Djellal', fraisLivraison: { domicile: 750, stopDesk: 600 }, delaiLivraison: '3-4 jours' },
  { code: '52', nom: 'Bordj Badji Mokhtar', fraisLivraison: { domicile: 1500, stopDesk: 1300 }, delaiLivraison: '7-10 jours' },
  { code: '53', nom: 'Béni Abbès', fraisLivraison: { domicile: 1000, stopDesk: 850 }, delaiLivraison: '4-6 jours' },
  { code: '54', nom: 'Timimoun', fraisLivraison: { domicile: 900, stopDesk: 750 }, delaiLivraison: '4-6 jours' },
  { code: '55', nom: 'Touggourt', fraisLivraison: { domicile: 800, stopDesk: 650 }, delaiLivraison: '3-5 jours' },
  { code: '56', nom: 'Djanet', fraisLivraison: { domicile: 1300, stopDesk: 1100 }, delaiLivraison: '6-8 jours' },
  { code: '57', nom: 'In Salah', fraisLivraison: { domicile: 1100, stopDesk: 950 }, delaiLivraison: '5-7 jours' },
  { code: '58', nom: 'In Guezzam', fraisLivraison: { domicile: 1400, stopDesk: 1200 }, delaiLivraison: '7-10 jours' }
];

// Utilisateur admin par défaut
const adminUser = {
  nom: 'Admin',
  prenom: 'System',
  email: 'admin@platforme.com',
  telephone: '0555000000',
  password: 'admin123',
  role: 'admin',
  status: 'active'
};

// Utilisateur commercant de test
const commercantUser = {
  nom: 'Boutique',
  prenom: 'Test',
  email: 'commercant@test.com',
  telephone: '0666111222',
  password: '123456',
  role: 'commercant',
  wilaya: '16',
  adresse: '123 Rue Didouche Mourad, Alger',
  status: 'active'
};

// Fonction pour initialiser la base de données
const seedDatabase = async () => {
  try {
    console.log('🗑️  Suppression des anciennes données...');
    
    // Supprimer toutes les données existantes
    await User.deleteMany({});
    await Wilaya.deleteMany({});
    await Agence.deleteMany({});

    console.log('✅ Données supprimées\n');

    // Créer les wilayas
    console.log('📍 Création des wilayas...');
    const createdWilayas = await Wilaya.insertMany(wilayas);
    console.log(`✅ ${createdWilayas.length} wilayas créées\n`);

    // Créer l'utilisateur admin
    console.log('👤 Création de l\'utilisateur admin...');
    const admin = await User.create(adminUser);
    console.log(`✅ Admin créé: ${admin.email} / mot de passe: admin123\n`);

    // Créer l'utilisateur commercant
    console.log('👤 Création de l\'utilisateur commerçant...');
    const commercant = await User.create(commercantUser);
    console.log(`✅ Commerçant créé: ${commercant.email} / mot de passe: 123456\n`);

    // Créer quelques agences avec leurs comptes utilisateurs
    console.log('🏢 Création des agences avec comptes utilisateurs...');
    const agencesData = [
      {
        agence: {
          nom: 'Agence Alger Centre',
          wilaya: '16',
          wilayaText: 'Alger',
          email: 'alger.centre@agence.com',
          telephone: '021123456',
          adresse: 'Rue Didouche Mourad, Alger'
        },
        user: {
          nom: 'Agence Alger Centre',
          prenom: 'Agent',
          email: 'alger.centre@agence.com',
          password: 'agent123',
          telephone: '021123456',
          role: 'agent',
          wilaya: '16'
        }
      },
      {
        agence: {
          nom: 'Agence Oran',
          wilaya: '31',
          wilayaText: 'Oran',
          email: 'oran@agence.com',
          telephone: '041654321',
          adresse: 'Boulevard de la Soummam, Oran'
        },
        user: {
          nom: 'Agence Oran',
          prenom: 'Agent',
          email: 'oran@agence.com',
          password: 'agent123',
          telephone: '041654321',
          role: 'agent',
          wilaya: '31'
        }
      },
      {
        agence: {
          nom: 'Agence Constantine',
          wilaya: '25',
          wilayaText: 'Constantine',
          email: 'constantine@agence.com',
          password: 'agent123',
          telephone: '031789456',
          adresse: 'Rue Larbi Ben M\'hidi, Constantine'
        },
        user: {
          nom: 'Agence Constantine',
          prenom: 'Agent',
          email: 'constantine@agence.com',
          password: 'agent123',
          telephone: '031789456',
          role: 'agent',
          wilaya: '25'
        }
      }
    ];

    // Créer les agences avec leurs comptes utilisateurs
    const createdAgences = [];
    for (const data of agencesData) {
      // 1. Créer d'abord l'agence
      const agence = await Agence.create(data.agence);
      
      // 2. Créer l'utilisateur agent avec la référence à l'agence
      const user = await User.create({
        ...data.user,
        agence: agence._id  // Lier l'utilisateur à l'agence
      });
      
      // 3. Mettre à jour l'agence avec l'userId
      agence.userId = user._id;
      await agence.save();
      
      createdAgences.push(agence);
      console.log(`   ✅ ${agence.nom} + compte agent créé`);
    }
    console.log(`✅ ${createdAgences.length} agences créées avec comptes\n`);

    console.log('═══════════════════════════════════════');
    console.log('✅ Base de données initialisée avec succès!');
    console.log('═══════════════════════════════════════');
    console.log('\n📊 Résumé:');
    console.log(`   - ${createdWilayas.length} wilayas`);
    console.log(`   - ${createdAgences.length} agences`);
    console.log(`   - 5 utilisateurs (1 admin + 1 commerçant + 3 agents)\n`);
    console.log('🔐 Identifiants de connexion:');
    console.log('\n   👨‍💼 Admin:');
    console.log('   📧 Email: admin@platforme.com');
    console.log('   🔑 Password: admin123\n');
    console.log('   👨‍🏭 Commerçant:');
    console.log('   📧 Email: commercant@test.com');
    console.log('   🔑 Password: 123456\n');
    console.log('   👨‍💼 Agents (Agences):');
    console.log('   📧 Email: alger.centre@agence.com   | 🔑 Password: agent123 (Wilaya: Alger)');
    console.log('   📧 Email: oran@agence.com           | 🔑 Password: agent123 (Wilaya: Oran)');
    console.log('   📧 Email: constantine@agence.com    | 🔑 Password: agent123 (Wilaya: Constantine)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

// Exécuter
seedDatabase();
