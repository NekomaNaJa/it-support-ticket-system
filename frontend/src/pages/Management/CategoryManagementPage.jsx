import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/StatCard';
import EditIcon from '../../assets/Edit.png';
import DeleteIcon from '../../assets/Delete.png';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { CreateCategoryModal } from '../../components/Modals';
import { DeleteCategoryModal } from '../../components/Modals';

function CategoryManagementPage() {
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total_categories: 0, total_tickets: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null); 
    const [isDeleting, setIsDeleting] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalError, setModalError] = useState(null);

    const fetchData = async () => {
        try {
            setError(null); // (ล้าง Error เก่า)
            setLoading(true);
            // (แก้ไข) เรียก API "หลัก"
            const response = await apiClient.get('/categories'); 
            setCategories(response.data.categories);
            setStats(response.data.stats);
        } catch (err) {
            console.error("Failed to fetch admin data", err);
            setError("Failed to load data. You must be an Admin.");
        } finally {
            setLoading(false);
        }
    };

    // (useEffect - ดึงข้อมูลจาก API ใหม่)
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get('/categories');
                setCategories(response.data.categories);
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

    const handleDeleteClick = (category) => {
        setError(null); // (ล้าง Error เก่า)
        setCategoryToDelete(category);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCategoryToDelete(null);
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        
        setIsDeleting(true);
        setError(null);

        try {
            // (ยิง API 'DELETE' ที่เราเพิ่งสร้าง)
            await apiClient.delete(`/categories/${categoryToDelete.category_id}`);
            
            // (เมื่อลบสำเร็จ)
            handleCloseModal();
            fetchData(); // (โหลดข้อมูลใหม่)

        } catch (err) {
            console.error("Failed to delete category", err);
            if (err.response && err.response.data.message) {
                // (แสดง Error จาก Backend เช่น "Category ถูกใช้งานอยู่")
                setError(err.response.data.message); 
            } else {
                setError("Failed to delete category. Please try again.");
            }
            // (ถ้าล้มเหลว, ให้ปิด Modal)
            handleCloseModal();
        } finally {
            setIsDeleting(false);
        }
    };

    // (Logic การ "สร้าง")
    const handleOpenCreateModal = () => {
        setModalError(null); // (ล้าง Error เก่าใน Modal)
        setIsCreateModalOpen(true);
    };
    
    const handleCloseCreateModal = () => {
        setIsCreateModalOpen(false);
        setModalError(null);
    };

    const handleConfirmCreate = async (formData) => {
        setIsSubmitting(true);
        setModalError(null);

        try {
            // (ยิง API 'POST' ที่เราเพิ่งสร้าง)
            const response = await apiClient.post('/categories', formData);
            
            // (เมื่อสร้างสำเร็จ - ปิด Modal)
            handleCloseCreateModal();
            
            // (อัปเดต List ในหน้าจอทันที - โดยไม่ต้องยิง fetchData ใหม่)
            setCategories(prevCategories => [...prevCategories, response.data]);
            // (อัปเดต Stats)
            setStats(prevStats => ({
                ...prevStats,
                total_categories: prevStats.total_categories + 1
            }));

        } catch (err) {
            console.error("Failed to create category", err);
            if (err.response && err.response.data.errors) {
                // (ถ้า Validation Error เช่น "ชื่อซ้ำ")
                setModalError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setModalError("Failed to create category. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // (Logic กรอง)
    const filteredCategories = useMemo(() => {
        return categories.filter(cat =>
            cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    if (loading) { return <p>Loading data...</p>; }
    if (error) { return <p className="text-red-500">{error}</p>; }

    // (JSX - อ้างอิงจาก UserManagementPage)
    return (
        <div className="space-y-6">

            {/* (Title & Create Button) */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">
                    All Categories
                    <span className="text-lg font-normal text-gray-500 ml-4">
                        Total {stats.total_categories}
                    </span>
                </h1>
                {/* (TODO: เพิ่มฟังก์ชัน 'Create Category') */}
                <button 
                    onClick={handleOpenCreateModal}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                >
                    <span className="text-lg font-medium">+ Create new Category</span>
                </button>
            </div>

            {/* (Stats Cards - ใช้ State ใหม่) */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Total Categories" value={stats.total_categories} />
                <StatCard title="Total Tickets (All)" value={stats.total_tickets} colorClass="text-blue-500" />
                {/* (เราสามารถเพิ่ม Stat Card ได้อีกในอนาคต) */}
            </div>

            {/* (Filter Bar) */}
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                <input 
                    type="text" 
                    placeholder="Search Category Name..." 
                    className="w-full pl-4 pr-4 py-3 rounded-lg text-sm bg-gray-100 border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* (Categories Table) */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left ...">ID</th>
                            <th className="px-6 py-3 text-left ...">Name</th>
                            <th className="px-6 py-3 text-left ...">Description</th>
                            <th className="px-6 py-3 text-center ...">Ticket Count</th>
                            <th className="px-6 py-3 text-center ...">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredCategories.map(cat => (
                            <tr key={cat.category_id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 ...">{cat.category_id}</td>
                                <td className="px-6 py-4 ...">{cat.name}</td>
                                <td className="px-6 py-4 ...">{cat.description || <span className="text-gray-400">N/A</span>}</td>
                                {/* (แสดง 'tickets_count' ที่ Backend นับมาให้) */}
                                <td className="px-6 py-4 ... text-center">{cat.tickets_count}</td>
                                <td className="px-6 py-4">
                                    <div className="flex justify-center space-x-2">
                                        <button 
                                            className="p-1 text-gray-500 hover:text-blue-600 rounded-full" 
                                            title="Edit Category"
                                            onClick={() => navigate(`/management/categories/edit/${cat.category_id}`)}
                                        >
                                            <img src={EditIcon} alt="Delete" className="w-5 h-5" />
                                        </button>
                                        <button 
                                            className="p-1 text-gray-500 hover:text-red-600 rounded-full" 
                                            title="Delete Category"
                                            onClick={() => handleDeleteClick(cat)}
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
            <DeleteCategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                category={categoryToDelete}
            />
            <CreateCategoryModal
                isOpen={isCreateModalOpen}
                onClose={handleCloseCreateModal}
                onConfirm={handleConfirmCreate}
                isSubmitting={isSubmitting}
                error={modalError}
            />
        </div>
    );
}

export default CategoryManagementPage;