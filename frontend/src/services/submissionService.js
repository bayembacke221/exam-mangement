import api from './api';

const submissionService = {
    // Récupérer toutes les soumissions (pour les enseignants)
    getAllSubmissions: async () => {
        const response = await api.get('/submissions');
        return response.data;
    },

    // Récupérer les soumissions pour un examen spécifique
    getSubmissionsByExam: async (examId) => {
        const response = await api.get(`/submissions/exam/${examId}`);
        return response.data;
    },

    // Récupérer les soumissions de l'étudiant connecté
    getMySubmissions: async () => {
        const response = await api.get('/submissions/student');
        return response.data;
    },

    // Récupérer une soumission par ID
    getSubmissionById: async (id) => {
        const response = await api.get(`/submissions/${id}`);
        return response.data;
    },

    // Soumettre un examen
    submitExam: async (submissionData) => {
        // Utilisation de FormData pour l'upload de fichier
        const formData = new FormData();
        Object.keys(submissionData).forEach(key => {
            formData.append(key, submissionData[key]);
        });

        const response = await api.post('/submissions', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Noter une soumission
    gradeSubmission: async (id, gradeData) => {
        const response = await api.put(`/submissions/${id}/grade`, gradeData);
        return response.data;
    }
};

export default submissionService;