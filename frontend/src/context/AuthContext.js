import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Essayer de récupérer l'utilisateur depuis le localStorage
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }

        // Vérifier si le token est valide
        const verifyToken = async () => {
            try {
                const result = await authService.verifyToken();
                if (!result.valid) {
                    logout();
                }
            } catch (error) {
                logout();
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const data = await authService.login(credentials);
            setCurrentUser(data.user);
            return data;
        } catch (error) {
            setError(error.response?.data?.error || 'Une erreur est survenue lors de la connexion');
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const data = await authService.register(userData);
            return data;
        } catch (error) {
            setError(error.response?.data?.error || 'Une erreur est survenue lors de l\'inscription');
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading,
        error
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé avec AuthProvider');
    }
    return context;
};