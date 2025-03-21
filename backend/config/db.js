require('dotenv').config();
const mysql = require('mysql2/promise');

// Création d'un pool de connexions MySQL pour une meilleure gestion des ressources
const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "Projet",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion au démarrage
(async () => {
    try {
        const connection = await pool.getConnection();
        console.log("✅ Connecté à MySQL !");
        connection.release();
    } catch (error) {
        console.error("❌ Erreur de connexion à MySQL :", error);
    }
})();

// Wrapper pour les requêtes SQL
const db = {
    execute: async (sql, params) => {
        try {
            return await pool.execute(sql, params);
        } catch (error) {
            console.error(`Erreur SQL: ${sql}`, error);
            throw error;
        }
    },
    query: async (sql, params) => {
        try {
            return await pool.query(sql, params);
        } catch (error) {
            console.error(`Erreur SQL: ${sql}`, error);
            throw error;
        }
    },
    getConnection: async () => {
        return await pool.getConnection();
    }
};

module.exports = db;