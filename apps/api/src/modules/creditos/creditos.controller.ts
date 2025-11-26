import { Request, Response } from "express";
import * as svc from "./creditos.service";

export const CreditosController = {
  getCatalogo: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) throw new Error("Usuario no autenticado");

      const data = await svc.getCatalogoCreditos(userId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  buyPaquete: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { paqueteId } = req.body;
      if (!userId || !paqueteId) throw new Error("Datos incompletos");

      const data = await svc.comprarPaquete(userId, Number(paqueteId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  buyPlan: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const { planId } = req.body;
      if (!userId || !planId) throw new Error("Datos incompletos");

      const data = await svc.comprarPlan(userId, Number(planId));
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};