import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as AuthApi from "../../api/auth";

export type LoginValues = { email: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/market";

  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // --- LÓGICA DE PERSISTENCIA (Traída de Auth.tsx) ---
  // Usamos 'any' aquí para evitar conflictos de tipos con la respuesta de la API
  function persistSession(resp: any) {
    const user =
      resp?.user ??
      resp?.data?.user ??
      (typeof resp === "object" && resp?.id ? resp : null);

    const token = resp?.token ?? resp?.data?.token;

    if (token) localStorage.setItem("treke_token", token);
    if (user) localStorage.setItem("treke_user", JSON.stringify(user));

    const isAdmin =
      user?.rol_id === 10003 ||
      user?.id === 20005 ||
      (user?.email || "").toLowerCase() === "admin.treke@gmail.com";

    return { isAdmin };
  }
  // ---------------------------------------------------

  const canSend = values.email.includes("@") && values.password.trim().length >= 1;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend || loading) return;

    setLoading(true);
    setMsg(null);

    try {
      // 1. Llamada a la API
      const r = await AuthApi.login(values);

      // 2. Persistencia usando la función auxiliar
      const { isAdmin } = persistSession(r);

      setMsg({ type: "ok", text: "¡Login correcto! Redirigiendo..." });

      // 3. Redirección
      setTimeout(() => {
        navigate(isAdmin ? "/admin" : next, { replace: true });
      }, 500);

    } catch (err: any) {
      console.error("Login error:", err);
      setMsg({
        type: "err",
        text: err?.message || "Credenciales inválidas o error de conexión",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#f6f8f7] dark:bg-[#112117] transition-colors px-4 py-10 font-sans">
      <div className="w-full max-w-[480px] mx-auto">
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center justify-center p-3 bg-[#2ecc71]/10 rounded-2xl mb-4">
            <svg className="w-10 h-10 text-[#2ecc71]" fill="currentColor" viewBox="0 0 24 24">
               <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.5 14.5L5.64 11.64l1.41-1.41L10.5 13.09l6.95-6.95 1.41 1.41L10.5 16.5z"></path>
            </svg>
          </div>
          <h1 className="text-[#112117] dark:text-white text-3xl font-bold tracking-tight">Bienvenido a TREKE</h1>
          <p className="text-[#638872] dark:text-gray-400 text-base mt-2">Intercambia y sé sostenible</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <label className="flex flex-col gap-2">
            <span className="text-[#112117] dark:text-gray-200 font-medium ml-1">Correo Electrónico</span>
            <input
              type="email"
              placeholder="tu@email.com"
              value={values.email}
              onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-[#dce5df] dark:border-gray-700 text-[#112117] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[#112117] dark:text-gray-200 font-medium ml-1">Contraseña</span>
            <div className="relative flex items-center">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={values.password}
                onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))}
                className="w-full h-14 pl-4 pr-12 rounded-xl bg-white dark:bg-[#1a2e22] border border-[#dce5df] dark:border-gray-700 text-[#112117] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-[#2ecc71] transition-colors">
                {showPassword ? <span className="text-sm font-semibold">Ocultar</span> : <span className="text-sm font-semibold">Ver</span>}
              </button>
            </div>
          </label>

          {msg && (
            <div className={`p-3 rounded-lg text-sm font-medium text-center ${msg.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <button disabled={!canSend || loading} className="w-full h-12 mt-2 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300">
            {loading ? "Entrando..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#638872] dark:text-gray-400">
           ¿No tienes una cuenta? <Link to="/register" className="font-bold text-[#2ecc71] hover:underline">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}