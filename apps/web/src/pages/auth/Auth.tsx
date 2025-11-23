// apps/web/src/pages/Auth/Auth.tsx (ajusta la ruta si es distinta)
import Header from "../../components/Header";
import Login, { type LoginValues } from "./Login";
import Register, { type RegisterValues } from "./Register";
import * as AuthApi from "../../api/auth";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth() {
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");
  const [msg, setMsg] = useState<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/perfil";

  function persistSession(resp: any) {
    // Normalizamos posibles formas de respuesta
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

    return { user, token, isAdmin };
  }

  // 🔐 LOGIN
  async function handleLogin(values: LoginValues) {
    try {
      setStatus("idle");
      setMsg("");

      const r = await AuthApi.login(values);
      const { isAdmin } = persistSession(r);

      setStatus("ok");
      setMsg("¡Login correcto!");

      // Redirección automática
      navigate(isAdmin ? "/admin" : next, { replace: true });

      console.log("login resp:", r);
    } catch (e: any) {
      setStatus("err");
      setMsg(e?.message || "Credenciales inválidas");
    }
  }

  // 🧾 REGISTER + luego LOGIN automático con las mismas credenciales
  async function handleRegister(values: RegisterValues) {
    try {
      setStatus("idle");
      setMsg("");

      const r = await AuthApi.register(values);
      console.log("register resp:", r);

      setStatus("ok");
      setMsg("¡Registro completado! Iniciando sesión...");

      // Auto-login con el mismo email y password
      await handleLogin({
        email: values.email,
        password: values.password,
      });
    } catch (e: any) {
      setStatus("err");
      setMsg(e?.message || "No se pudo registrar");
    }
  }

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Acceso" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Mensaje global */}
        {status !== "idle" && (
          <div
            className={`mb-4 rounded-lg border p-3 ${
              status === "ok" ? "border-green-600" : "border-red-600"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 items-start">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Register onSubmit={handleRegister} />
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
            <Login onSubmit={handleLogin} />
          </div>
        </div>
      </main>
    </div>
  );
}
