// apps/api/src/modules/report/report.service.ts

import { withTx } from "../../config/database/database";
import { ReportSQL } from "./report.sql";

/**
 * ============================================
 * 1) ACTIVIDAD DE USUARIOS
 * ============================================
 */

/** Última actividad de TODOS los usuarios (vw_user_last_activity) */
export async function getUserLastActivityAll() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.userLastActivityAll);
    return res.rows;
  });
}

/** Última actividad de un usuario específico (vw_user_last_activity) */
export async function getUserLastActivityById(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.userLastActivityById, [usuarioId]);
    return res.rows[0] || null;
  });
}

/** Usuarios inactivos > 30 días (vw_usuario_inactivos_30d) */
export async function getUsuariosInactivos30d() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.usuariosInactivos30d);
    return res.rows;
  });
}

/**
 * ============================================
 * 2) PUBLICACIONES
 * ============================================
 */

/** Publicaciones agrupadas por mes (vista_publicaciones_por_mes) */
export async function getPublicacionesPorMes() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.publicacionesPorMes);
    return res.rows;
  });
}

/**
 * ============================================
 * 3) INTERCAMBIOS
 * ============================================
 */

/** Totales de intercambios (vw_total_intercambios) */
export async function getTotalIntercambios() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.totalIntercambios);
    return res.rows[0] || null;
  });
}

/** Intercambios completados por categoría (vw_intercambios_por_categorias) */
export async function getIntercambiosPorCategorias() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.intercambiosPorCategorias);
    return res.rows;
  });
}

/** Ratio demanda real por categoría (vw_ratio_demanda_por_categoria) */
export async function getRatioDemandaPorCategoria() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.ratioDemandaPorCategoria);
    return res.rows;
  });
}

/**
 * ============================================
 * 4) MONETIZACIÓN / CRÉDITOS
 * ============================================
 */

/** Resumen global de ingresos (vw_monetizacion_ingresos_total) */
export async function getMonetizacionIngresosTotal() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.monetizacionIngresosTotal);
    return res.rows[0] || null;
  });
}

/** Ingresos por mes (vw_monetizacion_ingresos_por_mes) */
export async function getMonetizacionIngresosPorMes() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.monetizacionIngresosPorMes);
    return res.rows;
  });
}

/** Créditos comprados por usuario (todos) (vw_creditos_comprados_por_usuario) */
export async function getCreditosCompradosPorUsuarioAll() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.creditosCompradosPorUsuarioAll);
    return res.rows;
  });
}

/** Créditos comprados por un usuario (vw_creditos_comprados_por_usuario) */
export async function getCreditosCompradosPorUsuario(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.creditosCompradosPorUsuarioById, [usuarioId]);
    return res.rows[0] || null;
  });
}

/** Saldos de créditos (todos) (vw_saldo_creditos_usuario) */
export async function getSaldoCreditosUsuarioAll() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.saldoCreditosUsuarioAll);
    return res.rows;
  });
}

/** Saldos de un usuario (vw_saldo_creditos_usuario) */
export async function getSaldoCreditosUsuario(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.saldoCreditosUsuarioById, [usuarioId]);
    return res.rows[0] || null;
  });
}

/** Consumo vs generación de créditos (vw_consumo_vs_generacion) */
export async function getConsumoVsGeneracion() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.consumoVsGeneracion);
    return res.rows;
  });
}

/**
 * ============================================
 * 5) IMPACTO AMBIENTAL / SOSTENIBILIDAD
 * ============================================
 */

/** Impacto ambiental total (vw_impacto_ambiental_total) */
export async function getImpactoAmbientalTotal() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.impactoAmbientalTotal);
    return res.rows[0] || null;
  });
}

/** Participación en actividades sostenibles (vw_participacion_actividades_sostenibles) */
export async function getParticipacionActividadesSostenibles() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.participacionActividadesSostenibles);
    return res.rows;
  });
}

/**
 * ============================================
 * 6) RANKING / PARTICIPACIÓN / SUSCRIPCIÓN
 * ============================================
 */

/** Ranking completo de participación (vw_ranking_participacion) */
export async function getRankingParticipacionAll() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.rankingParticipacionAll);
    return res.rows;
  });
}

/** Datos de ranking de un usuario (vw_ranking_participacion) */
export async function getRankingParticipacionByUser(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.rankingParticipacionByUser, [usuarioId]);
    return res.rows[0] || null;
  });
}

/** Ranking con posición (ROW_NUMBER) para TODOS (usa rankingParticipacionWithPosition) */
export async function getRankingParticipacionWithPosition() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.rankingParticipacionWithPosition);
    return res.rows;
  });
}

/** Ranking de un usuario con posición (usa rankingMeWithPosition) */
export async function getRankingMeWithPosition(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.rankingMeWithPosition, [usuarioId]);
    return res.rows[0] || null;
  });
}

/** Top 10 usuarios con nombre (usa rankingTop10WithNombre) */
export async function getRankingTop10() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.rankingTop10WithNombre);
    return res.rows;
  });
}

/** Métricas de adopción de suscripción (vw_adopcion_suscripcion) */
export async function getAdopcionSuscripcion() {
  return withTx(async (c) => {
    const res = await c.query(ReportSQL.adopcionSuscripcion);
    return res.rows[0] || null;
  });
}

/**
 * ============================================
 * 7) DASHBOARDS COMPACTOS (útiles para front)
 * ============================================
 */

/**
 * Dashboard resumido para un usuario:
 * - actividad: última actividad conocida
 * - ranking: posición en el ranking (con rank_intercambios)
 * - saldo: saldo_disponible, saldo_retenido, saldo_total
 * - compras: resumen de compras de créditos completadas
 */
export async function getUserSummary(usuarioId: number) {
  return withTx(async (c) => {
    const [actividad, ranking, saldo, compras] = await Promise.all([
      c.query(ReportSQL.userLastActivityById, [usuarioId]),
      c.query(ReportSQL.rankingMeWithPosition, [usuarioId]),
      c.query(ReportSQL.saldoCreditosUsuarioById, [usuarioId]),
      c.query(ReportSQL.creditosCompradosPorUsuarioById, [usuarioId]),
    ]);

    return {
      actividad: actividad.rows[0] || null,
      ranking: ranking.rows[0] || null,
      saldo: saldo.rows[0] || null,
      compras: compras.rows[0] || null,
    };
  });
}

/**
 * Dashboard global para ADMIN:
 * - ingresos_total: una fila de vw_monetizacion_ingresos_total
 * - ingresos_por_mes: lista de vw_monetizacion_ingresos_por_mes
 * - impacto_total: una fila de vw_impacto_ambiental_total
 * - adopcion_suscripcion: una fila de vw_adopcion_suscripcion
 * - total_intercambios: fila de vw_total_intercambios
 * - consumo_vs_generacion: lista de vw_consumo_vs_generacion
 */
export async function getAdminDashboard() {
  return withTx(async (c) => {
    const [
      ingresosTotal,
      ingresosMes,
      impacto,
      adopcion,
      totalIntercambios,
      consumo,
    ] = await Promise.all([
      c.query(ReportSQL.monetizacionIngresosTotal),
      c.query(ReportSQL.monetizacionIngresosPorMes),
      c.query(ReportSQL.impactoAmbientalTotal),
      c.query(ReportSQL.adopcionSuscripcion),
      c.query(ReportSQL.totalIntercambios),
      c.query(ReportSQL.consumoVsGeneracion),
    ]);

    return {
      ingresos_total: ingresosTotal.rows[0] || null,
      ingresos_por_mes: ingresosMes.rows,
      impacto_total: impacto.rows[0] || null,
      adopcion_suscripcion: adopcion.rows[0] || null,
      total_intercambios: totalIntercambios.rows[0] || null,
      consumo_vs_generacion: consumo.rows,
    };
  });
}
