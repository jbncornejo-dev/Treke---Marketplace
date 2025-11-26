// apps/web/src/api/intercambios.ts
import { api } from "./client";
import { getCurrentUserId } from "./market";

// 1. Tipos ajustados a los alias del SQL actual
export type PropuestaResumen = {
  id: number;
  tipo: "enviada" | "recibida";
  estado: string;
  created_at: string;
  titulo: string;
  
  // CAMBIO: En el SQL ahora usas "AS monto_intercambio" (valor fijo)
  monto_intercambio: number; 
  
  valor_publicacion: number; // Esto suele ser redundante con el de arriba, pero el SQL lo trae
  publicacion_id: number;
  contraparte_id: number;
  puede_responder: boolean;
};

export type IntercambioResumen = {
  id: number;
  monto_credito: number;
  estado: string;
  fecha_de_aceptacion: string;
  fecha_de_expiracion: string;
  fecha_completado?: string | null;
  confirm_comprador: boolean;
  confirm_vendedor: boolean;
  comprador_id: number;
  vendedor_id: number;
  titulo: string;
  
  // CAMBIO: En el SQL ahora usas "AS valor_original_pub"
  valor_original_pub: number; 
  
  publicacion_id: number;
};

export type MisIntercambiosResponse = {
  propuestas: PropuestaResumen[];
  intercambios: IntercambioResumen[];
  page: { page: number; pageSize: number };
};

// RF-18: Iniciar Propuesta
// ELIMINADO: monto_ofertado (ya no se negocia precio)
export async function iniciarPropuesta(
  publicacionId: number,
  mensaje?: string
) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    "/api/intercambios/propuestas",
    { publicacion_id: publicacionId, mensaje }
  );
  return (resp as any).data ?? resp;
}

// RF-19, RF-20: Aceptar
export async function aceptarPropuesta(propuestaId: number) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/propuestas/${propuestaId}/aceptar`,
    {}
  );
  return (resp as any).data ?? resp;
}

// RF-21, RF-22: Confirmar
export async function confirmarIntercambio(intercambioId: number) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/${intercambioId}/confirmar`,
    {}
  );
  return (resp as any).data ?? resp;
}

// RF-23: Cancelar
export async function cancelarIntercambio(
  intercambioId: number,
  motivo?: string
) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/${intercambioId}/cancelar`,
    { motivo }
  );
  return (resp as any).data ?? resp;
}

// RF-24: Listado propio
export async function fetchMisIntercambios(
  usuarioId: number,
  opts?: { page?: number; pageSize?: number }
): Promise<MisIntercambiosResponse> {
  const q = new URLSearchParams();
  if (opts?.page) q.set("page", String(opts.page));
  if (opts?.pageSize) q.set("pageSize", String(opts.pageSize));

  const path =
    `/api/usuarios/${usuarioId}/intercambios` + (q.toString() ? `?${q}` : "");
  const resp = await api.get<{ ok: boolean; data: MisIntercambiosResponse }>(
    path
  );
  return (resp as any).data ?? (resp as any);
}

export async function rechazarPropuesta(
  propuestaId: number,
  motivo?: string
) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/propuestas/${propuestaId}/rechazar`,
    { motivo }
  );
  return (resp as any).data ?? resp;
}

