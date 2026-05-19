import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import EventMap from '../components/EventMap';
import { API_URL } from '../config/api';

const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;
const VenuesUrl = `${API_URL}/venues`;

const EventDetail = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [guard, setGuard] = useState(null);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${EventURL}/${id}`)
      .then(res => {
        setEvent(res.data);

        if (res.data.guardId) {
          axios.get(`${GuardsUrl}/${res.data.guardId}`)
            .then(gRes => setGuard(gRes.data))
            .catch(err => console.error(err));
        }

        if (res.data.venueId) {
          axios.get(`${VenuesUrl}/${res.data.venueId}`)
            .then(vRes => setVenue(vRes.data))
            .catch(err => console.error(err));
        }
      })
      .catch(err => {
        console.error(err);
        setError('Ошибка загрузки мероприятия');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: '20px' }}>Загрузка...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>{error}</div>;
  if (!event) return <div style={{ padding: '20px', color: 'red' }}>Мероприятие не найдено</div>;

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return '#f44336';
      case 'medium': return '#FF9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return '🟢 Активное';
      case 'planned': return '🔵 Планируется';
      case 'completed': return '⚫ Завершено';
      default: return status;
    }
  };

  const getTicketPrice = () => {
    switch(event.riskLevel) {
      case 'high': return 6500;
      case 'medium': return 3500;
      case 'low': return 1500;
      default: return 3000;
    }
  };

  const calculateRevenue = () => {
    if (!venue || !event) return 0;
    const ticketPrice = getTicketPrice();
    const ticketsSold = event.ticketsSold || 0.5; // Значение по умолчанию если отсутствует
    const visitors = Math.round(venue.capacity * ticketsSold);
    return ticketPrice * visitors;
  };

  const getWeaponValidityStatus = () => {
    if (!event.weaponIssueDate) return null;
    const issueDate = new Date(event.weaponIssueDate);
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + 1);
    const now = new Date();
    
    if (now > expiryDate) {
      return { status: 'expired', label: 'Истек срок действия' };
    }
    return { status: 'valid', label: 'Действительно' };
  };

  const handleIncident = () => {
    axios.patch(`${EventURL}/${id}`, { isIncident: true })
      .then(res => {
        setEvent(res.data);
      })
      .catch(err => console.error(err));
  };

  const handleResolveIncident = () => {
    axios.patch(`${EventURL}/${id}`, { isIncident: false })
      .then(res => {
        setEvent(res.data);
      })
      .catch(err => console.error(err));
  };

  return (
    <div style={{ maxWidth: '600px', padding: '20px' }}>
      <div style={{ 
        padding: '20px', 
        border: `3px solid ${event.isIncident ? '#d32f2f' : getRiskColor(event.riskLevel)}`, 
        borderRadius: '10px',
        backgroundColor: event.isIncident ? '#ffebee' : '#f9f9f9'
      }}>
        <h1 style={{ margin: '0 0 15px 0', color: event.isIncident ? '#d32f2f' : 'inherit' }}>
          {event.isIncident ? '❌ ' : ''}{event.title}
        </h1>

        {event.isIncident && (
          <div style={{
            backgroundColor: '#ffcdd2',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '2px solid #d32f2f'
          }}>
            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#d32f2f' }}>
              ⚠️ МЕРОПРИЯТИЕ СОРВАНО
            </p>
            <p style={{ margin: '0', fontSize: '16px', fontWeight: 'bold' }}>
              Цена ущерба (сборы): {calculateRevenue().toLocaleString('ru-RU')} ₽
            </p>
          </div>
        )}
        
        <div style={{ 
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '15px'
        }}>
          <p><strong>Дата:</strong> {event.date}</p>
          <p><strong>Площадка:</strong> {venue ? venue.name : 'Не выбрана'}</p>
          {venue && (
            <>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Адрес:</strong> {venue.address}
              </p>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Вместимость:</strong> {venue.capacity} человек
              </p>
              <p style={{ marginLeft: '20px', fontSize: '14px', color: '#666' }}>
                <strong>Тип:</strong> {venue.type === 'indoor' ? 'Закрытое' : 'Открытое'}
              </p>
            </>
          )}

          <p><strong>Уровень опасности:</strong> 
            <span style={{ 
              marginLeft: '10px',
              padding: '5px 10px',
              backgroundColor: getRiskColor(event.riskLevel),
              color: 'white',
              borderRadius: '5px'
            }}>
              {event.riskLevel === 'high' ? 'Высокий' :
               event.riskLevel === 'medium' ? 'Средний' :
               'Низкий'}
            </span>
          </p>

          <p><strong>Тип мероприятия:</strong> {event.type === 'internal' ? 'Внутреннее' : 'Внешнее'}</p>

          <p><strong>Требуемая охрана:</strong> {event.guardsCount} человек</p>

          <p><strong>Цена билета:</strong> {getTicketPrice().toLocaleString('ru-RU')} ₽</p>

          <p><strong>Ожидаемая посещаемость:</strong> {Math.round(venue?.capacity * (event.ticketsSold || 0.5))} из {venue?.capacity} человек ({Math.round((event.ticketsSold || 0.5) * 100)}%)</p>

          <p style={{ 
            backgroundColor: '#fff9c4',
            padding: '10px',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>
            <strong>Общая сумма сборов:</strong> {calculateRevenue().toLocaleString('ru-RU')} ₽
          </p>

          <p><strong>Статус готовности:</strong> {getStatusLabel(event.status)}</p>

          {guard && (
            <div style={{
              backgroundColor: '#e3f2fd',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '10px'
            }}>
              <p><strong>Ответственный охранник:</strong></p>
              <p style={{ marginLeft: '20px' }}>
                <strong>{guard.fullName}</strong><br/>
                Должность: {guard.rank}<br/>
                Опыт: {guard.experience} лет<br/>
                Телефон: {guard.phone}
              </p>
            </div>
          )}

          {event.isArmed && (
            <div style={{
              backgroundColor: '#ffe0b2',
              padding: '10px',
              borderRadius: '5px',
              marginTop: '10px',
              border: '2px solid #ff6f00'
            }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100' }}>
                🔫 Охранники оснащены табельным оружием
              </p>
              <p style={{ marginLeft: '20px', margin: '5px 0' }}>
                <strong>Ответственный за выдачу:</strong> {guard?.fullName || 'Не назначен'}
              </p>
              <p style={{ marginLeft: '20px', margin: '5px 0' }}>
                <strong>Пункт выдачи:</strong> {event.weaponIssueAddress}
              </p>
              <p style={{ marginLeft: '20px', margin: '5px 0' }}>
                <strong>Дата выдачи:</strong> {event.weaponIssueDate}
              </p>
              <p style={{ marginLeft: '20px', margin: '5px 0' }}>
                <strong>Срок действия:</strong> {getWeaponValidityStatus()?.label}
                <span style={{ 
                  marginLeft: '10px',
                  padding: '2px 8px',
                  backgroundColor: getWeaponValidityStatus()?.status === 'expired' ? '#d32f2f' : '#4CAF50',
                  color: 'white',
                  borderRadius: '3px',
                  fontSize: '12px'
                }}>
                  {getWeaponValidityStatus()?.status === 'expired' ? '❌' : '✓'}
                </span>
              </p>
            </div>
          )}
        </div>

        <EventMap venue={venue} />

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <Link to="/" style={{ 
            flex: 1,
            padding: '10px',
            backgroundColor: '#2196F3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            textAlign: 'center'
          }}>
            Вернуться к списку
          </Link>
          {!event.isIncident && (
            <Link to={`/edit/${id}`} style={{ 
              padding: '10px 20px',
              backgroundColor: '#FF9800',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px'
            }}>
              Редактировать
            </Link>
          )}
        </div>

        {!event.isIncident && (
          <button 
            onClick={handleIncident}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#d32f2f',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            🚨 Демо инцидент
          </button>
        )}

        {event.isIncident && (
          <button 
            onClick={handleResolveIncident}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '12px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px'
            }}
          >
            ✅ Исправлено
          </button>
        )}
      </div>
    </div>
  );
};

export default EventDetail;