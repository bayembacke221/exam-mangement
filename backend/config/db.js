require('dotenv').config();
const { Pool } = require('pg');

// Création d'un pool de connexions PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'exam_management',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion au démarrage
(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connecté à PostgreSQL !");
        console.log("Base de données:", process.env.DB_NAME || 'exam_management');
        client.release();
    } catch (error) {
        console.error("❌ Erreur de connexion à PostgreSQL :", error);
    }
})();

// Wrapper pour les requêtes SQL
const db = {
    execute: async (sql, params) => {
        // Convertir les placeholders de MySQL (?) à PostgreSQL ($1, $2, etc.)
        const pgSql = convertToPostgresPlaceholders(sql);
        try {
            return await pool.query(pgSql, params);
        } catch (error) {
            console.error(`Erreur SQL: ${pgSql}`, error);
            throw error;
        }
    },
    query: async (sql, params) => {
        // Convertir les placeholders de MySQL (?) à PostgreSQL ($1, $2, etc.)
        const pgSql = convertToPostgresPlaceholders(sql);
        try {
            return await pool.query(pgSql, params);
        } catch (error) {
            console.error(`Erreur SQL: ${pgSql}`, error);
            throw error;
        }
    },
    getConnection: async () => {
        return await pool.connect();
    },
    pool: pool // Exposer l'objet pool directement
};

// Fonction utilitaire pour convertir les placeholders MySQL (?) en PostgreSQL ($1, $2, etc.)
function convertToPostgresPlaceholders(sql) {
    let paramIndex = 0;
    return sql.replace(/\?/g, () => `$${++paramIndex}`);
}
// Ajouter ce code dans server.js juste après l'importation de db
const createTablesIfNotExist = async () => {
    try {
        // Vérifier si la table users existe
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public'
                AND table_name = 'users'
            )
        `);

        const tableExists = checkTable.rows[0].exists;

        if (!tableExists) {
            console.log("La table 'users' n'existe pas, création en cours...");

            // Créer la table users
            await db.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    nom VARCHAR(100) NOT NULL,
                    prenom VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL UNIQUE,
                    mdp VARCHAR(255) NOT NULL,
                    classe VARCHAR(50),
                    role VARCHAR(20) NOT NULL CHECK (role IN ('etudiant', 'enseignant')),
                    date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                )
            `);

            console.log("Table 'users' créée avec succès!");
        } else {
            console.log("La table 'users' existe déjà.");
        }
    } catch (error) {
        console.error("Erreur lors de la vérification/création des tables:", error);
    }
};

createTablesIfNotExist();
module.exports = db;