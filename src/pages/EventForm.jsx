import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import VenueSelector from '../components/VenueSelector';

const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;
const VenuesUrl = `${API_URL}/venues`;

const EventForm = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [guards, setGuards] = useState([]);
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    riskLevel: 'low',
    guardsCount: 0,
    status: 'planned',
    type: 'internal',
    guardId: '',
    venueId: '',
    ticketsSold: 0.5,
    isIncident: false,
    isArmed: false,
    weaponIssueAddress: '',
    weaponIssueDate: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`${EventURL}/${id}`)
        .then(res => {
          const data = res.data;
          // Убедиться, что есть необходимые поля
          if (!data.ticketsSold) {
            data.ticketsSold = 0.5;
          }
          if (data.isIncident === undefined) {
            data.isIncident = false;
          }
          if (data.isArmed === undefined) {
            data.isArmed = false;
          }
          if (!data.weaponIssueAddress) {
            data.weaponIssueAddress = '';
          }
          if (!data.weaponIssueDate) {
            data.weaponIssueDate = '';
          }
          setFormData(data);
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  useEffect(() => {
    axios.get(`${GuardsUrl}`)
      .then(res => setGuards(res.data))
      .catch(err => console.error(err));
    
    axios.get(`${VenuesUrl}`)
      .then(res => setVenues(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.title.trim()) {
      setError('Название обязательно');
      return;
    }
    if (!formData.date) {
      setError('Дата обязательна');
      return;
    }
    if (Number(formData.guardsCount) <= 0) {
      setError('Количество охраны должно быть больше 0');
      return;
    }
    if (!formData.venueId) {
      setError('Выберите площадку');
      return;
    }
    
    setError(null);

    const dataToSubmit = {
      ...formData,
      ticketsSold: formData.ticketsSold || 0.5,
      isIncident: formData.isIncident || false,
      isArmed: formData.riskLevel === 'high' ? formData.isArmed : false,
      weaponIssueAddress: formData.riskLevel === 'high' && formData.isArmed ? formData.weaponIssueAddress : '',
      weaponIssueDate: formData.riskLevel === 'high' && formData.isArmed ? formData.weaponIssueDate : ''
    };

    if (id) {
      axios.put(`${EventURL}/${id}`, dataToSubmit)
        .then(() => {
          alert("Данные обновлены!");
          navigate('/');
        })
        .catch(err => setError(`Ошибка обновления: ${err.message}`));
    } else {
      // При создании добавляем случайный коэффициент посещаемости
      const newEventData = {
        ...dataToSubmit,
        ticketsSold: Math.random() * 0.6 + 0.4 // От 0.4 до 1.0
      };
      axios.post(EventURL, newEventData)
        .then(() => {
          alert("Мероприятие создано!");
          navigate('/');
        })
        .catch(err => setError(`Ошибка создания: ${err.message}`));
    }
  };

  return (
    <div style={{ maxWidth: '500px', padding: '20px' }}>
      <h2>{id ? "Редактирование мероприятия" : "Новое мероприятие"}</h2>
      {error && <div style={{ color: 'red', padding: '10px', backgroundColor: '#ffebee', borderRadius: '5px', marginBottom: '10px' }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div>
          <label>Название</label>
          <input 
            placeholder="Название мероприятия" 
            value={formData.title} 
            onChange={e => setFormData({...formData, title: e.target.value})} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label>Дата</label>
          <input 
            type="date"
            value={formData.date} 
            onChange={e => setFormData({...formData, date: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Выбор площадки на карте</label>
          <VenueSelector 
            venues={venues}
            selectedVenueId={formData.venueId}
            onVenueSelect={(venueId) => setFormData({...formData, venueId})}
          />
          {formData.venueId && (
            <div style={{ padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px', marginTop: '10px', color: '#2e7d32', fontSize: '14px' }}>
              ✓ Площадка выбрана: <strong>{venues.find(v => v.id === formData.venueId)?.name}</strong>
            </div>
          )}
        </div>
        
        <div>
          <label>Уровень риска</label>
          <select 
            value={formData.riskLevel} 
            onChange={e => setFormData({...formData, riskLevel: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="low">Низкий</option>
            <option value="medium">Средний</option>
            <option value="high">Высокий</option>
          </select>
          <div style={{ padding: '8px', backgroundColor: '#e8f5e9', borderRadius: '4px', marginTop: '8px', color: '#2e7d32', fontSize: '14px' }}>
            💡 Цена билета: 
            {formData.riskLevel === 'low' && ' 1500 ₽'}
            {formData.riskLevel === 'medium' && ' 3500 ₽'}
            {formData.riskLevel === 'high' && ' 6500 ₽'}
          </div>
        </div>

        {formData.riskLevel === 'high' && (
          <>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox"
                  checked={formData.isArmed}
                  onChange={e => setFormData({...formData, isArmed: e.target.checked})}
                  style={{ cursor: 'pointer' }}
                />
                <span>🔫 Охранники оснащены табельным оружием</span>
              </label>
            </div>

            {formData.isArmed && (
              <>
                <div>
                  <label>Адрес пункта выдачи оружия</label>
                  <input 
                    placeholder="Адрес пункта выдачи"
                    value={formData.weaponIssueAddress}
                    onChange={e => setFormData({...formData, weaponIssueAddress: e.target.value})}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label>Дата выдачи оружия</label>
                  <input 
                    type="date"
                    value={formData.weaponIssueDate}
                    onChange={e => setFormData({...formData, weaponIssueDate: e.target.value})}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                  />
                  <div style={{ padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', marginTop: '8px', color: '#856404', fontSize: '12px' }}>
                    ⏰ Срок действия: не более 24 часов с момента выдачи
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <div>
          <label>Тип мероприятия</label>
          <select 
            value={formData.type} 
            onChange={e => setFormData({...formData, type: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="internal">Внутреннее</option>
            <option value="external">Внешнее</option>
          </select>
        </div>

        <div>
          <label>Ответственный охранник</label>
          <select 
            value={formData.guardId} 
            onChange={e => setFormData({...formData, guardId: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="">Не назначен</option>
            {guards.map(g => (
              <option key={g.id} value={g.id}>{g.fullName} ({g.rank})</option>
            ))}
          </select>
        </div>

        <div>
          <label>Требуемая охрана (человек)</label>
          <input 
            type="number" 
            min="1"
            value={formData.guardsCount} 
            onChange={e => setFormData({...formData, guardsCount: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>

        <div>
          <label>Статус</label>
          <select 
            value={formData.status} 
            onChange={e => setFormData({...formData, status: e.target.value})}
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          >
            <option value="planned">Планируется</option>
            <option value="active">Активное</option>
            <option value="completed">Завершено</option>
          </select>
        </div>
        
        <button 
          type="submit" 
          style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          {id ? "Сохранить изменения" : "Создать мероприятие"}
        </button>
      </form>
    </div>
  );
};

export default EventForm;