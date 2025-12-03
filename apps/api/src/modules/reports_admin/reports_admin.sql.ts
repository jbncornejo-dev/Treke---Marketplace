// apps/api/src/modules/reports_admin/reports_admin.sql.ts

export const ReportSQL = {
  // =====================================================
  // 1) DASHBOARD GENERAL
  // =====================================================

  /** Vista: vw_admin_dashboard_resumen */
  dashboardResumen: `
    SELECT
      ingresos_total_bs,
      creditos_vendidos_total,
      usuarios_registrados,
      usuarios_activos,
      intercambios_completados,
      impacto_total_co2_kg,
      impacto_total_energia_kwh,
      impacto_total_agua_l,
      impacto_total_residuos_kg
    FROM vw_admin_dashboard_resumen;
  `,

  // =====================================================
  // 2) COMUNIDAD
  // =====================================================

  /** Vista: vw_admin_comunidad_estados */
  comunidadEstados: `
    SELECT
      estado,
      total_usuarios
    FROM vw_admin_comunidad_estados
    ORDER BY estado;
  `,

  /** Vista: vw_admin_actividad_usuarios */
  actividadUsuarios: `
    SELECT
      usuario_id,
      email,
      full_name,
      ultima_actividad,
      tipo_actividad
    FROM vw_admin_actividad_usuarios
    ORDER BY ultima_actividad DESC NULLS LAST;
  `,

  /** Vista: vw_admin_usuarios_inactivos_30d */
  usuariosInactivos30d: `
    SELECT
      usuario_id,
      email,
      full_name,
      ultimo_login,
      intervalo_desde_ultimo_login
    FROM vw_admin_usuarios_inactivos_30d
    ORDER BY ultimo_login NULLS FIRST;
  `,

  /** Vista: vw_admin_crecimiento_comunidad_mensual */
  crecimientoComunidadMensual: `
    SELECT
      periodo_mes,
      periodo,
      usuarios_nuevos_mes,
      total_acumulado
    FROM vw_admin_crecimiento_comunidad_mensual
    ORDER BY periodo_mes;
  `,

  /** Vista: vw_admin_crecimiento_comunidad_trimestral */
  crecimientoComunidadTrimestral: `
    SELECT
      periodo_trimestre,
      periodo_label,
      usuarios_nuevos_trimestre,
      total_acumulado
    FROM vw_admin_crecimiento_comunidad_trimestral
    ORDER BY periodo_trimestre;
  `,

  /** Vista: vw_admin_crecimiento_comunidad_anual */
  crecimientoComunidadAnual: `
    SELECT
      anio,
      usuarios_nuevos_anio,
      total_acumulado
    FROM vw_admin_crecimiento_comunidad_anual
    ORDER BY anio;
  `,

  // =====================================================
  // 3) RANKINGS
  // =====================================================

  /** Vista: vw_admin_ranking_usuarios_intercambios */
  rankingUsuariosIntercambios: `
    SELECT
      usuario_id,
      email,
      full_name,
      intercambios_completados,
      ranking
    FROM vw_admin_ranking_usuarios_intercambios
    ORDER BY ranking, usuario_id;
  `,

  /** Vista: vw_admin_ranking_participacion */
  rankingParticipacion: `
    SELECT
      usuario_id,
      email,
      full_name,
      intercambios,
      compras_creditos,
      bs_total_creditos,
      tiene_suscripcion,
      puntaje,
      ranking
    FROM vw_admin_ranking_participacion
    ORDER BY ranking, usuario_id;
  `,

  /** Vista: vw_admin_ranking_reputacion_mejor */
  rankingReputacionMejor: `
    SELECT
      usuario_id,
      email,
      full_name,
      calificacion_prom,
      total_resenias,
      total_estrellas,
      ranking
    FROM vw_admin_ranking_reputacion_mejor
    ORDER BY ranking, usuario_id;
  `,

  /** Vista: vw_admin_ranking_reputacion_peor */
  rankingReputacionPeor: `
    SELECT
      usuario_id,
      email,
      full_name,
      calificacion_prom,
      total_resenias,
      total_estrellas,
      ranking
    FROM vw_admin_ranking_reputacion_peor
    ORDER BY ranking, usuario_id;
  `,

  // =====================================================
  // 4) PUBLICACIONES & CATÁLOGO
  // =====================================================

  /** Vista: vw_admin_publicaciones_resumen */
  publicacionesResumen: `
    SELECT
      total_publicaciones,
      publicaciones_con_favoritos,
      publicaciones_activas_mas_90d
    FROM vw_admin_publicaciones_resumen;
  `,

  /** Vista: vw_admin_publicaciones_activas_mas_90d */
  publicacionesActivasMas90d: `
    SELECT
      id,
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      created_at,
      dueno_email,
      dueno_nombre,
      intervalo_activa
    FROM vw_admin_publicaciones_activas_mas_90d
    ORDER BY created_at ASC;
  `,

  /** Vista: vw_admin_publicaciones_por_categoria */
  publicacionesPorCategoria: `
    SELECT
      categoria_id,
      categoria_nombre,
      total_publicaciones
    FROM vw_admin_publicaciones_por_categoria
    ORDER BY total_publicaciones DESC;
  `,

  /** Vista: vw_admin_publicaciones_intercambiadas_resumen */
  publicacionesIntercambiadasResumen: `
    SELECT
      total_publicaciones,
      publicaciones_intercambiadas,
      publicaciones_no_intercambiadas
    FROM vw_admin_publicaciones_intercambiadas_resumen;
  `,

  /** Vista: vw_admin_publicaciones_por_ubicacion */
  publicacionesPorUbicacion: `
    SELECT
      ubicacion_texto,
      total_publicaciones
    FROM vw_admin_publicaciones_por_ubicacion
    ORDER BY total_publicaciones DESC;
  `,

  // =====================================================
  // 5) MONETIZACIÓN
  // =====================================================

  /** Vista: vw_monetizacion_ingresos_base */
  monetizacionIngresosBase: `
    SELECT
      fecha,
      fuente,
      monto_bs,
      creditos,
      usuario_id
    FROM vw_monetizacion_ingresos_base
    ORDER BY fecha;
  `,

 /** Vista: vw_monetizacion_ingresos_dia_ultima_semana */
monetizacionIngresosDia: `
  SELECT
    fecha_dia,
    ingresos_total_bs,
    ingresos_bs_creditos,
    ingresos_bs_planes,
    ingresos_bs_anuncios,
    creditos_vendidos_creditos,
    creditos_incluidos_planes
  FROM vw_monetizacion_ingresos_dia_ultima_semana
  ORDER BY fecha_dia;
`,

/** Vista: vw_monetizacion_ingresos_semana_ultimo_mes */
monetizacionIngresosSemana: `
  SELECT
    semana_inicio,
    anio_iso,
    semana_iso,
    ingresos_total_bs,
    ingresos_bs_creditos,
    ingresos_bs_planes,
    ingresos_bs_anuncios
  FROM vw_monetizacion_ingresos_semana_ultimo_mes
  ORDER BY semana_inicio;
`,


  /** Vista: vw_monetizacion_ingresos_mes */
  monetizacionIngresosMes: `
    SELECT
      periodo_mes,
      periodo_label,
      ingresos_total_bs,
      ingresos_bs_creditos,
      ingresos_bs_planes,
      ingresos_bs_anuncios,
      creditos_vendidos_creditos
    FROM vw_monetizacion_ingresos_mes
    ORDER BY periodo_mes;
  `,

  /** Vista: vw_monetizacion_ingresos_anio */
  monetizacionIngresosAnio: `
    SELECT
      anio,
      ingresos_total_bs,
      ingresos_bs_creditos,
      ingresos_bs_planes,
      ingresos_bs_anuncios,
      creditos_vendidos_creditos
    FROM vw_monetizacion_ingresos_anio
    ORDER BY anio;
  `,

  /** Vista: vw_monetizacion_resumen_totales */
  monetizacionResumenTotales: `
    SELECT
      ingresos_total_bs,
      ingresos_bs_creditos,
      ingresos_bs_planes,
      ingresos_bs_anuncios,
      creditos_vendidos_creditos,
      creditos_incluidos_planes
    FROM vw_monetizacion_resumen_totales;
  `,

  /** Vista: vw_monetizacion_ingresos_por_fuente */
  monetizacionIngresosPorFuente: `
    SELECT
      fuente,
      ingresos_total_bs,
      creditos_totales
    FROM vw_monetizacion_ingresos_por_fuente
    ORDER BY ingresos_total_bs DESC;
  `,

  /** Vista: vw_monetizacion_usuarios_pagadores_resumen */
  monetizacionUsuariosPagadoresResumen: `
    SELECT
      total_usuarios,
      usuarios_pagadores,
      usuarios_sin_pago
    FROM vw_monetizacion_usuarios_pagadores_resumen;
  `,

  /** Vista: vw_monetizacion_ranking_usuarios_gasto_total */
  monetizacionRankingUsuariosGastoTotal: `
    SELECT
      usuario_id,
      email,
      full_name,
      gasto_creditos_bs,
      gasto_planes_bs,
      gasto_anuncios_bs,
      gasto_total_bs,
      ranking
    FROM vw_monetizacion_ranking_usuarios_gasto_total
    ORDER BY ranking, usuario_id;
  `,

  /** Vista: vw_monetizacion_inflacion_creditos_mensual */
  monetizacionInflacionCreditosMensual: `
    SELECT
      periodo_mes,
      periodo_label,
      creditos_generados,
      creditos_gastados,
      inflacion_neta
    FROM vw_monetizacion_inflacion_creditos_mensual
    ORDER BY periodo_mes;
  `,

  /** Vista: vw_monetizacion_creditos_ganados_vs_comprados */
  monetizacionCreditosGanadosVsComprados: `
    SELECT
      usuario_id,
      email,
      full_name,
      creditos_comprados,
      creditos_ganados,
      total_creditos,
      porcentaje_comprado
    FROM vw_monetizacion_creditos_ganados_vs_comprados
    ORDER BY total_creditos DESC;
  `,

  /** Vista: vw_monetizacion_ranking_usuarios_creditos_acumulados */
  monetizacionRankingUsuariosCreditosAcumulados: `
    SELECT
      usuario_id,
      email,
      full_name,
      saldo_total,
      ranking
    FROM vw_monetizacion_ranking_usuarios_creditos_acumulados
    ORDER BY ranking, usuario_id;
  `,

  // =====================================================
  // 6) IMPACTO AMBIENTAL
  // =====================================================

  /** Vista: vw_impacto_totales */
  impactoTotales: `
    SELECT
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_verdes
    FROM vw_impacto_totales;
  `,

  /** Vista: vw_impacto_totales_por_factor */
  impactoTotalesPorFactor: `
    SELECT
      nombre_factor,
      unidad_medida,
      valor_total
    FROM vw_impacto_totales_por_factor
    ORDER BY nombre_factor;
  `,

  /** Vista: vw_impacto_por_usuario */
  impactoPorUsuario: `
    SELECT
      usuario_id,
      email,
      full_name,
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_ganados
    FROM vw_impacto_por_usuario
    ORDER BY total_co2_evitado DESC;
  `,

  /** Vista: vw_impacto_ranking_usuarios */
  impactoRankingUsuarios: `
    SELECT
      usuario_id,
      email,
      full_name,
      total_co2_evitado,
      total_residuos_evitados,
      total_creditos_ganados,
      ranking
    FROM vw_impacto_ranking_usuarios
    ORDER BY ranking, usuario_id;
  `,

  /** Vista: vw_impacto_por_rol */
  impactoPorRol: `
    SELECT
      rol_nombre,
      total_usuarios,
      total_co2_evitado,
      total_energia_ahorrada,
      total_agua_preservada,
      total_residuos_evitados,
      total_creditos_ganados
    FROM vw_impacto_por_rol
    ORDER BY total_co2_evitado DESC;
  `,

  /** Vista: vw_impacto_base_intercambios */
  impactoBaseIntercambios: `
    SELECT
      intercambio_id,
      fecha_impacto,
      categoria_id,
      categoria_nombre,
      ubicacion_texto,
      factor_id,
      nombre_factor,
      unidad_medida,
      peso_aprox_kg,
      impacto_valor
    FROM vw_impacto_base_intercambios;
  `,

  /** Vista: vw_impacto_por_categoria */
  impactoPorCategoria: `
    SELECT
      categoria_id,
      categoria_nombre,
      factor_id,
      nombre_factor,
      unidad_medida,
      impacto_total,
      peso_total_kg
    FROM vw_impacto_por_categoria
    ORDER BY categoria_nombre, nombre_factor;
  `,

  /** Vista: vw_impacto_por_ubicacion */
  impactoPorUbicacion: `
    SELECT
      ubicacion_texto,
      nombre_factor,
      unidad_medida,
      impacto_total,
      peso_total_kg
    FROM vw_impacto_por_ubicacion
    ORDER BY impacto_total DESC;
  `,

  /** Vista: vw_impacto_por_semana */
  impactoPorSemana: `
    SELECT
      semana_inicio,
      anio_iso,
      semana_iso,
      nombre_factor,
      unidad_medida,
      impacto_total
    FROM vw_impacto_por_semana
    ORDER BY semana_inicio, nombre_factor;
  `,

  /** Vista: vw_impacto_por_mes */
  impactoPorMes: `
    SELECT
      periodo_mes,
      periodo_label,
      nombre_factor,
      unidad_medida,
      impacto_total
    FROM vw_impacto_por_mes
    ORDER BY periodo_mes, nombre_factor;
  `,

  /** Vista: vw_impacto_por_anio */
  impactoPorAnio: `
    SELECT
      anio,
      nombre_factor,
      unidad_medida,
      impacto_total
    FROM vw_impacto_por_anio
    ORDER BY anio, nombre_factor;
  `,

  // =====================================================
  // 7) INTERCAMBIOS
  // =====================================================

  /** Vista: vw_intercambios_resumen */
  intercambiosResumen: `
    SELECT
      total_intercambios,
      intercambios_completados,
      intercambios_pendientes,
      intercambios_cancelados,
      intercambios_expirados
    FROM vw_intercambios_resumen;
  `,

  /** Vista: vw_intercambios_estados_conteo */
  intercambiosEstadosConteo: `
    SELECT
      estado,
      total
    FROM vw_intercambios_estados_conteo
    ORDER BY estado;
  `,

  /** Vista: vw_intercambios_por_categoria */
  intercambiosPorCategoria: `
    SELECT
      categoria_id,
      categoria_nombre,
      intercambios_completados
    FROM vw_intercambios_por_categoria
    ORDER BY intercambios_completados DESC;
  `,

  /** Vista: vw_intercambios_categorias_populares */
  intercambiosCategoriasPopulares: `
    SELECT
      categoria_id,
      categoria_nombre,
      intercambios_completados,
      ranking
    FROM vw_intercambios_categorias_populares
    ORDER BY ranking, categoria_id;
  `,

  /** Vista: vw_intercambios_por_ubicacion */
  intercambiosPorUbicacion: `
    SELECT
      ubicacion_texto,
      intercambios_completados
    FROM vw_intercambios_por_ubicacion
    ORDER BY intercambios_completados DESC;
  `,

  /** Vista HISTÓRICA: vw_monetizacion_ingresos_dia (todos los días) */
monetizacionIngresosDiaHistorico: `
  SELECT
    fecha_dia,
    ingresos_total_bs,
    ingresos_bs_creditos,
    ingresos_bs_planes,
    ingresos_bs_anuncios,
    creditos_vendidos_creditos,
    creditos_incluidos_planes
  FROM vw_monetizacion_ingresos_dia
  ORDER BY fecha_dia;
`,

/** Vista HISTÓRICA: vw_monetizacion_ingresos_semana (todas las semanas) */
monetizacionIngresosSemanaHistorico: `
  SELECT
    semana_inicio,
    anio_iso,
    semana_iso,
    ingresos_total_bs,
    ingresos_bs_creditos,
    ingresos_bs_planes,
    ingresos_bs_anuncios
  FROM vw_monetizacion_ingresos_semana
  ORDER BY semana_inicio;
`,

};


