import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as AuthApi from "../../api/auth";

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

  // --- LÓGICA DE PERSISTENCIA (Traída de Auth.tsx) ---
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

      // 2. Auto-Login
      const r = await AuthApi.login({ email: values.email, password: values.password });

      // 3. Persistencia
      persistSession(r);

      // 4. Redirección
      setTimeout(() => {
        navigate("/market", { replace: true });
      }, 1000);

    } catch (err: any) {
      console.error("Register error:", err);
      setMsg({
        type: "err",
        text: err?.message || "Error al registrar. Intenta otro email.",
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
               <path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,15,7,17,8Z"/>
            </svg>
          </div>
          <h1 className="text-[#112117] dark:text-white text-3xl font-bold tracking-tight">Crea tu cuenta</h1>
          <p className="text-[#638872] dark:text-gray-400 text-base mt-2">Únete a la comunidad de trueque sostenible</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
          <label className="flex flex-col gap-2">
            <span className="text-[#112117] dark:text-gray-200 font-medium ml-1">Nombre Completo</span>
            <input
              type="text"
              placeholder="Ej. Alex Guzmán"
              value={values.full_name}
              onChange={(e) => setValues((s) => ({ ...s, full_name: e.target.value }))}
              className="w-full h-14 px-4 rounded-xl bg-white dark:bg-[#1a2e22] border border-[#dce5df] dark:border-gray-700 text-[#112117] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all"
            />
          </label>

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
                placeholder="Mínimo 6 caracteres"
                value={values.password}
                onChange={(e) => setValues((s) => ({ ...s, password: e.target.value }))}
                className="w-full h-14 pl-4 pr-12 rounded-xl bg-white dark:bg-[#1a2e22] border border-[#dce5df] dark:border-gray-700 text-[#112117] dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] transition-all"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-gray-400 hover:text-[#2ecc71] transition-colors">
                {showPassword ? <span className="text-sm font-semibold">Ocultar</span> : <span className="text-sm font-semibold">Ver</span>}
              </button>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={values.acepta_terminos}
              onChange={(e) => setValues((s) => ({ ...s, acepta_terminos: e.target.checked }))}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-[#dce5df] dark:border-gray-600 bg-white dark:bg-[#1a2e22] checked:border-[#2ecc71] checked:bg-[#2ecc71] transition-all"
            />
            <span className="text-sm text-[#638872] dark:text-gray-400 group-hover:text-[#2ecc71] transition-colors">Acepto los términos y condiciones</span>
          </label>

          {msg && (
            <div className={`p-3 rounded-lg text-sm font-medium text-center ${msg.type === 'ok' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {msg.text}
            </div>
          )}

          <button disabled={!canSend || loading} className="w-full h-12 mt-2 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-lg tracking-wide shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none transition-all duration-300">
            {loading ? "Registrando..." : "Crear Cuenta"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#638872] dark:text-gray-400">
           ¿Ya tienes una cuenta? <Link to="/login" className="font-bold text-[#2ecc71] hover:underline">Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}