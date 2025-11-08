import React from 'react';

export const PriorityBadge = ({ priority }) => {
    let colorClass = 'bg-gray-200 text-gray-800'; 
    switch (priority.toLowerCase()) {
        case 'critical': colorClass = 'bg-red-500 text-white'; break;
        case 'high': colorClass = 'bg-yellow-400 text-yellow-900'; break;
        case 'medium': colorClass = 'bg-blue-200 text-blue-900'; break;
        case 'low': colorClass = 'bg-gray-200 text-gray-800'; break;
        default: break;
    }
    return (<span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} capitalize`}>{priority}</span>);
};

export const getStatusColorClasses = (status) => {
    switch (status.toLowerCase()) {
        case 'open':
            return 'bg-gray-200 text-gray-800';
        case 'in_progress':
            return 'bg-yellow-200 text-yellow-900';
        case 'resolved':
            return 'bg-green-200 text-green-900';
        case 'closed':
            return 'bg-gray-400 text-gray-800';
        default:
            return 'bg-gray-200 text-gray-800';
    }
};

export const StatusBadge = ({ status }) => {
    const colorClass = getStatusColorClasses(status); 
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} capitalize`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export const RoleBadge = ({ role }) => {
    let colorClass = 'bg-gray-200 text-gray-800';
    if (role === 'admin') colorClass = 'bg-orange-500 text-white';
    else if (role === 'staff') colorClass = 'bg-blue-500 text-white';
    else if (role === 'user') colorClass = 'bg-gray-400 text-gray-900';

    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass} capitalize`}>{role}</span>;
};