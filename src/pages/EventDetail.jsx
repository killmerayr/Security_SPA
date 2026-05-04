import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EventMap from '../components/EventMap';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;
const VenuesUrl = `${API_URL}/venues`;

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guard, setGuard] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${EventURL}/${id}`)
      .then(res => {
        setEvent(res.data);

        if (res.data.guardId) {
          axios.get(`${GuardsUrl}/${res.data.guardId}`)
            .then(gRes => setGuard(gRes.data))
            .catch(err => console.error(err));
        }

        if (res.data.venueId) {
          axios.get(`${VenuesUrl}/${res.data.venueId}`)
            .then(vRes => setVenue(vRes.data))
            .catch(err => console.error(err));
        }
      })
      .catch(err => {
        console.error(err);
        setError('Ошибка загрузки мероприятия');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!event) return <div style={{ padding: '20px', color: 'red' }}>Мероприятие не найдено</div>;

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return '🟢 Активное';
      case 'planned': return '🔵 Планируется';
      case 'completed': return '⚫ Завершено';
      default: return status;
    }
  };

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <div style={{ 
        padding: '20px', 
        border: `3px solid ${getRiskColor(event.riskLevel)}`, 
        borderRadius: '10px',
        backgroundColor: '#f9f9f9'
      }}>
        <h1 style={{ margin: '0 0 15px 0' }}>{event.title}</h1>
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <p><strong>Дата:</strong> {event.date}</p>
          <p><strong>Площадка:</strong> {venue ? venue.name : 'Не выбрана'}</p>
          {venue && (
            <>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Адрес:</strong> {venue.address}
              </p>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Вместимость:</strong> {venue.capacity} человек
              </p>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Тип:</strong> {venue.type === 'indoor' ? 'Закрытое' : 'Открытое'}
              </p>
            </>
          )}

          <p><strong>Уровень опасности:</strong> 
            <span style={{ 
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: getRiskColor(event.riskLevel),
              color: 'white',
              borderRadius: '5px'
            }}>
              {event.riskLevel === 'high' ? 'Высокий' :
               event.riskLevel === 'medium' ? 'Средний' :
               'Низкий'}
            </span>
          </p>

          <p><strong>Тип мероприятия:</strong> {event.type === 'internal' ? 'Внутреннее' : 'Внешнее'}</p>

          <p><strong>Требуемая охрана:</strong> {event.guardsCount} человек</p>

          <p><strong>Статус готовности:</strong> {getStatusLabel(event.status)}</p>

          {guard && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              <p><strong>Ответственный охранник:</strong></p>
              <p style={{ marginLeft: '20px' }}>
                <strong>{guard.fullName}</strong><br/>
                Должность: {guard.rank}<br/>
                Опыт: {guard.experience} лет<br/>
                Телефон: {guard.phone}
              </p>
            </div>
          )}
        </div>

        <EventMap venue={venue} />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link to="/" style={{ 
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
          <Link to={`/edit/${id}`} style={{ 
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

export default EventDetail;