// src/api/reports_user.ts
import { api } from "./client";

/* =========================================================
 * 1) Tipos básicos devueltos por el backend
 * ========================================================= */

export type UserActividad = {
  usuario_id: number;
  email: string;
  ultima_actividad: string | null;
  tipo_actividad?: string | null;
};

export type UserRanking = {
  usuario_id: number;
  email: string;
  intercambios: number | null;
  compras_creditos?: number | null;
  creditos_comprados?: number | null;
  tiene_suscripcion: boolean;
  rank_intercambios: number | null;
  puntaje: number | null;
};

export type UserCreditosComprados = {
  usuario_id: number;
  compras_ok: number;
  bs_total: string | number;
  creditos_total: string | number;
};

export type UserSaldoCreditos = {
  usuario_id: number;
  saldo_disponible: string | number;
  saldo_retenido: string | number;
  saldo_total: string | number;
};

export type UserResumenCreditos = {
  usuario_id: number;
  email: string;
  rol: string | null;
  created_at: string;
  bs_total_invertido: string | number;
  creditos_comprados: string | number;
  saldo_disponible: string | number;
  saldo_retenido: string | number;
  saldo_total: string | number;
  intercambios_como_comprador: number;
  intercambios_como_vendedor: number;
  creditos_gastados_intercambios: string | number;
  creditos_ganados_intercambios: string | number;
  creditos_por_bonos: string | number;
};

export type UserMovimientoDetalle = {
  movimiento_id: number;
  usuario_id: number;
  fecha_movimiento: string | null;
  tipo_codigo: string;
  tipo_descripcion: string;
  es_debito?: boolean;
  monto?: string | number;
  monto_signed: string | number;
  saldo_anterior: string | number;
  saldo_posterior: string | number;
};

export type UserImpactoAmbiental = {
  usuario_id: number;
  total_co2_evitado: number | null;
  total_energia_ahorrada: number | null;
  total_agua_preservada: number | null;
  total_residuos_evitados: number | null;
  total_creditos_ganados: number | null;
  ultima_actualizacion: string | null;
};

export type UserSuscripcionResumen = {
  usuario_id: number;
  total_suscripciones: number;
  plan_id: number | null;
  plan_nombre: string | null;
  estado_ultima_suscripcion: string | null;
  fecha_ini: string | null;
  fecha_fin: string | null;
  tiene_suscripcion_activa: boolean;
};

/* =========================================================
 * 2) Tipos para RANKINGS GLOBALES
 * ========================================================= */

export type UserRankingTopIntercambios = {
  usuario_id: number;
  display_name: string;
  intercambios: number;
  rank_intercambios: number;
};

export type UserRankingTopPuntaje = {
  usuario_id: number;
  display_name: string;
  puntaje: number;
  rank_puntaje: number;
};

/* =========================================================
 * 3) Respuesta combinada del dashboard
 * ========================================================= */

export type UserDashboardResponse = {
  actividad: UserActividad | null;
  ranking: UserRanking | null;
  resumen_creditos: UserResumenCreditos | null;
  saldo: UserSaldoCreditos | null;
  compras_creditos: UserCreditosComprados | null;
  movimientos: UserMovimientoDetalle[];
  impacto_ambiental: UserImpactoAmbiental | null;
  suscripcion_resumen?: UserSuscripcionResumen | null;
};

/* =========================================================
 * 4) Funciones de API
 * ========================================================= */

const userReportsBase = "/api/user/reportes";

export async function getUserDashboard(
  usuarioId: number
): Promise<UserDashboardResponse> {
  const r = await api.get<UserDashboardResponse>(
    `${userReportsBase}/${usuarioId}/dashboard`
  );
  return (r as any).data ?? (r as any);
}

export async function getUserRankingById(
  usuarioId: number
): Promise<UserRanking | null> {
  const r = await api.get<UserRanking | null>(
    `${userReportsBase}/${usuarioId}/ranking`
  );
  return (r as any).data ?? (r as any);
}

export async function getUserCreditosById(
  usuarioId: number
): Promise<{
  resumen_creditos: UserResumenCreditos | null;
  saldo: UserSaldoCreditos | null;
  compras_creditos: UserCreditosComprados | null;
}> {
  const r = await api.get<{
    resumen_creditos: UserResumenCreditos | null;
    saldo: UserSaldoCreditos | null;
    compras_creditos: UserCreditosComprados | null;
  }>(`${userReportsBase}/${usuarioId}/creditos`);
  return (r as any).data ?? (r as any);
}

export async function getUserMovimientosById(
  usuarioId: number
): Promise<UserMovimientoDetalle[]> {
  const r = await api.get<UserMovimientoDetalle[]>(
    `${userReportsBase}/${usuarioId}/movimientos`
  );
  return (r as any).data ?? (r as any);
}

export async function getUserImpactoById(
  usuarioId: number
): Promise<UserImpactoAmbiental | null> {
  const r = await api.get<UserImpactoAmbiental | null>(
    `${userReportsBase}/${usuarioId}/impacto`
  );
  return (r as any).data ?? (r as any);
}

/* =========================================================
 * 5) NUEVOS: RANKINGS GLOBALES
 * ========================================================= */

export async function getTopRankingIntercambios(
  limit = 10
): Promise<UserRankingTopIntercambios[]> {
  const r = await api.get<UserRankingTopIntercambios[]>(
    `${userReportsBase}/ranking/top-intercambios?limit=${limit}`
  );
  return (r as any).data ?? (r as any);
}

export async function getTopRankingPuntaje(
  limit = 10
): Promise<UserRankingTopPuntaje[]> {
  const r = await api.get<UserRankingTopPuntaje[]>(
    `${userReportsBase}/ranking/top-puntaje?limit=${limit}`
  );
  return (r as any).data ?? (r as any);
}
