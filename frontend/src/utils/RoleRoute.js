import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Composant pour protéger les routes en fonction du rôle
const RoleRoute = ({ allowedRoles }) => {
    const { currentUser, loading } = useAuth();

    // Si encore en chargement, on peut afficher un spinner
    if (loading) {
        return <div className="text-center mt-5">Chargement...</div>;
    }

    // Si pas d'utilisateur connecté, rediriger vers la page de login
    if (!currentUser) {
        return <Navigate to="/login" />;
    }

    // Si l'utilisateur n'a pas le rôle requis, rediriger vers une page d'accès refusé
    if (!allowedRoles.includes(currentUser.role)) {
        return <Navigate to="/access-denied" />;
    }

    // Sinon, afficher le composant enfant
    return <Outlet />;
};

export default RoleRoute;