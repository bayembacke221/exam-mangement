require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    // Lire le fichier de schéma
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');

    // Utiliser l'URL de connexion ou les paramètres individuels
    const useConnectionString = process.env.DATABASE_URL ? true : false;

    let pool;

    if (useConnectionString) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false // Important pour les connexions à Render
            }
        });
    } else {
        pool = new Pool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 5432,
            ssl: {
                rejectUnauthorized: false // Important pour les connexions à Render
            }
        });
    }

    try {
        const client = await pool.connect();
        console.log('Connecté à la base de données PostgreSQL. Initialisation du schéma...');

        // Exécuter le script de schéma
        await client.query(schemaSQL);
        console.log('Schéma initialisé avec succès !');

        // Créer un compte administrateur de test (facultatif)
        const bcrypt = require('bcryptjs'); // Utiliser bcryptjs au lieu de bcrypt
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await client.query(`
      INSERT INTO users (nom, prenom, email, mdp, role)
      VALUES ('Admin', 'System', 'admin@example.com', $1, 'enseignant')
      ON CONFLICT (email) DO NOTHING
    `, [hashedPassword]);

        console.log('Utilisateur administrateur créé ou déjà existant.');

        client.release();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de la base de données :', error);
    } finally {
        await pool.end();
    }
}

initDatabase();