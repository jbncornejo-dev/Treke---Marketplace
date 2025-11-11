import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Home/Landing";
import AuthPage from "./pages/auth/Auth"; // si no tienes index.tsx, crea rutas a Register/Login directo
import Marketplace from "./pages/Marketplace/Marketplace";
import AdminUsers from "./pages/admin/AdminUsers";
import Profile from "./pages/profile/Profile";

import './index.css';


export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        {/* Navbar simple para moverte */}
        <nav className="sticky top-0 z-50 border-b border-neutral-800/70 bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-6">
            <Link to="/" className="font-semibold text-green-400 hover:text-green-300">TREKE</Link>
            <Link to="/marketplace" className="text-sm text-neutral-300 hover:text-white">Marketplace</Link>
            <Link to="/auth" className="text-sm text-neutral-300 hover:text-white">Auth</Link>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/auth" element={<AuthPage />} />
          {/* ... */}
          <Route path="/admin" element={<AdminUsers />} />  
          <Route path="/perfil" element={<Profile />} />
          {/* Si quieres exponer Register/Login por separado: */}
          {/* <Route path="/auth/register" element={<Register />} /> */}
          {/* <Route path="/auth/login" element={<Login />} /> */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}
