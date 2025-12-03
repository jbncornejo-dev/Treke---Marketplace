// apps/api/src/modules/report-user/userReport.service.ts

import { withTx } from "../../config/database/database";
import { UserReportSQL } from "./userReport.sql";

/**
 * ============================================
 * A) ACTIVIDAD / RANKING (LEGACY + ACTUAL)
 * ============================================
 */

export async function getUserLastActivity(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userLastActivityById, [usuarioId]);
    return res.rows[0] || null;
  });
}

export async function getUserRanking(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.rankingMeWithPosition, [usuarioId]);
    return res.rows[0] || null;
  });
}

/**
 * ============================================
 * B) CRÉDITOS / BILLETERA (RESÚMENES + DETALLE)
 * ============================================
 */

export async function getUserCreditosComprados(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(
      UserReportSQL.creditosCompradosPorUsuarioById,
      [usuarioId]
    );
    return res.rows[0] || null;
  });
}

export async function getUserSaldoCreditos(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.saldoCreditosUsuarioById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

export async function getUserResumenCreditos(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userResumenCreditosById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

export async function getUserMovimientosDetalle(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userMovimientosDetalleById, [
      usuarioId,
    ]);
    return res.rows;
  });
}

/**
 * ============================================
 * C) IMPACTO AMBIENTAL PERSONAL
 * ============================================
 */

export async function getUserImpactoAmbiental(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userImpactoAmbientalById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

/**
 * ============================================
 * D) DASHBOARD RESUMEN (LEGACY)
 *    -> MULTI-QUERY, COMPATIBLE CON LO QUE TENÍAS
 * ============================================
 */

export async function getUserDashboard(usuarioId: number) {
  return withTx(async (c) => {
    const [
      actividad,
      ranking,
      resumenCreditos,
      saldo,
      compras,
      movimientos,
      impacto,
      suscripcion,            // 👈 NUEVO
    ] = await Promise.all([
      c.query(UserReportSQL.userLastActivityById, [usuarioId]),
      c.query(UserReportSQL.rankingMeWithPosition, [usuarioId]),
      c.query(UserReportSQL.userResumenCreditosById, [usuarioId]),
      c.query(UserReportSQL.saldoCreditosUsuarioById, [usuarioId]),
      c.query(UserReportSQL.creditosCompradosPorUsuarioById, [usuarioId]),
      c.query(UserReportSQL.userMovimientosDetalleById, [usuarioId]),
      c.query(UserReportSQL.userImpactoAmbientalById, [usuarioId]),
      c.query(UserReportSQL.userSuscripcionesResumenById, [usuarioId]), // 👈 NUEVO
    ]);

    return {
      actividad: actividad.rows[0] || null,
      ranking: ranking.rows[0] || null,
      resumen_creditos: resumenCreditos.rows[0] || null,
      saldo: saldo.rows[0] || null,
      compras_creditos: compras.rows[0] || null,
      movimientos: movimientos.rows,
      impacto_ambiental: impacto.rows[0] || null,
      suscripcion_resumen: suscripcion.rows[0] || null, // 👈 NUEVO
    };
  });
}



/**
 * ============================================
 * E) NUEVO DASHBOARD (VW_USER_DASHBOARD_RESUMEN)
 * ============================================
 */
// apps/api/src/modules/report-user/userReport.service.ts


// ============================================
// NUEVOS: RANKINGS GLOBALES
// ============================================

export async function getUserRankingTopIntercambios(limit = 10) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.rankingTopIntercambios, [limit]);
    return res.rows;
  });
}

export async function getUserRankingTopPuntaje(limit = 10) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.rankingTopPuntaje, [limit]);
    return res.rows;
  });
}

export async function getUserDashboardResumen(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userDashboardResumenById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

/**
 * ============================================
 * F) SERIES TEMPORALES PARA GRÁFICOS (FUTURO)
 * ============================================
 */

export async function getUserCreditosPorMes(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userCreditosPorMesById, [
      usuarioId,
    ]);
    return res.rows;
  });
}

export async function getUserIntercambiosPorMes(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userIntercambiosPorMesById, [
      usuarioId,
    ]);
    return res.rows;
  });
}

export async function getUserPuntosPorMes(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userPuntosPorMesById, [usuarioId]);
    return res.rows;
  });
}

/**
 * ============================================
 * G) RESÚMENES ADICIONALES
 * ============================================
 */

export async function getUserPublicacionesResumen(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userPublicacionesResumenById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

export async function getUserReferidosResumen(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userReferidosResumenById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}

export async function getUserSuscripcionesResumen(usuarioId: number) {
  return withTx(async (c) => {
    const res = await c.query(UserReportSQL.userSuscripcionesResumenById, [
      usuarioId,
    ]);
    return res.rows[0] || null;
  });
}
