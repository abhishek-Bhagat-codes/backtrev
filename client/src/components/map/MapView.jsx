import React from 'react';
import { MapContainer, TileLayer, GeoJSON, LayersControl, LayerGroup, Marker, Popup} from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { useState } from 'react';

const MapView = () => {
    const [center, setCenter] = useState([28.6448, 77.216721]);  
    const mapRef = React.useRef();
    
    return (
        <MapContainer ref={mapRef} center={center} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>  
    );
}

export default MapView;
