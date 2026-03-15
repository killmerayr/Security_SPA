import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const EventURL = `${API_URL}/events`;

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(EventURL)
      .then(res => setEvents(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Удалить мероприятие?")) return;
    axios.delete(`${EventURL}/${id}`)
      .then(() => setEvents(prev => prev.filter(e => e.id !== id)));
  };

  if (loading) return <p>Загрузка мероприятий...</p>;

  return (
    <div>
      <h1>Список мероприятий</h1>
      <Link to="/add">Добавить мероприятие</Link>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {events.map(e => (
          <div key={e.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <h3>{e.title}</h3>
            <p>Место: {e.location}</p>
            <p>Риск: {e.riskLevel}</p>
            <p>Охрана: {e.guardsCount} чел</p>

            <Link to={`/detail/${e.id}`}>Детали</Link>{" | "}
            <Link to={`/edit/${e.id}`}>Редактировать</Link>{" | "}
            <button onClick={() => handleDelete(e.id)} style={{ color: 'red' }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventList;