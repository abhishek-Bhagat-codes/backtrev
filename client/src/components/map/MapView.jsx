import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { User } from "lucide-react";
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Normalize zone to { lat, lng, radius } - supports API format (center: [lng, lat]) or legacy (location: { lat, lng })
function getZoneCoords(zone) {
    if (zone.center && Array.isArray(zone.center)) {
        const [lng, lat] = zone.center;
        return { lat, lng, radius: zone.radius ?? 800 };
    }
    if (zone.location) {
        return { lat: zone.location.lat, lng: zone.location.lng, radius: zone.radius ?? 800 };
    }
    return null;
}

const RISK_COLORS = { 1: '#10b981', 2: '#f59e0b', 3: '#f59e0b', 4: '#ef4444', 5: '#ef4444' };

const MapView = ({ tourists = [], zones = [] }) => {
    const center = useMemo(() => {
        const firstTourist = tourists[0];
        if (firstTourist?.location?.lat != null && firstTourist?.location?.lng != null) {
            return [firstTourist.location.lat, firstTourist.location.lng];
        }
        return [28.6448, 77.216721];
    }, [tourists]);

    const visibleTourists = useMemo(() => {
        if (tourists.length === 1) {
            return tourists.filter(
                (tourist) => tourist?.location?.lat != null && tourist?.location?.lng != null
            );
        }

        return tourists.filter(
            (tourist) =>
                (tourist.status === 'warning' || tourist.status === 'sos') &&
                tourist?.location?.lat != null &&
                tourist?.location?.lng != null
        );
    }, [tourists]);

    const mapRef = React.useRef();

    const touristMarkerIcon = useMemo(() => {
        const markerHtml = renderToStaticMarkup(
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-700">
                <User size={20} className="text-gray-300" />
            </div>
        );

        return L.divIcon({
            html: markerHtml,
            className: '',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
            popupAnchor: [0, -14],
        });
    }, []);

    return (
        <MapContainer ref={mapRef} center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* In detail view (single tourist), always show marker. In dashboard, show warning/SOS only. */}
            {visibleTourists.map((tourist) => (
                <Marker 
                    key={tourist.id} 
                    position={[tourist.location.lat, tourist.location.lng]}
                    icon={touristMarkerIcon}
                >
                    <Popup>
                        <div className="min-w-48">
                            <h3 className="text-base font-semibold text-gray-800 ">{tourist.name}</h3>
                            <p className="text-xs text-gray-600 ">
                                <span className="font-semibold">ID:</span> {tourist.id}
                            </p>
                            <p className="text-xs text-gray-600 ">
                                <span className="font-semibold">Itinerary:</span> {tourist.itinerary}
                            </p>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded text-white ${tourist.status === "safe" ? "bg-green-500" : tourist.status === "warning" ? "bg-yellow-500" : "bg-red-500" }`}>
                                {tourist.status.toUpperCase()}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Display zones as circles - supports API format (center: [lng,lat]) or legacy (location) */}
            {zones.map((zone) => {
                const coords = getZoneCoords(zone);
                if (!coords) return null;
                const riskLevel = zone.risk_level ?? (zone.risk === "High" ? 4 : zone.risk === "Medium" ? 3 : 2) ?? 4;
                const color = RISK_COLORS[riskLevel] || '#ef4444';
                return (
                    <Circle
                        key={zone.id}
                        center={[coords.lat, coords.lng]}
                        radius={coords.radius}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.35 }}
                    >
                        <Popup>
                            <div className="min-w-48">
                                <h3 className="text-base font-semibold text-gray-800">{zone.name}</h3>
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Type:</span> {zone.type || 'risk zone'}
                                </p>
                                <p className="text-xs text-gray-600">
                                    <span className="font-semibold">Risk Level:</span> {riskLevel}
                                </p>
                            </div>
                        </Popup>
                    </Circle>
                );
            })}
        </MapContainer>  
    );
}

export default MapView;
