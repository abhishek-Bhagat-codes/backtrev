const StatCard = ({ label, value, color }) => {
    return (
        <div className="bg-linear-to-b from-gray-900 to-gray-950 p-5 rounded-xl border border-gray-800">
            <p className="text-sm text-gray-400">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
    );
};

export default StatCard;
