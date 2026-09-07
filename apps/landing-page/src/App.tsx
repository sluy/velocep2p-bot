import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import MiembrosPage from './pages/MiembrosPage';

export default function App() {
  return (
    <div className="scanline-bg">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/miembros" element={<MiembrosPage />} />
      </Routes>
    </div>
  );
}
