import { useState } from "react";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MapView from "../components/map/MapView";
import { createZone } from "../services/api";

const RISK_COLORS = {
    1: { text: "text-emerald-400", bg: "bg-emerald-500", dot: "#10b981" },
    2: { text: "text-amber-400", bg: "bg-amber-500", dot: "#f59e0b" },
    3: { text: "text-amber-400", bg: "bg-amber-500", dot: "#f59e0b" },
    4: { text: "text-red-400", bg: "bg-red-500", dot: "#ef4444" },
    5: { text: "text-red-400", bg: "bg-red-500", dot: "#ef4444" },
};

// API returns center: [lng, lat]; legacy/dummy may have location: { lat, lng }
function toDisplayZone(zone) {
    let lat, lng;
    if (zone.center && Array.isArray(zone.center)) {
        [lng, lat] = zone.center;
    } else if (zone.location) {
        lat = zone.location.lat;
        lng = zone.location.lng;
    } else {
        lat = 28.6139;
        lng = 77.209;
    }
    return {
        id: zone.id,
        name: zone.name,
        lat,
        lng,
        radius: zone.radius ?? 300,
        type: zone.type || "risk zone",
        risk_level: zone.risk_level ?? (zone.risk === "High" ? 4 : zone.risk === "Medium" ? 3 : 2),
    };
}

export default function RiskyZones({ zones = [], loading = false, onRefresh }) {
    const [form, setForm] = useState({
        name: "",
        latitude: "",
        longitude: "",
        radius: "300",
        type: "crime zone",
        risk_level: 4,
    });
    const [error, setError] = useState("");
    const [adding, setAdding] = useState(false);
    const [added, setAdded] = useState(false);

    const displayZones = zones.map(toDisplayZone);

    const inputCls =
        "w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all";

    const handleAdd = async () => {
        if (!form.name.trim()) {
            setError("Zone name is required.");
            return;
        }

        const lat = Number.parseFloat(form.latitude) || 28.6139;
        const lng = Number.parseFloat(form.longitude) || 77.209;
        const radius = Number.parseFloat(form.radius) || 300;

        setError("");
        setAdding(true);

        try {
            await createZone({
                name: form.name.trim(),
                latitude: lat,
                longitude: lng,
                radius,
                type: form.type || "crime zone",
                expiry_type: "infinite",
                expiry_time: null,
                risk_level: Number(form.risk_level) || 4,
            });

            setForm({ name: "", latitude: "", longitude: "", radius: "300", type: "crime zone", risk_level: 4 });
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);

            if (onRefresh) onRefresh();
        } catch (err) {
            setError(err.message || "Failed to create zone");
        } finally {
            setAdding(false);
        }
    };

    return (
        <>
            <DashboardHeader page="Risky Zones" />
            <div className="min-h-screen text-slate-200 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3 space-y-5">
                            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6 space-y-4">
                                <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Add Risky Zone</h2>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Zone Name</label>
                                    <input
                                        className={inputCls}
                                        placeholder="e.g., Old Delhi Crowded Market"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Latitude</label>
                                        <input
                                            className={inputCls}
                                            placeholder="28.6562"
                                            value={form.latitude}
                                            onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Longitude</label>
                                        <input
                                            className={inputCls}
                                            placeholder="77.241"
                                            value={form.longitude}
                                            onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Radius (meters)</label>
                                    <input
                                        className={inputCls}
                                        placeholder="300"
                                        type="number"
                                        min="50"
                                        max="5000"
                                        value={form.radius}
                                        onChange={(e) => setForm({ ...form, radius: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Type</label>
                                    <select
                                        className={`${inputCls} cursor-pointer`}
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="crime zone">Crime Zone</option>
                                        <option value="crowded area">Crowded Area</option>
                                        <option value="high risk">High Risk</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Risk Level (1-5)</label>
                                    <select
                                        className={`${inputCls} cursor-pointer`}
                                        value={form.risk_level}
                                        onChange={(e) => setForm({ ...form, risk_level: Number(e.target.value) })}
                                    >
                                        <option value={1}>1 - Low</option>
                                        <option value={2}>2 - Medium-Low</option>
                                        <option value={3}>3 - Medium</option>
                                        <option value={4}>4 - High</option>
                                        <option value={5}>5 - Critical</option>
                                    </select>
                                </div>

                                {error && <p className="text-xs text-red-400">{error}</p>}

                                <button
                                    onClick={handleAdd}
                                    disabled={adding}
                                    className="w-full py-2.5 cursor-pointer rounded-lg text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {adding ? "Adding..." : added ? "Zone Added" : "Add Zone"}
                                </button>
                            </div>

                            <div className="rounded-2xl bg-gray-900/40 border border-gray-700 px-6 py-5 shadow-[0_0_0_1px_rgba(10,36,77,0.15)]">
                                <h2 className="mb-6 font-semibold text-white">All Risky Zones</h2>

                                {loading ? (
                                    <p className="py-8 text-center text-sm text-slate-500">Loading zones...</p>
                                ) : displayZones.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-slate-500">No zones yet. Add one above to get started.</p>
                                ) : (
                                    <div className="overflow-y-auto max-h-80 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] items-center border-b border-white/10 px-4 pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                            <span>Name</span>
                                            <span>Latitude</span>
                                            <span>Longitude</span>
                                            <span>Radius</span>
                                            <span>Risk</span>
                                        </div>

                                        {displayZones.map((zone) => (
                                            <div
                                                key={zone.id}
                                                className="grid grid-cols-[1.5fr_1fr_1fr_1fr_0.8fr] items-center border-b border-white/10 px-4 py-3 text-sm text-slate-200 last:border-b-0 hover:bg-white/5 transition-colors"
                                            >
                                                <span className="pr-4 font-medium text-white">{zone.name}</span>
                                                <span className="text-slate-400">{zone.lat.toFixed(4)}</span>
                                                <span className="text-slate-400">{zone.lng.toFixed(4)}</span>
                                                <span className="text-slate-400">{zone.radius}m</span>
                                                <span className={`${RISK_COLORS[zone.risk_level]?.text || "text-red-400"} font-medium`}>
                                                    {zone.risk_level}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <div className="bg-gray-900/40 border border-gray-700 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Map Preview</h2>
                                    <div className="flex gap-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" /> Med
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-red-500" /> High
                                        </span>
                                    </div>
                                </div>

                                <div className="h-105 rounded-xl overflow-hidden border border-white/10">
                                    <MapView zones={zones} tourists={[]} />
                                </div>
                                <p className="text-xs text-slate-600 mt-3">
                                    Zones from database are shown as circles. New zones appear after adding.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
