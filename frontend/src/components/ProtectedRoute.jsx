// src/components/ProtectedRoute.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const { token } = useAuth(); // <-- 1. เปลี่ยนเป็นเช็ก Token

    if (!token) { // <-- 2. ถ้าไม่มี Token
        // ให้เด้งกลับไปหน้า Login
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;