import { Bell, LogOut } from "lucide-react";
import { useAuth } from '../../context/auth';
import { useState, useEffect} from 'react';

const DashboardHeader = ({ page }) => {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (open) {
            const timer = setTimeout(() => { setOpen(false);}, 5000); // 5 sec
            return () => clearTimeout(timer); 
        }
    }, [open]);

    return (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <h1 className="text-xl font-semibold">Smart Tourist Safety - {page}</h1>
            <div className="flex items-center gap-3">
                <button className="p-2 rounded-md cursor-pointer hover:bg-green-700"><Bell size={18} /></button>
                <div className="relative">
                    <button onClick={() => setOpen(!open)} className="cursor-pointer px-4 py-2 bg-gray-800 rounded-md text-sm">Police</button>
                    {open && (
                        <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-800 rounded-md shadow-lg">
                            <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-800">Logged in as {user.role}</div>
                            <button onClick={logout} className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-green-700"><LogOut size={16} />Logout</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DashboardHeader;
