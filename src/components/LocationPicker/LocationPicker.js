import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ userData, setUserData }) => {
    const handleMapClick = (e) => {
        const { lat, lng } = e.latlng;
        setUserData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            location: `Lat: ${lat}, Lng: ${lng}`,
        }));
    };

    return (
        <MapContainer
            center={[userData.latitude || 51.505, userData.longitude || -0.09]}
            zoom={13}
            style={{ height: '300px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />
            <Marker position={[userData.latitude || 51.505, userData.longitude || -0.09]} />
            <MapEvents handleMapClick={handleMapClick} />
        </MapContainer>
    );
};

const MapEvents = ({ handleMapClick }) => {
    useMapEvents({
        click: (e) => handleMapClick(e),
    });
    return null;
};
