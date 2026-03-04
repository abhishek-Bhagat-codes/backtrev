import ActiveAlertsPanel from "./ActiveAlertsPanel";
import StatCard from "./StatCard";

const StatsGrid = ({ stats }) => {
    return (
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-3 mb-3 ">
            <StatCard label="Total Tourists" value={stats.total} color="text-white" />
            <StatCard label="Active Alerts" value={stats.active} color="text-red-400" />
            <StatCard label="Acknowledged" value={stats.ack} color="text-blue-400" />
            <StatCard label="Dispatched" value={stats.dispatched} color="text-green-400" />  
        </div>
    );
};

export default StatsGrid;
