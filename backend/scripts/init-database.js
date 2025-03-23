
require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs'); // Utilisez bcryptjs au lieu de bcrypt

// Lecture du fichier SQL qui contient le schéma de la base de données
const schemaSQL = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');

// Création d'un pool de connexion PostgreSQL pour initialiser la base de données
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function initDatabase() {
    let client;

    try {
        console.log('Connexion à PostgreSQL...');
        client = await pool.connect();

        // Vérification si la base de données existe déjà
        try {
            const dbName = process.env.DB_NAME || 'exam_management';
            console.log(`Vérification si la base de données ${dbName} existe...`);

            const dbExists = await client.query(
                "SELECT 1 FROM pg_database WHERE datname = $1",
                [dbName]
            );

            // Si la base n'existe pas, on la crée
            if (dbExists.rows.length === 0) {
                console.log(`Création de la base de données ${dbName}...`);
                // Déconnexion des utilisateurs existants pour pouvoir supprimer la base si nécessaire
                await client.query(`
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = $1
                    AND pid <> pg_backend_pid()
                `, [dbName]);

                await client.query(`CREATE DATABASE ${dbName}`);
                console.log(`Base de données ${dbName} créée avec succès.`);
            } else {
                console.log(`La base de données ${dbName} existe déjà.`);
            }
        } catch (err) {
            console.error('Erreur lors de la vérification/création de la base de données:', err);
        }

        // On ferme la connexion au pool initial
        client.release();

        // Reconnexion à la base de données spécifique
        const dbPool = new Pool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_NAME || 'exam_management',
            port: process.env.DB_PORT || 5432,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });

        console.log('Connexion à la base de données créée...');
        const dbClient = await dbPool.connect();

        // Exécution du script SQL de création des tables
        console.log('Création des tables...');
        await dbClient.query(schemaSQL);
        console.log('Tables créées avec succès!');

        // Création d'un utilisateur admin pour les tests
        console.log('Vérification de l\'existence d\'un utilisateur admin...');
        const adminExists = await dbClient.query("SELECT * FROM users WHERE email = 'admin@example.com'");

        if (adminExists.rows.length === 0) {
            console.log('Création d\'un utilisateur administrateur pour les tests...');
            const hashedPassword = await bcrypt.hash('admin123', 10);

            await dbClient.query(`
                INSERT INTO users (nom, prenom, email, mdp, role) 
                VALUES ('Admin', 'System', 'admin@example.com', $1, 'enseignant')
            `, [hashedPassword]);

            console.log('Utilisateur administrateur créé avec succès.');
        } else {
            console.log('L\'utilisateur administrateur existe déjà.');
        }

        // Libération de la connexion à la base de données
        dbClient.release();
        console.log('Initialisation de la base de données terminée avec succès!');

    } catch (err) {
        console.error('Erreur lors de l\'initialisation de la base de données:', err);
    } finally {
        // Fermeture du pool
        pool.end();
    }
}

// Exécution de la fonction d'initialisation
initDatabase();