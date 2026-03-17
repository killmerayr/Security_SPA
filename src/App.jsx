import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import EventForm from "./pages/EventForm";
import GuardList from "./pages/GuardList";
import GuardDetail from "./pages/GuardDetail";
import GuardForm from "./pages/GuardForm";
import VenueList from "./pages/VenueList";
import VenueDetail from "./pages/VenueDetail";
import VenueForm from "./pages/VenueForm";

function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <header style={{
          backgroundColor: '#1976d2',
          color: 'white',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Система управления мероприятиями</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Управление событиями, охраной и площадками</p>
        </header>

        <nav style={{
          backgroundColor: '#fff',
          padding: '15px 20px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          <Link to="/" style={{ 
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: '500',
            fontSize: '16px',
            borderBottom: '3px solid transparent',
            paddingBottom: '5px',
            transition: 'border-color 0.3s'
          }}>
            Мероприятия
          </Link>
          <Link to="/guards" style={{ 
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: '500',
            fontSize: '16px',
            borderBottom: '3px solid transparent',
            paddingBottom: '5px',
            transition: 'border-color 0.3s'
          }}>
            Охранники
          </Link>
          <Link to="/venues" style={{ 
            textDecoration: 'none',
            color: '#1976d2',
            fontWeight: '500',
            fontSize: '16px',
            borderBottom: '3px solid transparent',
            paddingBottom: '5px',
            transition: 'border-color 0.3s'
          }}>
            Площадки
          </Link>
        </nav>

        <main style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<EventList />} />
            <Route path="/detail/:id" element={<EventDetail />} /> 
            <Route path="/add" element={<EventForm />} />
            <Route path="/edit/:id" element={<EventForm />} />

            <Route path="/guards" element={<GuardList />} />
            <Route path="/guards/detail/:id" element={<GuardDetail />} />
            <Route path="/guards/add" element={<GuardForm />} />
            <Route path="/guards/edit/:id" element={<GuardForm />} />

            <Route path="/venues" element={<VenueList />} />
            <Route path="/venues/detail/:id" element={<VenueDetail />} />
            <Route path="/venues/add" element={<VenueForm />} />
            <Route path="/venues/edit/:id" element={<VenueForm />} />
          </Routes>
        </main>

        <footer style={{
          backgroundColor: '#333',
          color: '#fff',
          padding: '20px',
          textAlign: 'center',
          marginTop: '40px'
        }}>
          <p style={{ margin: 0 }}>© 2024 Система управления мероприятиями • Все права защищены</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;