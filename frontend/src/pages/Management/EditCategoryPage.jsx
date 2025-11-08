import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../../api';
import Button from '../../components/Button';
import Input from '../../components/Input';

function EditCategoryPage() {
    const { id } = useParams(); // (ดึง ID ของ Category จาก URL)
    const navigate = useNavigate();

    // (State "รวมศูนย์" สำหรับฟอร์ม)
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // (useEffect - ดึงข้อมูล Category เก่า)
    useEffect(() => {
        setLoading(true);
        setError(null);

        apiClient.get(`/categories/${id}`) // (ยิง API ที่เพิ่งสร้าง)
            .then(response => {
                setFormData({
                    name: response.data.name,
                    description: response.data.description || '' // (ป้องกัน null)
                }); 
            })
            .catch(err => {
                console.error("Failed to fetch category", err);
                setError("ไม่สามารถโหลดข้อมูล Category ได้");
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
        navigate('/management/categories'); // (กลับไปหน้า List)
    };

    // (ฟังก์ชัน "ยืนยัน" - ส่งข้อมูล)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            // (ยิง API 'PUT' ที่เพิ่งสร้าง)
            await apiClient.put(`/categories/${id}`, formData);
            setIsSubmitting(false);
            navigate('/management/categories'); // กลับไปหน้า List

        } catch (err) {
            setIsSubmitting(false);
            console.error('Failed to update category:', err);
            if (err.response && err.response.data.errors) {
                setError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setError('เกิดข้อผิดพลาดในการอัปเดต Category');
            }
        }
    };

    if (loading) {
        return <div className="p-8">กำลังโหลดข้อมูล...</div>;
    }

    // (JSX - หน้าตาเหมือน EditUserPage)
    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg">

            <h1 className="text-3xl font-bold text-gray-800">Edit Category</h1>
            <p className="text-gray-500 mb-8">แก้ไขรายละเอียดหมวดหมู่</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* ID (แสดงผล แต่ห้ามแก้) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category ID</label>
                    <Input 
                        type="text"
                        value={id}
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

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                        name="description"
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full px-4 py-3 rounded-lg text-sm bg-[#f0f0f0] border-transparent ..."
                    ></textarea>
                </div>

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

export default EditCategoryPage;