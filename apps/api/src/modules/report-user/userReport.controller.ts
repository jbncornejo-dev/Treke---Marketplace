// apps/api/src/modules/report-user/userReport.controller.ts

import { Request, Response } from "express";
import {
  getUserLastActivity,
  getUserRanking,
  getUserCreditosComprados,
  getUserSaldoCreditos,
  getUserResumenCreditos,
  getUserMovimientosDetalle,
  getUserImpactoAmbiental,
  getUserDashboard,
  getUserDashboardResumen,
  getUserCreditosPorMes,
  getUserIntercambiosPorMes,
  getUserPuntosPorMes,
  getUserPublicacionesResumen,
  getUserReferidosResumen,
  getUserSuscripcionesResumen,
    getUserRankingTopIntercambios,   // 👈 NUEVOS
  getUserRankingTopPuntaje,    
} from "./userReport.service";

function parseUsuarioId(req: Request): number {
  // Aquí puedes adaptar según tu auth (req.user.id, etc.)
  const param = req.params.usuarioId;
  const id = Number(param);
  if (Number.isNaN(id)) {
    throw new Error("usuarioId inválido");
  }
  return id;
}

export const UserReportController = {
  // ============================================
  // DASHBOARD LEGACY (multi-query)
  // ============================================
  async getDashboard(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserDashboard(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getDashboard:", err);
      res.status(400).json({ message: "Error al obtener dashboard de usuario" });
    }
  },

  // ============================================
  // DASHBOARD NUEVO (vista agregada)
  // ============================================
  async getDashboardResumen(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserDashboardResumen(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getDashboardResumen:", err);
      res
        .status(400)
        .json({ message: "Error al obtener dashboard resumen de usuario" });
    }
  },

  // ============================================
  // ACTIVIDAD / RANKING
  // ============================================
  async getActividad(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserLastActivity(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getActividad:", err);
      res.status(400).json({ message: "Error al obtener actividad de usuario" });
    }
  },

  async getRanking(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserRanking(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getRanking:", err);
      res.status(400).json({ message: "Error al obtener ranking de usuario" });
    }
  },

  // ============================================
  // CRÉDITOS / BILLETERA
  // ============================================
  async getCreditos(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const [resumen, saldo, compras] = await Promise.all([
        getUserResumenCreditos(usuarioId),
        getUserSaldoCreditos(usuarioId),
        getUserCreditosComprados(usuarioId),
      ]);

      res.json({
        resumen_creditos: resumen,
        saldo,
        compras_creditos: compras,
      });
    } catch (err) {
      console.error("Error en getCreditos:", err);
      res
        .status(400)
        .json({ message: "Error al obtener datos de créditos de usuario" });
    }
  },

  async getMovimientos(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserMovimientosDetalle(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getMovimientos:", err);
      res
        .status(400)
        .json({ message: "Error al obtener movimientos de usuario" });
    }
  },

  // ============================================
  // IMPACTO AMBIENTAL
  // ============================================
  async getImpacto(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserImpactoAmbiental(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getImpacto:", err);
      res
        .status(400)
        .json({ message: "Error al obtener impacto ambiental de usuario" });
    }
  },

  // ============================================
  // SERIES TEMPORALES (para futuros gráficos)
  // ============================================
  async getCreditosPorMes(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserCreditosPorMes(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getCreditosPorMes:", err);
      res
        .status(400)
        .json({ message: "Error al obtener créditos por mes del usuario" });
    }
  },

  async getIntercambiosPorMes(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserIntercambiosPorMes(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getIntercambiosPorMes:", err);
      res
        .status(400)
        .json({ message: "Error al obtener intercambios por mes del usuario" });
    }
  },
  // ============================================
  // NUEVOS: RANKINGS GLOBALES
  // ============================================
  async getRankingTopIntercambios(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 100);
      const data = await getUserRankingTopIntercambios(safeLimit);
      res.json(data);
    } catch (err) {
      console.error("Error en getRankingTopIntercambios:", err);
      res
        .status(400)
        .json({ message: "Error al obtener ranking global por intercambios" });
    }
  },

  async getRankingTopPuntaje(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const safeLimit = Number.isNaN(limit) ? 10 : Math.min(Math.max(limit, 1), 100);
      const data = await getUserRankingTopPuntaje(safeLimit);
      res.json(data);
    } catch (err) {
      console.error("Error en getRankingTopPuntaje:", err);
      res
        .status(400)
        .json({ message: "Error al obtener ranking global por puntaje" });
    }
  },


  async getPuntosPorMes(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserPuntosPorMes(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getPuntosPorMes:", err);
      res
        .status(400)
        .json({ message: "Error al obtener puntos por mes del usuario" });
    }
  },

  // ============================================
  // RESÚMENES ADICIONALES
  // ============================================
  async getPublicacionesResumen(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserPublicacionesResumen(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getPublicacionesResumen:", err);
      res
        .status(400)
        .json({ message: "Error al obtener resumen de publicaciones" });
    }
  },

  async getReferidosResumen(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserReferidosResumen(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getReferidosResumen:", err);
      res
        .status(400)
        .json({ message: "Error al obtener resumen de referidos" });
    }
  },

  async getSuscripcionesResumen(req: Request, res: Response) {
    try {
      const usuarioId = parseUsuarioId(req);
      const data = await getUserSuscripcionesResumen(usuarioId);
      res.json(data);
    } catch (err) {
      console.error("Error en getSuscripcionesResumen:", err);
      res
        .status(400)
        .json({ message: "Error al obtener resumen de suscripciones" });
    }
  },
};
