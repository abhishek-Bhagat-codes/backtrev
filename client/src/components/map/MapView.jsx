import React from 'react';
import { MapContainer, TileLayer, Marker, Popup} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { useMemo, useState } from 'react';
import { User } from "lucide-react";
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

const MapView = ({ tourists = [] }) => {
    const [center] = useState([28.6448, 77.216721]);  
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
        <MapContainer ref={mapRef} center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Display markers for each tourist */}
            {tourists.map((tourist) => (
                <Marker 
                    key={tourist.id} 
                    position={[tourist.location.lat, tourist.location.lng]}
                    icon={touristMarkerIcon}
                >
                    <Popup>
                        <div className="min-w-48">
                            <h3 className="text-base font-semibold text-gray-800 mb-1">{tourist.name}</h3>
                            <p className="text-xs text-gray-600 mb-1">
                                <span className="font-semibold">ID:</span> {tourist.id}
                            </p>
                            <p className="text-xs text-gray-600 mb-2">
                                <span className="font-semibold">Itinerary:</span> {tourist.itinerary}
                            </p>
                            <span className={`inline-block px-2 py-0.5 text-xs rounded text-white ${tourist.status === "safe" ? "bg-green-500" : tourist.status === "warning" ? "bg-yellow-500" : "bg-red-500" }`}>
                                {tourist.status.toUpperCase()}
                            </span>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>  
    );
}

export default MapView;
