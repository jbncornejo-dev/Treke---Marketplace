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
    // Intentamos cubrir distintas formas de respuesta (según tu backend)
    const user =
      resp?.user ??
      resp?.data?.user ??
      (typeof resp === "object" && resp?.id ? resp : null);
    const token = resp?.token ?? resp?.data?.token;
    const u = JSON.parse(localStorage.getItem("treke_user") || "null");
    const isAdmin = u?.rol_id === 10003 || u?.id === 20005 || (u?.email || "").toLowerCase() === "admin.treke@gmail.com";
    navigate(isAdmin ? "/admin" : next, { replace: true });

    
    if (token) localStorage.setItem("treke_token", token);
    if (user) localStorage.setItem("treke_user", JSON.stringify(user));

    return { user, token };
  }

  async function handleRegister(values: RegisterValues) {
    try {
      setStatus("idle");
      setMsg("");
      const r = await AuthApi.register(values);
      setStatus("ok");
      setMsg("¡Registro completado!");

      // Si tu API de register devuelve user/token, también podemos guardar y redirigir:
      const { user } = persistSession(r);
      if (user) {
        navigate("/perfil", { replace: true });
      }
      console.log("register resp:", r);
    } catch (e: any) {
      setStatus("err");
      setMsg(e?.message || "No se pudo registrar");
    }
  }

  async function handleLogin(values: LoginValues) {
    try {
      setStatus("idle");
      setMsg("");
      const r = await AuthApi.login(values); // resp general
      persistSession(r);

      setStatus("ok");
      setMsg("¡Login correcto!");

      // Redirección automática al perfil (o a ?next=)
      navigate(next, { replace: true });

      console.log("login resp:", r);
    } catch (e: any) {
      setStatus("err");
      setMsg(e?.message || "Credenciales inválidas");
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
