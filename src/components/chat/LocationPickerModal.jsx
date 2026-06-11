// src/components/chat/LocationPickerModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to move map view when center changes
function ChangeMapView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, zoom || 15);
        }
    }, [center, zoom, map]);
    return null;
}

// Component to handle map clicks and set marker
function LocationMarker({ onLocationSelect }) {
    const [position, setPosition] = useState(null);
    const markerRef = useRef(null);
    
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    
    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                const latlng = marker.getLatLng();
                setPosition(latlng);
                onLocationSelect(latlng.lat, latlng.lng);
            }
        },
    };
    
    return position === null ? null : (
        <Marker
            draggable={true}
            position={position}
            ref={markerRef}
            eventHandlers={eventHandlers}
        />
    );
}

const LocationPickerModal = ({ isOpen, onClose, onSend }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedLat, setSelectedLat] = useState(null);
    const [selectedLng, setSelectedLng] = useState(null);
    const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // default India
    const [locationName, setLocationName] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const debounceTimer = useRef(null);

    // Search Nominatim
    useEffect(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        if (!searchTerm.trim() || searchTerm.length < 3) {
            setSuggestions([]);
            return;
        }
        debounceTimer.current = setTimeout(async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=5&addressdetails=1`
                );
                const data = await response.json();
                setSuggestions(data);
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setLoading(false);
            }
        }, 500);
    }, [searchTerm]);

    const handleSelectSuggestion = (place) => {
        const lat = parseFloat(place.lat);
        const lng = parseFloat(place.lon);
        setSelectedLat(lat);
        setSelectedLng(lng);
        setMapCenter([lat, lng]);
        setLocationName(place.display_name.split(',')[0] || place.name);
        setLocationAddress(place.display_name);
        setSuggestions([]);
        setSearchTerm('');
    };

    const handleMapSelect = (lat, lng) => {
        setSelectedLat(lat);
        setSelectedLng(lng);
        setMapCenter([lat, lng]);
        // Reverse geocode to fill name/address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(res => res.json())
            .then(data => {
                if (data.display_name) {
                    setLocationName(data.display_name.split(',')[0] || '');
                    setLocationAddress(data.display_name);
                }
            })
            .catch(console.error);
    };

    const handleConfirm = () => {
        if (selectedLat && selectedLng) {
            onSend(selectedLat, selectedLng, locationName, locationAddress);
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

                {/* Search input */}
                <div className="p-4 relative">
                    <input
                        type="text"
                        placeholder="Search for a place or address"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                    {loading && <div className="text-sm text-gray-500 mt-1">Searching...</div>}
                    {suggestions.length > 0 && (
                        <ul className="absolute left-4 right-4 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto z-50 mt-1">                            {suggestions.map((place) => (
                                <li
                                    key={place.place_id}
                                    onClick={() => handleSelectSuggestion(place)}
                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                                >
                                    <div className="font-medium">{place.display_name.split(',')[0]}</div>
                                    <div className="text-xs text-gray-500 truncate">{place.display_name}</div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Map */}
                <div className="p-4 h-96">
                    <MapContainer center={mapCenter} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeMapView center={mapCenter} zoom={15} />
                        <LocationMarker onLocationSelect={handleMapSelect} />
                    </MapContainer>
                </div>

                {/* Selected location details */}
                {selectedLat && selectedLng && (
                    <div className="p-4 border-t">
                        <input
                            type="text"
                            placeholder="Location Name (e.g., My Store)"
                            value={locationName}
                            onChange={(e) => setLocationName(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <input
                            type="text"
                            placeholder="Address"
                            value={locationAddress}
                            onChange={(e) => setLocationAddress(e.target.value)}
                            className="w-full mb-2 p-2 border rounded"
                        />
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700"
                        >
                            Send Location
                        </button>
                    </div>
                )}

                <div className="p-4 border-t flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;