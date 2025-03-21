const db = require('../config/db');
const path = require('path');
const fs = require('fs');

// Obtenir toutes les soumissions (pour les enseignants)
exports.getAllSubmissions = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est un enseignant
        if (req.user.role !== 'enseignant') {
            return res.status(403).json({ error: "Accès non autorisé" });
        }

        const [submissions] = await db.execute(
            "SELECT s.*, u.nom as etudiant_nom, u.prenom as etudiant_prenom, " +
            "e.titre as exam_titre FROM soumissions s " +
            "JOIN users u ON s.etudiant_id = u.id " +
            "JOIN exams e ON s.examen_id = e.id " +
            "WHERE e.enseignant_id = ? " +
            "ORDER BY s.date_soumission DESC",
            [req.user.id]
        );

        res.json(submissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des soumissions:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Obtenir les soumissions pour un examen spécifique
exports.getSubmissionsByExam = async (req, res) => {
    try {
        const examId = req.params.examId;

        // Vérifier si l'utilisateur est autorisé à voir les soumissions
        if (req.user.role === 'enseignant') {
            const [exams] = await db.execute(
                "SELECT * FROM exams WHERE id = ? AND enseignant_id = ?",
                [examId, req.user.id]
            );

            if (exams.length === 0) {
                return res.status(403).json({ error: "Vous n'êtes pas autorisé à voir ces soumissions" });
            }

            const [submissions] = await db.execute(
                "SELECT s.*, u.nom as etudiant_nom, u.prenom as etudiant_prenom FROM soumissions s " +
                "JOIN users u ON s.etudiant_id = u.id " +
                "WHERE s.examen_id = ? " +
                "ORDER BY s.date_soumission DESC",
                [examId]
            );

            res.json(submissions);
        } else {
            // Pour les étudiants, on ne renvoie que leurs propres soumissions
            const [submissions] = await db.execute(
                "SELECT s.* FROM soumissions s " +
                "WHERE s.examen_id = ? AND s.etudiant_id = ? " +
                "ORDER BY s.date_soumission DESC",
                [examId, req.user.id]
            );

            res.json(submissions);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des soumissions:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Obtenir les soumissions de l'étudiant connecté
exports.getMySubmissions = async (req, res) => {
    try {
        const [submissions] = await db.execute(
            "SELECT s.*, e.titre as exam_titre, e.date_limite FROM soumissions s " +
            "JOIN exams e ON s.examen_id = e.id " +
            "WHERE s.etudiant_id = ? " +
            "ORDER BY s.date_soumission DESC",
            [req.user.id]
        );

        res.json(submissions);
    } catch (error) {
        console.error("Erreur lors de la récupération des soumissions:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Soumettre un examen
exports.submitExam = async (req, res) => {
    try {
        const { examen_id } = req.body;
        const etudiant_id = req.user.id;

        // Vérifier si l'examen existe et est publié
        const [exams] = await db.execute(
            "SELECT * FROM exams WHERE id = ? AND statut = 'publié'",
            [examen_id]
        );

        if (exams.length === 0) {
            return res.status(404).json({ error: "Examen non trouvé ou non disponible" });
        }

        // Vérifier si la date limite est dépassée
        const exam = exams[0];
        const dateLimit = new Date(exam.date_limite);
        const now = new Date();

        if (now > dateLimit) {
            return res.status(400).json({ error: "La date limite de soumission est dépassée" });
        }

        // Vérifier si l'étudiant a déjà soumis une copie
        const [existingSubmissions] = await db.execute(
            "SELECT * FROM soumissions WHERE etudiant_id = ? AND examen_id = ?",
            [etudiant_id, examen_id]
        );

        if (existingSubmissions.length > 0) {
            return res.status(400).json({ error: "Vous avez déjà soumis une copie pour cet examen" });
        }

        // Enregistrer la soumission
        const fichier_url = req.file ? `/uploads/submissions/${req.file.filename}` : null;

        if (!fichier_url) {
            return res.status(400).json({ error: "Aucun fichier n'a été fourni" });
        }

        await db.execute(
            "INSERT INTO soumissions (etudiant_id, examen_id, fichier_url, date_soumission) VALUES (?, ?, ?, NOW())",
            [etudiant_id, examen_id, fichier_url]
        );

        res.status(201).json({ message: "Copie soumise avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la soumission de la copie :", error);
        res.status(500).json({ error: "Erreur interne du serveur" });
    }
};

// Obtenir une soumission par ID
exports.getSubmissionById = async (req, res) => {
    try {
        const submissionId = req.params.id;

        const [submissions] = await db.execute(
            "SELECT s.*, u.nom as etudiant_nom, u.prenom as etudiant_prenom, " +
            "e.titre as exam_titre, e.enseignant_id FROM soumissions s " +
            "JOIN users u ON s.etudiant_id = u.id " +
            "JOIN exams e ON s.examen_id = e.id " +
            "WHERE s.id = ?",
            [submissionId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({ error: "Soumission non trouvée" });
        }

        const submission = submissions[0];

        // Vérifier les droits d'accès
        if (req.user.role === 'etudiant' && submission.etudiant_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé à cette soumission" });
        }

        if (req.user.role === 'enseignant' && submission.enseignant_id !== req.user.id) {
            return res.status(403).json({ error: "Accès non autorisé à cette soumission" });
        }

        res.json(submission);
    } catch (error) {
        console.error("Erreur lors de la récupération de la soumission:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Noter une soumission
exports.gradeSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;
        const { note, commentaire } = req.body;

        // Vérifier que la soumission existe et que l'enseignant est autorisé
        const [submissions] = await db.execute(
            "SELECT s.*, e.enseignant_id FROM soumissions s " +
            "JOIN exams e ON s.examen_id = e.id " +
            "WHERE s.id = ?",
            [submissionId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({ error: "Soumission non trouvée" });
        }

        const submission = submissions[0];

        if (submission.enseignant_id !== req.user.id) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à noter cette soumission" });
        }

        // Mettre à jour la note
        await db.execute(
            "UPDATE soumissions SET note = ?, commentaire = ? WHERE id = ?",
            [note, commentaire, submissionId]
        );

        res.json({ message: "Soumission notée avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la notation de la soumission:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};