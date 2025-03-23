-- Structure de la base de données pour le projet d'examen
-- Version PostgreSQL

-- Supprime les tables si elles existent déjà (pour réinitialiser)
DROP TABLE IF EXISTS statistiques CASCADE;
DROP TABLE IF EXISTS chatbot_conversations CASCADE;
DROP TABLE IF EXISTS plagiat_resultats CASCADE;
DROP TABLE IF EXISTS corrections CASCADE;
DROP TABLE IF EXISTS soumissions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table des utilisateurs
CREATE TABLE users (
                       id SERIAL PRIMARY KEY,
                       nom VARCHAR(100) NOT NULL,
                       prenom VARCHAR(100) NOT NULL,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       mdp VARCHAR(255) NOT NULL,
                       classe VARCHAR(50),
                       role VARCHAR(20) NOT NULL CHECK (role IN ('etudiant', 'enseignant')),
                       date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des examens
CREATE TABLE exams (
                       id SERIAL PRIMARY KEY,
                       titre VARCHAR(255) NOT NULL,
                       fichier_url VARCHAR(255),
                       date_limite TIMESTAMP NOT NULL,
                       description TEXT,
                       statut VARCHAR(20) NOT NULL CHECK (statut IN ('brouillon', 'publié', 'terminé', 'archivé')) DEFAULT 'brouillon',
                       enseignant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                       date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des soumissions (copies d'étudiants)
CREATE TABLE soumissions (
                             id SERIAL PRIMARY KEY,
                             etudiant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                             examen_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                             fichier_url VARCHAR(255) NOT NULL,
                             date_soumission TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             note FLOAT,
                             note_proposee FLOAT,
                             commentaire TEXT,
                             evaluation_auto TEXT,
                             plagiat_flag FLOAT DEFAULT 0,
                             plagiat_details TEXT,
                             UNIQUE(etudiant_id, examen_id)
);

-- Table des corrections automatiques générées
CREATE TABLE corrections (
                             id SERIAL PRIMARY KEY,
                             examen_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                             correction_data TEXT NOT NULL,
                             date_creation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                             UNIQUE(examen_id)
);

-- Table des résultats de détection de plagiat
CREATE TABLE plagiat_resultats (
                                   id SERIAL PRIMARY KEY,
                                   examen_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                                   resultat_data TEXT NOT NULL,
                                   date_verification TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                   UNIQUE(examen_id)
);

-- Table des conversations avec le chatbot
CREATE TABLE chatbot_conversations (
                                       id SERIAL PRIMARY KEY,
                                       user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                                       examen_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                                       question TEXT NOT NULL,
                                       reponse TEXT NOT NULL,
                                       date_conversation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Table des statistiques générées
CREATE TABLE statistiques (
                              id SERIAL PRIMARY KEY,
                              examen_id INTEGER NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
                              statistiques_data TEXT NOT NULL,
                              date_generation TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                              UNIQUE(examen_id)
);

-- Création d'index pour améliorer les performances
CREATE INDEX idx_exams_enseignant ON exams(enseignant_id);
CREATE INDEX idx_soumissions_etudiant ON soumissions(etudiant_id);
CREATE INDEX idx_soumissions_examen ON soumissions(examen_id);