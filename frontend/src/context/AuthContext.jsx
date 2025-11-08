// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await apiClient.get('/user');
                    setUser(response.data); 
                } catch (error) {
                    console.error("Invalid token, logging out.", error);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                    // (เพิ่ม) ลบ Header ที่หมดอายุ
                    delete apiClient.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, [token]); 

    const login = (userData, token) => {
        localStorage.setItem('token', token); 
        setToken(token);
        setUser(userData);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = async () => {
        try {
            // (เรายังคงยิง API logout เพื่อให้ Server ทำลาย Token)
            await apiClient.post('/logout'); 
        } catch (error) {
            console.error("Logout API call failed, but logging out locally.", error);
        } finally {
            // (ไม่ว่า API จะสำเร็จหรือไม่... เราจะ "บังคับ" ลบทุกอย่างใน Frontend)
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete apiClient.defaults.headers.common['Authorization'];
        }
    };

    const isAuthenticated = !!user;

    if (loading) {
        return <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}></div>;
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};