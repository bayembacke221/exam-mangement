const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { verifyToken, isTeacher } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour les fichiers d'examens
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/exams');
    },
    filename: (req, file, cb) => {
        cb(null, `exam-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Routes pour les examens
router.get('/', verifyToken, examController.getAllExams);
router.get('/:id', verifyToken, examController.getExamById);
router.post('/', verifyToken, isTeacher, upload.single('fichier'), examController.createExam);
router.put('/:id', verifyToken, isTeacher, upload.single('fichier'), examController.updateExam);
router.delete('/:id', verifyToken, isTeacher, examController.deleteExam);

module.exports = router;