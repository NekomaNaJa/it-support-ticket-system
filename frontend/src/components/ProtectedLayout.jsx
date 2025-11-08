import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // (Import Navbar ที่เราเพิ่งสร้าง)

function ProtectedLayout() {
    const { user, token, loading } = useAuth(); // (ดึงสถานะ Login)

    if (loading) {
        // (ถ้ายังเช็กสถานะไม่เสร็จ ให้แสดงหน้าขาวๆ หรือ Loading... ไปก่อน)
        return <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}></div>;
    }

    if (!user || !token) {
        // (ถ้าเช็กแล้ว "ยังไม่ล็อกอิน" -> เด้งไปหน้า Login)
        return <Navigate to="/login" replace />;
    }

    // (ถ้า "ล็อกอินแล้ว")
    return (
        <>
            <Navbar /> {/* <-- 1. แสดง Navbar ที่ด้านบน */}

            {/* 2. แสดง "เนื้อหาของหน้าเพจ" (เช่น TicketFlowPage) 
                   ที่ถูกส่งมาจาก Router */}
            <Outlet /> 
        </>
    );
}

export default ProtectedLayout;