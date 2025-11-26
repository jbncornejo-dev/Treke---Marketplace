import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

// --- Páginas ---
import Landing from "./pages/Home/Landing"; // Asegúrate que la ruta sea correcta (mayúsculas/minúsculas)
import Register from "./pages/auth/Register"; // ⬅️ NUEVO: Importamos el Registro
import Login from "./pages/auth/Login";
import AdminUsers from "./pages/admin/AdminUsers";
import Profile from "./pages/profile/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import MarketDetailPage from "./pages/Marketplace/MarketDetail";
import MarketCreate from "./pages/Marketplace/MarketCreate";
import ComprarPaquetes from "./pages/Creditos/ComprarPaquetes";
import IntercambiosPage from "./pages/Intercambios/IntercambiosPage";
import UserReportsPage from "./pages/reports/UserReportsPage";
import OrgReportsPage from "./pages/reports/OrgReportsPage";
import AdminReportsPage from "./pages/reports/AdminReportsPage";
import SettingsPage from "./pages/profile/SettingsPage";

// --- Componentes ---
import ThemeToggle from "./components/ThemeToggle";

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* Wrapper con soporte light/dark */}
      <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        
        {/* Navbar Global */}
        <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-6">
            <Link
              to="/"
              className="font-semibold text-emerald-700 dark:text-green-400 hover:opacity-90 tracking-tight"
            >
              TREKE
            </Link>

            {/* Separador flexible para empujar contenido a la derecha */}
            <div className="ml-auto" />

            {/* Toggle de tema (ahora invisible/automático si usaste mi código anterior, o visible si lo dejaste normal) */}
            <ThemeToggle />
          </div>
        </nav>

        {/* Definición de Rutas */}
        <Routes>
          {/* Home & Auth */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} /> {/* ⬅️ RUTA AÑADIDA */}
          <Route path="/login" element={<Login />} />

          {/* Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/market/:id" element={<MarketDetailPage />} />
          <Route path="/market/nueva" element={<MarketCreate />} />

          {/* Perfil y Usuario */}
          <Route path="/perfil" element={<Profile />} />
          <Route path="/perfil/reportes" element={<UserReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Créditos */}
          <Route path="/creditosyplanes" element={<ComprarPaquetes />} />

          {/* Organización y Admin */}
          <Route path="/org/reportes" element={<OrgReportsPage />} />
          <Route path="/admin" element={<AdminUsers />} />
          <Route path="/admin/reportes" element={<AdminReportsPage />} />

          <Route path="/intercambios" element={<IntercambiosPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}