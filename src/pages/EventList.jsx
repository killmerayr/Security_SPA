import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';

const EventURL = `${API_URL}/events`;
const VenuesUrl = `${API_URL}/venues`;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(EventURL),
      axios.get(VenuesUrl)
    ])
    .then(([eventsRes, venuesRes]) => {
      setEvents(eventsRes.data);
      const venuesMap = {};
      venuesRes.data.forEach(v => {
        venuesMap[v.id] = v;
      });
      setVenues(venuesMap);
    })
    .catch(err => {
      console.error(err);
      setError('Ошибка загрузки мероприятий');
    })
    .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить это мероприятие?")) return;
    axios.delete(`${EventURL}/${id}`)
      .then(() => {
        setEvents(prev => prev.filter(e => e.id !== id));
      })
      .catch(err => {
        setError('Ошибка при удалении');
        console.error(err);
      });
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка мероприятий...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Список мероприятий</h1>
      <Link to="/add" style={{ 
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        Добавить мероприятие
      </Link>

      {events.length === 0 ? (
        <p style={{ fontSize: '18px', color: '#666' }}>Нет мероприятий. Создайте новое!</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {events.map(e => {
            const venue = venues[e.venueId];
            return (
              <div key={e.id} style={{ 
                border: '1px solid #ddd', 
                padding: 15, 
                borderRadius: 8,
                backgroundColor: e.status === 'active' ? '#e8f5e9' : '#f5f5f5',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 10px 0' }}>{e.title}</h3>
                <p><strong>Дата:</strong> {e.date}</p>
                <p><strong>Площадка:</strong> {venue ? venue.name : 'Не выбрана'}</p>
                <p><strong>Уровень риска:</strong> {
                  e.riskLevel === 'high' ? 'Высокий' :
                  e.riskLevel === 'medium' ? 'Средний' :
                  'Низкий'
                }</p>
                <p><strong>Охрана:</strong> {e.guardsCount} человек</p>
                <p><strong>Статус:</strong> {
                  e.status === 'active' ? 'Активное' :
                  e.status === 'planned' ? 'Планируется' :
                  'Завершено'
                }</p>

                <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                  <Link to={`/detail/${e.id}`} style={{ 
                    padding: '5px 10px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '3px'
                  }}>
                    Подробнее
                  </Link>
                  <Link to={`/edit/${e.id}`} style={{ 
                    padding: '5px 10px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '3px'
                  }}>
                    Редактировать
                  </Link>
                  <button 
                    onClick={() => handleDelete(e.id)} 
                    style={{ 
                      padding: '5px 10px',
                      backgroundColor: '#f44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventList;