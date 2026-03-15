import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/guards';
const EventURL = `${API_URL}/events`;
const GuardsUrl = `${API_URL}/guards`;

export default function GuardForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    rank: '',
    phone: ''
  });

  useEffect(() => {
    if (!id) return;
    axios.get(`${GuardsUrl}/${id}`)
      .then(res => setFormData(res.data));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const req = id
      ? axios.put(`${GuardsUrl}/${id}`, formData)
      : axios.post(GuardsUrl, formData);

    req.then(() => navigate('/guards'));
  };

  return (
    <div>
      <h2>{id ? "Редактировать охранника" : "Добавить охранника"}</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320 }}>
        <input
          placeholder="ФИО"
          value={formData.fullName}
          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
          required
        />
        <input
          placeholder="Должность"
          value={formData.rank}
          onChange={e => setFormData({ ...formData, rank: e.target.value })}
          required
        />
        <input
          placeholder="Телефон"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <button type="submit">
          {id ? "Сохранить" : "Создать"}
        </button>
      </form>
    </div>
  );
}