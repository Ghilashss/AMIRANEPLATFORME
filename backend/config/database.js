const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // ✅ Mongoose 6+ : plus besoin de useNewUrlParser et useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
