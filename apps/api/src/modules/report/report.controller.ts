// apps/api/src/modules/report/report.controller.ts
import { Request, Response } from "express";
import * as S from "./report.service";

// Ahora el uid viene SIEMPRE del JWT (req.user), no de headers/body/query
const uidFrom = (req: Request) => {
  const id = req.user?.id;
  return typeof id === "number" && id > 0 ? id : null;
};

/**
 * RESUMEN DEL USUARIO (DASHBOARD)
 * Usa S.getUserSummary(usuarioId):
 *  - actividad
 *  - ranking
 *  - saldo
 *  - compras
 */
export const userSummary = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado (usuario no encontrado en token)",
      });
    }

    const data = await S.getUserSummary(uid);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * RANKING DEL USUARIO
 * Mezcla:
 *  - S.getRankingMeWithPosition(usuarioId)
 *  - S.getRankingTop10()
 * y devuelve { me, top10 } como antes.
 */
export const userRanking = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado (usuario no encontrado en token)",
      });
    }

    const [me, top10] = await Promise.all([
      S.getRankingMeWithPosition(uid),
      S.getRankingTop10(),
    ]);

    res.json({ ok: true, data: { me, top10 } });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * HISTORIAL DEL USUARIO
 * ⚠️ Aún NO implementado con las nuevas vistas.
 */
export const userHistory = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado (usuario no encontrado en token)",
      });
    }

    return res.status(501).json({
      ok: false,
      error:
        "userHistory aún no está implementado con las nuevas vistas. " +
        "Define una vista de historial de intercambios por usuario y la conectamos aquí.",
    });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ORG / EMPRENDEDOR – VENTAS
 * De momento usa info global de ingresos por mes.
 */
export const orgVentas = async (_req: Request, res: Response) => {
  try {
    const data = await S.getMonetizacionIngresosPorMes();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ORG / EMPRENDEDOR – WALLET
 * Usa saldo por usuario desde vw_saldo_creditos_usuario.
 */
export const orgWallet = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado (usuario no encontrado en token)",
      });
    }

    const data = await S.getSaldoCreditosUsuario(uid);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * TOP CATEGORÍAS PARA ORG
 * Reutiliza vw_categorias_intercambio_popular.
 */
export const orgTopCategorias = async (_: Request, res: Response) => {
  try {
    const data = await S.getCategoriasIntercambioPopular();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN OVERVIEW
 * Usa S.getAdminDashboard():
 *  - ingresos_total
 *  - ingresos_por_mes
 *  - impacto_total
 *  - adopcion_suscripcion
 *  - total_intercambios
 *  - consumo_vs_generacion
 */
export const adminOverview = async (_: Request, res: Response) => {
  try {
    const data = await S.getAdminDashboard();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN TOP CATEGORÍAS
 * Usa vw_categorias_intercambio_popular.
 */
export const adminTopCategorias = async (_: Request, res: Response) => {
  try {
    const data = await S.getCategoriasIntercambioPopular();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN TOP USUARIOS
 * Usa vw_ranking_participacion → getRankingTop10().
 */
export const adminTopUsuarios = async (_: Request, res: Response) => {
  try {
    const data = await S.getRankingTop10();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN – Usuarios activos por rol
 * Usa vw_usuarios_activos_por_rol.
 */
export const adminUsuariosActivosPorRol = async (_: Request, res: Response) => {
  try {
    const data = await S.getUsuariosActivosPorRol();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN – Última actividad de todos los usuarios
 * Usa vw_user_last_activity.
 */
export const adminUserLastActivityAll = async (_: Request, res: Response) => {
  try {
    const data = await S.getUserLastActivityAll();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN – Usuarios inactivos > 30 días
 * Usa vw_usuario_inactivos_30d.
 */
export const adminUsuariosInactivos30d = async (_: Request, res: Response) => {
  try {
    const data = await S.getUsuariosInactivos30d();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};
