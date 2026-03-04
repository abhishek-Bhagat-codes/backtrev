import React from 'react';

const TouristFilter = ({status, setStatus}) => {
    return (
        <>
           {/* Status TouristFilter */}
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-40 bg-gray-950 border border-gray-700 rounded-md px-3 py-2 text-sm outline-none" >
                <option value="all">All Status</option>
                <option value="safe">Safe</option>
                <option value="warning">Warning</option>
                <option value="sos">SOS</option>
            </select>
        </>
    );
}

export default TouristFilter;
