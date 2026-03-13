import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/guards';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

export default function GuardDetail() {
  const { id } = useParams();
  const [guard, setGuard] = useState(null);

  useEffect(() => {
    axios.get(`${GuardsUrl}/${id}`)
      .then(res => setGuard(res.data));
  }, [id]);

  if (!guard) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>{guard.fullName}</h1>
      <p><strong>Должность:</strong> {guard.rank}</p>
      <p><strong>Телефон:</strong> {guard.phone}</p>

      <Link to="/guards">Назад к списку</Link>
    </div>
  );
}