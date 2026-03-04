import AlertItem from "./AlertItem";
import { TriangleAlert } from 'lucide-react';

const ActiveAlertsPanel = ({ alerts, updateAlertStatus}) => {
    
    return (
        <div className="h-full bg-linear-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <TriangleAlert size={18} className="text-red-500" />
                <h2 className="text-sm font-semibold text-white">Active Alerts</h2>
            </div>

            <div className="space-y-3">{alerts.map(a => (<AlertItem key={a.id} alert={a} updateAlertStatus={updateAlertStatus}/>))}</div>
        </div>
    );
};

export default ActiveAlertsPanel;
