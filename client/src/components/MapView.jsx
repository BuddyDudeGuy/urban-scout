/*
 * leaflet map component - shows a marker at the given coordinates
 * used on PlaceDetailPage to show where a place is
 */
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

export default function MapView({ lat, lng, name, zoom = 15 }) {
  if (!lat || !lng) return null;

  return (
    <div className="h-48 rounded-lg overflow-hidden mb-4">
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[lat, lng]}>
          <Popup>{name}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
