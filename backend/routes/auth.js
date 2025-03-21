// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

// Route pour obtenir le profil de l'utilisateur connecté
router.get('/profile', verifyToken, authController.getProfile);

// Route pour vérifier si le token est valide
router.get('/verify', verifyToken, (req, res) => {
    res.status(200).json({
        valid: true,
        user: {
            id: req.user.id,
            role: req.user.role
        }
    });
});

router.get('/classes', async (req, res) => {
    try {
        const db = require('../config/db');
        const [classes] = await db.execute('SELECT DISTINCT classe FROM users WHERE classe IS NOT NULL AND classe != "" ORDER BY classe');

        console.log("Classes trouvées :", classes);

        // Si aucune classe valide n'est trouvée, renvoyer une liste par défaut
        if (classes.length === 0) {
            return res.json([
                'Licence 1 Informatique',
                'Licence 2 Informatique',
                'Licence 3 Informatique',
                'Master 1 Informatique',
                'Master 2 Informatique'
            ]);
        }

        res.json(classes.map(c => c.classe));
    } catch (error) {
        console.error("Erreur lors de la récupération des classes:", error);
        res.status(500).json(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2']);
    }
});

module.exports = router;