import { Router } from "express";
import { pool } from "../config/database/database";

const r = Router();

/** Impacto total (vw_impacto_ambiental_total) */
r.get("/impacto-total", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_impacto_ambiental_total`);
    res.json({
      ok: true,
      data: rows[0] || { co2: 0, energia: 0, agua: 0, residuos: 0, creditos: 0 },
    });
  } catch (e) {
    next(e);
  }
});

/** Impacto ambiental por categoría (vw_impacto_ambiental_por_categoria) */
r.get("/impacto-categoria", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_impacto_ambiental_por_categoria`);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Participación en actividades sostenibles (vw_participacion_actividades_sostenibles) */
r.get("/actividades-sostenibles", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM vw_participacion_actividades_sostenibles`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Usuarios activos por rol en los últimos 30 días (vw_usuarios_activos_30d_por_rol) */
r.get("/usuarios-activos-rol", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_usuarios_activos_30d_por_rol`);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Ranking participación (vw_ranking_participacion) */
r.get("/ranking", async (req, res, next) => {
  try {
    const limit = Number(req.query.limit ?? 10);

    const q = `
      SELECT
        ROW_NUMBER() OVER (ORDER BY puntaje DESC, intercambios DESC) AS pos,
        usuario_id,
        email,
        intercambios,
        compras_creditos,
        creditos_comprados,
        tiene_suscripcion,
        puntaje
      FROM vw_ranking_participacion
      ORDER BY pos ASC
      LIMIT $1
    `;

    const { rows } = await pool.query(q, [limit]);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Inactivos 30 días (vw_usuario_inactivos_30d) */
r.get("/inactivos", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM vw_usuario_inactivos_30d ORDER BY ultima_actividad ASC`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Intercambios por categoría (vw_intercambios_por_categorias) */
r.get("/intercambios-categoria", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_intercambios_por_categorias`);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Totales + ratio publicaciones vs intercambios */
r.get("/ratio", async (_req, res, next) => {
  try {
    // Totales de intercambios (completados, activos, total)
    const totalRes = await pool.query(`SELECT * FROM vw_total_intercambios`);
    const total =
      totalRes.rows[0] || ({ completados: 0, activos: 0, total: 0 } as const);

    // Ratio publicaciones vs intercambios (agregado a partir de vw_ratio_demanda_por_categoria)
    const ratioRes = await pool.query(`
      SELECT
        COALESCE(SUM(total_publicaciones), 0)::bigint            AS publicaciones,
        COALESCE(SUM(total_intercambios_completados), 0)::bigint AS intercambios,
        CASE
          WHEN COALESCE(SUM(total_publicaciones), 0) > 0 THEN
            SUM(total_intercambios_completados)::decimal / SUM(total_publicaciones)
          ELSE 0
        END AS ratio_intercambio_por_publicacion
      FROM vw_ratio_demanda_por_categoria
    `);

    const ratio =
      ratioRes.rows[0] || ({
        publicaciones: 0,
        intercambios: 0,
        ratio_intercambio_por_publicacion: 0,
      } as const);

    res.json({ ok: true, data: { total, ratio } });
  } catch (e) {
    next(e);
  }
});

export default r;
