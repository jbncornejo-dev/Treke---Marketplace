import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as AuthApi from "../../api/auth";
import { 
  Leaf, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  Check
} from 'lucide-react';

export type RegisterValues = {
  email: string;
  full_name: string;
  password: string;
  acepta_terminos: boolean;
};

export default function Register() {
  const navigate = useNavigate();

  const [values, setValues] = useState<RegisterValues>({
    email: "",
    full_name: "",
    password: "",
    acepta_terminos: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  // --- LÓGICA DE PERSISTENCIA (INTACTA) ---
  function persistSession(resp: any) {
    const user =
      resp?.user ??
      resp?.data?.user ??
      (typeof resp === "object" && resp?.id ? resp : null);

    const token = resp?.token ?? resp?.data?.token;

    if (token) localStorage.setItem("treke_token", token);
    if (user) localStorage.setItem("treke_user", JSON.stringify(user));
  }
  // ---------------------------------------------------

  // Validaciones
  const canSend =
    values.email.includes("@") &&
    values.full_name.trim().length >= 3 &&
    values.password.length >= 6 &&
    values.acepta_terminos;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend || loading) return;

    setLoading(true);
    setMsg(null);

    try {
      // 1. Registro
      await AuthApi.register(values);
      setMsg({ type: "ok", text: "¡Cuenta creada! Iniciando sesión..." });

      // 2. Auto-Login (UX fluida)
      const r = await AuthApi.login({ email: values.email, password: values.password });

      // 3. Persistencia
      persistSession(r);

      // 4. Redirección
      setTimeout(() => {
        navigate("/market", { replace: true });
      }, 1500); // Un poco más de tiempo para celebrar el registro

    } catch (err: any) {
      console.error("Register error:", err);
      setMsg({
        type: "err",
        text: err?.message || "Error al registrar. Intenta con otro correo.",
      });
      setLoading(false); // Solo quitamos loading si falla, si es éxito esperamos la redirección
    }
  }

  return (
    <div className="min-h-screen flex bg-white font-sans text-gray-900">
      
      {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-20 xl:px-24 relative z-10 py-10">
        
        {/* Logo */}
        <div className="absolute top-8 left-8 sm:left-12">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110">
               <Leaf size={16} fill="currentColor" />
            </div>
            <span className="font-semibold tracking-tight text-xl">Treke.</span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto mt-12 sm:mt-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-3">
              Únete a la comunidad
            </h1>
            <p className="text-gray-500">
              Crea tu cuenta gratis y empieza a intercambiar hoy mismo.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Nombre */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Nombre Completo</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Ej. Alex Guzmán"
                  value={values.full_name}
                  onChange={(e) => setValues((s) => ({ ...s, full_name: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all duration-200"
                />
              </div>
            </div>

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
              <label className="text-sm font-medium text-gray-700 ml-1">Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-emerald-600 transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
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

            {/* Checkbox Términos */}
            <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all duration-200 ${values.acepta_terminos ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300 group-hover:border-emerald-500'}`}>
                        {values.acepta_terminos && <Check size={14} className="text-white" strokeWidth={3} />}
                    </div>
                    <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={values.acepta_terminos} 
                        onChange={(e) => setValues((s) => ({ ...s, acepta_terminos: e.target.checked }))} 
                    />
                    <span className="text-sm text-gray-500 leading-tight">
                        Acepto los <a href="#" className="text-emerald-600 hover:underline font-medium">Términos de Servicio</a> y la <a href="#" className="text-emerald-600 hover:underline font-medium">Política de Privacidad</a>.
                    </span>
                </label>
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  Registrarse
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
              Iniciar Sesión
            </Link>
          </p>
        </div>
      </div>

      {/* --- COLUMNA DERECHA: IMAGEN (Desktop) --- */}
      <div className="hidden lg:block lg:w-1/2 relative bg-emerald-50">
         <div className="absolute inset-0 w-full h-full">
            {/* Imagen de comunidad/gente intercambiando */}
            <img 
               src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
               alt="Community working together" 
               className="w-full h-full object-cover grayscale-0 transition-all hover:scale-105 duration-[20s]"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-emerald-900/20 mix-blend-multiply" />
            <div className="absolute inset-0 bg-linear-to-t from-gray-900/60 via-transparent to-transparent" />
         </div>

         {/* Contenido sobre la imagen */}
         <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-50 text-xs font-semibold tracking-wide mb-4">
               <User size={12} fill="currentColor" />
               ÚNETE AL CAMBIO
            </div>
            <h2 className="text-4xl font-bold leading-tight mb-4 drop-shadow-lg">
               Tu basura es el<br/>tesoro de otro.
            </h2>
            <p className="text-lg text-gray-100 max-w-md drop-shadow-md">
               Forma parte de la primera red social dedicada exclusivamente a la economía circular y el trueque justo.
            </p>
         </div>
      </div>

    </div>
  );
}