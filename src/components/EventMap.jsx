import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const EventMap = ({ venue }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!venue || !venue.latitude || !venue.longitude) {
      return;
    }

    // Если карта уже инициализирована, очистить её
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const mapContainer = document.getElementById('event-map');
    if (!mapContainer) {
      return;
    }

    // Инициализация карты
    const map = L.map('event-map').setView(
      [venue.latitude, venue.longitude],
      13
    );

    mapRef.current = map;

    // Добавление слоя OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Добавление маркера площадки
    L.marker([venue.latitude, venue.longitude])
      .addTo(map)
      .bindPopup(`<strong>${venue.name}</strong><br>${venue.address}`);

    // Очистка при размонтировании компонента
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [venue]);

  if (!venue) {
    return <div style={{ padding: '20px', color: '#999' }}>Площадка не найдена</div>;
  }

  return (
    <div
      id="event-map"
      style={{
        width: '100%',
        height: '400px',
        marginTop: '20px',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    />
  );
};

export default EventMap;
