const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { verifyToken, isTeacher, isStudent } = require('../middleware/authMiddleware');

// Route pour générer un corrigé type pour un examen
router.post('/exams/:id/generate-correction', verifyToken, isTeacher, aiController.generateExamCorrection);

// Route pour évaluer automatiquement une soumission
router.post('/submissions/:id/evaluate', verifyToken, isTeacher, aiController.evaluateSubmission);

// Route pour vérifier le plagiat pour un examen
router.post('/exams/:id/check-plagiarism', verifyToken, isTeacher, aiController.checkPlagiarism);

// Route pour le chatbot d'assistance
router.post('/chatbot', verifyToken, aiController.chatbotQuery);

module.exports = router;