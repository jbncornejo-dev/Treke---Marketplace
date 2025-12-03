// src/api/reports_admin.ts
import { api } from "./client";

/* ==========================
 * 1) DASHBOARD
 *    vw_admin_dashboard_resumen
 * ========================== */

// src/api/reports_admin.ts

export type DashboardResumen = {
  ingresos_total_bs: number;
  creditos_vendidos_total: number;
  usuarios_registrados: number;
  usuarios_activos: number;
  intercambios_completados: number;
  impacto_total_co2_kg: number;
  impacto_total_energia_kwh: number;
  impacto_total_agua_l: number;
  impacto_total_residuos_kg: number;
};

export type MonetizacionHistoricoResponse = {
  ingresos_dia_historico: MonetizacionIngresosDiaRow[];
  ingresos_semana_historico: MonetizacionIngresosSemanaRow[];
};

export type DashboardResponse = {
  resumen: DashboardResumen;
};

export async function getDashboard(): Promise<DashboardResponse> {
  const r = await api.get<{ ok: boolean; data: any }>(
    "/api/admin/reportes/dashboard"
  );

  const raw = (r as any).data ?? (r as any);

  // Si el backend ya devuelve { resumen: {...} }, lo usamos directo
  if (raw && typeof raw === "object" && "resumen" in raw) {
    return raw as DashboardResponse;
  }

  // Si el backend devuelve directamente los campos del view,
  // lo envolvemos en { resumen: ... } para que el frontend no rompa
  return { resumen: raw as DashboardResumen };
}

/* ==========================
 * 2) COMUNIDAD
 *    vw_admin_comunidad_estados
 *    vw_admin_actividad_usuarios
 *    vw_admin_usuarios_inactivos_30d
 *    vw_admin_crecimiento_comunidad_mensual
 *    vw_admin_crecimiento_comunidad_trimestral
 *    vw_admin_crecimiento_comunidad_anual
 *    vw_admin_ranking_usuarios_intercambios
 *    vw_admin_ranking_participacion
 *    vw_admin_ranking_reputacion_mejor
 *    vw_admin_ranking_reputacion_peor
 * ========================== */

export type ComunidadEstadoRow = {
  estado: string;
  total_usuarios: number;
};

export type ComunidadActividadRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  ultima_actividad: string | null;
  tipo_actividad: string | null;
};

export type ComunidadInactivoRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  ultimo_login: string | null;
  intervalo_desde_ultimo_login: string | null;
};

export type ComunidadCrecimientoMensualRow = {
  periodo_mes: string; // date ISO
  periodo: string;     // "YYYY-MM"
  usuarios_nuevos_mes: number;
  total_acumulado: number;
};

export type ComunidadCrecimientoTrimestralRow = {
  periodo_trimestre: string; // date ISO
  periodo_label: string;     // "YYYY-QX"
  usuarios_nuevos_trimestre: number;
  total_acumulado: number;
};

export type ComunidadCrecimientoAnualRow = {
  anio: number;
  usuarios_nuevos_anio: number;
  total_acumulado: number;
};

export type RankingIntercambiosRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  intercambios_completados: number;
  ranking: number;
};

export type RankingParticipacionRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  intercambios: number;
  compras_creditos: number;
  bs_total_creditos: string;
  tiene_suscripcion: boolean;
  puntaje: number;
  ranking: number;
};

export type RankingReputacionRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  calificacion_prom: string;
  total_resenias: number;
  total_estrellas: number;
  ranking: number;
};

export type ComunidadResponse = {
  estados: ComunidadEstadoRow[];
  actividad_reciente: ComunidadActividadRow[];
  inactivos_30d: ComunidadInactivoRow[];
  crecimiento_mensual: ComunidadCrecimientoMensualRow[];
  crecimiento_trimestral: ComunidadCrecimientoTrimestralRow[];
  crecimiento_anual: ComunidadCrecimientoAnualRow[];
  ranking_intercambios: RankingIntercambiosRow[];
  ranking_participacion: RankingParticipacionRow[];
  ranking_reputacion_mejor: RankingReputacionRow[];
  ranking_reputacion_peor: RankingReputacionRow[];
};

export async function getComunidad(): Promise<ComunidadResponse> {
  const r = await api.get<{ ok: boolean; data: ComunidadResponse }>(
    "/api/admin/reportes/comunidad"
  );
  return (r as any).data ?? (r as any);
}

/* ==========================
 * 3) PUBLICACIONES & CATÁLOGO
 *    vw_admin_publicaciones_resumen
 *    vw_admin_publicaciones_activas_mas_90d
 *    vw_admin_publicaciones_por_categoria
 *    vw_admin_publicaciones_intercambiadas_resumen
 *    vw_admin_publicaciones_por_ubicacion
 * ========================== */

export type PublicacionesResumen = {
  total_publicaciones: number;
  publicaciones_con_favoritos: number;
  publicaciones_activas_mas_90d: number;
};

export type PublicacionesActivas90Row = {
  id: number;
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  created_at: string;
  dueno_email: string;
  dueno_nombre: string | null;
  intervalo_activa: string;
};

export type PublicacionesPorCategoriaRow = {
  categoria_id: number;
  categoria_nombre: string;
  total_publicaciones: number;
};

export type PublicacionesIntercambiadasResumen = {
  total_publicaciones: number;
  publicaciones_intercambiadas: number;
  publicaciones_no_intercambiadas: number;
};

export type PublicacionesPorUbicacionRow = {
  ubicacion_texto: string;
  total_publicaciones: number;
};

export type PublicacionesResponse = {
  resumen: PublicacionesResumen;
  activas_mas_90d: PublicacionesActivas90Row[];
  por_categoria: PublicacionesPorCategoriaRow[];
  intercambiadas_resumen: PublicacionesIntercambiadasResumen;
  por_ubicacion: PublicacionesPorUbicacionRow[];
};

export async function getPublicaciones(): Promise<PublicacionesResponse> {
  const r = await api.get<{ ok: boolean; data: PublicacionesResponse }>(
    "/api/admin/reportes/publicaciones"
  );
  return (r as any).data ?? (r as any);
}

/* ==========================
 * 4) MONETIZACIÓN
 *    TODAS las vistas de monetización
 * ========================== */

export type MonetizacionResumenTotales = {
  ingresos_total_bs: string;
  ingresos_bs_creditos: string;
  ingresos_bs_planes: string;
  ingresos_bs_anuncios: string;
  creditos_vendidos_creditos: string;
  creditos_incluidos_planes: string;
};

export type MonetizacionIngresosPorFuenteRow = {
  fuente: "creditos" | "planes" | "anuncios";
  ingresos_total_bs: string;
  creditos_totales: string;
};

export type MonetizacionUsuariosPagadoresResumen = {
  total_usuarios: number;
  usuarios_pagadores: number;
  usuarios_sin_pago: number;
};

export type MonetizacionRankingGastoRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  gasto_creditos_bs: string;
  gasto_planes_bs: string;
  gasto_anuncios_bs: string;
  gasto_total_bs: string;
  ranking: number;
};

export type MonetizacionInflacionMensualRow = {
  periodo_mes: string;      // date
  periodo_label: string;    // YYYY-MM
  creditos_generados: string;
  creditos_gastados: string;
  inflacion_neta: string;
};

export type MonetizacionCreditosGanVsCompRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  creditos_comprados: string;
  creditos_ganados: string;
  total_creditos: string;
  porcentaje_comprado: string;
};

export type MonetizacionRankingCreditosAcumuladosRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  saldo_total: string;
  ranking: number;
};

export type MonetizacionIngresosDiaRow = {
  fecha_dia: string;
  ingresos_total_bs: string;
  ingresos_bs_creditos: string;
  ingresos_bs_planes: string;
  ingresos_bs_anuncios: string;
  creditos_vendidos_creditos: string;
  creditos_incluidos_planes: string;
};

export type MonetizacionIngresosSemanaRow = {
  semana_inicio: string;
  anio_iso: number;
  semana_iso: number;
  ingresos_total_bs: string;
  ingresos_bs_creditos: string;
  ingresos_bs_planes: string;
  ingresos_bs_anuncios: string;
};

export type MonetizacionIngresosMesRow = {
  periodo_mes: string;
  periodo_label: string;
  ingresos_total_bs: string;
  ingresos_bs_creditos: string;
  ingresos_bs_planes: string;
  ingresos_bs_anuncios: string;
  creditos_vendidos_creditos: string;
};

export type MonetizacionIngresosAnioRow = {
  anio: number;
  ingresos_total_bs: string;
  ingresos_bs_creditos: string;
  ingresos_bs_planes: string;
  ingresos_bs_anuncios: string;
  creditos_vendidos_creditos: string;
};

export type MonetizacionResponse = {
  resumen_totales: MonetizacionResumenTotales;
  ingresos_por_fuente: MonetizacionIngresosPorFuenteRow[];
  usuarios_pagadores: MonetizacionUsuariosPagadoresResumen;
  ranking_gasto_total: MonetizacionRankingGastoRow[];
  inflacion_mensual: MonetizacionInflacionMensualRow[];
  creditos_ganados_vs_comprados: MonetizacionCreditosGanVsCompRow[];
  ranking_creditos_acumulados: MonetizacionRankingCreditosAcumuladosRow[];
  ingresos_dia: MonetizacionIngresosDiaRow[];
  ingresos_semana: MonetizacionIngresosSemanaRow[];
  ingresos_mes: MonetizacionIngresosMesRow[];
  ingresos_anio: MonetizacionIngresosAnioRow[];
};

export async function getMonetizacion(): Promise<MonetizacionResponse> {
  const r = await api.get<{ ok: boolean; data: MonetizacionResponse }>(
    "/api/admin/reportes/monetizacion"
  );
  return (r as any).data ?? (r as any);
}
export async function getMonetizacionHistorico(): Promise<MonetizacionHistoricoResponse> {
  const r = await api.get<{ ok: boolean; data: MonetizacionHistoricoResponse }>(
    "/api/admin/reportes/monetizacion/historico"
  );
  return (r as any).data ?? (r as any);
}
/* ==========================
 * 5) IMPACTO AMBIENTAL
 *    TODAS las vistas de impacto
 * ========================== */

export type ImpactoTotales = {
  total_co2_evitado: string;
  total_energia_ahorrada: string;
  total_agua_preservada: string;
  total_residuos_evitados: string;
  total_creditos_verdes: string;
};

export type ImpactoTotalesPorFactorRow = {
  nombre_factor: string;
  unidad_medida: string;
  valor_total: string;
};

export type ImpactoPorUsuarioRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  total_co2_evitado: string;
  total_energia_ahorrada: string;
  total_agua_preservada: string;
  total_residuos_evitados: string;
  total_creditos_ganados: string;
};

export type ImpactoRankingUsuariosRow = {
  usuario_id: number;
  email: string;
  full_name: string | null;
  total_co2_evitado: string;
  total_residuos_evitados: string;
  total_creditos_ganados: string;
  ranking: number;
};

export type ImpactoPorRolRow = {
  rol_nombre: string;
  total_usuarios: number;
  total_co2_evitado: string;
  total_energia_ahorrada: string;
  total_agua_preservada: string;
  total_residuos_evitados: string;
  total_creditos_ganados: string;
};

export type ImpactoPorCategoriaRow = {
  categoria_id: number;
  categoria_nombre: string;
  factor_id: number;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string;
  peso_total_kg: string;
};

export type ImpactoPorUbicacionRow = {
  ubicacion_texto: string;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string;
  peso_total_kg: string;
};

export type ImpactoPorSemanaRow = {
  semana_inicio: string;
  anio_iso: number;
  semana_iso: number;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string;
};

export type ImpactoPorMesRow = {
  periodo_mes: string;
  periodo_label: string;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string;
};

export type ImpactoPorAnioRow = {
  anio: number;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string;
};

export type ImpactoResponse = {
  totales: ImpactoTotales;
  totales_por_factor: ImpactoTotalesPorFactorRow[];
  por_usuario: ImpactoPorUsuarioRow[];
  ranking_usuarios: ImpactoRankingUsuariosRow[];
  por_rol: ImpactoPorRolRow[];
  por_categoria: ImpactoPorCategoriaRow[];
  por_ubicacion: ImpactoPorUbicacionRow[];
  por_semana: ImpactoPorSemanaRow[];
  por_mes: ImpactoPorMesRow[];
  por_anio: ImpactoPorAnioRow[];
};

export async function getImpacto(): Promise<ImpactoResponse> {
  const r = await api.get<{ ok: boolean; data: ImpactoResponse }>(
    "/api/admin/reportes/impacto"
  );
  return (r as any).data ?? (r as any);
}

/* ==========================
 * 6) INTERCAMBIOS
 *    TODAS las vistas de intercambios
 * ========================== */

export type IntercambiosResumen = {
  total_intercambios: number;
  intercambios_completados: number;
  intercambios_pendientes: number;
  intercambios_cancelados: number;
  intercambios_expirados: number;
};

export type IntercambiosEstadosConteoRow = {
  estado: string;
  total: number;
};

export type IntercambiosPorCategoriaRow = {
  categoria_id: number;
  categoria_nombre: string;
  intercambios_completados: number;
};

export type IntercambiosCategoriasPopularesRow = {
  categoria_id: number;
  categoria_nombre: string;
  intercambios_completados: number;
  ranking: number;
};

export type IntercambiosPorUbicacionRow = {
  ubicacion_texto: string;
  intercambios_completados: number;
};

export type IntercambiosResponse = {
  resumen: IntercambiosResumen;
  estados_conteo: IntercambiosEstadosConteoRow[];
  por_categoria: IntercambiosPorCategoriaRow[];
  categorias_populares: IntercambiosCategoriasPopularesRow[];
  por_ubicacion: IntercambiosPorUbicacionRow[];
};

export async function getIntercambios(): Promise<IntercambiosResponse> {
  const r = await api.get<{ ok: boolean; data: IntercambiosResponse }>(
    "/api/admin/reportes/intercambios"
  );
  return (r as any).data ?? (r as any);
}
