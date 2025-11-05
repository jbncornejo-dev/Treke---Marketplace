import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PerfilPage from './pages/PerfilPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';


export default function App() {
return (
<BrowserRouter>
<nav className="p-3 flex gap-4 border-b">
<Link to="/">Inicio</Link>
<Link to="/admin/usuarios">Admin Usuarios</Link>
</nav>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/perfil/:id" element={<PerfilPage />} />
<Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
</Routes>
</BrowserRouter>
);
}