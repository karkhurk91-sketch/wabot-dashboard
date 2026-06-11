import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return position === null ? null : <Marker position={position} />;
}

export default function LocationPickerModal({ isOpen, onClose, onSend }) {
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [address, setAddress] = useState('');

  const handleSelect = (latitude, longitude) => {
    setLat(latitude);
    setLng(longitude);
    // Optionally reverse geocode to get address (use OpenStreetMap Nominatim)
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`)
      .then(res => res.json())
      .then(data => {
        if (data.display_name) setAddress(data.display_name);
      })
      .catch(err => console.error('Reverse geocoding error', err));
  };

  const handleSend = () => {
    if (lat && lng) {
      onSend(lat, lng, address);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Select Location</h3>
        </div>
        <div className="p-4 h-96">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker onSelect={handleSelect} />
          </MapContainer>
        </div>
        {lat && lng && (
          <div className="p-4 border-t">
            <p className="text-sm text-gray-600 truncate">{address || `${lat}, ${lng}`}</p>
            <button
              onClick={handleSend}
              className="mt-2 w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
            >
              Send Location
            </button>
          </div>
        )}
        <div className="p-4 border-t flex justify-end">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
}