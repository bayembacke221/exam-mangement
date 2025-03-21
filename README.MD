## Projet : Plateforme de gestion d'examens avec correction automatique par IA 

## Description
Ce projet consiste à développer une plateforme de gestion d'examens en ligne. Cette plateforme permettra aux enseignants de créer des examens et aux étudiants de les passer. Les examens seront composés de questions à choix multiples. Les étudiants pourront passer les examens en ligne et obtenir leur note automatiquement.
Il est réalisé en Node.js, Express.js, Mysql, React.js .

[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/en/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)](https://expressjs.com/)
[![Mysql](https://img.shields.io/badge/Mysql-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![React.js](https://img.shields.io/badge/React.js-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

## Architecture 
# Architecture du Projet

## Structure des Dossiers

```
project/
│
├── backend/
│   ├── config/
│   │   └── db.js                 # Configuration de la base de données
│   │
│   ├── controllers/
│   │   ├── authController.js     # Logique d'authentification
│   │   ├── examController.js     # Logique de gestion des examens
│   │   └── submissionController.js # Logique de gestion des soumissions
│   │
│   ├── middleware/
│   │   └── authMiddleware.js     # Middleware d'authentification
│   │
│   ├── routes/
│   │   ├── auth.js               # Routes d'authentification
│   │   ├── exams.js              # Routes pour les examens
│   │   └── submissions.js        # Routes pour les soumissions
│   │
│   ├── uploads/                  # Dossier pour les fichiers uploadés
│   │
│   ├── .env                      # Variables d'environnement
│   ├── package.json              # Dépendances du backend
│   └── server.js                 # Point d'entrée du serveur
│
├── frontend/
│   ├── public/
│   │   ├── index.html            # HTML principal
│   │   └── favicon.ico           # Favicon
│   │
│   ├── src/
│   │   ├── assets/               # Images, styles, etc.
│   │   │
│   │   ├── components/
│   │   │   ├── auth/             # Composants d'authentification
│   │   │   │   ├── Login.js      
│   │   │   │   └── Register.js  
│   │   │   │
│   │   │   ├── exams/            # Composants liés aux examens
│   │   │   │   ├── ExamList.js
│   │   │   │   ├── ExamForm.js
│   │   │   │   └── ExamDetail.js
│   │   │   │
│   │   │   ├── submissions/      # Composants liés aux soumissions
│   │   │   │
│   │   │   ├── layout/           # Composants de mise en page
│   │   │   │   ├── Header.js
│   │   │   │   ├── Footer.js
│   │   │   │   └── Sidebar.js
│   │   │   │
│   │   │   └── common/           # Composants réutilisables
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js    # Contexte d'authentification
│   │   │
│   │   ├── pages/                # Pages de l'application
│   │   │   ├── Home.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ExamManagement.js
│   │   │   └── SubmissionPage.js
│   │   │
│   │   ├── services/             # Services API
│   │   │   ├── api.js            # Configuration Axios
│   │   │   ├── authService.js    # Service d'authentification
│   │   │   ├── examService.js    # Service pour les examens
│   │   │   └── submissionService.js # Service pour les soumissions
│   │   │
│   │   ├── utils/                # Utilitaires
│   │   │   └── validation.js     # Validation des formulaires
│   │   │
│   │   ├── App.js                # Composant principal
│   │   ├── index.js              # Point d'entrée
│   │   └── routes.js             # Configuration des routes
│   │
│   ├── .env                      # Variables d'environnement frontend
│   └── package.json              # Dépendances du frontend
│
├── package.json                  # Script pour exécuter les deux parties
└── README.md                     # Documentation du projet
```

## Installation des dépendances
Pour installer les dépendances du backend et du frontend, exécutez la commande suivante à la racine du projet :

```bash
npm install
```

## Configuration de la base de données
Créez une base de données MySQL et ajoutez les informations de connexion dans un fichier `.env` à la racine du dossier backend; execute le script `db.sql` pour créer les tables.:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=projet
```

### Execution du projet
Pour exécuter le projet, exécutez la commande suivante à la racine du projet :

```bash
npm start
```



