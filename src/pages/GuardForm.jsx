import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const GuardsUrl = `${API_URL}/guards`;

export default function GuardForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    rank: '',
    phone: '',
    experience: 0
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`${GuardsUrl}/${id}`)
      .then(res => setFormData(res.data));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.fullName.trim()) {
      setError('ФИО обязательно');
      return;
    }
    if (!formData.rank.trim()) {
      setError('Должность обязательна');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Телефон обязателен');
      return;
    }
    if (Number(formData.experience) < 0) {
      setError('Опыт не может быть отрицательным');
      return;
    }
    
    setError(null);
    
    const req = id
      ? axios.put(`${GuardsUrl}/${id}`, formData)
      : axios.post(GuardsUrl, formData);

    req
      .then(() => {
        alert(id ? 'Охранник обновлён!' : 'Охранник добавлен!');
        navigate('/guards');
      })
      .catch(err => setError(`Ошибка: ${err.message}`));
  };

  return (
    <div style={{ maxWidth: '500px', padding: '20px' }}>
      <h2>{id ? "Редактировать охранника" : "Добавить охранника"}</h2>
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>ФИО</label>
          <input
            placeholder="ФИО"
            value={formData.fullName}
            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div>
          <label>Должность</label>
          <input
            placeholder="Должность"
            value={formData.rank}
            onChange={e => setFormData({ ...formData, rank: e.target.value })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div>
          <label>Телефон</label>
          <input
            placeholder="Телефон"
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>
        <div>
          <label>Опыт работы (лет)</label>
          <input
            type="number"
            min="0"
            placeholder="Опыт работы"
            value={formData.experience}
            onChange={e => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <button type="submit" style={{ 
          padding: '10px', 
          background: '#4CAF50', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          fontSize: '16px'
        }}>
          {id ? "Сохранить" : "Создать"}
        </button>
      </form>
    </div>
  );
}