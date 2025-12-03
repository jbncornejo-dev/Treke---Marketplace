import { api } from "./client";

// Tipos
export interface Resenia {
  id: number;
  calificacion: number;
  comentario: string;
  created_at: string;
  autor_nombre: string;
  autor_foto: string;
}

export interface CrearReseniaDTO {
  destinatario_id: number;
  calificacion: number;
  comentario: string;
}

// --- Endpoints ---

/**
 * Crea una nueva reseña para un usuario
 * (Requiere que exista un intercambio completado previamente)
 */
export async function crearResenia(payload: CrearReseniaDTO) {
  // POST /api/resenias
  return api.post("/api/resenias", payload);
}

/**
 * Obtiene las reseñas de un usuario específico
 */
export async function getReseniasUsuario(usuarioId: number): Promise<Resenia[]> {
  // GET /api/resenias/:usuario_id
  const resp = await api.get<{ ok: boolean; data: Resenia[] } | Resenia[]>(
    `/api/resenias/${usuarioId}`
  );
  
  // Normalizamos la respuesta por si el backend devuelve { ok: true, data: [...] } o solo el array
  return Array.isArray(resp) ? resp : (resp as any).data || [];
}