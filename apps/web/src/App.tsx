import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";

// --- Páginas ---
import Landing from "./pages/Home/Landing";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminUsers from "./pages/admin/AdminUsers";
import Profile from "./pages/profile/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import MarketDetailPage from "./pages/Marketplace/MarketDetail";
import MarketCreate from "./pages/Marketplace/MarketCreate";
import ComprarPaquetes from "./pages/Creditos/ComprarPaquetes";
import IntercambiosPage from "./pages/Intercambios/IntercambiosPage";
import UserReportsPage from "./pages/reports/UserReportsPage";
import AdminReportsPage from "./pages/reports/AdminReportsPage";
import AdminAdsPage from "./pages/admin/AdminAdsPage";

import UserPublicProfilePage from "./pages/profile/UserPublicProfilePage";

// ...


import SettingsPage from "./pages/profile/SettingsPage";

import GamificacionProfile from "./pages/profile/GamificacionProfile";

// ...




import "./index.css";

// ----------------------------------------------------------------------
// 🛡️ COMPONENTES DE PROTECCIÓN (Guardianes)
// ----------------------------------------------------------------------

// 1. Solo Usuarios Logueados (Cualquier rol)
function PrivateRoute({ children }: { children: ReactElement }) {
  // Verificamos si existe el usuario en localStorage
  const userStr = localStorage.getItem("treke_user");
  
  if (!userStr) {
    // Si no hay usuario, mandamos al login
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// 2. Solo Administradores (rol_id === 10003)
function AdminRoute({ children }: { children: ReactElement }) {
  const userStr = localStorage.getItem("treke_user");
  const user = userStr ? JSON.parse(userStr) : null;

  // Si no existe o no es el rol 10003, lo mandamos al inicio
  if (!user || user.rol_id !== 10003) {
    return <Navigate to="/" replace />;
  }

  return children;
}

// ----------------------------------------------------------------------

export default function App() {
  return (
    <BrowserRouter>
      {/* Wrapper con soporte light/dark */}
      <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        
        <Routes>
          {/* --- RUTAS PÚBLICAS (Cualquiera puede ver) --- */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* El Marketplace base suele ser público para atraer usuarios */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/market/:id" element={<MarketDetailPage />} />


          {/* --- RUTAS PRIVADAS (Requieren Login) --- */}
          <Route path="/market/nueva" element={
            <PrivateRoute>
              <MarketCreate />
            </PrivateRoute>
          } />

          <Route path="/perfil" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          <Route path="/perfil/reportes" element={
            <PrivateRoute>
              <UserReportsPage />
            </PrivateRoute>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute>
              <SettingsPage />
            </PrivateRoute>
          } />

          <Route path="/creditosyplanes" element={
            <PrivateRoute>
              <ComprarPaquetes />
            </PrivateRoute>
          } />

          <Route path="/intercambios" element={
            <PrivateRoute>
              <IntercambiosPage />
            </PrivateRoute>
          } />


          {/* --- RUTAS DE ADMIN (Protegidas Nivel Alto) --- */}
          {/* Aquí aplicamos la lógica que pediste: Evitar que entren por URL */}
          
          <Route path="/admin" element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          } />
          
          <Route path="/admin/reportes" element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          } />
          <Route path="/perfil/gamificacion" element={<GamificacionProfile />} />
          <Route path="/perfil/:usuarioId" element={<UserPublicProfilePage />} />
          <Route path="/admin/anuncios" element={
               <AdminRoute>
          <AdminAdsPage />
          </AdminRoute>

          
  }
/>


        </Routes>
      </div>
    </BrowserRouter>
  );
}