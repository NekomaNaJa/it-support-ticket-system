import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

// (ฟังก์ชัน Style เดียวกับ Navbar หลัก)
const getSubNavLinkStyle = ({ isActive }) => {
    const baseStyle = "px-4 py-2 rounded-lg text-sm font-medium";
    if (isActive) {
        return `${baseStyle} bg-white text-blue-600 shadow-sm`;
    }
    return `${baseStyle} text-gray-500 hover:bg-gray-100 hover:text-gray-700`;
};

function ManagementLayout() {
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            <main className="p-8 max-w-7xl mx-auto w-full">

                {/* --- (นี่คือ "Sub-Navbar" ที่คุณขอ) --- */}
                <div className="mb-6">
                    <div className="bg-gray-200 p-1.5 rounded-lg flex space-x-2 max-w-xs">
                        <NavLink to="/management/users" className={getSubNavLinkStyle}>
                            Manage Users
                        </NavLink>
                        <NavLink to="/management/categories" className={getSubNavLinkStyle}>
                            Manage Categories
                        </NavLink>
                    </div>
                </div>

                {/* (นี่คือ "ช่อง" ที่หน้าลูก (เช่น User List) จะมาแสดง) */}
                <Outlet />

            </main>
        </div>
    );
}

export default ManagementLayout;