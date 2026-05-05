import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const VenuesUrl = `${API_URL}/venues`;
const EventURL = `${API_URL}/events`;

const VenueDetail = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${VenuesUrl}/${id}`),
      axios.get(EventURL)
    ])
    .then(([venueRes, eventsRes]) => {
      setVenue(venueRes.data);
      // Фильтруем события для этой площадки
      const venueEvents = eventsRes.data.filter(e => e.venueId === id);
      setEvents(venueEvents);
    })
    .catch(err => {
      console.error(err);
      setError('Ошибка загрузки');
    })
    .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!venue) return <div style={{ padding: '20px', color: 'red' }}>Площадка не найдена</div>;

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <div style={{ 
        padding: '20px', 
        border: '3px solid #9C27B0', 
        borderRadius: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        <h1 style={{ margin: '0 0 15px 0' }}>{venue.name}</h1>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <p><strong>Адрес:</strong> {venue.address}</p>
          <p><strong>Вместимость:</strong> {venue.capacity} человек</p>
          <p><strong>Тип:</strong> {venue.type === 'indoor' ? 'Закрытое помещение' : 'Открытая площадка'}</p>
          <p><strong>Парковка:</strong> {venue.parking ? 'Доступна' : 'Отсутствует'}</p>

          {events.length > 0 && (
            <div style={{
              backgroundColor: '#e8f5e9',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              <p><strong>Мероприятия на этой площадке ({events.length}):</strong></p>
              <ul style={{ marginLeft: '20px' }}>
                {events.map(e => (
                  <li key={e.id}>
                    <Link to={`/detail/${e.id}`} style={{ color: '#2196F3', textDecoration: 'none' }}>
                      {e.title}
                    </Link>
                    {' '} ({e.date})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/venues" style={{ 
            flex: 1,
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            Вернуться к списку
          </Link>
          <Link to={`/venues/edit/${id}`} style={{ 
            padding: '10px 20px',
            backgroundColor: '#FF9800',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
          }}>
            Редактировать
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail;