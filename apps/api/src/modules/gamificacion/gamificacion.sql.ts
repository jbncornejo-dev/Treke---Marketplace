// apps/api/src/modules/gamificacion/gamificacion.sql.ts

export const GamificacionSQL = {
  // =========================
  // RESUMEN DE USUARIO
  // =========================

  getProgresoUsuario: `
    SELECT 
      pu.usuario_id,
      pu.puntos_acumulados,
      pu.nivel_id,
      n.nombre_nivel,
      n.multiplicador_bono,
      n.puntos_requeridos
    FROM progreso_usuario pu
    JOIN niveles_acelerador n ON n.id = pu.nivel_id
    WHERE pu.usuario_id = $1
  `,

  getNivelBase: `
    SELECT 
      id,
      nombre_nivel,
      multiplicador_bono,
      puntos_requeridos,
      descripcion,
      icono,
      color
    FROM niveles_acelerador
    ORDER BY puntos_requeridos ASC
    LIMIT 1
  `,

  getNextLevelByPuntos: `
    SELECT 
      id,
      nombre_nivel,
      puntos_requeridos,
      descripcion,
      icono,
      color
    FROM niveles_acelerador
    WHERE puntos_requeridos > $1
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
      AND fecha_evento >= (now() - INTERVAL '30 days')
  `,

  // =========================
  // HISTORIAL
  // =========================

  historialUsuario: `
    SELECT
      h.id,
      h.fecha_evento,
      h.puntos_ganados,
      COALESCE(h.descripcion, a.descripcion) AS descripcion,
      a.codigo_accion,
      a.nombre_accion,
      a.categoria_accion
    FROM historial_puntos h
    JOIN acciones_aceleradores a ON a.id = h.accion_id
    WHERE h.usuario_id = $1
    ORDER BY h.fecha_evento DESC, h.id DESC
    LIMIT $2 OFFSET $3
  `,

  historialTotal: `
    SELECT COUNT(*)::int AS total
    FROM historial_puntos
    WHERE usuario_id = $1
  `,

  // =========================
  // LOGROS (ACCIONES)
  // =========================

  logrosUsuario: `
    SELECT
      a.id,
      a.codigo_accion,
      a.nombre_accion,
      a.puntos_otorgados,
      a.descripcion,
      a.esta_activa,
      a.max_diario,
      a.categoria_accion,
      EXISTS (
        SELECT 1
        FROM historial_puntos h
        WHERE h.usuario_id = $1
          AND h.accion_id = a.id
      ) AS completado,
      (
        SELECT COUNT(*)::int
        FROM historial_puntos h
        WHERE h.usuario_id = $1
          AND h.accion_id = a.id
      ) AS veces_completado
    FROM acciones_aceleradores a
    ORDER BY a.categoria_accion NULLS LAST, a.puntos_otorgados DESC
  `,

  // =========================
  // LISTADOS GLOBALES
  // =========================

  listarNiveles: `
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

  listarAcciones: `
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
    ORDER BY categoria_accion NULLS LAST, puntos_otorgados DESC
  `,

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
    ORDER BY puntos_requeridos ASC;
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
    ORDER BY categoria_accion NULLS LAST, puntos_otorgados DESC;
  `,
};
