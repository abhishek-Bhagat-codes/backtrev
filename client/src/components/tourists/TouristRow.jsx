import { useNavigate } from "react-router-dom";

const statusColor = {
    safe: "text-green-400 border-green-400/50",
    warning: "text-yellow-400 border-yellow-400/50",
    sos: "text-red-400 border-red-400/50",
};

const TouristRow = ({ tourist }) => {
    const navigate = useNavigate();
    const handleRowClick = () => {
        navigate(`/tourists/${tourist.id}`);
    };

    return (
        <tr onClick={handleRowClick} className="border-t border-gray-800 hover:bg-gray-900/50 hover:cursor-pointer">
            <td className="p-3">{tourist.id}</td>
            <td className="p-3 font-medium">{tourist.name}</td>
            <td className="p-3">{tourist.itinerary}</td>
            <td className="p-3">
                <span className={`px-2 py-1 text-xs rounded-full border ${statusColor[tourist.status]}`}>
                    {tourist.status.toUpperCase()}
                </span>
            </td>
            <td className="p-3 text-gray-400"> {new Date(tourist.lastSeen).toLocaleString()} </td>
        </tr>
    );
};

export default TouristRow;