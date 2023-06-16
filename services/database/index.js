const { MongoClient } = require("mongodb");

class MongoDBConnection {
  constructor() {
    if (!MongoDBConnection.instance) {
      // Créez une seule instance de connexion à MongoDB
      this.client = new MongoClient(process.env.MONGO_URI);
      MongoDBConnection.instance = this;
    }

    return MongoDBConnection.instance;
  }

  async connect() {
    try {
      // Connectez-vous à la base de données
      await this.client.connect();
      console.log("Connecté à MongoDB");
    } catch (error) {
      console.error("Erreur de connexion à MongoDB:", error);
    }
  }

  getDatabase(databaseName) {
    // Retourne une référence à la base de données spécifiée
    return this.client.db(databaseName);
  }
}

module.exports = MongoDBConnection;
