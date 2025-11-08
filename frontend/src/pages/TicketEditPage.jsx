import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Button from '../components/Button';
import Input from '../components/Input';

// (คัดลอกค่า Validation มาจาก CreateTicketPage)
const MAX_FILE_SIZE = 50 * 1024 * 1024; 
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const fileAcceptString = ALLOWED_FILE_TYPES.join(',');

// (Icon สำหรับปุ่มลบไฟล์)
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


function TicketEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const backendRootUrl = 'http://localhost:8000'; // (สำหรับแสดงรูป)

    // --- (1. แก้ไข) "รวมศูนย์" State ทั้งหมดไว้ที่ 'ticket' ---
    const [ticket, setTicket] = useState(null); // (เริ่มต้นเป็น null)
    const [categories, setCategories] = useState([]);
    
    // (State การโหลด)
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false); // (สำหรับปุ่ม "ยืนยัน")
    const [isUploading, setIsUploading] = useState(false); // (สำหรับตอนอัปโหลดไฟล์)
    const [error, setError] = useState(null);

    // --- (2. แก้ไข) useEffect ดึงข้อมูล Categories และ Ticket ---
    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchCategories = apiClient.get('/categories');
        const fetchTicket = apiClient.get(`/tickets/${id}`); // (API นี้ต้อง eager load 'attachments' มาด้วย)

        Promise.all([fetchCategories, fetchTicket])
            .then(([categoriesResponse, ticketResponse]) => {
                setCategories(categoriesResponse.data);
                setTicket(ticketResponse.data); // (เก็บ Ticket ทั้งก้อนลง State)
            })
            .catch(err => {
                console.error("Failed to fetch data", err);
                setError("ไม่สามารถโหลดข้อมูล Ticket ได้ (คุณอาจไม่มีสิทธิ์)");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    
    const handleCancel = () => { navigate(-1); };

    // --- (3. แก้ไข) ฟังก์ชัน "handleChange" เดียวสำหรับทุก Input ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        // อัปเดต State 'ticket' ที่ "key" (name) ที่ตรงกัน
        setTicket(prevTicket => ({
            ...prevTicket,
            [name]: value
        }));
    };

    // --- (4. เพิ่ม) ฟังก์ชัน "เพิ่ม" ไฟล์แนบ (อัปโหลดทันที) ---
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError(null);
        if (file.size > MAX_FILE_SIZE) {
            setError('ไฟล์มีขนาดใหญ่เกิน 50MB'); return;
        }
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            setError('ประเภทไฟล์ไม่ถูกต้อง (png, jpg, gif)'); return;
        }

        setIsUploading(true);
        const formData = new FormData();

        formData.append('attachable_type', 'App\\Models\\Ticket'); 
        formData.append('attachable_id', ticket.ticket_id);
        formData.append('attachment', file);

        try {
            const response = await apiClient.post('/attachments', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // (เพิ่มไฟล์ใหม่เข้าไปใน State 'ticket' ทันที)
            setTicket(prevTicket => ({
                ...prevTicket,
                attachments: [...prevTicket.attachments, response.data]
            }));
        } catch (err) {
            console.error('Failed to upload file:', err);
            setError('อัปโหลดไฟล์ไม่สำเร็จ');
        } finally {
            setIsUploading(false);
            e.target.value = null; 
        }
    };

    // --- (5. เพิ่ม) ฟังก์ชัน "ลบ" ไฟล์แนบ (ลบทันที) ---
    const handleDeleteAttachment = async (attachmentId) => {
        if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์นี้?")) return;

        try {
            await apiClient.delete(`/attachments/${attachmentId}`);
            // (กรองไฟล์ที่ถูกลบออกจาก State 'ticket' ทันที)
            setTicket(prevTicket => ({
                ...prevTicket,
                attachments: prevTicket.attachments.filter(
                    att => att.attachment_id !== attachmentId
                )
            }));
        } catch (err) {
            console.error('Failed to delete file:', err);
            setError('ลบไฟล์ไม่สำเร็จ');
        }
    };

    // --- (6. แก้ไข) handleSubmit จะส่งเฉพาะ "ข้อความ" ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        // (ดึงข้อมูลจาก 'ticket' state)
        const updateData = {
            title: ticket.title,
            description: ticket.description,
            category_id: ticket.category_id,
            priority: ticket.priority,
        };

        try {
            await apiClient.put(`/tickets/${id}`, updateData);
            setIsSubmitting(false);
            navigate(`/ticket/${id}`); // กลับไปหน้า Detail

        } catch (err) {
            setIsSubmitting(false);
            console.error('Failed to update ticket:', err);
            if (err.response && err.response.data.errors) {
                setError(Object.values(err.response.data.errors).flat().join(' '));
            } else {
                setError('เกิดข้อผิดพลาดในการอัปเดต Ticket');
            }
        }
    };

    // --- (7. แก้ไข) หน้าจอ Loading (ต้องเช็ก !ticket ด้วย) ---
    if (loading || !ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>
                <p>{error ? error : 'กำลังโหลดข้อมูล Ticket...'}</p>
            </div>
        );
    }

    // --- (UI) คัดลอก JSX ทั้งหมดมาจาก CreateTicketPage ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            {/* (TODO: เพิ่ม Navbar ที่นี่) */}
            
            <main className="p-8 max-w-4xl mx-auto w-full">
                
                {/* (แก้ Path ให้ถูก) */}
                <button onClick={() => navigate(`/ticket/${id}`)} className="text-gray-600 hover:text-gray-900 mb-4">
                    &lt; Back to Ticket Detail
                </button>

                <div className="bg-white p-8 rounded-2xl shadow-lg">
                    
                    <h1 className="text-3xl font-bold text-gray-800">Edit my Ticket</h1>
                    <p className="text-gray-500 mb-8">กรอกรายละเอียดงานใหม่</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* --- (8. แก้ไข) ผูก Input ทั้งหมดเข้ากับ 'ticket' state --- */}
                        
                        {/* หัวข้อ */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
                            <Input 
                                type="text"
                                name="title" // <-- (สำคัญ) เพิ่ม "name"
                                placeholder="กรอกหัวข้อปัญหา" 
                                isDark={true}
                                value={ticket.title} // <-- (ผูกกับ ticket state)
                                onChange={handleChange} // <-- (ใช้ handleChange)
                                required
                            />
                        </div>

                        {/* รายละเอียด */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">รายละเอียด</label>
                            <textarea
                                name="description" // <-- (สำคัญ) เพิ่ม "name"
                                placeholder="กรอกรายละเอียดปัญหา"
                                className="block w-full px-4 py-3 ... (สไตล์เดิม)"
                                rows="5"
                                value={ticket.description} // <-- (ผูกกับ ticket state)
                                onChange={handleChange} // <-- (ใช้ handleChange)
                                required
                            ></textarea>
                        </div>

                        {/* แถว Dropdowns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* (แก้เป็น 2 cols) */}
                            
                            {/* หมวดหมู่ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่</label>
                                <select 
                                    name="category_id" // <-- (สำคัญ) เพิ่ม "name"
                                    className="block w-full px-4 py-3 ... (สไตล์เดิม)"
                                    value={ticket.category_id} // <-- (ผูกกับ ticket state)
                                    onChange={handleChange} // <-- (ใช้ handleChange)
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

                            {/* ระดับความสำคัญ */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">ระดับความสำคัญ</label>
                                <select 
                                    name="priority" // <-- (สำคัญ) เพิ่ม "name"
                                    className="block w-full px-4 py-3 ... (สไตล์เดิม)"
                                    value={ticket.priority} // <-- (ผูกกับ ticket state)
                                    onChange={handleChange} // <-- (ใช้ handleChange)
                                    required
                                >
                                    <option value="">เลือกระดับความสำคัญ</option>
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        {/* --- (9. เพิ่ม) ส่วนจัดการไฟล์แนบ --- */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ไฟล์แนบ</label>
                            
                            {/* 9a. แสดงไฟล์ที่มีอยู่ (จาก State 'ticket') */}
                            <div className="space-y-2 mb-4">
                                {ticket.attachments.length === 0 && (
                                    <p className="text-sm text-gray-500">ไม่มีไฟล์แนบ</p>
                                )}
                                {ticket.attachments.map(att => {
                                    const fullFilePath = `${backendRootUrl}${att.file_path}`;
                                    const isImage = att.attachmentcol && att.attachmentcol.startsWith('image/');
                                    
                                    return (
                                        <div key={att.attachment_id} className="group flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                            {isImage ? (
                                                <img src={fullFilePath} alt={att.file_name} className="w-16 h-16 object-cover rounded-md border" />
                                            ) : (
                                                <a href={fullFilePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{att.file_name}</a>
                                            )}
                                            
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAttachment(att.attachment_id)}
                                                className="p-1 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                title="Delete this file"
                                            >
                                                <CloseIcon />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 9b. ปุ่มเพิ่มไฟล์ (ทำงานทันที) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">เพิ่มไฟล์ (สูงสุด 50MB)</label>
                                <input
                                    type="file"
                                    accept={fileAcceptString}
                                    onChange={handleFileChange} 
                                    className="block w-full text-sm text-gray-500 ... (สไตล์เดิม)"
                                    disabled={isUploading || isSubmitting}
                                />
                                {isUploading && <p className="text-sm text-blue-600 mt-1">กำลังอัปโหลด...</p>}
                            </div>
                        </div>
                        {/* --- (จบส่วนที่เพิ่ม) --- */}


                        {/* แสดง Error */}
                        {error && (
                            <div className="text-red-500 text-sm text-center">
                                {error}
                            </div>
                        )}

                        {/* ปุ่ม Submit & Cancel */}
                        <div className="flex justify-end space-x-4 pt-4">
                            <Button
                                type="button"
                                variant="danger" 
                                onClick={handleCancel}
                                disabled={isSubmitting || isUploading}
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                variant="primary" 
                                disabled={isSubmitting || isUploading}
                            >
                                {isSubmitting ? 'กำลังอัปเดต...' : 'ยืนยันการแก้ไข'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default TicketEditPage;