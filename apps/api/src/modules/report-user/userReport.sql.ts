// apps/api/src/modules/report-user/userReport.sql.ts

export const UserReportSQL = {
  // ============================================
  // 1) ACTIVIDAD Y RANKING
  // ============================================

  userLastActivityById: `
    SELECT
      usuario_id,
      email,
      ultima_actividad
    FROM vw_user_last_activity
    WHERE usuario_id = $1;
  `,

  rankingMeWithPosition: `
    WITH ranked AS (
      SELECT
        r.usuario_id,
        r.email,
        r.intercambios,
        r.compras_creditos,
        r.creditos_comprados,
        r.tiene_suscripcion,
        r.puntaje,
        ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
      FROM vw_ranking_participacion r
    )
    SELECT *
    FROM ranked
    WHERE usuario_id = $1;
  `,


  // ==================================================
  // NUEVOS RANKINGS GLOBALES
  // ==================================================

  // TOP por INTERCAMBIOS completados
  rankingTopIntercambios: `
    SELECT
      r.usuario_id,
      COALESCE(pu.full_name, r.email) AS display_name,
      r.intercambios,
      ROW_NUMBER() OVER (ORDER BY r.intercambios DESC, r.usuario_id) AS rank_intercambios
    FROM vw_ranking_participacion r
    LEFT JOIN perfil_usuario pu ON pu.usuario_id = r.usuario_id
    ORDER BY r.intercambios DESC, r.usuario_id
    LIMIT $1;
  `,

  // TOP por PUNTAJE (gamificación)
  rankingTopPuntaje: `
    SELECT
      r.usuario_id,
      COALESCE(pu.full_name, r.email) AS display_name,
      r.puntaje,
      ROW_NUMBER() OVER (ORDER BY r.puntaje DESC, r.usuario_id) AS rank_puntaje
    FROM vw_ranking_participacion r
    LEFT JOIN perfil_usuario pu ON pu.usuario_id = r.usuario_id
    ORDER BY r.puntaje DESC, r.usuario_id
    LIMIT $1;
  `,

  
  // ============================================
  // 2) CRÉDITOS / BILLETERA
  // ============================================

  creditosCompradosPorUsuarioById: `
    SELECT
      usuario_id,
      compras_ok,
      bs_total,
      creditos_total
    FROM vw_creditos_comprados_por_usuario
    WHERE usuario_id = $1;
  `,

  saldoCreditosUsuarioById: `
    SELECT
      usuario_id,
      saldo_disponible,
      saldo_retenido,
      saldo_total
    FROM vw_saldo_creditos_usuario
    WHERE usuario_id = $1;
  `,

  userResumenCreditosById: `
    SELECT
      usuario_id,
      email,
      rol,
      created_at,
      bs_total_invertido,
      creditos_comprados,
      saldo_disponible,
      saldo_retenido,
      saldo_total,
      intercambios_como_comprador,
      intercambios_como_vendedor,
      creditos_gastados_intercambios,
      creditos_ganados_intercambios,
      creditos_por_bonos
    FROM vw_user_resumen_creditos
    WHERE usuario_id = $1;
  `,

  userMovimientosDetalleById: `
    SELECT
      usuario_id,
      email,
      movimiento_id,
      fecha_movimiento,
      tipo_codigo,
      tipo_descripcion,
      es_debito,
      monto_signed,
      saldo_anterior,
      saldo_posterior
    FROM vw_user_movimientos_detalle
    WHERE usuario_id = $1
    ORDER BY fecha_movimiento DESC;
  `,

  // ============================================
  // 3) IMPACTO AMBIENTAL PERSONAL
  // ============================================

  userImpactoAmbientalById: `
    SELECT
      usuario_id,
      email,
      full_name,
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_ganados,
      ultima_actualizacion
    FROM vw_user_impacto_ambiental
    WHERE usuario_id = $1;
  `,

  // ============================================
  // 4) NUEVO DASHBOARD RESUMEN (KPIs)
  // ============================================

  userDashboardResumenById: `
    SELECT
      usuario_id,
      email,
      full_name,
      estado,
      fecha_registro,
      ultimo_login,
      saldo_disponible,
      saldo_retenido,
      calificacion_prom,
      total_resenias,
      total_estrellas,
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_verdes,
      total_publicaciones,
      publicaciones_activas,
      publicaciones_activas_mas_90d,
      intercambios_totales,
      intercambios_completados,
      intercambios_pendientes,
      total_favoritos,
      puntos_acumulados,
      nombre_nivel,
      fecha_ultima_actualizacion_puntos
    FROM vw_user_dashboard_resumen
    WHERE usuario_id = $1;
  `,

  // ============================================
  // 5) SERIES TEMPORALES PARA GRÁFICOS (FUTURO)
  // ============================================

  userCreditosPorMesById: `
    SELECT
      usuario_id,
      periodo_mes,
      periodo_label,
      creditos_ingresados,
      creditos_gastados,
      balance_neto
    FROM vw_user_creditos_por_mes
    WHERE usuario_id = $1
    ORDER BY periodo_mes;
  `,

  userIntercambiosPorMesById: `
    SELECT
      usuario_id,
      periodo_mes,
      periodo_label,
      total_intercambios,
      intercambios_como_comprador,
      intercambios_como_vendedor,
      intercambios_completados,
      intercambios_pendientes
    FROM vw_user_intercambios_por_mes
    WHERE usuario_id = $1
    ORDER BY periodo_mes;
  `,

  userPuntosPorMesById: `
    SELECT
      usuario_id,
      periodo_mes,
      periodo_label,
      puntos_mes
    FROM vw_user_puntos_por_mes
    WHERE usuario_id = $1
    ORDER BY periodo_mes;
  `,

  // ============================================
  // 6) RESÚMENES ADICIONALES (PUBLICACIONES, REFERIDOS, SUSCRIPCIONES)
  // ============================================

  userPublicacionesResumenById: `
    SELECT
      usuario_id,
      publicaciones_totales,
      publicaciones_vigentes,
      publicaciones_activas,
      publicaciones_activas_mas_90d
    FROM vw_user_publicaciones_resumen
    WHERE usuario_id = $1;
  `,

  userReferidosResumenById: `
    SELECT
      usuario_id,
      total_referidos,
      referidos_completados,
      referidos_con_recompensa
    FROM vw_user_referidos_resumen
    WHERE usuario_id = $1;
  `,

  userSuscripcionesResumenById: `
    SELECT
      usuario_id,
      total_suscripciones,
      plan_id,
      plan_nombre,
      estado_ultima_suscripcion,
      fecha_ini,
      fecha_fin,
      tiene_suscripcion_activa
    FROM vw_user_suscripciones_resumen
    WHERE usuario_id = $1;
  `,

};
