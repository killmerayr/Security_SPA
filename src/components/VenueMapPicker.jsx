import { useEffect, useRef } from 'react';
import { YANDEX_API_KEY } from '../config/api';

const VenueMapPicker = ({ latitude, longitude, address = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const placemarksRef = useRef([]);

  // Загрузка Яндекс Maps API (один раз)
  useEffect(() => {
    // Проверяем есть ли уже скрипт на странице
    if (window.ymaps) {
      initializeMap();
      return;
    }

    // Проверяем не загружается ли уже скрипт
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      window.addEventListener('load', initializeMap);
      return () => window.removeEventListener('load', initializeMap);
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = initializeMap;
    script.onerror = () => console.error('Failed to load Yandex Maps API');
    document.body.appendChild(script);

    return () => {
      // Не удаляем скрипт, т.к. он может использоваться другими компонентами
    };
  }, []);

  // Инициализация карты
  const initializeMap = () => {
    if (!window.ymaps) {
      console.warn('Yandex Maps not available yet');
      return;
    }
    
    if (mapInstanceRef.current) return;

    window.ymaps.ready(() => {
      const mapContainer = mapRef.current;
      if (!mapContainer) return;

      const map = new window.ymaps.Map(mapContainer, {
        center: [latitude || 55.7558, longitude || 37.6173],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstanceRef.current = map;

      // Добавление начального маркера
      if (latitude && longitude) {
        addMarker(map, latitude, longitude);
      }
    });
  };

  // Добавление маркера на карту
  const addMarker = (map, lat, lng) => {
    if (!window.ymaps) return;

    // Удаление старых маркеров
    placemarksRef.current.forEach((placemark) => {
      map.geoObjects.remove(placemark);
    });
    placemarksRef.current = [];

    // Добавление нового маркера
    const placemark = new window.ymaps.Placemark(
      [lat, lng],
      {
        balloonContent: `
          <div style="font-family: Arial; width: 200px;">
            <p style="margin: 0;"><strong>Координаты:</strong></p>
            <p style="margin: 5px 0; font-size: 12px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
          </div>
        `,
      },
      {
        preset: 'islands#redDotIcon',
      }
    );

    map.geoObjects.add(placemark);
    placemarksRef.current.push(placemark);
    map.setCenter([lat, lng], 13);
  };

  // Обновление маркера при изменении координат
  useEffect(() => {
    if (!mapInstanceRef.current || !latitude || !longitude) return;
    addMarker(mapInstanceRef.current, latitude, longitude);
  }, [latitude, longitude]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3>Предпросмотр местоположения площадки</h3>

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

      {/* Текущие координаты и адрес */}
      {latitude && longitude && (
        <div
          style={{
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#f5f5f5',
            borderRadius: '5px',
            fontSize: '12px',
            color: '#666',
          }}
        >
          <strong>✓ Координаты:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}
          {address && (
            <>
              <br />
              <strong style={{ marginTop: '8px', display: 'block' }}>✓ Адрес:</strong>
              <div style={{ marginTop: '5px', color: '#333', fontWeight: '500' }}>{address}</div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueMapPicker;
