// apps/web/src/api/profilePublic.ts
import { api } from "./client";

export type PublicProfile = {
  perfil: {
    usuario_id: number;
    email: string;
    full_name: string | null;
    acerca_de: string | null;
    foto: string | null;
    perfil_created_at: string;
    calificacion_prom: number | null;
    total_resenias: number;
    total_estrellas: number;
    total_publicaciones: number;
  };
  publicaciones: {
    items: Array<{
      id: number;
      titulo: string;
      descripcion: string;
      valor_creditos: number;
      ubicacion_texto: string;
      peso_aprox_kg: number;
      created_at: string;
      categoria: string;
      categoria_color: string | null;
      categoria_icono: string | null;
      estado_nombre: string;
      foto_principal: string | null;
    }>;
    page: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
  reviews: {
    items: Array<{
      id: number;
      calificacion: number;
      comentario: string | null;
      created_at: string;
      autor_id: number;
      autor_nombre: string;
      autor_foto: string | null;
    }>;
    page: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  };
  viewerReview: {
    id: number;
    calificacion: number;
    comentario: string | null;
    created_at: string;
  } | null;
};

export async function fetchPublicProfile(
  usuarioId: number,
  opts?: {
    pub_limit?: number;
    pub_offset?: number;
    rev_limit?: number;
    rev_offset?: number;
  }
): Promise<PublicProfile> {
  const params: Record<string, any> = {};
  if (opts?.pub_limit != null) params.pub_limit = opts.pub_limit;
  if (opts?.pub_offset != null) params.pub_offset = opts.pub_offset;
  if (opts?.rev_limit != null) params.rev_limit = opts.rev_limit;
  if (opts?.rev_offset != null) params.rev_offset = opts.rev_offset;

  const resp = await api.get<{
    ok: boolean;
    data: PublicProfile;
    error?: string;
  }>(`/api/profiles/${usuarioId}`, { params });

  const r: any = resp;
  if (!r.ok) throw new Error(r.error || "Error al obtener perfil público");
  return r.data as PublicProfile;
}

export async function upsertProfileReview(
  destinatarioId: number,
  payload: { calificacion: number; comentario?: string }
) {
  const resp = await api.post<{
    ok: boolean;
    data?: any;
    error?: string;
  }>(`/api/profiles/${destinatarioId}/review`, payload); // ✅ coincide con la ruta backend

  const r: any = resp;
  if (!r.ok) throw new Error(r.error || "Error al guardar reseña");
  return r.data;
}
