-- Structure de la base de données pour le projet
-- MySQL/MariaDB

-- Table des utilisateurs
CREATE TABLE `users` (
                         `id` int(11) NOT NULL AUTO_INCREMENT,
                         `nom` varchar(100) NOT NULL,
                         `prenom` varchar(100) NOT NULL,
                         `email` varchar(100) NOT NULL UNIQUE,
                         `mdp` varchar(255) NOT NULL,
                         `classe` varchar(50) DEFAULT NULL,
                         `role` enum('etudiant', 'enseignant') NOT NULL,
                         `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des examens
CREATE TABLE `exams` (
                         `id` int(11) NOT NULL AUTO_INCREMENT,
                         `titre` varchar(255) NOT NULL,
                         `fichier_url` varchar(255) DEFAULT NULL,
                         `date_limite` datetime NOT NULL,
                         `description` text,
                         `statut` enum('brouillon', 'publié', 'terminé', 'archivé') NOT NULL DEFAULT 'brouillon',
                         `enseignant_id` int(11) NOT NULL,
                         `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                         PRIMARY KEY (`id`),
                         FOREIGN KEY (`enseignant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des soumissions (copies d'étudiants)
CREATE TABLE `soumissions` (
                               `id` int(11) NOT NULL AUTO_INCREMENT,
                               `etudiant_id` int(11) NOT NULL,
                               `examen_id` int(11) NOT NULL,
                               `fichier_url` varchar(255) NOT NULL,
                               `date_soumission` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               `note` float DEFAULT NULL,
                               `note_proposee` float DEFAULT NULL,
                               `commentaire` text,
                               `evaluation_auto` text,
                               `plagiat_flag` float DEFAULT 0, -- 0: pas de plagiat, 0.5: suspicion, 1: plagiat détecté
                               `plagiat_details` text,
                               PRIMARY KEY (`id`),
                               UNIQUE KEY `unique_submission` (`etudiant_id`, `examen_id`),
                               FOREIGN KEY (`etudiant_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                               FOREIGN KEY (`examen_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des corrections automatiques générées
CREATE TABLE `corrections` (
                               `id` int(11) NOT NULL AUTO_INCREMENT,
                               `examen_id` int(11) NOT NULL,
                               `correction_data` text NOT NULL,
                               `date_creation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                               PRIMARY KEY (`id`),
                               UNIQUE KEY `examen_id` (`examen_id`),
                               FOREIGN KEY (`examen_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des résultats de détection de plagiat
CREATE TABLE `plagiat_resultats` (
                                     `id` int(11) NOT NULL AUTO_INCREMENT,
                                     `examen_id` int(11) NOT NULL,
                                     `resultat_data` text NOT NULL,
                                     `date_verification` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                     PRIMARY KEY (`id`),
                                     UNIQUE KEY `examen_id` (`examen_id`),
                                     FOREIGN KEY (`examen_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des conversations avec le chatbot
CREATE TABLE `chatbot_conversations` (
                                         `id` int(11) NOT NULL AUTO_INCREMENT,
                                         `user_id` int(11) NOT NULL,
                                         `examen_id` int(11) NOT NULL,
                                         `question` text NOT NULL,
                                         `reponse` text NOT NULL,
                                         `date_conversation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                         PRIMARY KEY (`id`),
                                         FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
                                         FOREIGN KEY (`examen_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table des statistiques générées
CREATE TABLE `statistiques` (
                                `id` int(11) NOT NULL AUTO_INCREMENT,
                                `examen_id` int(11) NOT NULL,
                                `statistiques_data` text NOT NULL,
                                `date_generation` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `examen_id` (`examen_id`),
                                FOREIGN KEY (`examen_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;