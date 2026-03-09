import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/events'; 

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(API_URL)
      .then(res => setEvents(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Удалить запись?")) {
      axios.delete(`${API_URL}/${id}`)
        .then(() => {
          setEvents(events.filter(event => event.id !== id));
        })
        .catch(err => console.error("Ошибка удаления:", err));
    }
  };

  return (
    <div>
      <h1>Реестр мероприятий</h1>
      {loading && <p>Загрузка...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ display: 'grid', gap: '15px' }}>
        {events.map(event => (
          <div key={event.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            <h3>{event.title}</h3>
            <p>Локация: {event.location}</p>
            <p>Риск: <strong>{event.riskLevel}</strong> | Охрана: {event.guardsCount} чел.</p>
            <p>Статус: {event.status}</p>
            
            <Link to={`/detail/${event.id}`}>Детали</Link> | 
            <Link to={`/edit/${event.id}`} style={{ marginLeft: '10px' }}>Редактировать</Link> | 
            <button onClick={() => handleDelete(event.id)} style={{ color: 'red', marginLeft: '10px', cursor: 'pointer' }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;