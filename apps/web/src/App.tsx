import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Landing from "./pages/Home/Landing";
import AuthPage from "./pages/auth/Auth";
import AdminUsers from "./pages/admin/AdminUsers";
import Profile from "./pages/profile/Profile";
import Marketplace from "./pages/Marketplace/Marketplace";
import MarketDetailPage from "./pages/Marketplace/MarketDetail";
import ReportsRouter from "./pages/reports/ReportsRouter";
import GeneralReports from "./pages/reports/ReportsGeneral";
import AdminMonetization from "./pages/reports/AdminMonetizacion";
import MarketCreate from "./pages/Marketplace/MarketCreate";




import ThemeToggle from "./components/ThemeToggle"; // ⬅️ botón tema

import "./index.css";

export default function App() {
  return (
    <BrowserRouter>
      {/* Wrapper con soporte light/dark */}
     <div className="min-h-dvh bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100 transition-colors">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800/70 bg-white/70 dark:bg-neutral-950/70 backdrop-blur">
          <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-6">
            <Link
              to="/"
              className="font-semibold text-emerald-700 dark:text-green-400 hover:opacity-90"
            >
              TREKE
            </Link>

            <Link
              to="/marketplace"
              className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            >
              Marketplace
            </Link>
            <Link
              to="/auth"
              className="text-sm text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white"
            >
              Auth
            </Link>

            {/* separador flexible */}
            <div className="ml-auto" />

            {/* Toggle de tema visible en toda la app */}
            <ThemeToggle />
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin" element={<AdminUsers />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/market/:id" element={<MarketDetailPage />} />
          <Route path="/reports" element={<ReportsRouter />} />
          <Route path="/reportesgeneral" element={<GeneralReports />} />
          <Route path="/admin/reportes/monetizacion" element={<AdminMonetization />} />
          <Route path="/market/nueva" element={<MarketCreate />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
