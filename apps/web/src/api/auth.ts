// apps/web/src/api/auth.ts
import { api } from "./client";

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  full_name: string;
  password: string;
  acepta_terminos: boolean;
  rol_id?: number; // opcional
};

export type LoginResp = {
  ok?: boolean;
  user?: {
    id: number;
    email: string;
    rol_id: number;
    estado: string;
  };
  token?: string;
};

// 🔐 Solo llama al backend y devuelve la data.
// NO toca localStorage: eso se maneja en el componente Auth.
export async function login(input: LoginInput): Promise<LoginResp> {
  return api.post<LoginResp>("/api/auth/login", input);
}

// Registro: tu backend devuelve { ok, user, perfil, billetera }
// Tampoco tocamos localStorage aquí.
export async function register(input: RegisterInput) {
  return api.post("/api/usuarios/register", {
    email: input.email,
    full_name: input.full_name,
    password: input.password,
    acepta_terminos: input.acepta_terminos,
  });
}

// Perfil protegido (usa Authorization desde axios)
export async function getPerfil(usuarioId: number) {
  return api.get(`/api/usuarios/${usuarioId}/perfil`);
}

// Usuario actual desde localStorage (lo usa el resto de APIs)
export function getCurrentUser():
  | { id: number; email: string; rol_id: number }
  | null {
  try {
    const raw = localStorage.getItem("treke_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
