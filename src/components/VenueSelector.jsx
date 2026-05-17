import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Фиксим иконки маркеров для бандлеров
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

// Пользовательские иконки для маркеров
const createCustomIcon = (isSelected) => {
  return L.divIcon({
    html: `<div style="
      background-color: ${isSelected ? '#FF5722' : '#2196F3'};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      transition: all 0.2s;
    ">●</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
    className: 'custom-marker'
  });
};

const VenueSelector = ({ venues, selectedVenueId, onVenueSelect }) => {
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!venues || venues.length === 0) {
      return;
    }

    // Если карта уже инициализирована, очистить её
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      markersRef.current = {};
    }

    const mapContainer = document.getElementById('venue-selector-map');
    if (!mapContainer) {
      return;
    }

    // Вычисляем центр и границы карты
    const latitudes = venues.map(v => v.latitude);
    const longitudes = venues.map(v => v.longitude);
    const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
    const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;

    // Инициализация карты
    const map = L.map('venue-selector-map').setView([centerLat, centerLng], 12);
    mapRef.current = map;

    // Добавление слоя OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Добавление маркеров для каждой площадки
    venues.forEach(venue => {
      const isSelected = venue.id === selectedVenueId;
      const marker = L.marker(
        [venue.latitude, venue.longitude],
        { icon: createCustomIcon(isSelected) }
      ).addTo(map);

      marker.bindPopup(`
        <div style="font-family: Arial, sans-serif; width: 280px;">
          <h3 style="margin: 0 0 8px 0; color: #2196F3; font-size: 16px;">${venue.name}</h3>
          <p style="margin: 0 0 5px 0;"><strong>📍 Адрес:</strong></p>
          <p style="margin: 0 0 8px 0; color: #555; font-size: 14px;">${venue.address}</p>
          <p style="margin: 0 0 5px 0;"><strong>👥 Вместимость:</strong> ${venue.capacity} человек</p>
          <p style="margin: 0 0 5px 0;"><strong>🏢 Тип:</strong> ${venue.type === 'indoor' ? 'Закрытое' : 'Открытое'}</p>
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">Координаты: ${venue.latitude.toFixed(4)}, ${venue.longitude.toFixed(4)}</p>
          <button onclick="window.selectVenue_${venue.id}()" style="
            width: 100%;
            padding: 8px;
            background-color: ${isSelected ? '#FF5722' : '#2196F3'};
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
          ">
            ${isSelected ? '✓ Выбрано' : 'Выбрать'}
          </button>
        </div>
      `);

      // Регистрируем функцию для выбора площадки
      window[`selectVenue_${venue.id}`] = () => {
        onVenueSelect(venue.id);
        marker.closePopup();
      };

      // Добавляем клик на маркер
      marker.on('click', () => {
        onVenueSelect(venue.id);
      });

      markersRef.current[venue.id] = marker;
    });

    // Автоматически центруем карту на всех маркерах
    const group = new L.featureGroup(Object.values(markersRef.current));
    map.fitBounds(group.getBounds().pad(0.1));

    // Очистка при размонтировании компонента
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
      }
    };
  }, [venues, selectedVenueId, onVenueSelect]);

  // Обновляем иконки при изменении выбранной площадки
  useEffect(() => {
    if (mapRef.current && markersRef.current) {
      Object.keys(markersRef.current).forEach(venueId => {
        const marker = markersRef.current[venueId];
        const isSelected = venueId === selectedVenueId;
        marker.setIcon(createCustomIcon(isSelected));
      });
    }
  }, [selectedVenueId]);

  if (!venues || venues.length === 0) {
    return <div style={{ padding: '20px', color: '#999' }}>Площадок не найдено</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        id="venue-selector-map"
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '15px'
        }}
      ></div>
      <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px', color: '#666' }}>
        <strong>Подсказка:</strong> Кликните на маркер площадки чтобы её выбрать. Выбранная площадка отмечена красным цветом.
      </div>
    </div>
  );
};

export default VenueSelector;
