import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';

import { formatDateTime } from '../utils/formatters';

function KnowledgeBaseDetailPage() {
    const { id } = useParams(); // (ดึง ID จาก URL)
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const backendRootUrl = 'http://localhost:8000'; // (สำหรับแสดงรูป)

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                setLoading(true);
                // (ยิง API ที่เราเพิ่งสร้าง)
                const response = await apiClient.get(`/knowledge-base/${id}`);
                setArticle(response.data);
            } catch (err) {
                console.error("Failed to fetch article", err);
                setError("ไม่สามารถโหลดบทความได้");
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
    }, [id]); // (รันใหม่ทุกครั้งที่ id เปลี่ยน)

    // (ฟังก์ชันสำหรับแสดงไฟล์แนบ - เรายกมาจาก TicketDetailPage)
    const renderAttachments = (attachments) => {
        if (!attachments || attachments.length === 0) return null;

        return (
            <div className="mt-6 border-t pt-4">
                <p className="text-gray-500 text-sm mb-2">Attachments</p>
                <div className="space-y-2">
                    {attachments.map(att => {
                        const fullFilePath = `${backendRootUrl}${att.file_path}`;
                        const isImage = att.attachmentcol && att.attachmentcol.startsWith('image/');
                        return (
                            <div key={att.attachment_id}>
                                {isImage ? (
                                    <img 
                                        src={fullFilePath} 
                                        alt={att.file_name}
                                        className="max-w-md h-auto rounded-lg border shadow-sm"
                                    />
                                ) : (
                                    <a href={fullFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                        {att.file_name}
                                    </a>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) { return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>กำลังโหลด...</div>; }
    if (error) { return <div className="min-h-screen flex items-center justify-center text-red-500" style={{ backgroundColor: '#edf4f5' }}>{error}</div>; }
    if (!article) { return null; }

    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            {/* (TODO: เพิ่ม Navbar ที่นี่) */}

            <main className="p-8 max-w-4xl mx-auto w-full">

                {/* (ปุ่ม Back) */}
                <button onClick={() => navigate('/knowledge-base')} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back to Knowledge Base
                </button>

                <div className="flex flex-col md:flex-row gap-6">

                    {/* (คอลัมน์ซ้าย - เนื้อหา) */}
                    <div className="flex-grow md:w-2/3">
                        <div className="bg-white p-8 rounded-2xl shadow-lg">
                            <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

                            {/* (แสดงเนื้อหา - 'whitespace-pre-wrap' คือหัวใจสำคัญ) */}
                            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {article.content}
                            </p>

                            {/* (แสดงไฟล์แนบ) */}
                            {renderAttachments(article.attachments)}
                        </div>
                    </div>

                    {/* (คอลัมน์ขวา - ข้อมูล) */}
                    <div className="md:w-1/3">
                        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                            <h2 className="text-xl font-bold">Article Information</h2>

                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-600">Category</span>
                                <span className="font-semibold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                                    {article.category ? article.category.name : 'N/A'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-600">Created Date</span>
                                <span className="font-semibold">{formatDateTime(article.created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-gray-600">Created By</span>
                                <span className="font-semibold">{article.user ? article.user.name : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default KnowledgeBaseDetailPage;