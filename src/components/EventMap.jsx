import { useEffect, useRef } from 'react';
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

    // Добавление маркера площадки здания с красивым попапом
    L.marker([venue.latitude, venue.longitude])
      .addTo(map)
      .bindPopup(`<div style="font-family: Arial, sans-serif; width: 250px;">
        <h3 style="margin: 0 0 8px 0; color: #9C27B0; font-size: 16px;">${venue.name}</h3>
        <p style="margin: 0 0 5px 0;"><strong>📍 Адрес здания:</strong></p>
        <p style="margin: 0 0 8px 0; color: #555;">${venue.address}</p>
        <p style="margin: 0 0 5px 0;"><strong>👥 Вместимость:</strong> ${venue.capacity} человек</p>
        <p style="margin: 0; font-size: 12px; color: #999;">Координаты: ${venue.latitude.toFixed(4)}, ${venue.longitude.toFixed(4)}</p>
      </div>`);

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
    ></div>
  );
};

export default EventMap;
