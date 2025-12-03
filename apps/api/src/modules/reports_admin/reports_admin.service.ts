// apps/api/src/modules/reports_admin/reports_admin.service.ts

import { withTx } from "../../config/database/database";
import { ReportSQL } from "./reports_admin.sql";

// ==========================
// DASHBOARD
// ==========================
export async function getDashboardData() {
  return withTx(async (client) => {
    const r = await client.query(ReportSQL.dashboardResumen);
    return r.rows[0] ?? null;
  });
}

// ==========================
// COMUNIDAD
// ==========================
export async function getComunidadData() {
  return withTx(async (client) => {
    const [estadosQ, actividadQ, inactivosQ, mensualQ, trimestralQ, anualQ] =
      await Promise.all([
        client.query(ReportSQL.comunidadEstados),
        client.query(ReportSQL.actividadUsuarios),
        client.query(ReportSQL.usuariosInactivos30d),
        client.query(ReportSQL.crecimientoComunidadMensual),
        client.query(ReportSQL.crecimientoComunidadTrimestral),
        client.query(ReportSQL.crecimientoComunidadAnual),
      ]);

    return {
      estados: estadosQ.rows,
      actividad: actividadQ.rows,
      inactivos_30d: inactivosQ.rows,
      crecimiento_mensual: mensualQ.rows,
      crecimiento_trimestral: trimestralQ.rows,
      crecimiento_anual: anualQ.rows,
    };
  });
}

// ==========================
// RANKINGS
// ==========================
export async function getRankingData() {
  return withTx(async (client) => {
    const [
      rIntercambios,
      rParticipacion,
      rMejorReputacion,
      rPeorReputacion,
    ] = await Promise.all([
      client.query(ReportSQL.rankingUsuariosIntercambios),
      client.query(ReportSQL.rankingParticipacion),
      client.query(ReportSQL.rankingReputacionMejor),
      client.query(ReportSQL.rankingReputacionPeor),
    ]);

    return {
      usuarios_intercambios: rIntercambios.rows,
      participacion: rParticipacion.rows,
      reputacion_mejor: rMejorReputacion.rows,
      reputacion_peor: rPeorReputacion.rows,
    };
  });
}

// ==========================
// PUBLICACIONES
// ==========================
export async function getPublicacionesData() {
  return withTx(async (client) => {
    const [
      resumenQ,
      activas90Q,
      porCategoriaQ,
      intercambiadasResumenQ,
      porUbicacionQ,
    ] = await Promise.all([
      client.query(ReportSQL.publicacionesResumen),
      client.query(ReportSQL.publicacionesActivasMas90d),
      client.query(ReportSQL.publicacionesPorCategoria),
      client.query(ReportSQL.publicacionesIntercambiadasResumen),
      client.query(ReportSQL.publicacionesPorUbicacion),
    ]);

    return {
      resumen: resumenQ.rows[0] ?? null,
      activas_mas_90d: activas90Q.rows,
      por_categoria: porCategoriaQ.rows,
      intercambiadas_resumen: intercambiadasResumenQ.rows[0] ?? null,
      por_ubicacion: porUbicacionQ.rows,
    };
  });
}

// ==========================
// IMPACTO AMBIENTAL
// ==========================
export async function getImpactoData() {
  return withTx(async (client) => {
    const [
      totalesQ,
      totalesFactorQ,
      porUsuarioQ,
      rankingQ,
      porRolQ,
      baseInterQ,
      porCategoriaQ,
      porUbicacionQ,
      porSemanaQ,
      porMesQ,
      porAnioQ,
    ] = await Promise.all([
      client.query(ReportSQL.impactoTotales),
      client.query(ReportSQL.impactoTotalesPorFactor),
      client.query(ReportSQL.impactoPorUsuario),
      client.query(ReportSQL.impactoRankingUsuarios),
      client.query(ReportSQL.impactoPorRol),
      client.query(ReportSQL.impactoBaseIntercambios),
      client.query(ReportSQL.impactoPorCategoria),
      client.query(ReportSQL.impactoPorUbicacion),
      client.query(ReportSQL.impactoPorSemana),
      client.query(ReportSQL.impactoPorMes),
      client.query(ReportSQL.impactoPorAnio),
    ]);

    return {
      totales: totalesQ.rows[0] ?? null,
      totales_por_factor: totalesFactorQ.rows,
      por_usuario: porUsuarioQ.rows,
      ranking_usuarios: rankingQ.rows,
      por_rol: porRolQ.rows,
      base_intercambios: baseInterQ.rows,
      por_categoria: porCategoriaQ.rows,
      por_ubicacion: porUbicacionQ.rows,
      por_semana: porSemanaQ.rows,
      por_mes: porMesQ.rows,
      por_anio: porAnioQ.rows,
    };
  });
}

// ==========================
// MONETIZACIÓN
// ==========================
export async function getMonetizacionData() {
  return withTx(async (client) => {
    const [
      baseQ,
      diaQ,
      semanaQ,
      mesQ,
      anioQ,
      resumenTotalesQ,
      porFuenteQ,
      usuariosPagadoresQ,
      rankingGastoQ,
      inflacionMesQ,
      ganadosVsCompradosQ,
      rankingSaldoQ,
    ] = await Promise.all([
      client.query(ReportSQL.monetizacionIngresosBase),
      client.query(ReportSQL.monetizacionIngresosDia),
      client.query(ReportSQL.monetizacionIngresosSemana),
      client.query(ReportSQL.monetizacionIngresosMes),
      client.query(ReportSQL.monetizacionIngresosAnio),
      client.query(ReportSQL.monetizacionResumenTotales),
      client.query(ReportSQL.monetizacionIngresosPorFuente),
      client.query(ReportSQL.monetizacionUsuariosPagadoresResumen),
      client.query(ReportSQL.monetizacionRankingUsuariosGastoTotal),
      client.query(ReportSQL.monetizacionInflacionCreditosMensual),
      client.query(ReportSQL.monetizacionCreditosGanadosVsComprados),
      client.query(ReportSQL.monetizacionRankingUsuariosCreditosAcumulados),
    ]);

    return {
      ingresos_base: baseQ.rows,
      ingresos_dia: diaQ.rows,
      ingresos_semana: semanaQ.rows,
      ingresos_mes: mesQ.rows,
      ingresos_anio: anioQ.rows,
      resumen_totales: resumenTotalesQ.rows[0] ?? null,
      ingresos_por_fuente: porFuenteQ.rows,
      usuarios_pagadores_resumen: usuariosPagadoresQ.rows[0] ?? null,
      ranking_usuarios_gasto_total: rankingGastoQ.rows,
      inflacion_creditos_mensual: inflacionMesQ.rows,
      creditos_ganados_vs_comprados: ganadosVsCompradosQ.rows,
      ranking_usuarios_creditos_acumulados: rankingSaldoQ.rows,
    };
  });
}

// ==========================
// MONETIZACIÓN - HISTÓRICO
// ==========================
export async function getMonetizacionHistoricoData() {
  return withTx(async (client) => {
    const [diaHistQ, semanaHistQ] = await Promise.all([
      client.query(ReportSQL.monetizacionIngresosDiaHistorico),
      client.query(ReportSQL.monetizacionIngresosSemanaHistorico),
    ]);

    return {
      ingresos_dia_historico: diaHistQ.rows,
      ingresos_semana_historico: semanaHistQ.rows,
    };
  });
}


// ==========================
// INTERCAMBIOS
// ==========================
export async function getIntercambiosData() {
  return withTx(async (client) => {
    const [
      resumenQ,
      estadosQ,
      porCategoriaQ,
      categoriasPopularesQ,
      porUbicacionQ,
    ] = await Promise.all([
      client.query(ReportSQL.intercambiosResumen),
      client.query(ReportSQL.intercambiosEstadosConteo),
      client.query(ReportSQL.intercambiosPorCategoria),
      client.query(ReportSQL.intercambiosCategoriasPopulares),
      client.query(ReportSQL.intercambiosPorUbicacion),
    ]);

    return {
      resumen: resumenQ.rows[0] ?? null,
      estados_conteo: estadosQ.rows,
      por_categoria: porCategoriaQ.rows,
      categorias_populares: categoriasPopularesQ.rows,
      por_ubicacion: porUbicacionQ.rows,
    };
  });
}
