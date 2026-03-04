import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Globe, Users, TriangleAlert, ChartColumn, MapPin } from "lucide-react";

const AppLayout = () => {
    return (
        <div className="min-h-screen grid grid-cols-[240px_1fr]">
            <aside className="bg-gray-900 text-white p-4 h-screen sticky top-0 flex flex-col overflow-y-auto">
                <div className="flex items-center gap-3 border-b border-gray-600 pb-3">
                    <div className="p-2 bg-blue-900/40 border border-blue-900 rounded-md w-8 h-8 flex items-center justify-center">
                        {/* icon ya logo yahan */}
                    </div>
                    <div className="flex flex-col leading-tight">
                        <h2 className="text-sm text-gray-400">Smart Tourist Safety</h2>
                        <h1 className="text-xl font-bold">Admin Panel</h1>
                    </div>
                </div>

                <nav className="space-y-2 mt-3">
                    <NavLink to="/" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition ${isActive ? "bg-blue-900/40 text-blue-500  border border-blue-900" : "hover:bg-green-900/50"}`}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </NavLink>

                    <NavLink to="/tourists" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition ${isActive ? "bg-blue-900/40 text-blue-500 border border-blue-900" : "hover:bg-green-900/50"}`}>
                        <Users size={18} />
                        <span>Tourists</span>
                    </NavLink>

                    <NavLink to="/alerts" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition ${isActive ? "bg-blue-900/40 text-blue-500 border border-blue-900" : "hover:bg-green-900/50"}`}>
                        <TriangleAlert size={18} />
                        <span>Alerts</span>
                    </NavLink>

                    <NavLink to="/reports" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition ${isActive ? "bg-blue-900/40 text-blue-500 border border-blue-900" : "hover:bg-green-900/50"}`}>
                        <ChartColumn size={18} />
                        <span>Reports</span>
                    </NavLink>

                    <NavLink to="/riskyzones" className={({ isActive }) => `flex items-center gap-3 px-4 py-2 rounded-md transition ${isActive ? "bg-blue-900/40 text-blue-500 border border-blue-900" : "hover:bg-green-900/50"}`}>
                        <MapPin size={18} />
                        <span>Risky Zones</span>
                    </NavLink>
                </nav>
                <div className="mt-auto w-full border-t border-gray-700 pt-3 mb-2 flex items-center gap-2">
                    <Globe size={20} className="text-white shrink-0" />
                    <select className="w-full px-2 py-2 rounded-md border border-gray-600 bg-gray-800 text-white text-sm shadow focus:outline-none">
                        <option className="bg-gray-900" value={"English"}>English</option>
                        <option className="bg-gray-900" value={"Hindi"}>Hindi</option>
                    </select>
                </div>
            </aside>
            <main className="bg-gray-950 text-white p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default AppLayout;
