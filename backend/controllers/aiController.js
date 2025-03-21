const OllamaService = require('../services/ollamaService');
const db = require('../config/db');
const path = require('path');
const fs = require('fs');

/**
 * Contrôleur pour les fonctionnalités d'IA (correction automatique, plagiat, etc.)
 */
exports.generateExamCorrection = async (req, res) => {
    try {
        const examId = req.params.id;

        // Vérifier que l'examen existe et que l'enseignant est autorisé
        const [exams] = await db.execute(
            "SELECT * FROM exams WHERE id = ? AND enseignant_id = ?",
            [examId, req.user.id]
        );

        if (exams.length === 0) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à corriger cet examen" });
        }

        const exam = exams[0];

        // Vérifier que le fichier d'examen existe
        if (!exam.fichier_url) {
            return res.status(400).json({ error: "Aucun fichier d'examen trouvé" });
        }

        // Chemin complet vers le fichier d'examen
        const examFilePath = path.join(__dirname, '..', exam.fichier_url);

        // Vérifier si un corrigé existe déjà
        const [corrections] = await db.execute(
            "SELECT * FROM corrections WHERE examen_id = ?",
            [examId]
        );

        let correctionData;

        if (corrections.length > 0) {
            // Utiliser le corrigé existant
            correctionData = JSON.parse(corrections[0].correction_data);
            return res.json({
                message: "Un corrigé existe déjà pour cet examen",
                correction: correctionData
            });
        }

        // Générer un nouveau corrigé
        const correctionResult = await OllamaService.analyzeExam(examFilePath);

        // Enregistrer le corrigé dans la base de données
        await db.execute(
            "INSERT INTO corrections (examen_id, correction_data, date_creation) VALUES (?, ?, NOW())",
            [examId, JSON.stringify(correctionResult)]
        );

        res.status(201).json({
            message: "Corrigé généré avec succès",
            correction: correctionResult
        });
    } catch (error) {
        console.error("Erreur lors de la génération du corrigé:", error);
        res.status(500).json({ error: "Erreur lors de la génération du corrigé" });
    }
};

exports.evaluateSubmission = async (req, res) => {
    try {
        const submissionId = req.params.id;

        // Vérifier que la soumission existe et que l'enseignant est autorisé
        const [submissions] = await db.execute(
            "SELECT s.*, e.enseignant_id, e.id as examen_id FROM soumissions s " +
            "JOIN exams e ON s.examen_id = e.id " +
            "WHERE s.id = ?",
            [submissionId]
        );

        if (submissions.length === 0) {
            return res.status(404).json({ error: "Soumission non trouvée" });
        }

        const submission = submissions[0];

        if (submission.enseignant_id !== req.user.id) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à évaluer cette soumission" });
        }

        // Vérifier que le fichier de soumission existe
        if (!submission.fichier_url) {
            return res.status(400).json({ error: "Aucun fichier de soumission trouvé" });
        }

        // Vérifier si une évaluation automatique existe déjà
        if (submission.evaluation_auto) {
            const evaluationData = JSON.parse(submission.evaluation_auto);
            return res.json({
                message: "Une évaluation automatique existe déjà pour cette soumission",
                evaluation: evaluationData
            });
        }

        // Récupérer le corrigé type
        const [corrections] = await db.execute(
            "SELECT * FROM corrections WHERE examen_id = ?",
            [submission.examen_id]
        );

        if (corrections.length === 0) {
            // Aucun corrigé trouvé, il faut d'abord en générer un
            return res.status(400).json({
                error: "Aucun corrigé n'existe pour cet examen",
                needsCorrection: true,
                examId: submission.examen_id
            });
        }

        const correctionData = JSON.parse(corrections[0].correction_data);

        // Chemin complet vers le fichier de soumission
        const submissionFilePath = path.join(__dirname, '..', submission.fichier_url);

        // Évaluer la soumission
        const evaluationResult = await OllamaService.evaluateSubmission(submissionFilePath, correctionData);

        // Enregistrer l'évaluation dans la base de données
        await db.execute(
            "UPDATE soumissions SET evaluation_auto = ?, note_proposee = ? WHERE id = ?",
            [JSON.stringify(evaluationResult), evaluationResult.note_finale, submissionId]
        );

        res.json({
            message: "Évaluation automatique générée avec succès",
            evaluation: evaluationResult
        });
    } catch (error) {
        console.error("Erreur lors de l'évaluation automatique:", error);
        res.status(500).json({ error: "Erreur lors de l'évaluation automatique" });
    }
};

exports.checkPlagiarism = async (req, res) => {
    try {
        const examId = req.params.id;

        // Vérifier que l'examen existe et que l'enseignant est autorisé
        const [exams] = await db.execute(
            "SELECT * FROM exams WHERE id = ? AND enseignant_id = ?",
            [examId, req.user.id]
        );

        if (exams.length === 0) {
            return res.status(403).json({ error: "Vous n'êtes pas autorisé à vérifier le plagiat pour cet examen" });
        }

        // Récupérer toutes les soumissions pour cet examen
        const [submissions] = await db.execute(
            "SELECT s.*, u.nom, u.prenom FROM soumissions s " +
            "JOIN users u ON s.etudiant_id = u.id " +
            "WHERE s.examen_id = ?",
            [examId]
        );

        if (submissions.length < 2) {
            return res.status(400).json({ error: "Il faut au moins 2 soumissions pour détecter le plagiat" });
        }

        // Construire un prompt pour Ollama pour vérifier le plagiat
        const submissionsContent = await Promise.all(
            submissions.map(async (submission) => {
                try {
                    const filePath = path.join(__dirname, '..', submission.fichier_url);
                    let content;

                    if (path.extname(filePath).toLowerCase() === '.pdf') {
                        content = await OllamaService.extractTextFromPDF(filePath);
                    } else {
                        content = fs.readFileSync(filePath, 'utf8');
                    }

                    return {
                        id: submission.id,
                        student: `${submission.prenom} ${submission.nom}`,
                        content: content
                    };
                } catch (error) {
                    console.error(`Erreur lors de la lecture du fichier pour la soumission ${submission.id}:`, error);
                    return {
                        id: submission.id,
                        student: `${submission.prenom} ${submission.nom}`,
                        content: "Erreur lors de la lecture du fichier"
                    };
                }
            })
        );

        // Prompt pour détecter le plagiat
        const plagiarismPrompt = `
Tu es un système de détection de plagiat pour des examens.
Voici les copies de ${submissions.length} étudiants pour le même examen.
Analyse ces copies et identifie les similarités suspectes qui pourraient indiquer du plagiat.

${submissionsContent.map((sub, index) =>
            `ÉTUDIANT ${index + 1}: ${sub.student} (ID: ${sub.id})
    ${sub.content.substring(0, 2000)} ${sub.content.length > 2000 ? '...' : ''}`
        ).join('\n\n')}

Réponds au format JSON avec:
1. Une matrice de similarité entre chaque paire de copies (pourcentage)
2. Les passages spécifiques qui semblent copiés
3. Une évaluation globale du risque de plagiat pour chaque étudiant

Format de réponse:
{
  "matrice_similarite": [
    [étudiant1_id, étudiant2_id, pourcentage_similarite],
    ...
  ],
  "passages_suspects": [
    {
      "etudiants": [id1, id2],
      "texte": "passage suspect...",
      "confiance": pourcentage
    },
    ...
  ],
  "evaluation_risque": [
    {"etudiant_id": id, "risque": "élevé/moyen/faible", "justification": "..."},
    ...
  ]
}
`;

        // Interroger Ollama pour la détection de plagiat
        const plagiarismResponse = await OllamaService.query(plagiarismPrompt);

        // Extraire le JSON de la réponse
        const jsonMatch = plagiarismResponse.match(/```json\n([\s\S]*?)\n```/) ||
            plagiarismResponse.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            throw new Error('Impossible d\'extraire le JSON de la réponse du modèle');
        }

        // Nettoyer et parser le JSON
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        const plagiarismResult = JSON.parse(jsonStr);

        // Enregistrer les résultats dans la base de données
        await db.execute(
            "INSERT INTO plagiat_resultats (examen_id, resultat_data, date_verification) VALUES (?, ?, NOW()) " +
            "ON DUPLICATE KEY UPDATE resultat_data = ?, date_verification = NOW()",
            [examId, JSON.stringify(plagiarismResult), JSON.stringify(plagiarismResult)]
        );

        // Mettre à jour les drapeaux de plagiat dans les soumissions
        for (const eval of plagiarismResult.evaluation_risque) {
            const riskLevel = eval.risque.toLowerCase();
            const plagiatFlag = riskLevel === 'élevé' ? 1 : (riskLevel === 'moyen' ? 0.5 : 0);

            await db.execute(
                "UPDATE soumissions SET plagiat_flag = ?, plagiat_details = ? WHERE id = ?",
                [plagiatFlag, eval.justification, eval.etudiant_id]
            );
        }

        res.json({
            message: "Analyse de plagiat effectuée avec succès",
            result: plagiarismResult
        });
    } catch (error) {
        console.error("Erreur lors de la détection de plagiat:", error);
        res.status(500).json({ error: "Erreur lors de la détection de plagiat" });
    }
};

// Répondre aux questions via un chatbot
exports.chatbotQuery = async (req, res) => {
    try {
        const { examId, question } = req.body;

        // Vérifier si l'examen existe
        const [exams] = await db.execute("SELECT * FROM exams WHERE id = ?", [examId]);

        if (exams.length === 0) {
            return res.status(404).json({ error: "Examen non trouvé" });
        }

        const exam = exams[0];

        // Récupérer le corrigé s'il existe
        const [corrections] = await db.execute(
            "SELECT * FROM corrections WHERE examen_id = ?",
            [examId]
        );

        let correctionData = null;
        if (corrections.length > 0) {
            correctionData = JSON.parse(corrections[0].correction_data);
        }

        // Construire un prompt pour le chatbot
        let chatbotPrompt = `
Tu es un assistant pédagogique qui aide les étudiants à comprendre leurs examens.
Un étudiant te pose la question suivante à propos d'un examen:

"${question}"

`;

        // Ajouter le sujet et le corrigé si disponibles
        if (exam.fichier_url) {
            try {
                const examFilePath = path.join(__dirname, '..', exam.fichier_url);
                let examContent;

                if (path.extname(examFilePath).toLowerCase() === '.pdf') {
                    examContent = await OllamaService.extractTextFromPDF(examFilePath);
                } else {
                    examContent = fs.readFileSync(examFilePath, 'utf8');
                }

                chatbotPrompt += `
Voici le sujet de l'examen:
${examContent}
`;
            } catch (error) {
                console.error("Erreur lors de la lecture du sujet d'examen:", error);
            }
        }

        if (correctionData) {
            chatbotPrompt += `
Voici des éléments du corrigé que tu peux utiliser pour guider l'étudiant (sans donner directement les réponses):
Concepts clés: ${correctionData.concepts_cles.join(', ')}
Critères d'évaluation: ${JSON.stringify(correctionData.criteres_evaluation)}
`;
        }

        chatbotPrompt += `
IMPORTANT: Ne donne pas directement les réponses aux questions de l'examen.
Aide l'étudiant à comprendre le sujet et à trouver la réponse par lui-même.
Donne des indications, des explications sur les concepts, ou des exemples similaires.
`;

        // Interroger Ollama pour obtenir une réponse
        const chatbotResponse = await OllamaService.query(chatbotPrompt);

        // Enregistrer la conversation
        await db.execute(
            "INSERT INTO chatbot_conversations (user_id, examen_id, question, reponse, date_conversation) VALUES (?, ?, ?, ?, NOW())",
            [req.user.id, examId, question, chatbotResponse]
        );

        res.json({ response: chatbotResponse });
    } catch (error) {
        console.error("Erreur lors de la communication avec le chatbot:", error);
        res.status(500).json({ error: "Erreur lors de la communication avec le chatbot" });
    }
};