import { useEffect, useRef } from 'react';
import { YANDEX_API_KEY } from '../config/api';

const VenueSelector = ({ venues, selectedVenueId, onVenueSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const placemarksRef = useRef({});

  // Загрузка Яндекс Maps API (один раз)
  useEffect(() => {
    // Если Yandex Maps уже загружена, инициализируем сразу
    if (window.ymaps && venues.length > 0) {
      initializeMap();
      return;
    }

    // Если скрипт уже загружается/загружен, используем готовый
    if (document.querySelector('script[src*="api-maps.yandex.ru"]')) {
      if (window.ymaps) {
        window.ymaps.ready(initializeMap);
      }
      return;
    }

    // Загружаем скрипт, если это первый компонент использующий Yandex Maps
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if (venues.length > 0 && window.ymaps) {
        window.ymaps.ready(initializeMap);
      }
    };
    document.body.appendChild(script);

    return () => {
      // Не удаляем скрипт
    };
  }, [venues, selectedVenueId]);

  const initializeMap = () => {
    if (!window.ymaps || !venues || venues.length === 0 || !mapRef.current) return;

    // Если карта уже инициализирована, удалить её
    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
      placemarksRef.current = {};
    }

    // Вычисляем центр и границы карты
    const latitudes = venues.map(v => v.latitude);
    const longitudes = venues.map(v => v.longitude);
    const centerLat = (Math.max(...latitudes) + Math.min(...latitudes)) / 2;
    const centerLng = (Math.max(...longitudes) + Math.min(...longitudes)) / 2;

    // Инициализация карты
    const map = new window.ymaps.Map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 12,
      controls: ['zoomControl', 'fullscreenControl']
    });

    mapInstanceRef.current = map;

    // Добавление маркеров для каждой площадки
    venues.forEach(venue => {
      const isSelected = venue.id === selectedVenueId;

      const placemark = new window.ymaps.Placemark(
        [venue.latitude, venue.longitude],
        {
          balloonContent: `
            <div style="font-family: Arial; width: 280px;">
              <h3 style="margin: 0 0 8px 0; color: #2196F3; font-size: 16px;">${venue.name}</h3>
              <p style="margin: 0 0 5px 0;"><strong>📍 Адрес:</strong></p>
              <p style="margin: 0 0 8px 0; color: #555; font-size: 14px;">${venue.address}</p>
              <p style="margin: 0 0 5px 0;"><strong>👥 Вместимость:</strong> ${venue.capacity} человек</p>
              <p style="margin: 0 0 5px 0;"><strong>🏢 Тип:</strong> ${venue.type === 'indoor' ? 'Закрытое' : 'Открытое'}</p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">Координаты: ${venue.latitude.toFixed(4)}, ${venue.longitude.toFixed(4)}</p>
            </div>
          `,
          hintContent: venue.name,
        },
        {
          preset: isSelected ? 'islands#redDotIcon' : 'islands#blueDotIcon',
        }
      );

      // Клик на маркер
      placemark.events.add('click', () => {
        onVenueSelect(venue.id);
      });

      map.geoObjects.add(placemark);
      placemarksRef.current[venue.id] = placemark;
    });

    // Автоматически центруем карту на все маркеры
    const bounds = map.geoObjects.getBounds();
    if (bounds) {
      map.setBounds(bounds, { checkZoomRange: true });
    }
  };

  // Обновляем иконки при изменении выбранной площадки
  useEffect(() => {
    if (mapInstanceRef.current && placemarksRef.current && selectedVenueId) {
      Object.keys(placemarksRef.current).forEach(venueId => {
        const placemark = placemarksRef.current[venueId];
        const isSelected = venueId === selectedVenueId;
        const preset = isSelected ? 'islands#redDotIcon' : 'islands#blueDotIcon';
        placemark.options.set('preset', preset);
      });
    }
  }, [selectedVenueId]);

  if (!venues || venues.length === 0) {
    return <div style={{ padding: '20px', color: '#999' }}>Площадок не найдено</div>;
  }

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '400px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '15px'
        }}
      />
      <div style={{ padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '8px', fontSize: '14px', color: '#666' }}>
        <strong>Подсказка:</strong> Кликните на маркер площадки чтобы её выбрать. Выбранная площадка отмечена красным цветом.
      </div>
    </div>
  );
};

export default VenueSelector;
