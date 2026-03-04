import { Send, CircleCheck, User } from "lucide-react";

const statusStyles = {
    active: "border-red-700 text-red-400",
    acknowledged: "border-blue-700 text-blue-400",
    dispatched: "border-green-700 text-green-400",
};

const AlertItem = ({ alert, updateAlertStatus}) => {

    return (
        <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between min-h-40">
        
            {/* TOP */}
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-sm font-semibold">{alert.type} – {alert.id}</h3>
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${statusStyles[alert.status]}`} >{alert.status}</span> 
                </div>

                <div className="flex items-center gap-2 text-gray-200">
                    <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700">
                        <User size={20} className="text-gray-300" />    
                    </div>
                    <span><h4>{alert.name} ( {alert.touristId} )</h4></span>
                </div>

                <p className="text-xs text-gray-500">{alert.time}</p>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">
                <button className="flex-1 text-xs bg-gray-800 py-2 rounded-md hover:cursor-pointer flex items-center justify-center gap-1 hover:bg-gray-900" onClick={() => updateAlertStatus(alert.id, "acknowledged")}>
                    <CircleCheck size={14} />
                    Acknowledge
                </button>

                <button className="flex-1 text-xs bg-blue-600 py-2 rounded-md hover:cursor-pointer flex items-center justify-center gap-1 hover:bg-blue-700" onClick={() => updateAlertStatus(alert.id, "dispatched")}>
                    <Send size={14} />
                    Dispatch Police
                </button>
            </div>
        </div>
    );
};

export default AlertItem;
