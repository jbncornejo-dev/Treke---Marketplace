// apps/api/src/modules/reports_admin/reports_admin.controller.ts

import { Request, Response } from "express";
import * as svc from "./reports_admin.service";

export const AdminReportsController = {
  getDashboardReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getDashboardData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getDashboardReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },
  
  getComunidadReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getComunidadData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getComunidadReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  getRankingReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getRankingData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getRankingReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  getPublicacionesReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getPublicacionesData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getPublicacionesReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  getImpactoReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getImpactoData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getImpactoReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },

  getMonetizacionReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getMonetizacionData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getMonetizacionReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },
    getMonetizacionHistoricoReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getMonetizacionHistoricoData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getMonetizacionHistoricoReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },



  getIntercambiosReport: async (_req: Request, res: Response) => {
    try {
      const data = await svc.getIntercambiosData();
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("Error getIntercambiosReport:", e);
      res.status(500).json({ ok: false, error: e.message });
    }
  },
};


