// apps/web/src/api/settings.ts
import { api } from "./client";
import { getCurrentUserId } from "./profile";

export type Direccion = {
  id: number;
  descripcion: string;
  calle_y_num: string;
  provincia: string;
  ciudad: string;
  es_principal: boolean;
};

// --- Perfil ---
export async function updateProfile(data: any) {
  const id = getCurrentUserId();
  if(!id) throw new Error("No sesión");
  // 👇 AGREGADO /api
  return api.put(`/api/usuarios/${id}/perfil`, data);
}

export async function getMyProfile() {
  const id = getCurrentUserId();
  if(!id) throw new Error("No sesión");
  // 👇 AGREGADO /api
  const r = await api.get<{ok:boolean; data:any}>(`/api/usuarios/${id}/perfil`);
  return (r as any).data ?? r;
}

// --- Direcciones ---
export async function getAddresses() {
  const id = getCurrentUserId();
  if(!id) throw new Error("No sesión");
  // 👇 AGREGADO /api
  const r = await api.get<{ok:boolean; data: Direccion[]}>(`/api/usuarios/${id}/direcciones`);
  return (r as any).data ?? [];
}

export async function addAddress(addr: Omit<Direccion, 'id'>) {
  const id = getCurrentUserId();
  if(!id) throw new Error("No sesión");
  // 👇 AGREGADO /api
  return api.post(`/api/usuarios/${id}/direcciones`, addr);
}

export async function deleteAddress(did: number) {
  const id = getCurrentUserId();
  if(!id) throw new Error("No sesión");
  // 👇 AGREGADO /api
  return api.del(`/api/usuarios/${id}/direcciones/${did}`);
}