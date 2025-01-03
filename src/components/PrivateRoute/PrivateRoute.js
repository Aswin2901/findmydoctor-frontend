import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Use your AuthContext

const PrivateRoute = ({ children }) => {
    const { auth } = useAuth();

    // Check if the user is authenticated
    const isAuthenticated = !!auth.accessToken;

    return isAuthenticated ? children : <Navigate to="/" />;
};

export default PrivateRoute;