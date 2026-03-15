import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

export default function GuardList() {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(GuardsUrl)
      .then(res => setGuards(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Удалить охранника?")) return;
    axios.delete(`${GuardsUrl}/${id}`)
      .then(() => setGuards(prev => prev.filter(g => g.id !== id)));
  };

  if (loading) return <p>Загрузка охранников...</p>;

  return (
    <div>
      <h1>Список охранников</h1>
      <Link to="/guards/add">Добавить охранника</Link>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {guards.map(g => (
          <div key={g.id} style={{ border: '1px solid #ddd', padding: 12, borderRadius: 8 }}>
            <h3>{g.fullName}</h3>
            <p>Должность: {g.rank}</p>
            <p>Телефон: {g.phone}</p>

            <Link to={`/guards/detail/${g.id}`}>Детали</Link>{" | "}
            <Link to={`/guards/edit/${g.id}`}>Редактировать</Link>{" | "}
            <button onClick={() => handleDelete(g.id)} style={{ color: 'red' }}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}