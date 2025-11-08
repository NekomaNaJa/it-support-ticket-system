import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import StatCard from '../components/StatCard'; // (Import StatCard)

// (Import เครื่องมือวาดกราฟ - ที่เราเพิ่ง 'npm install')
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend 
} from 'recharts';

// (กำหนดสีสำหรับกราฟ)
const STATUS_COLORS = {
    open: '#EF4444', // red-500
    in_progress: '#F59E0B', // yellow-500
    resolved: '#10B981', // green-500
    closed: '#6B7280', // gray-500
};
const PRIORITY_COLORS = {
    low: '#D1FAE5', // green-100
    medium: '#BFDBFE', // blue-200
    high: '#FDE68A', // yellow-300
    critical: '#FECACA', // red-200
};


function AdminDashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                // (ยิง API ที่เราเพิ่งสร้าง)
                const response = await apiClient.get('/admin/dashboard-stats');
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
                setError("Failed to load dashboard. You must be an Admin.");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // (ฟังก์ชันแปลงข้อมูลสำหรับ Pie Chart)
    const getStatusPieData = () => {
        if (!stats) return [];
        return [
            { name: 'Open', value: stats.status_stats.open },
            { name: 'In Progress', value: stats.status_stats.in_progress },
            { name: 'Resolved', value: stats.status_stats.resolved },
            { name: 'Closed', value: stats.status_stats.closed },
        ];
    };

    // (ฟังก์ชันแปลงข้อมูลสำหรับ Bar Chart)
    const getPriorityBarData = () => {
        if (!stats) return [];
        // (Recharts ต้องการ Array of Objects)
        return [
            { name: 'Low', value: stats.priority_stats.low || 0 },
            { name: 'Medium', value: stats.priority_stats.medium || 0 },
            { name: 'High', value: stats.priority_stats.high || 0 },
            { name: 'Critical', value: stats.priority_stats.critical || 0 },
        ];
    };


    if (loading) { return <div className="p-8">Loading Dashboard...</div>; }
    if (error) { return <div className="p-8 text-red-500">{error}</div>; }
    if (!stats) { return null; } // (ถ้ายังไม่มีข้อมูล)

    // (JSX - อ้างอิงจาก Wireframe 'image_a1cc9d.png')
    return (
        <div className="min-h-screen" style={{ backgroundColor: '#edf4f5' }}>
            <main className="p-8 max-w-7xl mx-auto w-full">

                {/* (Title & Filter) */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        System Dashboard
                    </h1>
                    {/* (TODO: ทำให้ Filter นี้ทำงาน) */}
                    <select className="p-2 rounded-lg bg-white border border-gray-300">
                        <option value="30">Last 30 days</option>
                        <option value="60">Last 60 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>

                {/* (Stats Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
                    <StatCard title="Total Tickets" value={stats.status_stats.total} />
                    <StatCard title="Open" value={stats.status_stats.open} colorClass="text-red-500" />
                    <StatCard title="In Progress" value={stats.status_stats.in_progress} colorClass="text-yellow-500" />
                    <StatCard title="Resolved" value={stats.status_stats.resolved} colorClass="text-green-500" />
                    <StatCard title="Closed" value={stats.status_stats.closed} colorClass="text-gray-500" />
                    <StatCard title="Past SLA" value={stats.status_stats.past_sla} colorClass="text-gray-400" />
                </div>

                {/* (Charts) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* (Pie Chart) */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets by Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={getStatusPieData()}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                >
                                    {getStatusPieData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase().replace(' ', '_')]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* (Bar Chart) */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Tickets by Priority</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={getPriorityBarData()}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value">
                                    {getPriorityBarData().map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name.toLowerCase()]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                </div>
            </main>
        </div>
    );
}

export default AdminDashboardPage;