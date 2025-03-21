import api from './api';

const aiService = {
    // Générer un corrigé type pour un examen
    generateExamCorrection: async (examId) => {
        const response = await api.post(`/ai/exams/${examId}/generate-correction`);
        return response.data;
    },

    // Récupérer un corrigé existant
    getExamCorrection: async (examId) => {
        try {
            const response = await api.get(`/exams/${examId}/correction`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Évaluer une soumission automatiquement
    evaluateSubmission: async (submissionId) => {
        const response = await api.post(`/ai/submissions/${submissionId}/evaluate`);
        return response.data;
    },

    // Soumettre la note finale (validée par l'enseignant)
    submitFinalGrade: async (submissionId, gradeData) => {
        const response = await api.put(`/submissions/${submissionId}/grade`, gradeData);
        return response.data;
    },

    // Vérifier le plagiat pour un examen
    checkPlagiarism: async (examId) => {
        const response = await api.post(`/ai/exams/${examId}/check-plagiarism`);
        return response.data;
    },

    // Récupérer les résultats de plagiat existants
    getPlagiarismResults: async (examId) => {
        try {
            const response = await api.get(`/exams/${examId}/plagiarism`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Poser une question au chatbot
    chatbotQuery: async (examId, question) => {
        const response = await api.post('/ai/chatbot', { examId, question });
        return response.data;
    },

    // Récupérer l'historique des conversations avec le chatbot
    getChatHistory: async (examId) => {
        try {
            const response = await api.get(`/exams/${examId}/chat-history`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Récupérer les statistiques générées par l'IA
    getExamStatistics: async (examId) => {
        const response = await api.get(`/exams/${examId}/statistics`);
        return response.data;
    }
};

export default aiService;