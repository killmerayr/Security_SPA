import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import EventList from "./pages/EventList";
import EventDetail from "./pages/EventDetail";
import EventForm from "./pages/EventForm";

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'sans-serif'}}>
        <nav>
          <Link to="/">Главная </Link> |
          <Link to="/add">Добавить мероприятие</Link>
        </nav>
        <hr />

        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/detail/:id" element={<EventDetail />} /> 
          <Route path="/add" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />     
        </Routes>
      </div>
    </Router>
  );
}

export default App;