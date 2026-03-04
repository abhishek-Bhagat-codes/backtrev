import React from 'react';

const AlertFilter = ({status, setStatus}) => {
    return (
        <div className="flex gap-4 mb-4">
           {/* Status TouristFilter */}
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm outline-none" >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="dispatched">Dispatched</option>
            </select>
        </div>
    );
}

export default AlertFilter;
