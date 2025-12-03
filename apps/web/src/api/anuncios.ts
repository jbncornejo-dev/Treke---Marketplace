// apps/web/src/api/anuncios.ts
import { api } from "./client";

export type UbicacionAnuncio =
  | "market"
  | "perfil"
  | "creditos"
  | "intercambios"
  | "global";

export type Anuncio = {
  id: number;
  titulo: string;
  contenido: string;
  imagen_url: string;
  enlace_destino: string | null;
  ubicacion: UbicacionAnuncio | string;
  fecha_ini: string;
  fecha_fin: string;
  esta_activo: boolean;
  presupuesto: number | null;
  clicks: number;
  impresiones: number;
};

type ApiResp<T> = { ok: boolean; data: T };

// Público: anuncios para un footer específico
export async function getAnunciosByUbicacion(
  ubicacion: UbicacionAnuncio
): Promise<Anuncio[]> {
  const resp = await api.get<ApiResp<Anuncio[]>>("/api/anuncios/activos", {
    params: { ubicacion },
  });
  return resp.data;
}

// Admin: listado
export async function adminListAnuncios(): Promise<Anuncio[]> {
  const resp = await api.get<ApiResp<Anuncio[]>>("/api/admin/anuncios");
  return resp.data;
}

// Admin: crear anuncio
export async function adminCrearAnuncio(payload: {
  titulo: string;
  contenido: string;
  imagen_url: string;
  enlace_destino?: string;
  ubicacion: UbicacionAnuncio;
  fecha_ini: string; // "YYYY-MM-DD"
  fecha_fin: string; // "YYYY-MM-DD"
  esta_activo?: boolean;
  presupuesto?: number;
}): Promise<Anuncio> {
  const resp = await api.post<ApiResp<Anuncio>>("/api/admin/anuncios", payload);
  return resp.data;
}

// Métrica de click (opcional)
export async function registrarClick(id: number): Promise<void> {
  await api.post(`/api/anuncios/${id}/click`);
}
