const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const { verifyToken, isStudent, isTeacher } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuration de Multer pour les fichiers de soumission
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/submissions');
    },
    filename: (req, file, cb) => {
        cb(null, `submission-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// Routes pour les soumissions
router.get('/', verifyToken, submissionController.getAllSubmissions);
router.get('/exam/:examId', verifyToken, submissionController.getSubmissionsByExam);
router.get('/student', verifyToken, isStudent, submissionController.getMySubmissions);
router.post('/', verifyToken, isStudent, upload.single('fichier_url'), submissionController.submitExam);
router.get('/:id', verifyToken, submissionController.getSubmissionById);
router.put('/:id/grade', verifyToken, isTeacher, submissionController.gradeSubmission);

module.exports = router;