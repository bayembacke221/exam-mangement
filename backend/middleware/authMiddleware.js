const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ message: "Accès refusé! Authentification requise." });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(401).json({ message: "Token invalide ou expiré!" });
    }
};

// Middleware pour vérifier le rôle enseignant
const isTeacher = (req, res, next) => {
    if (req.user && req.user.role === 'enseignant') {
        next();
    } else {
        res.status(403).json({ message: "Accès refusé! Droits d'enseignant requis." });
    }
};

// Middleware pour vérifier le rôle étudiant
const isStudent = (req, res, next) => {
    if (req.user && req.user.role === 'etudiant') {
        next();
    } else {
        res.status(403).json({ message: "Accès refusé! Droits d'étudiant requis." });
    }
};

module.exports = { verifyToken, isTeacher, isStudent };