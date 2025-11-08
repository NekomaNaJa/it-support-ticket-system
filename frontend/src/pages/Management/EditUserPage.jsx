import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import Button from '../../components/Button';
import Input from '../../components/Input';

function EditUserPage() {
    const { id } = useParams(); // (ดึง ID ของ User จาก URL)
    const navigate = useNavigate();

    // (State "รวมศูนย์" สำหรับฟอร์ม)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'user', // (ค่าเริ่มต้น)
        // status: 'active' // (TODO: เพิ่มทีหลัง)
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // (useEffect - ดึงข้อมูล User เก่า)
    useEffect(() => {
        setLoading(true);
        setError(null);

        apiClient.get(`/admin/users/${id}`) // (ยิง API ที่เพิ่งสร้าง)
            .then(response => {
                setFormData(response.data); // (เติมข้อมูลเก่าลงฟอร์ม)
            })
            .catch(err => {
                console.error("Failed to fetch user", err);
                setError("ไม่สามารถโหลดข้อมูล User ได้");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    // (ฟังก์ชัน "handleChange" เดียวสำหรับทุก Input)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        navigate('/management/users'); // (กลับไปหน้า List)
    };

    // (ฟังก์ชัน "ยืนยัน" - ส่งเฉพาะ Text)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // (ดึงข้อมูล Text จาก 'formData' state)
        const updateData = {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            // status: formData.status // (TODO: เพิ่มทีหลัง)
        };

        try {
            // (ยิง API 'PUT' ที่เพิ่งสร้าง)
            await apiClient.put(`/admin/users/${id}`, updateData);
            setIsSubmitting(false);
            navigate('/management/users'); // กลับไปหน้า List

        } catch (err) {
            setIsSubmitting(false);
            console.error('Failed to update user:', err);
            if (err.response && err.response.data.errors) {
                setError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setError('เกิดข้อผิดพลาดในการอัปเดต User');
            }
        }
    };

    if (loading) {
        return <div className="p-8">กำลังโหลดข้อมูล...</div>;
    }
    if (error && !isSubmitting) {
        return <div className="p-8 text-red-500">{error}</div>;
    }

    // (JSX - หน้าตาเหมือน CreateTicketPage / CreateKnowledgeBasePage)
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">

            <h1 className="text-3xl font-bold text-gray-800">Edit User</h1>
            <p className="text-gray-500 mb-8">แก้ไขรายละเอียดผู้ใช้</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ID (แสดงผล แต่ห้ามแก้) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                    <Input 
                        type="text"
                        value={formData.user_id || id}
                        isDark={true}
                        disabled 
                    />
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <Input 
                        type="text" name="name"
                        value={formData.name}
                        onChange={handleChange}
                        isDark={true} required
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input 
                        type="email" name="email"
                        value={formData.email}
                        onChange={handleChange}
                        isDark={true} required
                    />
                </div>

                {/* Role */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select 
                        name="role"
                        className="block w-full px-4 py-3 rounded-lg text-sm bg-[#f0f0f0] border-transparent ..."
                        value={formData.role}
                        onChange={handleChange}
                        required
                    >
                        <option value="user">User</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                {/* (TODO: เพิ่ม Dropdown 'status' ที่นี่ ถ้าต้องการ) */}

                {error && ( <div className="text-red-500 text-sm text-center">{error}</div> )}

                {/* ปุ่ม */}
                <div className="flex justify-end space-x-4 pt-4">
                    <Button type="button" variant="danger" onClick={handleCancel} disabled={isSubmitting}>
                        ยกเลิก
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default EditUserPage;