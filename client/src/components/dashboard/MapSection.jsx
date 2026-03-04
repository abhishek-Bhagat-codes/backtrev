import MapView from "../map/MapView";

const MapSection = ({ tourists, alerts, zones }) => {
    return (
        <div className="h-125 rounded-lg overflow-hidden border border-gray-800">
            <MapView tourists={tourists} alerts={alerts} zones={zones} />
        </div>
    );
};

export default MapSection;
