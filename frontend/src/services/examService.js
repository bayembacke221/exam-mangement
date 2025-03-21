import api from './api';

const examService = {
    // Récupérer tous les examens
    getAllExams: async () => {
        const response = await api.get('/exams');
        return response.data;
    },

    // Récupérer un examen par son ID
    getExamById: async (id) => {
        const response = await api.get(`/exams/${id}`);
        return response.data;
    },

    // Créer un nouvel examen
    createExam: async (examData) => {
        // Utilisation de FormData pour l'upload de fichier
        const formData = new FormData();
        Object.keys(examData).forEach(key => {
            formData.append(key, examData[key]);
        });

        const response = await api.post('/exams', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Mettre à jour un examen
    updateExam: async (id, examData) => {
        // Utilisation de FormData pour l'upload de fichier
        const formData = new FormData();
        Object.keys(examData).forEach(key => {
            formData.append(key, examData[key]);
        });

        const response = await api.put(`/exams/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Supprimer un examen
    deleteExam: async (id) => {
        const response = await api.delete(`/exams/${id}`);
        return response.data;
    }
};

export default examService;
