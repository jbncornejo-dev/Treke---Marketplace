import { Request, Response } from "express";
import * as S from "./report.service";

const uidFrom = (req: Request) => {
  const fromHeader = req.header("x-user-id");
  const fromQuery  = req.query.usuario_id as string | undefined;
  const fromBody   = (req.body as any)?.usuario_id;

  const raw = fromHeader ?? fromQuery ?? fromBody ?? null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * RESUMEN DEL USUARIO (DASHBOARD)
 * Usa S.getUserSummary(usuarioId) del nuevo service:
 *  - actividad
 *  - ranking
 *  - saldo
 *  - compras
 */
export const userSummary = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");

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
    if (!uid) throw new Error("x-user-id requerido");

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
 * ⚠️ Con las vistas actuales todavía NO tenemos una vista de historial
 * por intercambio (tipo v_user_trade_history).
 *
 * Para no mentirte, dejo este endpoint como NO IMPLEMENTADO con las nuevas vistas.
 * Cuando definamos una vista (o un SELECT específico) para historial, aquí
 * solo habrá que cambiar el cuerpo.
 */
export const userHistory = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");

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
 * De momento usamos la info global de ingresos por mes.
 * Si luego quieres ventas POR vendedor, creamos una vista específica
 * (ej. vw_ventas_por_vendedor) y cambiamos este handler.
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
 * Usa saldo por usuario desde la vista vw_saldo_creditos_usuario.
 */
export const orgWallet = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");

    const data = await S.getSaldoCreditosUsuario(uid);
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * TOP CATEGORÍAS PARA ORG
 * Reutilizamos vw_intercambios_por_categorias.
 */
// Emprendedor/ONG – TOP CATEGORÍAS
// Antes: S.getIntercambiosPorCategorias()
export const orgTopCategorias = async (_: Request, res: Response) => {
  try {
    const data = await S.getCategoriasIntercambioPopular(); // 👈 nueva vista
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};
/**
 * ADMIN OVERVIEW
 * Usa S.getAdminDashboard() del nuevo service:
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
 * Ahora basado en vw_categorias_intercambio_popular.
 */
export const adminTopCategorias = async (_: Request, res: Response) => {
  try {
    const data = await S.getCategoriasIntercambioPopular(); // 👈 nueva vista
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};

/**
 * ADMIN TOP USUARIOS
 * Usa S.getRankingTop10() (vista vw_ranking_participacion).
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
 * Usa S.getUsuariosActivosPorRol() → vw_usuarios_activos_por_rol
 */
export const adminUsuariosActivosPorRol = async (_: Request, res: Response) => {
  try {
    const data = await S.getUsuariosActivosPorRol();
    res.json({ ok: true, data });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e.message });
  }
};
