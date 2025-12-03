// apps/api/src/modules/gamificacion/gamificacion.sql.ts

export const GamificacionSQL = {
  // =========================
  // PROGRESO / RESUMEN
  // =========================

  getProgresoUsuario: `
    SELECT
      p.usuario_id,
      p.puntos_acumulados,
      p.nivel_id,
      n.nombre_nivel,
      n.puntos_requeridos,
      n.multiplicador_bono
    FROM progreso_usuario p
    JOIN niveles_acelerador n ON n.id = p.nivel_id
    WHERE p.usuario_id = $1
  `,

  getNivelBase: `
    SELECT
      id,
      nombre_nivel,
      puntos_requeridos,
      multiplicador_bono,
      descripcion,
      icono,
      color
    FROM niveles_acelerador
    ORDER BY puntos_requeridos ASC
    LIMIT 1
  `,

  getTotalesHistorial: `
    SELECT
      COALESCE(SUM(puntos_ganados), 0) AS puntos_totales
    FROM historial_puntos
    WHERE usuario_id = $1
  `,

  getTotalesHistorialUltimos30d: `
    SELECT
      COALESCE(SUM(puntos_ganados), 0) AS puntos_ultimos_30d
    FROM historial_puntos
    WHERE usuario_id = $1
      AND fecha_evento >= NOW() - INTERVAL '30 days'
  `,

  getNextLevelByPuntos: `
    SELECT
      id,
      nombre_nivel,
      puntos_requeridos,
      multiplicador_bono,
      descripcion,
      icono,
      color
    FROM niveles_acelerador
    WHERE puntos_requeridos > $1
    ORDER BY puntos_requeridos ASC
    LIMIT 1
  `,

  // =========================
  // HISTORIAL
  // =========================

  historialUsuario: `
    SELECT
      h.id,
      h.fecha_evento,
      h.puntos_ganados,
      h.descripcion,
      a.codigo_accion,
      a.nombre_accion
    FROM historial_puntos h
    JOIN acciones_aceleradores a
      ON a.id = h.accion_id
    WHERE h.usuario_id = $1
    ORDER BY h.fecha_evento DESC
    LIMIT $2 OFFSET $3
  `,

  historialTotal: `
    SELECT COUNT(*)::INT AS total
    FROM historial_puntos
    WHERE usuario_id = $1
  `,

  // =========================
  // LOGROS POR ACCIÓN
  // =========================

  logrosUsuario: `
    SELECT
      a.id                       AS accion_id,
      a.codigo_accion,
      a.nombre_accion,
      a.categoria_accion,
      a.puntos_otorgados,
      COALESCE(COUNT(h.id), 0)   AS veces_realizada,
      COALESCE(SUM(h.puntos_ganados), 0) AS puntos_totales,
      MAX(h.fecha_evento)        AS ultima_vez
    FROM acciones_aceleradores a
    LEFT JOIN historial_puntos h
      ON h.accion_id = a.id
     AND h.usuario_id = $1
    GROUP BY
      a.id,
      a.codigo_accion,
      a.nombre_accion,
      a.categoria_accion,
      a.puntos_otorgados
    ORDER BY a.id
  `,

  // =========================
  // LISTAS GLOBALES
  // =========================

  listNiveles: `
    SELECT
      id,
      nombre_nivel,
      puntos_requeridos,
      multiplicador_bono,
      descripcion,
      icono,
      color
    FROM niveles_acelerador
    ORDER BY puntos_requeridos ASC
  `,

  listAcciones: `
    SELECT
      id,
      codigo_accion,
      nombre_accion,
      puntos_otorgados,
      descripcion,
      esta_activa,
      max_diario,
      categoria_accion
    FROM acciones_aceleradores
    ORDER BY id ASC
  `,
};
