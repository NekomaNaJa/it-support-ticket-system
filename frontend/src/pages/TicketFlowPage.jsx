import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import Input from '../components/Input';
import { useAuth } from '../context/AuthContext';
import ViewIcon from '../assets/View.png';
import PlusIcon from '../assets/Plus.png';
import MinusIcon from '../assets/Minus.png';
import { PriorityBadge, StatusBadge } from '../components/Badges';
import { formatDateTime, formatTicketID } from '../utils/formatters';
import StatCard from '../components/StatCard';

// --- (3. ฟังก์ชันคำนวณสถิติ - 2 แบบ) ---
// (นี่คือ 'calculateStats' เดิมของคุณ ที่เปลี่ยนชื่อ)
const calculateUserStats = (tickets) => {
    const stats = { open: 0, inProgress: 0, resolved: 0, closed: 0, total: tickets.length };
    tickets.forEach(ticket => {
        if (ticket.status === 'open') stats.open++;
        else if (ticket.status === 'in_progress') stats.inProgress++;
        else if (ticket.status === 'resolved') stats.resolved++;
        else if (ticket.status === 'closed') stats.closed++;
    });
    return stats;
};

// (ฟังก์ชันสำหรับ Staff)
const calculateStaffStats = (tickets, currentUserId) => {
    const stats = { total: tickets.length, assignedToMe: 0, unassigned: 0, closed: 0 };
    tickets.forEach(ticket => {
        if (ticket.agent_id === currentUserId) {
            stats.assignedToMe++;
        }
        if (!ticket.agent_id) {
            stats.unassigned++;
        }
        if (ticket.status === 'closed') {
            stats.closed++;
        }
    });
    return stats;
};

// --- Main Page Component ---
function TicketFlowPage() {
    const [tickets, setTickets] = useState([]); // Master List
    const [stats, setStats] = useState({}); // (เริ่มต้นเป็น object ว่าง)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // (State สำหรับ Filter)
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [assigneeFilter, setAssigneeFilter] = useState('all');
    
    // --- State สำหรับ "กำลัง Assign" ---
    const [isAssigning, setIsAssigning] = useState(null); // (จะเก็บ ticket_id ที่กำลังโหลด)
    
    // (ตัวแปรเช็ก Role)
    const isStaff = useMemo(() => {
        return user && (user.role === 'staff' || user.role === 'admin');
    }, [user]);

    // (useEffect)
    useEffect(() => {
        if (!user) return; // (รอจนกว่า 'user' จะพร้อม)

        const fetchTickets = async () => {
            try {
                setLoading(true);
                const ticketsResponse = await apiClient.get('/tickets'); 
                const ticketsData = ticketsResponse.data;
                
                setTickets(ticketsData);
                
                // (คำนวณ Stats ตาม Role)
                if (isStaff) {
                    setStats(calculateStaffStats(ticketsData, user.user_id));
                } else {
                    setStats(calculateUserStats(ticketsData));
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('ไม่สามารถโหลดข้อมูลได้ (Failed to load data)');
                setLoading(false);
                if (err.response && err.response.status === 401) {
                    navigate('/login'); 
                }
            }
        };
        fetchTickets();
    }, [navigate, user, isStaff]); // (เพิ่ม user, isStaff dependencies)

    // (useMemo (Logic กรอง) - นำโค้ดที่ถูกต้องกลับมา)
    const filteredTickets = useMemo(() => {
        if (!user) return []; // (รอจนกว่า user จะพร้อม)

        const lowerSearchTerm = searchTerm.toLowerCase();
        
        return tickets.filter(ticket => {
            const statusMatch = statusFilter === 'all' || ticket.status === statusFilter;
            const priorityMatch = priorityFilter === 'all' || ticket.priority === priorityFilter;
            
            const searchMatch = searchTerm === '' || 
                ticket.title.toLowerCase().includes(lowerSearchTerm) ||
                (ticket.description && ticket.description.toLowerCase().includes(lowerSearchTerm)) ||
                `tk-${String(ticket.ticket_id).padStart(3, '0')}`.toLowerCase().includes(lowerSearchTerm);

            if (isStaff) {
                const assigneeMatch = assigneeFilter === 'all' ||
                    (assigneeFilter === 'me' && ticket.agent_id === user.user_id) ||
                    (assigneeFilter === 'unassigned' && !ticket.agent_id);
                return statusMatch && priorityMatch && assigneeMatch && searchMatch;
            }

            return statusMatch && priorityMatch && searchMatch;
        });
    }, [tickets, searchTerm, statusFilter, priorityFilter, assigneeFilter, user, isStaff]); 

    // --- (ฟังก์ชัน "รับ/ปล่อย" งาน) ---
    const handleAssignToggle = async (ticketId) => {
        setIsAssigning(ticketId); // (ล็อคปุ่มสำหรับ ID นี้)

        try {
            // (ยิง API 'PATCH' ที่เราเพิ่งสร้าง)
            const response = await apiClient.patch(`/tickets/${ticketId}/assign`);
            const updatedTicket = response.data;

            // (อัปเดต Master List)
            const newTickets = tickets.map(t => 
                t.ticket_id === updatedTicket.ticket_id ? updatedTicket : t
            );
            setTickets(newTickets);

            // (อัปเดต Stats ทันที!)
            if (isStaff) {
                setStats(calculateStaffStats(newTickets, user.user_id));
            }

        } catch (err) {
            console.error('Failed to assign ticket:', err);
            alert('Action failed. The ticket might be assigned to someone else.');
        } finally {
            setIsAssigning(null); // (ปลดล็อคปุ่ม)
        }
    };

    const handleCreateTicket = () => { navigate('/create-ticket'); }; 

    if (loading) { return <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#edf4f5' }}>กำลังโหลด...</div>; }
    if (error) { return <div className="min-h-screen flex items-center justify-center text-red-500" style={{ backgroundColor: '#edf4f5' }}>{error}</div>; }

    // --- (JSX ทั้งหมด) ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>

            {/* --- Main Content --- */}
            <main className="p-8 max-w-7xl mx-auto w-full">
                
                {/* --- แถวที่ 1: Title (Conditional) --- */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {isStaff ? 'All Ticket' : 'My Ticket'}
                        <span className="text-lg font-normal text-gray-500 ml-4">
                            Total {stats.total || 0}
                        </span>
                    </h1>
                    <button onClick={handleCreateTicket} className="flex items-center space-x-2 px-6 py-3 bg-gray-700 text-white rounded-lg shadow-md hover:bg-gray-800 transition-colors">
                        <span className="text-lg font-medium">+ Create new Ticket</span>
                    </button>
                </div>

                {/* --- แถวที่ 2: Stats (Conditional) --- */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    {isStaff ? (
                        <>
                            <StatCard title="Total" value={stats.total || 0} />
                            <StatCard title="Assigned to Me" value={stats.assignedToMe || 0} colorClass="text-blue-500" />
                            <StatCard title="Unassigned" value={stats.unassigned || 0} colorClass="text-yellow-500" />
                            <StatCard title="Closed" value={stats.closed || 0} colorClass="text-gray-500" />
                        </>
                    ) : (
                        <>
                            <StatCard title="Open" value={stats.open || 0} colorClass="text-red-500" />
                            <StatCard title="In Progress" value={stats.inProgress || 0} colorClass="text-yellow-500" />
                            <StatCard title="Resolved" value={stats.resolved || 0} colorClass="text-green-500" />
                            <StatCard title="Closed" value={stats.closed || 0} colorClass="text-gray-500" />
                        </>
                    )}
                </div>

                {/* --- แถวที่ 3: Filters (Conditional) --- */}
                <div className="bg-white p-4 rounded-lg shadow-lg flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex-grow min-w-[200px]">
                        <Input 
                            type="text" 
                            placeholder="Search Ticket (Title, Desc, ID)..." 
                            isDark={true}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="p-3 rounded-lg bg-gray-100 border-transparent"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <select 
                        className="p-3 rounded-lg bg-gray-100 border-transparent"
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                    >
                        <option value="all">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                    </select>
                    
                    {isStaff && (
                        <select 
                            className="p-3 rounded-lg bg-gray-100 border-transparent"
                            value={assigneeFilter}
                            onChange={(e) => setAssigneeFilter(e.target.value)}
                        >
                            <option value="all">All Assignee</option>
                            <option value="me">Assigned to Me</option>
                            <option value="unassigned">Unassigned</option>
                        </select>
                    )}
                </div>

                {/* --- แถวที่ 4: Table (Conditional Columns) --- */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                {isStaff && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>}
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!loading && filteredTickets.length === 0 && (
                                <tr>
                                    <td colSpan={isStaff ? 7 : 6} className="p-8 text-center text-gray-500">
                                        No tickets match your filters.
                                    </td>
                                </tr>
                            )}
                            
                            {filteredTickets.map((ticket) => (
                                <tr key={ticket.ticket_id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{formatTicketID(ticket.ticket_id)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-left">{ticket.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center"><PriorityBadge priority={ticket.priority} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center"><StatusBadge status={ticket.status} /></td>
                                    
                                    {isStaff && (
                                        <td className="px-6 py-4 whitespace-nowrap text-left text-sm">
                                            {ticket.agent ? ticket.agent.name : <span className="text-gray-400">Unassigned</span>}
                                        </td>
                                    )}
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-center">{formatDateTime(ticket.created_at)}</td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center space-x-2">
                                            {isStaff && !ticket.agent_id && (
                                                <button 
                                                    className="p-1 text-green-500 hover:bg-green-100 rounded-full disabled:text-gray-300" 
                                                    title="Take Ticket"
                                                    onClick={() => handleAssignToggle(ticket.ticket_id)}
                                                    disabled={isAssigning === ticket.ticket_id} // (ปิดปุ่มถ้ากำลังโหลด)
                                                >
                                                    {isAssigning === ticket.ticket_id ? '...' : <img src={PlusIcon} alt="Assign" className="w-4 h-4" />}
                                                </button>
                                            )}
                                            {isStaff && ticket.agent_id === user?.user_id && (
                                                <button 
                                                    className="p-1 text-red-500 hover:bg-red-100 rounded-full disabled:text-gray-300" 
                                                    title="Drop Ticket"
                                                    onClick={() => handleAssignToggle(ticket.ticket_id)}
                                                    disabled={isAssigning === ticket.ticket_id} // (ปิดปุ่มถ้ากำลังโหลด)
                                                >
                                                    {isAssigning === ticket.ticket_id ? '...' : <img src={MinusIcon} alt="Unassign" className="w-4 h-4" />}
                                                </button>
                                            )}
                                            <button 
                                                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full" 
                                                title="View Ticket"
                                                onClick={() => navigate(`/ticket/${ticket.ticket_id}`)}
                                            >
                                                <img src={ViewIcon} alt="View" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}

export default TicketFlowPage;