import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';

import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import TicketFlowIcon from '../assets/Ticket.png';
import KnowledgeIcon from '../assets/Knowledge.png';
import QuestionIcon from '../assets/Question.png';
import SearchIcon from '../assets/Search.png';
import EditIcon from '../assets/Edit.png';

function KnowledgeBasePage() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const backendRootUrl = 'http://localhost:8000';

    const isStaff = useMemo(() => {
        return user && (user.role === 'staff' || user.role === 'admin');
    }, [user]);

    // (useEffect ต้องดึงข้อมูล 2 อย่าง: Articles และ Categories)
    useEffect(() => {
        const fetchArticles = apiClient.get('/knowledge-base');
        const fetchCategories = apiClient.get('/categories'); // (ยิง API ที่เรามีอยู่แล้ว)

        setLoading(true);
        Promise.all([fetchArticles, fetchCategories])
            .then(([articlesResponse, categoriesResponse]) => {
                setArticles(articlesResponse.data);
                if (categoriesResponse.data && categoriesResponse.data.categories) {
                    setCategories(categoriesResponse.data.categories);
                } else {
                    setCategories(categoriesResponse.data);
                }
            })
            .catch(err => {
                console.error("Failed to fetch data", err);
                setError("ไม่สามารถโหลดข้อมูลได้");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const filteredArticles = useMemo(() => {
        // (เตรียมข้อความค้นหา (Search Term) ให้เป็นตัวพิมพ์เล็ก)
        const lowerSearchTerm = searchTerm.toLowerCase();

        return articles.filter(article => {
            const categoryMatch = !selectedCategory || 
                                  article.category_id.toString() === selectedCategory.toString();
            const searchMatch = lowerSearchTerm === '' || 
                                (article.title && article.title.toLowerCase().includes(lowerSearchTerm)) ||
                                (article.content && article.content.toLowerCase().includes(lowerSearchTerm));
            return categoryMatch && searchMatch;
        });
    }, [articles, selectedCategory, searchTerm]);

    const handleLogout = () => {
        logout(); 
    };

    // (Loading/Error handling)
    if (loading) { return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>กำลังโหลด...</div>; }
    if (error) { return <div className="min-h-screen flex items-center justify-center text-red-500" style={{ backgroundColor: '#edf4f5' }}>{error}</div>; }

    // 2. (UI) สร้างหน้าตาตาม Wireframe
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>

            <main className="p-8 max-w-6xl mx-auto w-full">

                {/* (ส่วนหัว) */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Knowledge Base</h1>
                        <p className="text-gray-500">แหล่งรวบรวมวิธีการแก้ปัญหาเบื้องต้น</p>
                    </div>
                    {isStaff && (
                        <button
                            onClick={() => navigate('/knowledge-base/create')} 
                            className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors"
                        >
                            <span className="text-lg font-medium">+ Create new Knowledge</span>
                        </button>
                    )}
                </div>

                {/* (ส่วนค้นหาและกรอง - TODO: ตอนนี้เป็นแค่ UI ยังไม่ทำงาน) */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    {/* (เชื่อมต่อ Search Bar เข้ากับ State) */}
                    <div className="relative flex-grow">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <img src={SearchIcon} alt="Search" className="w-4 h-4" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search your problem"
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-sm bg-white border border-gray-200 shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* (Category Filter) */}
                    <select
                        className="w-full md:w-1/4 px-4 py-3 rounded-lg text-sm bg-white border border-gray-200 shadow-sm"
                        value={selectedCategory} // <-- 1. ผูก Value
                        onChange={(e) => setSelectedCategory(e.target.value)} // <-- 2. ผูก OnChange
                    >
                        <option value="">All Categories</option> {/* <-- (value='' คือ "ไม่กรอง") */}
                        
                        {/* 3. วนลูป Categories ที่ดึงมา */}
                        {categories.map(cat => (
                            <option key={cat.category_id} value={cat.category_id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* (ส่วนรายการบทความ) */}
                <h2 className="text-lg font-semibold text-gray-700 mb-4">ตัวอย่างปัญหาที่คุณอาจจะเจอ</h2>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {filteredArticles.length === 0 && (
                            <p className="text-center text-gray-500 p-8">
                                {articles.length === 0 
                                    ? "ไม่พบบทความ" 
                                    : "ไม่พบบทความที่ตรงกับการค้นหา/หมวดหมู่นี้"}
                            </p>
                        )}
                        <ul className="divide-y divide-gray-200">
                            {filteredArticles.map(article => {

                            const firstImageAttachment = article.attachments?.find(
                                att => att.attachmentcol && att.attachmentcol.startsWith('image/')
                            );
                            
                            return (
                                <li 
                                    key={article.article_id} 
                                    onClick={() => navigate(`/knowledge-base/${article.article_id}`)}
                                    className="p-6 flex items-start space-x-4 hover:bg-gray-50 cursor-pointer"
                                >
                                    <div className="flex-shrink-0 pt-1">
                                        {firstImageAttachment ? (
                                            <img 
                                                src={`${backendRootUrl}${firstImageAttachment.file_path}`} 
                                                alt={firstImageAttachment.file_name}
                                                className="w-16 h-16 object-cover rounded-md border" 
                                            />
                                        ) : (
                                            <img src={QuestionIcon} alt="Question" className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{article.title}</h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {article.category && (
                                                <span className="text-xs font-medium text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full">
                                                    {article.category.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {isStaff && (
                                        <div className="flex-shrink-0">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); 
                                                    navigate(`/knowledge-base/edit/${article.article_id}`);
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-gray-100"
                                                title="Edit Article"
                                            >
                                                <img src={EditIcon} alt="Edit" className="w-6 h-6" />
                                            </button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                        </ul>
                </div>

            </main>
        </div>
    );
}

export default KnowledgeBasePage;