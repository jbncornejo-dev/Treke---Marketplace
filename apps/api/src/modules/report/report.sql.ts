// apps/api/src/modules/report/report.sql.ts

// Centraliza TODOS los SELECTs sobre vistas de analítica
// para que el service no tenga SQL "crudo" y siempre use
// las views ya definidas en la base de datos.

export const ReportSQL = {
  // =====================================================
  // 1) ACTIVIDAD DE USUARIOS
  // =====================================================

  /** Vista: vw_user_last_activity (todos los usuarios) */
  userLastActivityAll: `
    SELECT usuario_id, email, ultima_actividad
    FROM vw_user_last_activity
    ORDER BY ultima_actividad DESC;
  `,

  /** Vista: vw_user_last_activity (un usuario específico) */
  userLastActivityById: `
    SELECT usuario_id, email, ultima_actividad
    FROM vw_user_last_activity
    WHERE usuario_id = $1;
  `,

  /** Vista: vw_usuario_inactivos_30d (todos) */
  usuariosInactivos30d: `
    SELECT usuario_id, email, ultima_actividad
    FROM vw_usuario_inactivos_30d
    ORDER BY ultima_actividad ASC;
  `,

  // =====================================================
  // 2) PUBLICACIONES
  // =====================================================

  /** Vista: vista_publicaciones_por_mes */
  publicacionesPorMes: `
    SELECT
      anio,
      mes_num,
      mes_nombre,
      total_publicaciones
    FROM vista_publicaciones_por_mes
    ORDER BY anio DESC, mes_num DESC;
  `,

  // =====================================================
  // 3) INTERCAMBIOS
  // =====================================================

  /** Vista: vw_total_intercambios */
  totalIntercambios: `
    SELECT
      completados,
      activos,
      total
    FROM vw_total_intercambios;
  `,

  /** Vista: vw_intercambios_por_categorias */
  intercambiosPorCategorias: `
    SELECT
      categoria_id,
      categoria,
      intercambios
    FROM vw_intercambios_por_categorias
    ORDER BY intercambios DESC;
  `,

  /** Vista: vw_ratio_demanda_por_categoria */
  ratioDemandaPorCategoria: `
    SELECT
      categoria_id,
      categoria,
      total_publicaciones,
      total_intercambios_completados,
      ratio_intercambio_porcentaje
    FROM vw_ratio_demanda_por_categoria
    ORDER BY ratio_intercambio_porcentaje ASC, total_publicaciones DESC;
  `,

categoriasIntercambioPopular: `
    SELECT
      categoria_id,
      categoria,
      intercambios_completados AS intercambios
    FROM vw_categorias_intercambio_popular
    ORDER BY intercambios DESC;
  `,

  // =====================================================
  // 4) MONETIZACIÓN / CRÉDITOS
  // =====================================================

  /** Vista: vw_monetizacion_ingresos_total */
  monetizacionIngresosTotal: `
    SELECT
      compras_ok,
      bs_total,
      creditos_total
    FROM vw_monetizacion_ingresos_total;
  `,

  /** Vista: vw_monetizacion_ingresos_por_mes */
  monetizacionIngresosPorMes: `
    SELECT
      periodo,
      compras_ok,
      bs_total,
      creditos_total
    FROM vw_monetizacion_ingresos_por_mes
    ORDER BY periodo;
  `,

  /** Vista: vw_creditos_comprados_por_usuario (todos) */
  creditosCompradosPorUsuarioAll: `
    SELECT
      usuario_id,
      compras_ok,
      bs_total,
      creditos_total
    FROM vw_creditos_comprados_por_usuario
    ORDER BY usuario_id;
  `,

  /** Vista: vw_creditos_comprados_por_usuario (por usuario) */
  creditosCompradosPorUsuarioById: `
    SELECT
      usuario_id,
      compras_ok,
      bs_total,
      creditos_total
    FROM vw_creditos_comprados_por_usuario
    WHERE usuario_id = $1;
  `,

  /** Vista: vw_saldo_creditos_usuario (todos) */
  saldoCreditosUsuarioAll: `
    SELECT
      usuario_id,
      saldo_disponible,
      saldo_retenido,
      saldo_total
    FROM vw_saldo_creditos_usuario
    ORDER BY usuario_id;
  `,

  /** Vista: vw_saldo_creditos_usuario (por usuario) */
  saldoCreditosUsuarioById: `
    SELECT
      usuario_id,
      saldo_disponible,
      saldo_retenido,
      saldo_total
    FROM vw_saldo_creditos_usuario
    WHERE usuario_id = $1;
  `,

  /** Vista: vw_consumo_vs_generacion */
  consumoVsGeneracion: `
    SELECT
      origen,
      total
    FROM vw_consumo_vs_generacion
    ORDER BY origen;
  `,

   ingresosPorVentaDeCreditos: `
  SELECT creditos_total, bs_total, compras_completadas
  FROM vw_ingresos_por_venta_de_creditos;
`,



  // =====================================================
  // 5) IMPACTO AMBIENTAL / SOSTENIBILIDAD
  // =====================================================

  /** Vista: vw_impacto_ambiental_total */
  impactoAmbientalTotal: `
    SELECT
      co2,
      energia,
      agua,
      residuos,
      creditos
    FROM vw_impacto_ambiental_total;
  `,

  /** Vista: vw_participacion_actividades_sostenibles */
  participacionActividadesSostenibles: `
    SELECT
      total_usuarios_participantes,
      total_creditos_otorgados,
      tipo_actividad
    FROM vw_participacion_actividades_sostenibles
    ORDER BY tipo_actividad;
  `,

  // =====================================================
  // 6) RANKING / PARTICIPACIÓN / SUSCRIPCIÓN
  // =====================================================

  /** Vista: vw_ranking_participacion (todos, ordenado por puntaje) */
  rankingParticipacionAll: `
    SELECT
      usuario_id,
      email,
      intercambios,
      compras_creditos,
      creditos_comprados,
      tiene_suscripcion,
      puntaje
    FROM vw_ranking_participacion
    ORDER BY puntaje DESC, intercambios DESC;
  `,

  /** Vista: vw_ranking_participacion (un usuario) */
  rankingParticipacionByUser: `
    SELECT
      usuario_id,
      email,
      intercambios,
      compras_creditos,
      creditos_comprados,
      tiene_suscripcion,
      puntaje
    FROM vw_ranking_participacion
    WHERE usuario_id = $1;
  `,

  /** Ranking con posición (ROW_NUMBER) usando la vista */
  rankingParticipacionWithPosition: `
    SELECT
      r.usuario_id,
      r.email,
      r.intercambios,
      r.compras_creditos,
      r.creditos_comprados,
      r.tiene_suscripcion,
      r.puntaje,
      ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
    FROM vw_ranking_participacion r;
  `,

  /** Ranking: datos del usuario + su posición (para /me) */
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

  /** Top 10 usuarios por intercambios (para dashboards) */
  rankingTop10WithNombre: `
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
    SELECT
      ranked.usuario_id,
      ranked.intercambios        AS intercambios_hechos,
      ranked.rank_intercambios,
      COALESCE(p.full_name, ranked.email) AS nombre
    FROM ranked
    JOIN usuario u       ON u.id = ranked.usuario_id
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    ORDER BY ranked.rank_intercambios ASC
    LIMIT 10;
  `,

  /** Vista: vw_adopcion_suscripcion */
  adopcionSuscripcion: `
    SELECT
      total_registros,
      activas,
      usuarios_con_suscripcion,
      ratio_activas
    FROM vw_adopcion_suscripcion;
  `,

   // ============================================
  // 8) USUARIOS ACTIVOS POR ROL
  // ============================================

  usuariosActivosPorRol: `
    SELECT
      usuario_id,
      email,
      rol,
      ultima_actividad
    FROM vw_usuarios_activos_por_rol
    ORDER BY ultima_actividad DESC;
  `,
};


