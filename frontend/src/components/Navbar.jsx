import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';
import TicketFlowIcon from '../assets/Ticket.png';
import KnowledgeIcon from '../assets/Knowledge.png';
import DashboardIcon from '../assets/Dashboard.png';
import ManagementIcon from '../assets/Management.png';

/**
 * นี่คือ "ฟังก์ชัน" ที่จะบอก NavLink ว่าต้องใช้ Style ไหน
 * (ถ้า isActive = true, มันจะใช้สไตล์ 'activeLink')
 */
const getNavLinkStyle = ({ isActive }) => {
    const baseStyle = "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors";
    if (isActive) {
        return `${baseStyle} font-bold text-lg bg-gray-200`; // (สไตล์ "Active" ที่คุณใช้อยู่)
    }
    return `${baseStyle} text-gray-500 hover:bg-gray-100`; // (สไตล์ "Inactive")
};


function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // (สร้างตัวแปรเช็ก Role)
    const isAdmin = user && user.role === 'admin';

    return (
        <nav className="bg-white shadow px-8 py-4 flex justify-between items-center">
            {/* --- ส่วน Links (ด้านซ้าย) --- */}
            <div className="flex items-center space-x-4">

                {/* 1. Ticket Flow (ทุกคนเห็น) */}
                <NavLink to="/ticket-flow" className={getNavLinkStyle}>
                    <img src={TicketFlowIcon} alt="Ticket" className="w-8 h-8" />
                    <span>Ticket Flow</span>
                </NavLink>

                {/* 2. Knowledge (ทุกคนเห็น) */}
                <NavLink to="/knowledge-base" className={getNavLinkStyle}>
                    <img src={KnowledgeIcon} alt="Knowledge" className="w-6 h-6" />
                    <span>Knowledge</span>
                </NavLink>

                {/* --- (นี่คือ Logic RBAC ของคุณ) --- */}

                {/* 3. Management (Admin เท่านั้น) */}
                {isAdmin && (
                    <NavLink to="/management" className={getNavLinkStyle}>
                        <img src={ManagementIcon} alt="Management" className="w-6 h-6" />
                        <span>Management</span>
                    </NavLink>
                )}

                {/* 4. Dashboard (Admin เท่านั้น) */}
                {isAdmin && (
                    <NavLink to="/dashboard" className={getNavLinkStyle}>
                        <img src={DashboardIcon} alt="Dashboard" className="w-6 h-6" />
                        <span>Dashboard</span>
                    </NavLink>
                )}
                {/* --- (จบส่วน RBAC) --- */}

            </div>

            {/* --- ส่วน User (ด้านขวา) --- */}
            <div className="flex items-center space-x-4">
                <div className="text-right">
                    <div className="font-medium text-sm">{user ? user.email : 'Loading...'}</div>
                    <div className="text-xs text-gray-500">{user ? user.name : 'user'}</div>
                </div>
                <Button type="button" onClick={logout} variant="danger" className="h-10 py-2 flex items-center space-x-2">
                    <span>ออกจากระบบ</span>
                </Button>
            </div>
        </nav>
    );
}

export default Navbar;