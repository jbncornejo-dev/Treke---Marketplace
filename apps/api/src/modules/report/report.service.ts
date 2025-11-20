import { withTx } from "../../config/database/database";

/**
 * RESUMEN DEL USUARIO
 * - exchange: datos de participación (intercambios, compras de créditos, suscripción, puntaje)
 *             tomados de vw_ranking_participacion
 * - wallet_monthly: resumen mensual de movimientos de la billetera del usuario
 * - impacto: fila de impacto_usuario (impacto ambiental individual)
 */
export async function userSummary(uid: number) {
  return withTx(async (c) => {
    // 1) Resumen de participación (usa vista nueva vw_ranking_participacion)
    const exchange = await c.query(
      `
      WITH ranked AS (
        SELECT
          r.usuario_id,
          r.email,
          r.intercambios              AS intercambios_hechos,
          r.compras_creditos,
          r.creditos_comprados,
          r.tiene_suscripcion,
          r.puntaje,
          ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
        FROM vw_ranking_participacion r
      )
      SELECT *
      FROM ranked
      WHERE usuario_id = $1
    `,
      [uid]
    );

    // 2) Resumen mensual de la billetera del usuario (sin vista, usando movimientos)
    const walletMonthly = await c.query(
      `
      SELECT
        date_trunc('month', m.fecha_movimiento)::date AS mes,
        SUM(
          CASE 
            WHEN tm.es_debito THEN -m.monto 
            ELSE m.monto 
          END
        )::bigint AS delta_creditos,
        COUNT(*)::int AS total_movimientos
      FROM movimientos m
      JOIN billetera b       ON b.id = m.billetera_user_id
      JOIN tipos_movimiento tm ON tm.id = m.tipo_mov_id
      WHERE b.usuario_id = $1
      GROUP BY 1
      ORDER BY 1
    `,
      [uid]
    );

    // 3) Impacto ambiental del usuario
    const imp = await c.query(
      "SELECT * FROM impacto_usuario WHERE usuario_id = $1",
      [uid]
    );

    return {
      exchange: exchange.rows[0] || null,
      wallet_monthly: walletMonthly.rows,
      impacto: imp.rows[0] || null,
    };
  });
}

/**
 * RANKING DEL USUARIO
 * - me: posición del usuario en el ranking (usando vw_ranking_participacion)
 * - top10: top 10 usuarios con más intercambios (manteniendo campos intercambios_hechos y rank_intercambios)
 */
export async function userRanking(uid: number) {
  return withTx(async (c) => {
    // CTE con ranking basado en vista nueva vw_ranking_participacion
    const me = await c.query(
      `
      WITH ranked AS (
        SELECT
          r.usuario_id,
          r.email,
          r.intercambios              AS intercambios_hechos,
          r.compras_creditos,
          r.creditos_comprados,
          r.tiene_suscripcion,
          r.puntaje,
          ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
        FROM vw_ranking_participacion r
      )
      SELECT *
      FROM ranked
      WHERE usuario_id = $1
    `,
      [uid]
    );

    const top = await c.query(
      `
      WITH ranked AS (
        SELECT
          r.usuario_id,
          r.email,
          r.intercambios              AS intercambios_hechos,
          r.compras_creditos,
          r.creditos_comprados,
          r.tiene_suscripcion,
          r.puntaje,
          ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
        FROM vw_ranking_participacion r
      )
      SELECT
        ranked.usuario_id,
        ranked.intercambios_hechos,
        ranked.rank_intercambios,
        COALESCE(p.full_name, ranked.email) AS nombre
      FROM ranked
      JOIN usuario u       ON u.id = ranked.usuario_id
      LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
      ORDER BY ranked.rank_intercambios ASC
      LIMIT 10
    `
    );

    return { me: me.rows[0] || null, top10: top.rows };
  });
}

/**
 * HISTORIAL DE INTERCAMBIOS DEL USUARIO
 * - Reimplementa v_user_trade_history usando directamente las tablas nuevas.
 * - Devuelve h.* (campos del historial) + "rol" = 'venta' o 'compra'
 */
export async function userHistory(uid: number) {
  return withTx(async (c) => {
    const q = await c.query(
      `
      SELECT
        i.id                    AS intercambio_id,
        i.monto_credito,
        i.estado,
        i.fecha_de_aceptacion,
        i.fecha_de_expiracion,
        i.fecha_completado,
        i.comprador_id,
        i.vendedor_id,
        pr.id                   AS propuesta_id,
        p.id                    AS publicacion_id,
        p.titulo                AS publicacion_titulo,
        p.valor_creditos        AS publicacion_valor_creditos,
        ccat.id                 AS categoria_id,
        ccat.nombre             AS categoria_nombre
      FROM intercambios i
      JOIN propuesta pr    ON pr.id = i.propuesta_aceptada_id
      JOIN publicaciones p ON p.id = pr.publicacion_id
      JOIN categoria ccat  ON ccat.id = p.categoria_id
      WHERE i.comprador_id = $1 OR i.vendedor_id = $1
      ORDER BY i.fecha_completado DESC NULLS LAST, i.id DESC
      LIMIT 200
    `,
      [uid]
    );

    // Agregamos el campo "rol" igual que antes (venta/compra)
    const rows = q.rows.map((h: any) => ({
      ...h,
      rol:
        h.vendedor_id === uid
          ? "venta"
          : h.comprador_id === uid
          ? "compra"
          : null,
    }));

    return rows;
  });
}

// ============================
// Emprendedor / ONG
// ============================

/**
 * Ventas por mes del emprendedor/ONG
 * - Usa directamente intercambios (vendedor_id)
 */
export async function orgVentas(uid: number) {
  return withTx(async (c) => {
    const ventas = await c.query(
      `
      SELECT
        date_trunc('month', COALESCE(fecha_completado, fecha_de_aceptacion))::date AS mes,
        SUM(monto_credito)::bigint AS total_cred,
        COUNT(*)::int              AS total_ops
      FROM intercambios
      WHERE vendedor_id = $1
        AND estado = 'completado'
      GROUP BY 1
      ORDER BY 1
    `,
      [uid]
    );
    return ventas.rows;
  });
}

/**
 * Resumen mensual de la billetera del emprendedor/ONG
 * - Igual que en userSummary pero expuesto como endpoint propio
 */
export async function orgWallet(uid: number) {
  return withTx(async (c) => {
    const w = await c.query(
      `
      SELECT
        date_trunc('month', m.fecha_movimiento)::date AS mes,
        SUM(
          CASE
            WHEN tm.es_debito THEN -m.monto
            ELSE m.monto
          END
        )::bigint AS delta_creditos,
        COUNT(*)::int AS total_movimientos
      FROM movimientos m
      JOIN billetera b       ON b.id = m.billetera_user_id
      JOIN tipos_movimiento tm ON tm.id = m.tipo_mov_id
      WHERE b.usuario_id = $1
      GROUP BY 1
      ORDER BY 1
    `,
      [uid]
    );
    return w.rows;
  });
}

/**
 * Top categorías de intercambio (global)
 * - Ahora usa vw_intercambios_por_categorias (vista nueva)
 */
export async function orgTopCategorias() {
  return withTx(async (c) => {
    const r = await c.query(
      `
      SELECT *
      FROM vw_intercambios_por_categorias
      ORDER BY intercambios DESC
      LIMIT 20
    `
    );
    return r.rows;
  });
}

// ============================
// Admin
// ============================

/**
 * Admin overview:
 * - ingresos: viene de vw_monetizacion_ingresos_por_mes (periodo -> mes)
 * - impacto: vw_impacto_ambiental_total
 * - usuarios_activos: conteo de usuario activos
 */
export async function adminOverview() {
  return withTx(async (c) => {
    const ingresos = await c.query(
      `
      SELECT
        periodo::date AS mes,
        compras_ok,
        bs_total,
        creditos_total
      FROM vw_monetizacion_ingresos_por_mes
      ORDER BY mes
    `
    );

    const impacto = await c.query(`SELECT * FROM vw_impacto_ambiental_total`);

    const activos = await c.query(
      `
      SELECT COUNT(*)::int AS usuarios_activos
      FROM usuario
      WHERE estado = 'activo'
        AND deleted_at IS NULL
    `
    );

    return {
      ingresos: ingresos.rows,
      impacto: impacto.rows[0] || {
        co2: 0,
        energia: 0,
        agua: 0,
        residuos: 0,
        creditos: 0,
      },
      usuarios_activos: activos.rows[0]?.usuarios_activos ?? 0,
    };
  });
}

/**
 * Top categorías (admin)
 * - Usa vw_intercambios_por_categorias (vista nueva)
 */
export async function adminTopCategorias() {
  return withTx(async (c) => {
    const r = await c.query(
      `
      SELECT *
      FROM vw_intercambios_por_categorias
      ORDER BY intercambios DESC
      LIMIT 10
    `
    );
    return r.rows;
  });
}

/**
 * Top usuarios (admin)
 * - Usa la vista nueva vw_ranking_participacion
 * - Mantiene campos intercambios_hechos y rank_intercambios
 */
export async function adminTopUsuarios() {
  return withTx(async (c) => {
    const r = await c.query(
      `
      WITH ranked AS (
        SELECT
          r.usuario_id,
          r.email,
          r.intercambios              AS intercambios_hechos,
          r.compras_creditos,
          r.creditos_comprados,
          r.tiene_suscripcion,
          r.puntaje,
          ROW_NUMBER() OVER (ORDER BY r.intercambios DESC) AS rank_intercambios
        FROM vw_ranking_participacion r
      )
      SELECT
        ranked.usuario_id,
        ranked.intercambios_hechos,
        ranked.rank_intercambios,
        COALESCE(p.full_name, ranked.email) AS nombre
      FROM ranked
      JOIN usuario u       ON u.id = ranked.usuario_id
      LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
      ORDER BY ranked.intercambios_hechos DESC
      LIMIT 20
    `
    );
    return r.rows;
  });
}
