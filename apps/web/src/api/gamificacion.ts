// apps/web/src/api/gamificacion.ts
import { api } from "./client";
import { getCurrentUserId } from "./profile";

export type NivelAcelerador = {
  id: number;
  nombre_nivel: string;
  puntos_requeridos: number;
  multiplicador_bono: number;
  descripcion: string | null;
  icono?: string | null;
  color?: string | null;
};

export type GamificacionResumen = {
  puntos_acumulados: number;
  nivel_actual: {
    id: number;
    nombre: string;
    multiplicador_bono: number;
    puntos_requeridos: number;
    descripcion: string | null;
    icono: string | null;
    color: string | null;
  } | null;
  siguiente_nivel: {
    id: number;
    nombre: string;
    puntos_requeridos: number;
    descripcion: string | null;
    icono: string | null;
    color: string | null;
  } | null;
  puntos_totales_historial: number;
  puntos_ultimos_30d: number;
  puntos_para_siguiente: number | null;
};

export type HistorialPuntosItem = {
  id: number;
  fecha_evento: string;
  puntos_ganados: number;
  descripcion: string | null;
  metadata: any | null;
  usuario_id: number;
  accion_id: number;
  codigo_accion: string;
  nombre_accion: string;
  categoria_accion: string | null;
};

export type HistorialPaginado = {
  items: HistorialPuntosItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type LogroUsuario = {
  accion_id: number;
  codigo_accion: string;
  nombre_accion: string;
  categoria_accion: string | null;
  puntos_otorgados: number;
  veces_realizada: number;
  puntos_totales: number;
  ultima_vez: string | null;
};

export type AccionAcelerador = {
  id: number;
  codigo_accion: string;
  nombre_accion: string;
  puntos_otorgados: number;
  descripcion: string;
  esta_activa: boolean;
  max_diario: number;
  categoria_accion: string | null;
};

export async function fetchResumenGamificacion(
  usuarioId: number
): Promise<GamificacionResumen> {
  const resp = await api.get<{ ok: boolean; data: GamificacionResumen }>(
    `/api/gamificacion/usuarios/${usuarioId}/resumen`
  );
  return (resp as any).data ?? (resp as any);
}

export async function fetchHistorialPuntos(
  usuarioId: number,
  opts?: { page?: number; pageSize?: number }
): Promise<HistorialPaginado> {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const q = new URLSearchParams();
  q.set("page", String(page));
  q.set("pageSize", String(pageSize));

  const resp = await api.get<{ ok: boolean; data: HistorialPaginado }>(
    `/api/gamificacion/usuarios/${usuarioId}/historial?${q.toString()}`
  );
  return (resp as any).data ?? (resp as any);
}

export async function fetchLogrosUsuario(
  usuarioId: number
): Promise<LogroUsuario[]> {
  const resp = await api.get<{ ok: boolean; data: LogroUsuario[] }>(
    `/api/gamificacion/usuarios/${usuarioId}/logros`
  );
  return (resp as any).data ?? (resp as any);
}

export async function fetchNiveles(): Promise<NivelAcelerador[]> {
  const resp = await api.get<{ ok: boolean; data: NivelAcelerador[] }>(
    "/api/gamificacion/niveles"
  );
  return (resp as any).data ?? (resp as any);
}

export async function fetchAcciones(): Promise<AccionAcelerador[]> {
  const resp = await api.get<{ ok: boolean; data: AccionAcelerador[] }>(
    "/api/gamificacion/acciones"
  );
  return (resp as any).data ?? (resp as any);
}

// helper para usar directo con el usuario actual
export async function fetchGamificacionActual(opts?: {
  page?: number;
  pageSize?: number;
}) {
  const usuarioId = getCurrentUserId();
  if (!usuarioId) throw new Error("No hay usuario autenticado");

  const [resumen, historial, logros, niveles, acciones] = await Promise.all([
    fetchResumenGamificacion(usuarioId),
    fetchHistorialPuntos(usuarioId, opts),
    fetchLogrosUsuario(usuarioId),
    fetchNiveles(),
    fetchAcciones(),
  ]);

  return { resumen, historial, logros, niveles, acciones, usuarioId };
}
