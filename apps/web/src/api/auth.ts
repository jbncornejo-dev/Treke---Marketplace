import { api } from './client';

export type LoginInput = { email: string; password: string };
export type RegisterInput = {
  email: string;
  full_name: string;
  password: string;
  acepta_terminos: boolean;
  rol_id?: number; // opcional
};
export type LoginResp = { ok?: boolean; user: any; token?: string };


export async function login(input: LoginInput) {
  // backend: POST /api/auth/login
  // resp esperada: { ok: true, user, token? ... }
  return api.post('/api/auth/login', input);
}

export async function register(input: {
  email: string; full_name: string; password: string; acepta_terminos: boolean;
}) {
  // NO mandes rol_id
  return api.post('/api/usuarios/register', {
    email: input.email,
    full_name: input.full_name,
    password: input.password,
    acepta_terminos: input.acepta_terminos,
  });
}
export async function getPerfil(usuarioId: number) {
  // backend: GET /api/usuarios/:id/perfil
  return api.get(`/api/usuarios/${usuarioId}/perfil`);
}


export function getCurrentUser(): { id:number; email:string; rol_id:number } | null {
  try {
    const raw = localStorage.getItem('treke_user');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

