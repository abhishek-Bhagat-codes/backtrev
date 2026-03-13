import DashboardHeader from "../components/dashboard/DashboardHeader";
import StatsGrid from "../components/dashboard/StatsGrid";
import MapSection from "../components/dashboard/MapSection";
import ActiveAlertsPanel from "../components/dashboard/ActiveAlertsPanel";

const Dashboard = ({ tourists, alerts, zones, updateAlertStatus, loading, error, onRetry, useDummy, setUseDummy }) => {
    const stats = {
        total: tourists.length,
        active: alerts.filter(a => a.status === "active").length,
        ack: alerts.filter(a => a.status === "acknowledged").length,
        dispatched: alerts.filter(a => a.status === "dispatched").length
    };

    const activeAlerts = alerts.filter(a => a.status === "active");

    return (
        <>
            <DashboardHeader page="Dashboard" />
            {error && (
                <div className="mb-4 p-3 bg-amber-900/30 border border-amber-700 rounded-lg text-amber-200 text-sm flex items-center justify-between gap-2">
                    <span>{error} (using demo data)</span>
                    <div className="flex gap-2">
                        <button onClick={onRetry} className="px-3 py-1 bg-amber-700 rounded hover:bg-amber-600">Retry</button>
                        {setUseDummy && <button onClick={() => setUseDummy(true)} className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600">Use demo only</button>}
                    </div>
                </div>
            )}
            {loading && (
                <div className="mb-4 p-2 text-gray-400 text-sm">Loading data...</div>
            )}

            <div className="grid grid-cols-[1fr_370px] gap-4">
                <div>
                    <StatsGrid stats={stats} />
                    <MapSection tourists={tourists} alerts={alerts} zones={zones} />
                </div>

                <ActiveAlertsPanel alerts={activeAlerts} updateAlertStatus={updateAlertStatus} />
            </div>
        </>
    );
};

export default Dashboard;