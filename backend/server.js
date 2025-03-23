require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes import
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const submissionRoutes = require('./routes/submissions');
const aiRoutes = require('./routes/ai');

const app = express();

// Liste des origines autorisées
const allowedOrigins = [
    'http://localhost:3000',                                         // Développement local
    'https://exam-mangement.vercel.app',                             // Vercel production
];

// Middleware CORS avec configuration des origines
app.use(cors({
    origin: function(origin, callback) {
        // Permettre les requêtes sans origine (comme les applications mobiles ou postman)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('Origine non autorisée:', origin);
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.json());

// Static files middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/ai', aiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Une erreur est survenue sur le serveur",
        message: err.message
    });
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur en cours d'exécution sur : http://localhost:${PORT}`));