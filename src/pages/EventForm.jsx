import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/events';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

const EventForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [guards, setGuards] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    riskLevel: 'low',
    guardsCount: 0,
    status: 'planned',
    type: 'internal',
    guardId: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`${EventURL}/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => console.error("Ошибка загрузки:", err));
    }
  }, [id]);

  useEffect(() => {
    axios.get(`${GuardsUrl}`)
    .then(res => setGuards(res.data))
    .catch(err => console.error("Ошибка загрузки охранников", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Number(formData.guardsCount) <= 0) {
      setError('Количество охраны должно быть больше 0');
      return;
    }
    setError(null);
    if (id) {
      axios.put(`${EventURL}/${id}`, formData)
        .then(() => {
          alert("Данные обновлены!");
          navigate('/');
        })
        .catch(err => setError(err.message));
    } else {
      axios.post(EventURL, formData)
        .then(() => {
          alert("Мероприятие создано!");
          navigate('/');
        })
        .catch(err => setError(err.message));
    }
  };

  return (
    <div>
      <h2>{id ? "Редактирование" : "Новое мероприятие"}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input placeholder="Название" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <input placeholder="Локация" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
        
        <label>Риск:</label>
        <select value={formData.riskLevel} onChange={e => setFormData({...formData, riskLevel: e.target.value})}>
          <option value="low">Низкий</option>
          <option value="medium">Средний</option>
          <option value="high">Высокий</option>
        </select>

        <label>Тип:</label>
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
          <option value="internal">internal</option>
          <option value="external">external</option>
        </select>

        <label>Ответственный охранник</label>
        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
          <option value="">выбрать</option>
          {guards.map(g => (
            <option key={g.id} value={g.id}> {g.fullName} ({g.rank})
            </option>
          ))}
        </select>
        <label>Охрана (чел):</label>
        <input type="number" value={formData.guardsCount} onChange={e => setFormData({...formData, guardsCount: e.target.value})} />
        
        <button type="submit" style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}>
          {id ? "Сохранить изменения" : "Создать мероприятие"}
        </button>
      </form>
    </div>
  );
};

export default EventForm;