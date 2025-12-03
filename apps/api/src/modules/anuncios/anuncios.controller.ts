// apps/api/src/modules/anuncios/anuncios.controller.ts
import { Request, Response } from "express";
import * as svc from "./anuncios.service";

export const AnunciosController = {
  // GET /api/anuncios/activos?ubicacion=market
  listActivos: async (req: Request, res: Response) => {
    try {
      const ubicacion = (req.query.ubicacion as string) || "market";

      const data = await svc.getActivosByUbicacion(
        ubicacion as svc.UbicacionAnuncio
      );

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // POST /api/anuncios/:id/click
  registrarClick: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) {
        throw new Error("ID inválido");
      }

      const data = await svc.registrarClick(id);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // GET /api/admin/anuncios
  adminList: async (_req: Request, res: Response) => {
    try {
      const data = await svc.adminListAll();
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // POST /api/admin/anuncios
  adminCreate: async (req: Request, res: Response) => {
    try {
      const user = req.user;
      if (!user) throw new Error("Usuario no autenticado");

      const data = await svc.adminCrearAnuncio(req.body, user.id);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
