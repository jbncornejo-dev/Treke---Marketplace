// apps/web/src/api/market.ts
import { api } from "./client";

// 1. Eliminada la opción "near" porque ya no hay geolocalización
export type SortKey = "recent" | "price_asc" | "price_desc";

/* COMENTADO: El backend ya no tiene la ruta de factores ecológicos activa.
   Si en el futuro la reactivas, descomenta esto.
*/
/*
export type FactorEcologico = {
  id: number;
  nombre_factor: string;
  unidad_medida: string;
  desc_calc: string;
};

export async function getFactoresEcologicos(): Promise<FactorEcologico[]> {
  const r = await api.get<{ ok: boolean; data: FactorEcologico[] }>(
    "/api/market/factores" // Ajustado a la ruta probable
  );
  return (r as any).data ?? (r as any);
}
*/

export type ReviewItem = {
  id: number;
  calificacion: number;
  comentario: string | null;
  created_at: string;
  autor_nombre: string;
  autor_foto?: string | null;
};

export type MarketItem = {
  id: number;
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  peso_aprox_kg: number; // Nuevo campo
  created_at: string;
  usuario_id: number;
  categoria_id: number;
  estado_id: number;

  // Datos enriquecidos (JOINs)
  categoria: string;
  categoria_color?: string; // Nuevo del SQL
  categoria_icono?: string; // Nuevo del SQL
  estado_nombre: string;
  vendedor_nombre?: string | null;
  vendedor_rating?: string | number | null;
  foto_principal?: string | null;

  is_fav?: boolean;
};

export type MarketListResp = {
  items: MarketItem[];
  page: { total: number; limit: number; offset: number; has_more: boolean };
};

// 2. Función LIST limpia de coordenadas
export async function list(opts: {
  q?: string;
  categoria_id?: number | null;
  min_cred?: number | null;
  max_cred?: number | null;
  estado_id?: number | null;
  // Eliminados: lat, lng, radio_km
  sort?: SortKey;
  limit?: number;
  offset?: number;
}): Promise<MarketListResp> {
  const p = new URLSearchParams();

  if (opts.q) p.set("q", opts.q);
  if (opts.categoria_id != null) p.set("categoria_id", String(opts.categoria_id));
  if (opts.min_cred != null) p.set("min_cred", String(opts.min_cred));
  if (opts.max_cred != null) p.set("max_cred", String(opts.max_cred));
  if (opts.estado_id != null) p.set("estado_id", String(opts.estado_id));

  // lat, lng y radio_km ya no se envían
  p.set("sort", opts.sort || "recent");
  p.set("limit", String(opts.limit ?? 12));
  p.set("offset", String(opts.offset ?? 0));

  const resp = await api.get<{ ok: boolean; data: MarketListResp }>(
    `/api/market/list?${p.toString()}`
  );
  return (resp as any).data ?? (resp as any);
}

export type MarketDetail = MarketItem & {
  fotos: { id: number; foto_url: string; orden: number; es_principal: boolean }[];
  total_propuestas: number;
  is_fav: boolean;
  vendedor_email: string;

  // 👇 NUEVO CAMPO: reseñas del vendedor
  reviews: ReviewItem[];
};

export function getCurrentUserId(): number | null {
  try {
    const raw = localStorage.getItem("treke_user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return Number(u?.id) || null;
  } catch {
    return null;
  }
}

export async function detail(id: number): Promise<MarketDetail> {
  const resp = await api.get<{ ok: boolean; data: MarketDetail }>(
    `/api/market/${id}`
  );
  return (resp as any).data ?? (resp as any);
}

export async function toggleFav(id: number, wantFav: boolean) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  if (wantFav) {
    return api.post(`/api/market/${id}/fav`, {});
  }
  return api.del(`/api/market/${id}/fav`);
}

// 3. Payload de creación actualizado
export type CrearPublicacionPayload = {
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  // Eliminados: latitud, longitud
  peso_aprox_kg?: number | null;
  categoria_id: number;
  estado_id?: number | null;
  factor_ids: number[];
  sin_impacto: boolean;
  fotos: string[];
};

export async function crearPublicacion(payload: CrearPublicacionPayload) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: { id: number } }>(
    "/api/market", // Esto apunta a MarketController.create
    payload
  );

  return (resp as any).data ?? (resp as any);
}

// 4. Catálogos: Rutas ajustadas para apuntar a MarketController
// Antes tenías /api/catalogo/..., pero tu controller está en /api/market/...
export async function getCategorias(): Promise<
  Array<{ id: number; nombre: string; icono?: string; color?: string }>
> {
  const r = await api.get<{
    ok: boolean;
    data: Array<{ id: number; nombre: string; icono?: string; color?: string }>;
  }>("/api/market/categorias");
  return (r as any).data ?? (r as any);
}

export async function getEstadosPublicacion(): Promise<
  Array<{ id: number; nombre: string }>
> {
  const r = await api.get<{
    ok: boolean;
    data: Array<{ id: number; nombre: string }>;
  }>("/api/market/estados");
  return (r as any).data ?? (r as any);
}

// Upload con axios
export async function uploadMarketImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append("images", file));

  const r = await api.post<{ ok: boolean; data: string[] }>(
    "/api/market/upload-images",
    form
  );

  return (r as any).data ?? (r as any);
}
