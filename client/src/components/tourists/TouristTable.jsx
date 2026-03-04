import React from 'react';
import TouristRow from './TouristRow';

const TouristTable = ({tourists}) => {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-800">
            <table className="w-full text-sm">
                <thead className="bg-gray-900 text-gray-400">
                    <tr>
                        <th className="p-3 text-left">Tourist ID</th>
                        <th className="p-3 text-left">Name</th>
                        <th className="p-3 text-left">Itinerary</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Last Seen</th>
                    </tr>
                </thead>

                <tbody>
                    {tourists.map(t => ( <TouristRow key={t.id} tourist={t} /> ))}
                </tbody>
            </table>
        </div>
    );
}

export default TouristTable;
