import { useEffect, useRef, useState } from "react";
import { zones as dummyZones } from "../data/dummyData";
import DashboardHeader from "../components/dashboard/DashboardHeader";

const RISK_COLORS = {
    High: { text: "text-red-400", bg: "bg-red-500", dot: "#ef4444" },
    Medium: { text: "text-amber-400", bg: "bg-amber-500", dot: "#f59e0b" },
    Low: { text: "text-emerald-400", bg: "bg-emerald-500", dot: "#10b981" },
};

function toLocalZone(zone) {
    return {
        id: zone.id,
        name: zone.name,
        lat: zone.location?.lat ?? 28.6139,
        lng: zone.location?.lng ?? 77.209,
        risk: zone.risk || "High",
        notes: zone.notes || "",
    };
}

function MapPreview({ zones }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        if (mapLoaded || mapInstanceRef.current) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
        script.onload = () => {
            const L = window.L;
            const map = L.map(mapRef.current).setView([28.6139, 77.209], 11);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OSM</a>',
            }).addTo(map);
            mapInstanceRef.current = map;
            setMapLoaded(true);
        };
        document.head.appendChild(script);
    }, [mapLoaded]);

    useEffect(() => {
        if (!mapLoaded || !mapInstanceRef.current) return;

        const L = window.L;
        const map = mapInstanceRef.current;

        markersRef.current.forEach((marker) => map.removeLayer(marker));
        markersRef.current = [];

        zones.forEach((zone) => {
            const color = RISK_COLORS[zone.risk]?.dot || "#ef4444";
            const icon = L.divIcon({
                className: "",
                html: `<div style="width:18px;height:18px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 8px ${color}88;"></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            });

            const marker = L.marker([zone.lat, zone.lng], { icon })
                .addTo(map)
                .bindPopup(`<b>${zone.name}</b><br/>Risk: ${zone.risk}${zone.notes ? `<br/>${zone.notes}` : ""}`);

            markersRef.current.push(marker);
        });
    }, [zones, mapLoaded]);

    return (
        <div className="h-105 rounded-xl overflow-hidden border border-white/10">
            <div ref={mapRef} className="h-full w-full" />
        </div>
    );
}

export default function RiskyZones() {
    const [zones, setZones] = useState(() => dummyZones.map(toLocalZone));
    const [form, setForm] = useState({ name: "", lat: "", lng: "", risk: "High", notes: "" });
    const [error, setError] = useState("");
    const [added, setAdded] = useState(false);

    const inputCls =
        "w-full bg-gray-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all";

    const handleAdd = () => {
        if (!form.name.trim()) {
            setError("Zone name is required.");
            return;
        }

        setError("");
        const newZone = {
            id: `Z-${Date.now()}`,
            name: form.name.trim(),
            lat: Number.parseFloat(form.lat) || 28.6139,
            lng: Number.parseFloat(form.lng) || 77.209,
            risk: form.risk,
            notes: form.notes.trim(),
        };

        setZones((prev) => [...prev, newZone]);
        setForm({ name: "", lat: "", lng: "", risk: "High", notes: "" });
        setAdded(true);
        setTimeout(() => setAdded(false), 1600);
    };

    const handleDelete = (id) => {
        setZones((prev) => prev.filter((zone) => zone.id !== id));
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
                                    <label className="block text-xs text-slate-500  mb-1.5 uppercase tracking-wider">Zone Name</label>
                                    <input
                                        className={inputCls}
                                        placeholder="e.g., Chandni Chowk"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Latitude</label>
                                        <input
                                            className={inputCls}
                                            placeholder="28.6139"
                                            value={form.lat}
                                            onChange={(e) => setForm({ ...form, lat: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Longitude</label>
                                        <input
                                            className={inputCls}
                                            placeholder="77.2090"
                                            value={form.lng}
                                            onChange={(e) => setForm({ ...form, lng: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Risk Level</label>
                                    <select
                                        className={`${inputCls} cursor-pointer`}
                                        value={form.risk}
                                        onChange={(e) => setForm({ ...form, risk: e.target.value })}
                                    >
                                        <option>High</option>
                                        <option>Medium</option>
                                        <option>Low</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs text-slate-500 mb-1.5 uppercase tracking-wider">Notes</label>
                                    <input
                                        className={inputCls}
                                        placeholder="Optional details"
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    />
                                </div>

                                {error && <p className="text-xs text-red-400">{error}</p>}

                                <button
                                    onClick={handleAdd}
                                    className="w-full py-2.5 cursor-pointer rounded-lg text-sm font-semibold transition-all bg-blue-600 hover:bg-blue-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                >
                                    {added ? "Zone Added" : "Add Zone"}
                                </button>
                            </div>

                        <div className="rounded-2xl bg-gray-900/40 border border-gray-700 px-6 py-5 shadow-[0_0_0_1px_rgba(10,36,77,0.15)]">
                                <h2 className="mb-6  font-semibold text-white">All Risky Zones</h2>

                                {zones.length === 0 ? (
                                    <p className="py-8 text-center text-sm text-slate-500">No zones available.</p>
                                ) : (
                                    <div className="overflow-y-auto max-h-80 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                        <div className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] items-center border-b border-white/10 px-4 pb-3 text-sm font-semibold text-slate-400 uppercase tracking-wider">
                                            <span>Name</span>
                                            <span>Latitude</span>
                                            <span>Longitude</span>
                                            <span>Risk</span>
                                            <span className="text-right">Actions</span>
                                        </div>

                                        {zones.map((zone) => (
                                            <div
                                                key={zone.id}
                                                className="grid grid-cols-[1.5fr_1fr_1fr_0.8fr_0.8fr] items-center border-b border-white/10 px-4 py-3 text-sm text-slate-200 last:border-b-0 hover:bg-white/5 transition-colors"
                                            >
                                                <span className="pr-4 font-medium text-white">{zone.name}</span>
                                                <span className="text-slate-400">{zone.lat.toFixed(4)}</span>
                                                <span className="text-slate-400">{zone.lng.toFixed(4)}</span>
                                                <span className={`${RISK_COLORS[zone.risk]?.text || "text-red-400"} font-medium`}>
                                                    {zone.risk}
                                                </span>
                                                <div className="flex justify-end">
                                                    <button
                                                        onClick={() => handleDelete(zone.id)}
                                                        className="rounded-md bg-slate-700/80 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600/80 cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
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
                                        {Object.entries(RISK_COLORS).map(([level, color]) => (
                                            <span key={level} className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${color.bg}`} />
                                                {level}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <MapPreview zones={zones} />
                                <p className="text-xs text-slate-600 mt-3">Zones are shown by risk level. Use list actions to delete zones.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
