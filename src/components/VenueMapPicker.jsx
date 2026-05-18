import { useEffect, useRef, useState } from 'react';
import { YANDEX_API_KEY } from '../config/api';

const VenueMapPicker = ({ latitude, longitude, onLocationChange, address = '' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const placemarksRef = useRef([]);
  const debounceTimerRef = useRef(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState(address);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

      // Добавление маркера при клике на карту
      map.events.add('click', (e) => {
        const coords = e.get('coords');
        onLocationChange(coords[0], coords[1]);
      });

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

  // Debounce для поиска адресов
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddress(searchQuery);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Поиск адресов через Yandex или Photon API
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      let results = [];

      // Пробуем Yandex если есть ключ
      if (YANDEX_API_KEY) {
        try {
          const yandexResponse = await fetch(
            `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodeURIComponent(query)}&format=json&lang=ru_RU&results=10`
          );

          if (yandexResponse.ok) {
            const data = await yandexResponse.json();
            const features = data.response.GeoObjectCollection.featureMember || [];

            results = features.map((feature) => {
              const geoObject = feature.GeoObject;
              const point = geoObject.Point.pos.split(' ');
              const lon = parseFloat(point[0]);
              const lat = parseFloat(point[1]);

              return {
                lat: lat.toString(),
                lon: lon.toString(),
                display_name: geoObject.metaDataProperty.GeocoderMetaData.text,
                source: 'yandex'
              };
            });
          }
        } catch (error) {
          console.warn('Yandex API ошибка, переходим на Photon:', error);
        }
      }

      // Если Yandex не сработал или ключа нет, используем Photon
      if (results.length === 0) {
        const photonResponse = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=ru&limit=10`
        );

        if (photonResponse.ok) {
          const data = await photonResponse.json();
          results = (data.features || []).map((feature) => ({
            lat: feature.geometry.coordinates[1].toString(),
            lon: feature.geometry.coordinates[0].toString(),
            display_name: feature.properties.name ||
              `${feature.properties.street || ''} ${feature.properties.city || ''}`.trim(),
            source: 'photon'
          }));
        }
      }

      setSearchResults(results);
      setShowResults(results.length > 0);
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
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
          <div
            style={{
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
            }}
          >
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
          <div
            style={{
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
            }}
          >
            Адреса не найдены
          </div>
        )}
      </div>

      {/* Инструкция */}
      <div
        style={{
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          marginBottom: '15px',
          fontSize: '13px',
          color: '#1976d2',
        }}
      >
        💡 Поищите адрес выше или кликните на карту для установки координат
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
          <strong>Координаты:</strong> {latitude.toFixed(4)}, {longitude.toFixed(4)}
          {address && (
            <>
              <br />
              <strong style={{ marginTop: '8px', display: 'block' }}>Адрес:</strong>
              <div style={{ marginTop: '5px', color: '#333', fontWeight: '500' }}>
                {address}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VenueMapPicker;
