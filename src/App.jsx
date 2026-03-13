import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import EventForm from "./pages/EventForm";
import GuardList from "./pages/GuardList";
import GuardDetail from "./pages/GuardDetail";
import GuardForm from "./pages/GuardForm";

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif'}}>
        <nav>
          <Link to="/">Главная </Link> |
          <Link to="/add">Добавить мероприятие</Link>
          <Link to="/guards" style={{ marginLeft: '10px' }}>Охранники</Link>
        </nav>
        <hr />

        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/detail/:id" element={<EventDetail />} /> 
          <Route path="/add" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />
          <Route path="/guards" element={<GuardList />} />
          <Route path="/guards/detail/:id" element={<GuardDetail />} />
          <Route path="/guards/add" element={<GuardForm />} />
          <Route path="/guards/edit/:id" element={<GuardForm />} />     
        </Routes>
      </div>
    </Router>
  );
}

export default App;