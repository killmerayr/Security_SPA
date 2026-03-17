import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const VenuesUrl = `${API_URL}/venues`;

const VenueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 0,
    type: 'indoor',
    parking: false
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`${VenuesUrl}/${id}`)
        .then(res => setFormData(res.data))
        .catch(err => {
          console.error("Ошибка загрузки:", err);
          setError('Ошибка загрузки данных');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.name.trim()) {
      setError('Название обязательно');
      return;
    }
    if (!formData.address.trim()) {
      setError('Адрес обязателен');
      return;
    }
    if (Number(formData.capacity) <= 0) {
      setError('Вместимость должна быть больше 0');
      return;
    }
    
    setError(null);
    
    if (id) {
      axios.put(`${VenuesUrl}/${id}`, formData)
        .then(() => {
          alert("Площадка обновлена!");
          navigate('/venues');
        })
        .catch(err => setError(`Ошибка обновления: ${err.message}`));
    } else {
      axios.post(VenuesUrl, formData)
        .then(() => {
          alert("Площадка создана!");
          navigate('/venues');
        })
        .catch(err => setError(`Ошибка создания: ${err.message}`));
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;

  return (
    <div style={{ maxWidth: '500px', padding: '20px' }}>
      <h2>{id ? "Редактирование площадки" : "Новая площадка"}</h2>
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Название площадки</label>
          <input 
            placeholder="Название площадки" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label>Адрес</label>
          <input 
            placeholder="Полный адрес площадки"
            value={formData.address} 
            onChange={e => setFormData({...formData, address: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label>Вместимость (человек)</label>
          <input 
            type="number" 
            min="1"
            value={formData.capacity} 
            onChange={e => setFormData({...formData, capacity: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            required
          />
        </div>

        <div>
          <label>Тип помещения</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="indoor">Закрытое помещение</option>
            <option value="outdoor">Открытая площадка</option>
          </select>
        </div>

        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <input 
            type="checkbox" 
            id="parking"
            checked={formData.parking} 
            onChange={e => setFormData({...formData, parking: e.target.checked})}
          />
          <label htmlFor="parking" style={{ margin: 0 }}>Парковка доступна</label>
        </div>

        <button 
          type="submit" 
          style={{ 
            padding: '10px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px', 
            cursor: 'pointer' 
          }}
        >
          {id ? "Сохранить изменения" : "Создать площадку"}
        </button>
      </form>
    </div>
  );
};

export default VenueForm;