import { useEffect, useRef } from 'react';
import { YANDEX_API_KEY } from '../config/api';

const EventMap = ({ venue }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!venue || !venue.latitude || !venue.longitude) {
      return;
    }

    // Если Yandex Maps уже загружена, инициализируем сразу
    if (window.ymaps) {
      initializeMap();
      return;
    }

    // Загрузка Яндекс Maps API (один раз)
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      window.addEventListener('ymaps_ready', initializeMap);
      return () => window.removeEventListener('ymaps_ready', initializeMap);
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = initializeMap;
    document.body.appendChild(script);

    return () => {
      // Не удаляем скрипт, т.к. он может использоваться другими компонентами
    };
  }, [venue]);

  const initializeMap = () => {
    if (!window.ymaps || !mapRef.current) return;

    window.ymaps.ready(() => {
      // Если карта уже инициализирована, удалить её
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }

      // Инициализация карты
      const map = new window.ymaps.Map(mapRef.current, {
        center: [venue.latitude, venue.longitude],
        zoom: 13,
        controls: ['zoomControl', 'fullscreenControl']
      });

      mapInstanceRef.current = map;

      // Добавление маркера
      const placemark = new window.ymaps.Placemark(
        [venue.latitude, venue.longitude],
        {
          balloonContent: `
            <div style="font-family: Arial; width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #9C27B0; font-size: 16px;">${venue.name}</h3>
              <p style="margin: 0 0 5px 0;"><strong>📍 Адрес:</strong></p>
              <p style="margin: 0 0 8px 0; color: #555;">${venue.address}</p>
              <p style="margin: 0 0 5px 0;"><strong>👥 Вместимость:</strong> ${venue.capacity} человек</p>
              <p style="margin: 0; font-size: 12px; color: #999;">Координаты: ${venue.latitude.toFixed(4)}, ${venue.longitude.toFixed(4)}</p>
            </div>
          `,
        },
        {
          preset: 'islands#redDotIcon',
        }
      );

      map.geoObjects.add(placemark);
      placemark.balloon.open();
    });
  };

  if (!venue) {
    return <div style={{ padding: '20px', color: '#999' }}>Площадка не найдена</div>;
  }

  return (
    <div
      ref={mapRef}
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
