import { Request, Response } from "express";
import * as svc from "./creditos.service";

export const CreditosController = {
  paquetes: async (_: Request, res: Response) => {
    try {
      const data = await svc.listarPaquetesActivos();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  saldo: async (req: Request, res: Response) => {
    try {
      const usuarioId = req.user?.id; // 🔐 viene del JWT (authMiddleware)

      if (!usuarioId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const data = await svc.obtenerBilletera(usuarioId);
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error saldo billetera:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  comprar: async (req: Request, res: Response) => {
    try {
      const usuarioId = req.user?.id; // 🔐
      if (!usuarioId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const paqueteId = Number(req.body?.paquete_id);
      if (!Number.isInteger(paqueteId) || paqueteId <= 0) {
        throw new Error("paquete_id debe ser un entero válido");
      }

      const data = await svc.comprarPaquete(usuarioId, paqueteId);
      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      console.error("Error comprar paquete:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
