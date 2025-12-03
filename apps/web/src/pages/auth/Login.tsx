import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import * as AuthApi from "../../api/auth";
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2 
} from 'lucide-react';

// Definimos el ID del rol admin según tu archivo admin.ts
const ADMIN_ROLE_ID = 10003;

export type LoginValues = { email: string; password: string };

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  // Si venía de otra página, volvemos ahí, si no, al market por defecto
  const next = new URLSearchParams(location.search).get("next") || "/market";

  const [values, setValues] = useState<LoginValues>({
    email: "",
    password: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // --- LÓGICA DE PERSISTENCIA ACTUALIZADA ---
  function persistSession(resp: any) {
    // Tu backend devuelve { ok: true, user: {...}, token: "..." }
    // Normalizamos por si acaso la estructura varía
    const user = resp?.user || resp?.data?.user;
    const token = resp?.token || resp?.data?.token;

    if (token) localStorage.setItem("treke_token", token);
    if (user) localStorage.setItem("treke_user", JSON.stringify(user));

    // Verificación estricta del Rol ID
    const isAdmin = user?.rol_id === ADMIN_ROLE_ID;

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

      // 2. Guardar sesión y verificar si es Admin
      const { isAdmin } = persistSession(r);

      setMsg({ type: "ok", text: "¡Bienvenido de nuevo!" });

      // 3. Redirección Inteligente
      setTimeout(() => {
        if (isAdmin) {
          // Si es admin -> Panel de Administración
          navigate("/admin", { replace: true });
        } else {
          // Si es usuario normal -> Next (Market) o Perfil
          navigate(next, { replace: true });
        }
      }, 800);

    } catch (err: any) {
      console.error("Login error:", err);
      setMsg({
        type: "err",
        text: err?.message || "Credenciales incorrectas",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 relative z-10">
        
        {/* Logo / Link Home */}
        <div className="absolute top-8 left-8 sm:left-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110">
               <Leaf size={16} fill="currentColor" />
            </div>
            <span className="font-semibold tracking-tight text-xl">Treke.</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-12 sm:mt-0">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              Bienvenido de nuevo
            </h1>
            <p className="text-gray-500">
              Ingresa tus datos para continuar intercambiando.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="hola@ejemplo.com"
                  value={values.email}
                  onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                 <label className="text-sm font-medium text-gray-700">Contraseña</label>
                 <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline">
                    ¿Olvidaste tu contraseña?
                 </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={values.password}
                  onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))}
                  className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Mensajes de Estado */}
            {msg && (
              <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${
                msg.type === 'ok' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                  : 'bg-red-50 text-red-700 border border-red-100'
              }`}>
                {msg.type === 'ok' ? <Leaf size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                {msg.text}
              </div>
            )}

            {/* Botón Submit */}
            <button
              disabled={!canSend || loading}
              className="w-full py-3.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-medium text-base transition-all duration-300 shadow-lg shadow-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            ¿Aún no eres parte?{" "}
            <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
              Crear cuenta gratis
            </Link>
          </p>
        </div>

        {/* Footer simple */}
        <div className="absolute bottom-6 left-0 w-full text-center sm:text-left sm:pl-12">
            <p className="text-xs text-gray-400">© 2025 Treke Inc. Privacidad y Términos</p>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: IMAGEN (Desktop) --- */}
      <div className="hidden lg:block lg:w-1/2 relative bg-stone-100">
         <div className="absolute inset-0 w-full h-full">
            <img 
               src="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=2670&auto=format&fit=crop" 
               alt="Nature background" 
               className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-emerald-900/10 mix-blend-multiply" />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/50 via-transparent to-transparent" />
         </div>

         <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold tracking-wide mb-4">
               <Leaf size={12} fill="currentColor" />
               COMUNIDAD SOSTENIBLE
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4 drop-shadow-lg">
               Pequeños cambios,<br/>gran impacto.
            </h2>
            <p className="text-lg text-gray-100 max-w-md drop-shadow-md">
               Únete a miles de personas que están redefiniendo el valor de las cosas a través del intercambio.
            </p>
         </div>
      </div>

    </div>
  );
}