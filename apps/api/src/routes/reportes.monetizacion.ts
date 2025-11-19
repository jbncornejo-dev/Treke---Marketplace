import { Router } from "express";
import { pool } from "../config/database/database";

const r = Router();

/** Totales */
r.get("/ingresos/total", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_monetizacion_ingresos_total`);
    res.json({
      ok: true,
      data: rows[0] || { compras_ok: 0, bs_total: 0, creditos_total: 0 },
    });
  } catch (e) {
    next(e);
  }
});

/** Por mes */
r.get("/ingresos/por-mes", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM vw_monetizacion_ingresos_por_mes ORDER BY periodo ASC`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Créditos comprados por usuario */
r.get("/creditos/comprados-por-usuario", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        usuario_id,
        compras_ok,
        creditos_total AS creditos_comprados,
        bs_total       AS bs_gastados
      FROM vw_creditos_comprados_por_usuario
      ORDER BY creditos_comprados DESC NULLS LAST
    `);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Saldos de billetera */
r.get("/creditos/saldos", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM vw_saldo_creditos_usuario ORDER BY saldo_total DESC`
    );
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Consumo vs generación */
r.get("/consumo-vs-generacion", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_consumo_vs_generacion`);
    res.json({ ok: true, data: rows });
  } catch (e) {
    next(e);
  }
});

/** Adopción de suscripción */
r.get("/suscripciones/adopcion", async (_req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM vw_adopcion_suscripcion`);
    res.json({
      ok: true,
      data:
        rows[0] || {
          total_registros: 0,
          activas: 0,
          usuarios_con_suscripcion: 0,
          ratio_activas: 0,
        },
    });
  } catch (e) {
    next(e);
  }
});

export default r;
