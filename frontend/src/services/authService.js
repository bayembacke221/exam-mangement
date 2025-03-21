import api from './api';

const authService = {
    // Inscription
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // Connexion
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    // Déconnexion
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    // Vérifier si l'utilisateur est connecté
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Récupérer l'utilisateur courant
    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Vérifier si le token est valide
    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            authService.logout();
            return { valid: false };
        }
    },

    // Récupérer le profil complet
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    // Récupérer la liste des classes disponibles
    getClasses: async () => {
        const response = await api.get('/auth/classes');
        return response.data;
    }
};

export default authService;