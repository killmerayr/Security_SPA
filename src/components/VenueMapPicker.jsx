import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Фиксим иконки маркеров для бандлеров и Vercel
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const VenueMapPicker = ({ latitude, longitude, onLocationChange, address = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(address);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Инициализация карты
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(
      [latitude || 55.7558, longitude || 37.6173], // Москва по умолчанию
      13
    );

    mapInstanceRef.current = map;

    // Добавление слоя OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Добавление маркера при клике
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      onLocationChange(lat, lng);
    });

    // Добавление начального маркера, если есть координаты
    if (latitude && longitude) {
      addMarker(map, latitude, longitude);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Обновление маркера при изменении координат
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;

    addMarker(mapInstanceRef.current, latitude, longitude);
    mapInstanceRef.current.setView([latitude, longitude], 13);
  }, [latitude, longitude]);

  const addMarker = (map, lat, lng) => {
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }
    
    markerRef.current = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`<div style="font-family: Arial, sans-serif;">
        <p style="margin: 0; font-size: 12px;"><strong>Координаты:</strong><br>${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
      </div>`)
      .openPopup();
  };

  // Поиск адресов
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchAddress(query);
  };

  const handleSelectAddress = (result) => {
    const { lat, lon, display_name } = result;
    setSearchQuery(display_name);
    onLocationChange(parseFloat(lat), parseFloat(lon), display_name);
    setShowResults(false);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Выбор местоположения площадки</h3>
      
      {/* Поиск адреса */}
      <div style={{ marginBottom: '15px', position: 'relative' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Поиск адреса
        </label>
        <input
          type="text"
          placeholder="Введите адрес для поиска..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            width: '100%',
            padding: '10px',
            boxSizing: 'border-box',
            border: '1px solid #ccc',
            borderRadius: '5px',
            fontSize: '14px',
          }}
        />
        
        {/* Результаты поиска */}
        {showResults && searchResults.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            borderRadius: '0 0 5px 5px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                onClick={() => handleSelectAddress(result)}
                style={{
                  padding: '10px',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                  transition: 'backgroundColor 0.2s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#fafafa')}
              >
                <div style={{ fontSize: '13px', fontWeight: '500' }}>
                  {result.display_name.split(',')[0]}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                  {result.display_name.substring(result.display_name.indexOf(',') + 1)}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {showResults && searchResults.length === 0 && !isSearching && searchQuery.trim() && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderTop: 'none',
            padding: '10px',
            borderRadius: '0 0 5px 5px',
            fontSize: '13px',
            color: '#999',
            zIndex: 1000,
          }}>
            Адреса не найдены
          </div>
        )}
      </div>

      {/* Инструкция */}
      <div style={{
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '5px',
        marginBottom: '15px',
        fontSize: '13px',
        color: '#1976d2',
      }}>
        💡 Кликните на карту чтобы установить координаты, или используйте поиск адреса выше
      </div>

      {/* Карта */}
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #ddd',
        }}
      />

      {/* Текущие координаты */}
      {latitude && longitude && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f5f5f5',
          borderRadius: '5px',
          fontSize: '12px',
          color: '#666',
        }}>
          <strong>Текущие координаты:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
      )}
    </div>
  );
};

export default VenueMapPicker;
