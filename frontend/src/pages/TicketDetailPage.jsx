import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiClient from '../api'; 
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import SendIcon from '../assets/Send.png';
import AttachIcon from '../assets/Attach.png';
import EditIcon from '../assets/Edit.png';
import DeleteIcon from '../assets/Delete.png';
import { PriorityBadge, StatusBadge, getStatusColorClasses } from '../components/Badges';
import { formatDateTime, formatTicketID } from '../utils/formatters';

// (Component สำหรับ Modal Popup)
// เราสร้างมันไว้ในไฟล์เดียวกันนี้เลย เพื่อความง่าย
const DeleteModal = ({ isOpen, onClose, onConfirm, isDeleting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-sm mx-auto">
                
                <img src={DeleteIcon} alt="Delete" className="w-16 h-16 mx-auto mb-4" />
                
                <h2 className="text-2xl font-bold mb-4">แน่ใจว่าจะลบไหม</h2>
                <p className="text-gray-600 mb-8">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                
                <div className="flex justify-center space-x-4">
                    <Button 
                        variant="danger" 
                        onClick={onClose} 
                        disabled={isDeleting}
                    >
                        ยกเลิก
                    </Button>
                    <Button 
                        variant="primary" 
                        onClick={onConfirm}
                        disabled={isDeleting}
                    >
                        {isDeleting ? 'กำลังลบ...' : 'ยืนยัน'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

function TicketDetailPage() {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // (ใช้สำหรับ disable dropdown)

    // URL "ราก" ของ Backend (Laravel)
    const backendRootUrl = 'http://localhost:8000';

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get(`/tickets/${id}`); 
                setTicket(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch ticket", err);
                if (err.response && err.response.status === 404) {
                    setError("Ticket not found.");
                } else if (err.response && err.response.status === 403) {
                    setError("You do not have permission to view this ticket.");
                } else {
                    setError("Failed to load ticket details.");
                }
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id]); 

    const handleStatusChange = async (newStatus) => {
    if (!ticket || !user || (!user.role === 'staff' && !user.role === 'admin')) return;

    setIsUpdatingStatus(true); // (เริ่มโหลด)
    try {
        const response = await apiClient.patch(`/tickets/${ticket.ticket_id}/status`, { status: newStatus });
        // (อัปเดต State ของ Ticket ในหน้า Detail ด้วยข้อมูลล่าสุดจาก Backend)
        setTicket(response.data); 
        // alert('Ticket status updated successfully!'); // (ไม่ต้อง alert ก็ได้)
    } catch (err) {
        console.error('Failed to update ticket status:', err);
        alert('Failed to update ticket status. Please try again.');
    } finally {
        setIsUpdatingStatus(false); // (หยุดโหลด)
    }
};

    // ฟังก์ชันสำหรับ "ส่ง" คอมเมนต์
    const handleCommentSubmit = async () => {
        // 1. เช็กว่าคอมเมนต์ไม่ว่าง
        if (newComment.trim() === "") {
            return; // ไม่ทำอะไรถ้าช่องว่าง
        }

        setIsPosting(true);

        try {
            // 2. ส่งข้อมูลไปที่ Backend (ที่เราเพิ่งสร้าง)
            const response = await apiClient.post('/comments', {
                ticket_id: ticket.ticket_id,
                message: newComment
            });

            // 3. (สำคัญ!) เมื่อสำเร็จ Backend จะส่งข้อมูลคอมเมนต์ใหม่กลับมา (response.data)
            // เราเอามันมา "ต่อท้าย" ใน State 'ticket' ของเรา
            // นี่คือการ "Real-time update" โดยไม่ต้องโหลดหน้าใหม่
            setTicket(prevTicket => ({
                ...prevTicket,
                comments: [...prevTicket.comments, response.data]
            }));

            // 4. ล้างช่อง Input
            setNewComment("");

        } catch (err) {
            console.error("Failed to post comment", err);
            alert("Error: Could not post comment."); // แจ้งเตือนผู้ใช้
        } finally {
            setIsPosting(false); // หยุดหมุน
        }
    };

    // (ฟังก์ชันสำหรับ "ยืนยันการลบ" - จะถูกเรียกจาก Modal)
    const handleDeleteTicket = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            // (ยิง API 'DELETE' ไปที่ Backend)
            await apiClient.delete(`/tickets/${id}`);
            
            // (เมื่อลบสำเร็จ)
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
            alert("Ticket deleted successfully!");
            
            // (ส่งผู้ใช้กลับไปหน้ารายการ)
            navigate('/ticket-flow');

        } catch (err) {
            console.error("Failed to delete ticket", err);
            setError("Failed to delete ticket. Please try again.");
            setIsDeleting(false);
        }
    };
    
    if (loading) { return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>กำลังโหลด Ticket...</div>; }
    if (error) { return <div className="min-h-screen flex items-center justify-center text-red-500" style={{ backgroundColor: '#edf4f5' }}>{error}</div>; }
    if (!ticket) { return null; }


    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            <main className="p-8 max-w-6xl mx-auto w-full">
                <button onClick={() => navigate('/ticket-flow')} className="text-gray-600 hover:text-gray-900 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-1">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                    Back to Ticket
                </button>
                
                <div className="flex flex-col md:flex-row gap-6">

                    {/* --- คอลัมน์ซ้าย (Main Content) --- */}
                    <div className="flex-grow md:w-2/3 space-y-6">
                        
                        {/* กล่อง Ticket */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                                
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-bold text-gray-800">{formatTicketID(ticket.ticket_id)}</span>
                                {/* (กลุ่มของปุ่มที่เพิ่มเข้ามา) */}
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => navigate(`/ticket-edit/${id}`)}
                                        className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100 transition-colors"
                                        title="Edit Ticket"
                                    >
                                        <img src={EditIcon} alt="View" className="w-5 h-5" />
                                    </button>
                                    <button 
                                        onClick={() => setIsDeleteModalOpen(true)}
                                        className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                                        title="Delete Ticket"
                                        disabled={isDeleting}
                                    >
                                        <img src={DeleteIcon} alt="Delete" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold mb-2">{ticket.title}</h1>
                            <p className="text-gray-500 text-sm mb-1">Description</p>
                            <p className="text-gray-700 whitespace-pre-wrap mb-6">{ticket.description}</p>
                            
                            {ticket.attachments && ticket.attachments.length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <p className="text-gray-500 text-sm mb-2">Attachments</p>
                                    <div className="space-y-2">
                                        {ticket.attachments.map(att => {
                                            const fullFilePath = `${backendRootUrl}${att.file_path}`;
                                            const isImage = att.attachmentcol && att.attachmentcol.startsWith('image/');
                                            return (
                                                <div key={att.attachment_id}>
                                                    {isImage ? (
                                                        <img 
                                                            src={fullFilePath} 
                                                            alt={att.file_name}
                                                            className="w-1/2 h-auto rounded-lg border shadow-sm" // (นี่คือที่คุณเพิ่งแก้ขนาด)
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
                            )}
                        </div>
                        
                        {/* --- (เพิ่ม 3/4) --- */}
                        {/* กล่อง Comments (แก้ไขส่วนแสดงผลและ Input) */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg">
                            <h2 className="font-bold mb-4">Comment ( {ticket.comments ? ticket.comments.length : 0} )</h2>
                            
                            {/* ส่วนแสดงคอมเมนต์ (ไม่แก้ไข) */}
                            <div className="space-y-4 mb-4">
                                {ticket.comments && ticket.comments.length > 0 ? (
                                    ticket.comments.map(comment => (
                                        <div key={comment.comment_id} className="flex space-x-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div> {/* TODO: ใส่รูป Profile */}
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{comment.user.name}</p>
                                                <p className="text-xs text-gray-500">{formatDateTime(comment.created_at)}</p>
                                                <div className="bg-gray-100 p-3 rounded-lg mt-1 text-sm">
                                                    {comment.message} {/* <-- (แก้ชื่อ field ให้ตรงกับ DB) */}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center text-sm py-4">ยังไม่มีคอมเมนต์เลย</p>
                                )}
                            </div>
                            
                            {/* ส่วน Input คอมเมนต์ */}
                            <div className="relative">
                                <Input 
                                    type="text" 
                                    placeholder={isPosting ? "กำลังส่ง..." : "พิมพ์คอมเมนต์สักหน่อย..."}
                                    isDark={true}
                                    className="pr-16"
                                    value={newComment} // <-- 1. ผูก State
                                    onChange={(e) => setNewComment(e.target.value)} // <-- 2. อัปเดต State
                                    disabled={isPosting} // <-- 3. ปิดการใช้งานตอนส่ง
                                />
                                <div className="absolute right-2 top-0 h-full flex items-center space-x-2">
                                    {/* หมายเหตุ: การอัปโหลดไฟล์ในคอมเมนต์ซับซ้อนมาก ขอปิดไว้ก่อน */}
                                    <button className="p-2 text-gray-400 cursor-not-allowed" disabled>
                                        <img src={AttachIcon} alt="View" className="w-5 h-5" />
                                    </button>
                                    <button 
                                        className="p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-400"
                                        onClick={handleCommentSubmit} // <-- 4. เรียกฟังก์ชันส่ง
                                        disabled={isPosting} // <-- 5. ปิดการใช้งานตอนส่ง
                                    >
                                        <img src={SendIcon} alt="View" className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- คอลัมน์ขวา (Sidebar - ไม่มีการแก้ไข) --- */}
                    <div className="md:w-1/3">
                        {/* ... (โค้ด Sidebar ทั้งหมด) ... */}
                        <div className="bg-white p-6 rounded-2xl shadow-lg space-y-4">
                            <h2 className="text-xl font-bold">Ticket Information</h2>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Priorities</span>
                                <PriorityBadge priority={ticket.priority} />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                {(user && (user.role === 'staff' || user.role === 'admin')) ? (
                                    (() => {
                                        const colorClass = getStatusColorClasses(ticket.status);
                                        return (
                                            <select
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(e.target.value)}
                                                disabled={isUpdatingStatus}
                                            >
                                                {/* (เราต้อง "บังคับ" สีของ <option> ด้วย เพราะ <select> จะไม่สืบทอดสีไป) */}
                                                <option value="open" className="text-black bg-white">Open</option>
                                                <option value="in_progress" className="text-black bg-white">In Progress</option>
                                                <option value="resolved" className="text-black bg-white">Resolved</option>
                                                <option value="closed" className="text-black bg-white">Closed</option>
                                            </select>
                                        );
                                    })()
                                ) : (
                                    <StatusBadge status={ticket.status} />
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Categories</span>
                                <span className="font-semibold">{ticket.category ? ticket.category.name : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Create Date</span>
                                <span className="font-semibold">{formatDateTime(ticket.created_at)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Create By</span>
                                <span className="font-semibold">{ticket.user ? ticket.user.email : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Assigned Staff</span>
                                <span className="font-semibold">{ticket.agent ? ticket.agent.name : 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            {/* (เรียกใช้ Modal Component ที่เราสร้างไว้) */}
            <DeleteModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteTicket}
                isDeleting={isDeleting}
            />
        </div>
    );
}

export default TicketDetailPage;