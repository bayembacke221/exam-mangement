require('dotenv').config();
const { Pool } = require('pg');

// Utiliser l'URL de connexion complète ou les paramètres individuels
const useConnectionString = process.env.DATABASE_URL ? true : false;

let pool;

if (useConnectionString) {
    // En production avec URL de connexion
    pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Important pour Render
        }
    });
} else {
    // En développement ou production avec paramètres individuels
    pool = new Pool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 5432,
        ssl: {
            rejectUnauthorized: false // Important pour Render
        }
    });
}

// Test de connexion au démarrage
(async () => {
    try {
        const client = await pool.connect();
        console.log("✅ Connecté à PostgreSQL !");
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
            const result = await pool.query(pgSql, params);
            return result;
        } catch (error) {
            console.error(`Erreur SQL: ${pgSql}`, error);
            throw error;
        }
    },
    query: async (sql, params) => {
        // Convertir les placeholders de MySQL (?) à PostgreSQL ($1, $2, etc.)
        const pgSql = convertToPostgresPlaceholders(sql);
        try {
            const result = await pool.query(pgSql, params);
            return result;
        } catch (error) {
            console.error(`Erreur SQL: ${pgSql}`, error);
            throw error;
        }
    },
    getConnection: async () => {
        return await pool.connect();
    }
};

// Fonction utilitaire pour convertir les placeholders MySQL (?) en PostgreSQL ($1, $2, etc.)
function convertToPostgresPlaceholders(sql) {
    let paramIndex = 0;
    return sql.replace(/\?/g, () => `$${++paramIndex}`);
}

module.exports = db;