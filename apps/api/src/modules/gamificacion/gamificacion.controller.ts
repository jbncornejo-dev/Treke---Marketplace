// apps/api/src/modules/gamificacion/gamificacion.controller.ts

import { Request, Response } from "express";
import * as svc from "./gamificacion.service";

const num = (v: any) => (v !== undefined && v !== null ? Number(v) : null);

export const GamificacionController = {
  // GET /usuarios/:id/puntos/resumen
  resumenUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = num(req.params.id);
      if (!usuarioId) throw new Error("ID de usuario requerido");

      const data = await svc.resumenUsuario(usuarioId);
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("[GamificacionController.resumenUsuario]", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // GET /usuarios/:id/puntos/historial?page=&pageSize=
  historialUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = num(req.params.id);
      if (!usuarioId) throw new Error("ID de usuario requerido");

      const page = num(req.query.page) || 1;
      const pageSize = num(req.query.pageSize) || 20;

      const data = await svc.historialUsuario(usuarioId, { page, pageSize });
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("[GamificacionController.historialUsuario]", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // GET /usuarios/:id/puntos/logros
  logrosUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = num(req.params.id);
      if (!usuarioId) throw new Error("ID de usuario requerido");

      const data = await svc.logrosUsuario(usuarioId);
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("[GamificacionController.logrosUsuario]", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // GET /gamificacion/niveles
listarNiveles: async (_req: Request, res: Response) => {
    try {
      const data = await svc.listarNiveles();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  listarAcciones: async (_req: Request, res: Response) => {
    try {
      const data = await svc.listarAcciones();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};

