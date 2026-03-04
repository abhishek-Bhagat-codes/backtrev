const statusStyles = {
    active: "bg-red-600/20 text-red-400",
    acknowledged: "bg-green-600/20 text-green-400",
};

const AlertHistory = ({ alerts }) => {
    if (!alerts.length) {
        return (
            <p className="text-sm text-gray-500">No alerts found for this tourist</p>
        );
    }

    return (
        <div className="space-y-3">
            {alerts.map(alert => ( 
                <div key={alert.id} className="flex items-center justify-between bg-gray-800/60 px-4 py-2 rounded-md">
            
                    <div>
                        <p className="text-sm font-medium">{alert.type} – {alert.id}</p>
                        <p className="text-xs text-gray-400">{alert.time}</p>
                    </div>

                    <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[alert.status]}`} > {alert.status} </span>
                </div>
            ))}
        </div>
    );
};

export default AlertHistory;
