import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Button from '../components/Button';
import Input from '../components/Input';

// --- (เพิ่ม) Validation สำหรับไฟล์ ---
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const fileAcceptString = ALLOWED_FILE_TYPES.join(',');
// ---------------------------------

function CreateKnowledgeBasePage() {
    const [categories, setCategories] = useState([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [categoryId, setCategoryId] = useState('');
    
    // --- (เพิ่ม) State สำหรับไฟล์ ---
    const [attachment, setAttachment] = useState(null);
    // ---------------------------------
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // (useEffect - ไม่แก้ไข)
    useEffect(() => {
        apiClient.get('/categories')
            .then(response => {
                if (response.data && response.data.categories) {
                    setCategories(response.data.categories);
                } else {
                    setCategories(response.data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch categories", err);
                setError("ไม่สามารถโหลดหมวดหมู่ได้");
            });
    }, []);

    const handleCancel = () => {
        navigate('/knowledge-base'); 
    };

    // --- (เพิ่ม) ฟังก์ชันตรวจสอบไฟล์ ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setError(null);
        setAttachment(null);

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setError('ไฟล์มีขนาดใหญ่เกิน 50MB');
                e.target.value = null; 
                return;
            }
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                setError('ประเภทไฟล์ไม่ถูกต้อง (png, jpg, gif)');
                e.target.value = null; 
                return;
            }
            setAttachment(file);
        }
    };
    // ---------------------------------

    // --- (แก้ไข) handleSubmit ให้ส่ง FormData ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // (ต้องใช้ FormData เพื่อส่งไฟล์)
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        formData.append('category_id', categoryId);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            await apiClient.post('/knowledge-base', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // (สำคัญ!)
                },
            });

            setLoading(false);
            navigate('/knowledge-base');

        } catch (err) {
            setLoading(false);
            console.error('Failed to create article:', err);
            if (err.response && err.response.data.errors) {
                setError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setError('เกิดข้อผิดพลาดในการสร้างบทความ');
            }
        }
    };
    // ---------------------------------

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            {/* (TODO: เพิ่ม Navbar ที่นี่) */}

            <main className="p-8 max-w-4xl mx-auto w-full">

                <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900 mb-4">
                    &lt; Back to Knowledge Base
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-lg">

                    <h1 className="text-3xl font-bold text-gray-800">Create new Article</h1>
                    <p className="text-gray-500 mb-8">กรอกรายละเอียดบทความใหม่</p>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* หัวข้อ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
                            <Input 
                                type="text" 
                                placeholder="กรอกหัวข้อบทความ" 
                                isDark={true}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* --- (แก้ไข) เปลี่ยน Layout เป็น 2 คอลัมน์ --- */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* หมวดหมู่ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                                <select 
                                    className="block w-full px-4 py-3 rounded-lg text-sm ... (สไตล์เดิม)"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                >
                                    <option value="">เลือกหมวดหมู่</option>
                                    {categories.map(cat => (
                                        <option key={cat.category_id} value={cat.category_id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* (เพิ่ม) ช่องแนบไฟล์ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">แนบไฟล์ (สูงสุด 50MB)</label>
                                <input
                                    type="file"
                                    accept={fileAcceptString}
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg p-2.5"
                                />
                            </div>
                        </div>
                        {/* --- (จบส่วนแก้ไข) --- */}


                        {/* รายละเอียด */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">เนื้อหา (Content)</label>
                            <textarea
                                placeholder="กรอกเนื้อหาและวิธีการแก้ไข..."
                                className="block w-full px-4 py-3 ... (สไตล์เดิม)"
                                rows="10"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                required
                            ></textarea>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* ปุ่ม Submit & Cancel */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="danger" onClick={handleCancel} disabled={loading}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'กำลังสร้าง...' : 'สร้างบทความ'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default CreateKnowledgeBasePage;