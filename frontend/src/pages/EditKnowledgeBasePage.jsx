import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Button from '../components/Button';
import Input from '../components/Input';

// (คัดลอก Validation/Icons มา)
const MAX_FILE_SIZE = 50 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const fileAcceptString = ALLOWED_FILE_TYPES.join(',');

// (Icon สำหรับปุ่มลบไฟล์ [x])
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

function EditKnowledgeBasePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendRootUrl = 'http://localhost:8000'; // (สำหรับแสดงรูป)

    // (State "รวมศูนย์")
    const [article, setArticle] = useState(null);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);

    // (useEffect - ดึง Article และ Categories)
    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchArticle = apiClient.get(`/knowledge-base/${id}`); // (API ที่เพิ่งสร้าง)
        const fetchCategories = apiClient.get('/categories');

        Promise.all([fetchArticle, fetchCategories])
            .then(([articleResponse, categoriesResponse]) => {
                setArticle(articleResponse.data);
                if (categoriesResponse.data && categoriesResponse.data.categories) {
                    setCategories(categoriesResponse.data.categories);
                } else {
                    setCategories(categoriesResponse.data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch data", err);
                setError("ไม่สามารถโหลดข้อมูลบทความได้");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    const handleCancel = () => { navigate('/knowledge-base'); };

    // (ฟังก์ชัน "handleChange" สำหรับ Input/Textarea/Select)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setArticle(prev => ({ ...prev, [name]: value }));
    };

    // (ฟังก์ชัน "เพิ่ม" ไฟล์)
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setError(null);
        if (file.size > MAX_FILE_SIZE) { setError('ไฟล์ใหญ่เกิน 50MB'); return; }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) { setError('ประเภทไฟล์ไม่ถูกต้อง (png, jpg, gif)'); return; }

        setIsUploading(true);
        const formData = new FormData();

        // (สำคัญ!) ส่ง "Type" และ "ID" ของ Model แม่
        formData.append('attachable_type', 'App\\Models\\KnowledgeBase'); 
        formData.append('attachable_id', article.article_id);
        formData.append('attachment', file); 

        try {
            // (ยิง API 'POST /attachments' ที่เราเคยสร้างไว้)
            const response = await apiClient.post('/attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // (อัปเดต State 'article' ทันที)
            setArticle(prev => ({
                ...prev,
                attachments: [...prev.attachments, response.data]
            }));
        } catch (err) {
            console.error('Failed to upload file:', err);
            setError('อัปโหลดไฟล์ไม่สำเร็จ');
        } finally {
            setIsUploading(false);
            e.target.value = null; 
        }
    };

    // (ฟังก์ชัน "ลบ" ไฟล์)
    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("แน่ใจว่าจะลบไฟล์นี้?")) return;
        try {
            // (ยิง API 'DELETE /attachments/{id}' ที่เราเคยสร้างไว้)
            await apiClient.delete(`/attachments/${attachmentId}`);
            // (อัปเดต State 'article' ทันที)
            setArticle(prev => ({
                ...prev,
                attachments: prev.attachments.filter(att => att.attachment_id !== attachmentId)
            }));
        } catch (err) {
            console.error('Failed to delete file:', err);
            setError('ลบไฟล์ไม่สำเร็จ');
        }
    };

    // (ฟังก์ชัน "ยืนยัน" - ส่งเฉพาะ Text)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // (ดึงข้อมูล Text จาก 'article' state)
        const updateData = {
            title: article.title,
            content: article.content,
            category_id: article.category_id,
        };

        try {
            // (ยิง API 'PUT' ที่เพิ่งสร้าง)
            await apiClient.put(`/knowledge-base/${id}`, updateData);
            setIsSubmitting(false);
            navigate('/knowledge-base'); // กลับไปหน้า List

        } catch (err) {
            setIsSubmitting(false);
            console.error('Failed to update article:', err);
            setError('เกิดข้อผิดพลาดในการอัปเดตบทความ');
        }
    };

    // (Loading/Error handling)
    if (loading || !article) {
        return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>
                   <p>{error ? error : 'กำลังโหลด...'}</p>
               </div>;
    }

    // (JSX - หน้าตาเหมือน CreateKnowledgeBasePage)
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            <main className="p-8 max-w-4xl mx-auto w-full">
                <button onClick={handleCancel} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back
                </button>
                <div className="bg-white p-8 rounded-2xl shadow-lg">

                    {/* (เปลี่ยน Title) */}
                    <h1 className="text-3xl font-bold text-gray-800">Edit Knowledge</h1>
                    <p className="text-gray-500 mb-8">กรอกรายละเอียดการแก้ไข</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* หัวข้อ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
                            <Input 
                                type="text" name="title"
                                value={article.title}
                                onChange={handleChange}
                                isDark={true} required
                            />
                        </div>

                        {/* 2 คอลัมน์ (Category & File) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* หมวดหมู่ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                                <select 
                                    name="category_id"
                                    className="block w-full px-4 py-3 rounded-lg text-sm bg-[#f0f0f0] border-transparent ..."
                                    value={article.category_id}
                                    onChange={handleChange}
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
                            {/* ช่องแนบไฟล์ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">เพิ่มไฟล์แนบ (สูงสุด 50MB)</label>
                                <input
                                    type="file"
                                    accept={fileAcceptString}
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg ... (สไตล์เดิม)"
                                    disabled={isUploading || isSubmitting}
                                />
                                {isUploading && <p className="text-sm text-blue-600 mt-1">กำลังอัปโหลด...</p>}
                            </div>
                        </div>

                        {/* (เพิ่ม) ส่วนแสดงไฟล์ที่มีอยู่ */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">ไฟล์แนบที่มีอยู่</label>
                            {article.attachments.length === 0 && (
                                <p className="text-sm text-gray-500">ไม่มีไฟล์แนบ</p>
                            )}
                            {article.attachments.map(att => {
                                const fullFilePath = `${backendRootUrl}${att.file_path}`;
                                const isImage = att.attachmentcol && att.attachmentcol.startsWith('image/');

                                return (
                                    <div key={att.attachment_id} className="group flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        {isImage ? (
                                            <img src={fullFilePath} alt={att.file_name} className="w-16 h-16 object-cover rounded-md border" />
                                        ) : (
                                            <a href={fullFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{att.file_name}</a>
                                        )}
                                        {/* (ปุ่มลบไฟล์) */}
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteAttachment(att.attachment_id)}
                                            className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Delete this file"
                                            disabled={isSubmitting || isUploading}
                                        >
                                            <CloseIcon />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* เนื้อหา (Content) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">เนื้อหา (Content)</label>
                            <textarea
                                name="content"
                                rows="10"
                                value={article.content}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 rounded-lg text-sm bg-[#f0f0f0] border-transparent ..."
                                required
                            ></textarea>
                        </div>

                        {error && ( <div className="text-red-500 text-sm text-center">{error}</div> )}

                        {/* (เปลี่ยนข้อความปุ่ม) */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button type="button" variant="danger" onClick={handleCancel} disabled={isSubmitting || isUploading}>
                                ยกเลิก
                            </Button>
                            <Button type="submit" variant="primary" disabled={isSubmitting || isUploading}>
                                {isSubmitting ? 'กำลังอัปเดต...' : 'ยืนยันการสร้าง'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default EditKnowledgeBasePage;