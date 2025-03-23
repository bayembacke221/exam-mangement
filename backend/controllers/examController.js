const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// Obtenir tous les examens
exports.getAllExams = async (req, res) => {
    try {
        let query = "SELECT e.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom FROM exams e ";
        query += "JOIN users u ON e.enseignant_id = u.id ";

        // Filtrer les examens en fonction du rôle
        if (req.user.role === 'etudiant') {
            query += "WHERE e.statut = 'publié' ";
        }

        query += "ORDER BY e.date_limite DESC";

        const { rows } = await db.execute(query);
        res.json(rows);
    } catch (error) {
        console.error("Erreur lors de la récupération des examens:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Obtenir un examen par ID
exports.getExamById = async (req, res) => {
    try {
        const examId = req.params.id;

        const { rows } = await db.execute(
            "SELECT e.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom FROM exams e " +
            "JOIN users u ON e.enseignant_id = u.id " +
            "WHERE e.id = $1",
            [examId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Examen non trouvé" });
        }

        const exam = rows[0];

        // Vérifier les droits d'accès
        if (req.user.role === 'etudiant' && exam.statut !== 'publié') {
            return res.status(403).json({ error: "Accès non autorisé à cet examen" });
        }

        res.json(exam);
    } catch (error) {
        console.error("Erreur lors de la récupération de l'examen:", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Créer un nouvel examen
exports.createExam = async (req, res) => {
    const { titre, date_limite, description, statut } = req.body;
    const enseignant_id = req.user.id;
    const fichier_url = req.file ? `/uploads/exams/${req.file.filename}` : null;

    try {
        const sql = "INSERT INTO exams (titre, fichier_url, date_limite, description, statut, enseignant_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
        const result = await db.execute(sql, [titre, fichier_url, date_limite, description, statut, enseignant_id]);

        res.status(201).json({
            message: "Examen créé avec succès !",
            id: result.rows[0].id
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'examen :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Mettre à jour un examen
exports.updateExam = async (req, res) => {
    const examId = req.params.id;
    const { titre, date_limite, description, statut } = req.body;

    try {
        // Vérifier que l'enseignant est bien le créateur de l'examen
        const { rows } = await db.execute(
            "SELECT * FROM exams WHERE id = $1 AND enseignant_id = $2",
            [examId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à modifier cet examen" });
        }

        const exam = rows[0];
        let fichier_url = exam.fichier_url;

        // Si un nouveau fichier est fourni, supprimer l'ancien et utiliser le nouveau
        if (req.file) {
            if (exam.fichier_url) {
                const oldFilePath = path.join(__dirname, '..', exam.fichier_url);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }
            fichier_url = `/uploads/exams/${req.file.filename}`;
        }

        // Mettre à jour l'examen
        await db.execute(
            "UPDATE exams SET titre = $1, fichier_url = $2, date_limite = $3, description = $4, statut = $5 WHERE id = $6",
            [titre, fichier_url, date_limite, description, statut, examId]
        );

        res.json({ message: "Examen mis à jour avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'examen :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

// Supprimer un examen
exports.deleteExam = async (req, res) => {
    const examId = req.params.id;

    try {
        // Vérifier que l'enseignant est bien le créateur de l'examen
        const { rows } = await db.execute(
            "SELECT * FROM exams WHERE id = $1 AND enseignant_id = $2",
            [examId, req.user.id]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à supprimer cet examen" });
        }

        const exam = rows[0];

        // Supprimer le fichier associé s'il existe
        if (exam.fichier_url) {
            const filePath = path.join(__dirname, '..', exam.fichier_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        // Supprimer l'examen
        await db.execute("DELETE FROM exams WHERE id = $1", [examId]);

        res.json({ message: "Examen supprimé avec succès !" });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'examen :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};