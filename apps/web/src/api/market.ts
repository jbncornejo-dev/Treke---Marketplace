import { api } from "./client";

export type SortKey = "recent" | "price_asc" | "price_desc" | "near";


export type FactorEcologico = {
  id: number;
  nombre_factor: string;
  unidad_medida: string;
  desc_calc: string;
};
export async function getFactoresEcologicos(): Promise<FactorEcologico[]> {
  const r = await api.get<{ ok: boolean; data: FactorEcologico[] }>('/api/catalogo/factores-ecologicos');
  return (r as any).data ?? (r as any);
}

export type MarketItem = {
  id: number;
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  latitud?: number | null;
  longitud?: number | null;
  created_at: string;
  usuario_id: number;
  categoria_id: number;
  estado_id: number;
  categoria: string;
  estado_nombre: string;
  vendedor_nombre?: string | null;
  vendedor_rating?: string | number | null;
  foto_principal?: string | null;
  distancia_km?: number | null;
};

export type MarketListResp = {
  items: MarketItem[];
  page: { total: number; limit: number; offset: number; has_more: boolean };
};

export async function list(opts: {
  q?: string;
  categoria_id?: number | null;
  min_cred?: number | null;
  max_cred?: number | null;
  estado_id?: number | null;
  lat?: number | null;
  lng?: number | null;
  radio_km?: number | null;
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
  if (opts.lat != null) p.set("lat", String(opts.lat));
  if (opts.lng != null) p.set("lng", String(opts.lng));
  if (opts.radio_km != null) p.set("radio_km", String(opts.radio_km));
  p.set("sort", opts.sort || "recent");
  p.set("limit", String(opts.limit ?? 12));
  p.set("offset", String(opts.offset ?? 0));

  const resp = await api.get<{ ok: boolean; data: MarketListResp }>(`/api/market/list?${p.toString()}`);
  return (resp as any).data ?? (resp as any);
}

export type MarketDetail = MarketItem & {
  fotos: { id: number; foto_url: string; orden: number; es_principal: boolean }[];
  total_propuestas: number;
  is_fav: boolean;
  vendedor_email: string;
};

export function getCurrentUserId(): number | null {
  try {
    const raw = localStorage.getItem("treke_user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return Number(u?.id) || null;
  } catch { return null; }
}

export async function detail(id: number): Promise<MarketDetail> {
  const uid = getCurrentUserId();
  const headers = uid ? { "x-user-id": String(uid) } : undefined;
  const resp = await api.get<{ ok: boolean; data: MarketDetail }>(`/api/market/${id}`, { headers } as any);
  return (resp as any).data ?? (resp as any);
}

export async function toggleFav(id: number, wantFav: boolean) {
  const uid = getCurrentUserId();
  const headers = uid ? { "x-user-id": String(uid) } : undefined;
  if (wantFav) return api.post(`/api/market/${id}/fav`, {}, { headers } as any);
  return api.del(`/api/market/${id}/fav`, { headers } as any);
}

export type CrearPublicacionPayload = {
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  latitud?: number | null;
  longitud?: number | null;
  peso_aprox_kg?: number | null;
  categoria_id: number;
  estado_id?: number | null;
  factor_ids: number[];   // ids de factores_ecologicos seleccionados
  sin_impacto: boolean;   // true si marcó "ninguna"
  fotos: string[];        // por ahora URLs
};

export async function crearPublicacion(payload: CrearPublicacionPayload) {
  const uid = getCurrentUserId();
  const headers = uid ? { "x-user-id": String(uid) } : undefined;

  const resp = await api.post<{ ok: boolean; data: { id: number } }>(
    "/api/market",
    payload,
    { headers } as any
  );

  return (resp as any).data ?? (resp as any);
}


// catálogos dinámicos
export async function getCategorias(): Promise<Array<{id:number; nombre:string}>> {
  const r = await api.get<{ ok:boolean; data: Array<{id:number; nombre:string}> }>('/api/catalogo/categorias');
  return (r as any).data ?? (r as any);
}
export async function getEstadosPublicacion(): Promise<Array<{id:number; nombre:string}>> {
  const r = await api.get<{ ok:boolean; data: Array<{id:number; nombre:string}> }>('/api/catalogo/estados-publicacion');
  return (r as any).data ?? (r as any);
}
export async function uploadMarketImages(files: File[]): Promise<string[]> {
  const form = new FormData();
  files.forEach((file) => form.append("images", file)); // 👈 mismo nombre que en multer

  const token = localStorage.getItem("treke_token");

  const res = await fetch("/api/market/upload-images", {
    method: "POST",
    body: form,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NO pongas Content-Type, el navegador lo setea solo con boundary
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || "Error al subir imágenes");
  }

  // data.data = array de URLs
  return data.data ?? [];
}
