const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription d'un utilisateur
exports.register = async (req, res) => {
    const { nom, prenom, email, mdp, classe, role } = req.body;

    try {
        // Vérifier si l'utilisateur existe déjà
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé.' });
        }

        // Hasher le mot de passe
        const hashedMdp = await bcrypt.hash(mdp, 10);

        // Insérer l'utilisateur dans la base de données
        await db.execute(
            'INSERT INTO users (nom, prenom, email, mdp, classe, role) VALUES (?, ?, ?, ?, ?, ?)',
            [nom, prenom, email, hashedMdp, classe, role]
        );

        res.status(201).json({ message: 'Utilisateur enregistré avec succès !' });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
    const { email, mdp } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(400).json({ error: "Utilisateur non trouvé !" });

        const user = rows[0];
        const validPass = await bcrypt.compare(mdp, user.mdp);
        if (!validPass) return res.status(400).json({ error: "Mot de passe incorrect !" });

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Retirer le mot de passe avant d'envoyer l'utilisateur
        const { mdp: password, ...userWithoutPassword } = user;

        res.json({ token, user: userWithoutPassword });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, nom, prenom, email, classe, role FROM users WHERE id = ?', [req.user.id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Erreur lors de la récupération du profil :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};