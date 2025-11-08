import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api';
import { useNavigate } from 'react-router-dom';
import EditIcon from '../../assets/Edit.png';
import DeleteIcon from '../../assets/Delete.png';
import Button from '../../components/Button';

import { DeleteUserModal } from '../../components/Modals';

import { PriorityBadge, StatusBadge, RoleBadge } from '../../components/Badges';
import StatCard from '../../components/StatCard';

const formatAdminUserID = (user) => {
    if (!user) return '';
    let prefix = 'US'; // Default
    
    // (ใช้ strtolower() เพื่อความปลอดภัย)
    const userRole = user.role.toLowerCase(); 

    if (userRole === 'admin') prefix = 'AD';
    else if (userRole === 'staff') prefix = 'ST';
    
    // (padStart(2, '0') คือการเติม 0 ข้างหน้า ถ้าเลขไม่ถึง 2 หลัก)
    return `${prefix}-${String(user.user_id).padStart(2, '0')}`;
};

function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ total: 0, admin: 0, staff: 0, user: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // (State สำหรับ Filter - ยังไม่เชื่อมต่อ)
    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null); // (เก็บ User object ที่จะลบ)
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/admin/users');
            setUsers(response.data.users);
            setStats(response.data.stats);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setError("Failed to load data. You must be an Admin.");
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setUserToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!userToDelete) return;
        
        setIsDeleting(true);
        setError(null);

        try {
            // (ยิง API 'DELETE' ที่เราเพิ่งสร้าง)
            await apiClient.delete(`/admin/users/${userToDelete.user_id}`);
            
            // (เมื่อลบสำเร็จ)
            handleCloseModal();
            
            // (สำคัญ!) "โหลดข้อมูลใหม่" ทั้งหมด
            // (นี่คือวิธีที่ง่ายและแม่นยำที่สุดในการอัปเดต Stats และ List)
            fetchData(); 

        } catch (err) {
            console.error("Failed to delete user", err);
            if (err.response && err.response.data.message) {
                setError(err.response.data.message); // (แสดง Error จาก Backend เช่น "ห้ามลบตัวเอง")
            } else {
                setError("Failed to delete user. Please try again.");
            }
        } finally {
            setIsDeleting(false);
            // (ปิด Modal แม้ว่าจะ Error)
            // handleCloseModal(); // (เลือกเอาว่าจะให้ปิด Modal หรือค้างไว้ให้เห็น Error)
        }
    };

    // (useEffect - ดึงข้อมูลจาก API ใหม่)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/admin/users');
                setUsers(response.data.users);
                setStats(response.data.stats);
            } catch (err) {
                console.error("Failed to fetch admin data", err);
                setError("Failed to load data. You must be an Admin.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // (Logic กรอง - TODO: ทำให้สมบูรณ์)
    const filteredUsers = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();

        return users.filter(user => {
            // (1. ค้นหา Name)
            const nameMatch = user.name.toLowerCase().includes(lowerSearchTerm);
            
            // (2. ค้นหา Email)
            const emailMatch = user.email.toLowerCase().includes(lowerSearchTerm);

            // (3. ค้นหา Formatted ID)
            const idMatch = formatAdminUserID(user).toLowerCase().includes(lowerSearchTerm);

            // (ถ้า "อย่างใดอย่างหนึ่ง" จริง = ให้แสดง)
            return idMatch || nameMatch || emailMatch;
        });
    }, [users, searchTerm]);

    if (loading) { return <p>Loading data...</p>; }
    if (error) { return <p className="text-red-500">{error}</p>; }

    return (
        <div className="space-y-6">

            {/* (Title & Create Button) */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Users
                    <span className="text-lg font-normal text-gray-500 ml-4">
                        Total {stats.total}
                    </span>
                </h1>
            </div>

            {/* (Stats Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total" value={stats.total} />
                <StatCard title="Admin" value={stats.admin} colorClass="text-orange-500" />
                <StatCard title="Staff" value={stats.staff} colorClass="text-blue-500" />
                <StatCard title="User" value={stats.user} colorClass="text-gray-500" />
            </div>

            {/* (Filter Bar - TODO: เพิ่ม Dropdowns) */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                <input 
                    type="text" 
                    placeholder="Search ID or Name..." 
                    className="w-full pl-4 pr-4 py-3 rounded-lg text-sm bg-gray-100 border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* (Users Table) */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left ...">ID</th>
                            <th className="px-6 py-3 text-left ...">Name</th>
                            <th className="px-6 py-3 text-left ...">Email</th>
                            <th className="px-6 py-3 text-left ...">Role</th>
                            <th className="px-6 py-3 text-center ...">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map(user => (
                            <tr key={user.user_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {formatAdminUserID(user)}
                                </td>
                                <td className="px-6 py-4 ...">{user.name}</td>
                                <td className="px-6 py-4 ...">{user.email}</td>
                                <td className="px-6 py-4 ..."><RoleBadge role={user.role} /></td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-2">
                                        {/* (TODO: เพิ่ม onClick) */}
                                        <button 
                                            className="p-1 text-gray-500 hover:text-blue-600 rounded-full" 
                                            title="Edit Role"
                                            // (เพิ่ม onClick นี้)
                                            onClick={() => navigate(`/management/users/edit/${user.user_id}`)}
                                        >
                                            <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                                        </button>
                                        <button 
                                            className="p-1 text-gray-500 hover:text-red-600 rounded-full" 
                                            title="Delete User"
                                            onClick={() => handleDeleteClick(user)}
                                        >
                                            <img src={DeleteIcon} alt="Delete" className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* (เรียกใช้ Modal) */}
            <DeleteUserModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                user={userToDelete} // (ส่ง User เข้าไปให้ Modal แสดงชื่อ)
            />
        </div>
    );
}

export default UserManagementPage;