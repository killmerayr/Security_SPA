import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guard, setGuard] = useState(null);

useEffect(() => {
  axios.get(`${GuardsUrl}/${id}`)
    .then(res => {
      setEvent(res.data);

      if (res.data.guardId) {
        axios.get(`${GuardsUrl}/${res.data.guardId}`)
          .then(gRes => setGuard(gRes.data))
          .catch(err => console.error("Ошибка загрузки охранника:", err));
      }
    })
    .catch(err => console.error(err));
}, [id]);

  if (!event) return <div>Загрузка деталей...</div>;

  return (
    <div style={{ padding: '20px', border: '2px solid #2196F3', borderRadius: '10px' }}>
      <h1>{event.title}</h1>
      <p><strong>Место:</strong> {event.location}</p>
      <p><strong>Уровень опасности:</strong> {event.riskLevel}</p>
      <p><strong>Ответственный охранник: </strong> {guard ? `${guard.fullName} (${guard.rank})` : '-'}</p>
      <p><strong>Необходимо охраны:</strong> {event.guardsCount} человек</p>
      <p><strong>Статус готовности:</strong> {event.status}</p>
      <hr />
      <Link to="/">Вернуться к списку</Link>
    </div>
  );
};

export default EventDetail;