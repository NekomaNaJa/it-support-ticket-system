import React from 'react';

const StatCard = ({ title, value, colorClass = "text-black" }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
        <div className={`text-4xl font-bold ${colorClass}`}>{value}</div>
        <div className="text-sm uppercase text-gray-500 mt-2">{title}</div>
    </div>
);

export default StatCard;