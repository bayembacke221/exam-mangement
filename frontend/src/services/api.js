import axios from 'axios';

// Déterminer dynamiquement l'URL de l'API basée sur l'environnement
const getApiUrl = () => {
    // Environnement de production (Vercel)
    if (process.env.NODE_ENV === 'production') {
        return 'https://exam-mangement.onrender.com/api';
    }
    // Environnement de développement local
    return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

// Création de l'instance axios avec la config de base
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important pour les cookies CORS
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si l'erreur est 401 Unauthorized, rediriger vers la page de login
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;