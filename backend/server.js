require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Routes import
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exams');
const submissionRoutes = require('./routes/submissions');
const aiRoutes = require('./routes/ai');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
// Accédez au pool via db.pool
db.pool.query('SELECT current_database(), current_schema()', (err, res) => {
    if (err) {
        console.error('Erreur de vérification de la base de données:', err);
    } else {
        console.log('Base de données actuelle:', res.rows[0]);
    }
});
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
