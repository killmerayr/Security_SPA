import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL, YANDEX_API_KEY } from '../config/api';
import VenueMapPicker from '../components/VenueMapPicker';

const VenuesUrl = `${API_URL}/venues`;

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const debounceTimerRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 0,
    type: 'indoor',
    parking: false,
    latitude: 0,
    longitude: 0
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${VenuesUrl}/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => {
          console.error("Ошибка загрузки:", err);
          setError('Ошибка загрузки данных');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Debounce для поиска адресов
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!formData.address.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      searchAddress(formData.address);
    }, 800);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [formData.address]);

  // Поиск адресов через Yandex или Photon API
  const searchAddress = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    console.debug('searchAddress start', { query });
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
            const features = (data && data.response && data.response.GeoObjectCollection && data.response.GeoObjectCollection.featureMember) || [];
            console.debug('yandex search results count', features.length);

            results = features.map((feature) => {
              const geoObject = feature.GeoObject || {};
              const pos = (geoObject.Point && geoObject.Point.pos) || '';
              const point = pos.split(' ');
              const lon = parseFloat(point[0]) || 0;
              const lat = parseFloat(point[1]) || 0;

              const text = (geoObject.metaDataProperty && geoObject.metaDataProperty.GeocoderMetaData && geoObject.metaDataProperty.GeocoderMetaData.text) || '';

              return {
                lat,
                lon,
                display_name: text,
                source: 'yandex'
              };
            });
          } else {
            console.warn('Yandex geocode returned not ok', yandexResponse.status);
          }
        } catch (error) {
          console.warn('Yandex API ошибка, переходим на Photon:', error);
        }
      }

      // Если Yandex не сработал или ключа нет, используем Photon
      if (results.length === 0) {
        try {
          const photonResponse = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=ru&limit=10`
          );

          if (photonResponse.ok) {
            const data = await photonResponse.json();
            const feats = data.features || [];
            console.debug('photon search results count', feats.length);

            results = feats.map((feature) => {
              const coords = (feature.geometry && feature.geometry.coordinates) || [];
              const props = feature.properties || {};

              // Build a robust display name from available properties
              const parts = [];
              if (props.name) parts.push(props.name);
              if (props.street) parts.push(props.street);
              if (props.housenumber) parts.push(props.housenumber);
              if (props.city) parts.push(props.city);
              if (props.state) parts.push(props.state);
              if (props.country) parts.push(props.country);

              const display = parts.join(', ') || props.osm_value || props.label || '';

              return {
                lat: coords[1] || 0,
                lon: coords[0] || 0,
                display_name: display,
                source: 'photon'
              };
            });
          } else {
            console.warn('Photon geocode returned not ok', photonResponse.status);
          }
        } catch (error) {
          console.error('Photon API ошибка:', error);
        }
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
      console.debug('searchAddress finished', { query, resultsCount: results.length });
    } catch (error) {
      console.error('Ошибка поиска адреса:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAddress = (result) => {
    setFormData({
      ...formData,
      address: result.display_name,
      latitude: result.lat,
      longitude: result.lon
    });
    setShowSearchResults(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      setError('Название обязательно');
      return;
    }
    if (!formData.address.trim()) {
      setError('Адрес обязателен');
      return;
    }
    if (Number(formData.capacity) <= 0) {
      setError('Вместимость должна быть больше 0');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      setError('Координаты не установлены. Выберите адрес из поиска.');
      return;
    }
    
    setError(null);
    
    if (id) {
      axios.put(`${VenuesUrl}/${id}`, formData)
        .then(() => {
          alert("Площадка обновлена!");
          navigate('/venues');
        })
        .catch(err => setError(`Ошибка обновления: ${err.message}`));
    } else {
      axios.post(VenuesUrl, formData)
        .then(() => {
          alert("Площадка создана!");
          navigate('/venues');
        })
        .catch(err => setError(`Ошибка создания: ${err.message}`));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <h2>{id ? "Редактирование площадки" : "Новая площадка"}</h2>
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Название площадки</label>
          <input 
            placeholder="Введите название площадки" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>

        {/* Поиск адреса */}
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Адрес площадки</label>
          <input 
            type="text"
            placeholder="Введите адрес для поиска..."
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
            onFocus={() => formData.address && setShowSearchResults(true)}
            required
          />

          {/* Результаты поиска */}
          {showSearchResults && searchResults.length > 0 && (
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
                maxHeight: '250px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectAddress(result)}
                  style={{
                    padding: '12px',
                    borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                    cursor: 'pointer',
                    backgroundColor: '#fafafa',
                    transition: 'backgroundColor 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f0f0f0')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#fafafa')}
                >
                  <div style={{ fontSize: '14px', fontWeight: '500' }}>
                    {result.display_name.split(',')[0]}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '3px' }}>
                    {result.display_name.substring(result.display_name.indexOf(',') + 1)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showSearchResults && searchResults.length === 0 && !isSearching && formData.address.trim() && (
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
                padding: '12px',
                fontSize: '13px',
                color: '#999',
                zIndex: 1000,
              }}
            >
              Адреса не найдены
            </div>
          )}

          {isSearching && (
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
                padding: '12px',
                fontSize: '13px',
                color: '#999',
                zIndex: 1000,
              }}
            >
              Поиск...
            </div>
          )}
        </div>

        {/* Карта для предпросмотра */}
        <VenueMapPicker 
          latitude={formData.latitude}
          longitude={formData.longitude}
          address={formData.address}
        />

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Вместимость (человек)</label>
          <input 
            type="number" 
            min="1"
            value={formData.capacity} 
            onChange={e => setFormData({...formData, capacity: e.target.value})}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Тип помещения</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '5px' }}
          >
            <option value="indoor">Закрытое помещение</option>
            <option value="outdoor">Открытая площадка</option>
          </select>
        </div>

        <div style={{ 
          padding: '12px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input 
            type="checkbox" 
            id="parking"
            checked={formData.parking} 
            onChange={e => setFormData({...formData, parking: e.target.checked})}
          />
          <label htmlFor="parking" style={{ margin: 0 }}>Парковка доступна</label>
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '12px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px'
          }}
        >
          {id ? "Сохранить изменения" : "Создать площадку"}
        </button>
      </form>
    </div>
  );
};

export default VenueForm;