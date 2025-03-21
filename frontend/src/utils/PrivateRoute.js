import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composant pour protéger les routes qui nécessitent une authentification
const PrivateRoute = () => {
    const { currentUser, loading } = useAuth();

    // Si encore en chargement, on peut afficher un spinner
    if (loading) {
        return <div className="text-center mt-5">Chargement...</div>;
    }

    // Si pas d'utilisateur connecté, rediriger vers la page de login
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Sinon, afficher le composant enfant
    return <Outlet />;
};

export default PrivateRoute;