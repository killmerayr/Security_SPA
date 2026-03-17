import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const VenuesUrl = `${API_URL}/venues`;

const VenueList = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(VenuesUrl)
      .then(res => setVenues(res.data))
      .catch(err => {
        console.error(err);
        setError('Ошибка загрузки площадок');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту площадку?")) return;
    axios.delete(`${VenuesUrl}/${id}`)
      .then(() => {
        setVenues(prev => prev.filter(v => v.id !== id));
      })
      .catch(err => {
        setError('Ошибка при удалении');
        console.error(err);
      });
  };

  if (loading) return <div style={{ padding: '20px' }}>Загрузка площадок...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;

  return (
    <div>
      <h1>Список площадок</h1>
      <Link to="/venues/add" style={{ 
        display: 'inline-block',
        padding: '10px 20px',
        backgroundColor: '#4CAF50',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        Добавить площадку
      </Link>

      {venues.length === 0 ? (
        <p style={{ fontSize: '18px', color: '#666' }}>Нет площадок. Создайте новую!</p>
      ) : (
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {venues.map(v => (
            <div key={v.id} style={{ 
              border: '1px solid #ddd', 
              padding: 15, 
              borderRadius: 8,
              backgroundColor: '#f5f5f5',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 10px 0' }}>{v.name}</h3>
              <p><strong>Адрес:</strong> {v.address}</p>
              <p><strong>Вместимость:</strong> {v.capacity} человек</p>
              <p><strong>Тип:</strong> {v.type === 'indoor' ? 'Закрытое' : 'Открытое'}</p>
              <p><strong>Парковка:</strong> {v.parking ? 'Есть' : 'Нет'}</p>

              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <Link to={`/venues/detail/${v.id}`} style={{ 
                  padding: '5px 10px',
                  backgroundColor: '#2196F3',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}>
                  Подробнее
                </Link>
                <Link to={`/venues/edit/${v.id}`} style={{ 
                  padding: '5px 10px',
                  backgroundColor: '#FF9800',
                  color: 'white',
                  textDecoration: 'none',
                  borderRadius: '3px'
                }}>
                  Редактировать
                </Link>
                <button 
                  onClick={() => handleDelete(v.id)} 
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
          ))}
        </div>
      )}
    </div>
  );
};

export default VenueList;