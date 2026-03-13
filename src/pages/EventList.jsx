import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/events'; 
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guards, setGuard] = useState([]);

  useEffect(() => {
    axios.get(EventURL)
      .then(res => setEvents(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));

    axios.get(GuardsUrl)
      .then(res => setGuard(res.data))
      .catch(err => console.error("Ошибка загрузки охранников", err));
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Удалить запись?")) {
      axios.delete(`${EventURL}/${id}`)
        .then(() => {
          setEvents(events.filter(event => event.id !== id));
        })
        .catch(err => console.error("Ошибка удаления:", err));
    }
  };

  const guardById = Object.fromEntries(guards.map(g => [g.id, g]));

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
            <p>Ответственный: {guardById[event.guardID]?.fullname || '-'}</p>
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