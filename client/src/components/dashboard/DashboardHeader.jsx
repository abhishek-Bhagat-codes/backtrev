import React from 'react';
import { Bell } from "lucide-react";

const DashboardHeader = () => {
    return (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <h1 className="text-xl font-semibold">Smart Tourist Safety - Dashboard</h1>
            <div className="flex items-center gap-3">
                <button className="p-2 rounded-md hover:bg-green-700"><Bell size={18} /></button>
                <button className="px-4 py-2 bg-gray-800 rounded-md text-sm">Police</button>
            </div>
        </div>
    );
}

export default DashboardHeader;
