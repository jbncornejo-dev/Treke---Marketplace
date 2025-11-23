// apps/web/src/api/intercambios.ts
import { api } from "./client";
import { getCurrentUserId } from "./market"; // lo sigues usando para validar login

export type PropuestaResumen = {
  id: number;
  tipo: "enviada" | "recibida";
  estado: string;
  created_at: string;
  titulo: string;
  monto_ofertado: number;
  valor_publicacion: number;
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
  valor_creditos: number;
  publicacion_id: number;
};

export type MisIntercambiosResponse = {
  propuestas: PropuestaResumen[];
  intercambios: IntercambioResumen[];
  page: { page: number; pageSize: number };
};

// RF-18
export async function iniciarPropuesta(
  publicacionId: number,
  mensaje?: string,
  monto_ofertado?: number
) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    "/api/intercambios/propuestas",
    { publicacion_id: publicacionId, mensaje, monto_ofertado }
  );
  return (resp as any).data ?? resp;
}

// RF-19, RF-20
export async function aceptarPropuesta(propuestaId: number) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/propuestas/${propuestaId}/aceptar`,
    {}
  );
  return (resp as any).data ?? resp;
}

// RF-21, RF-22
export async function confirmarIntercambio(intercambioId: number) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/${intercambioId}/confirmar`,
    {}
  );
  return (resp as any).data ?? resp;
}

// RF-23
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

// RF-24 – página propia de intercambios
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

export async function contraofertarPropuesta(
  propuestaId: number,
  monto_ofertado: number,
  mensaje?: string
) {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Debes iniciar sesión");

  const resp = await api.post<{ ok: boolean; data: any }>(
    `/api/intercambios/propuestas/${propuestaId}/contraoferta`,
    { monto_ofertado, mensaje }
  );
  return (resp as any).data ?? resp;
}
