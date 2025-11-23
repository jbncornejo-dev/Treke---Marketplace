// apps/api/src/modules/intercambios/intercambios.controller.ts
import { Request, Response } from "express";
import * as svc from "./intercambios.service";

const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : null);

export const IntercambiosController = {
  // RF-18: iniciar propuesta
  iniciarPropuesta: async (req: Request, res: Response) => {
    try {
      const publicacionId = Number(req.body?.publicacion_id);
      const demandanteId = req.user?.id; // 🔐 viene del JWT (authMiddleware)

      if (!demandanteId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      if (!publicacionId) {
        throw new Error("publicacion_id es requerido");
      }

      const data = await svc.iniciarPropuesta({
        publicacionId,
        demandanteId,
        mensaje: req.body?.mensaje,
        monto_ofertado: Number(req.body?.monto_ofertado ?? 0),
      });

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // RF-19 / RF-20: aceptar propuesta
  aceptarPropuesta: async (req: Request, res: Response) => {
    try {
      const propuestaId = Number(req.params.id);
      const actorId = req.user?.id; // 🔐

      if (!propuestaId) {
        throw new Error("id de propuesta requerido");
      }
      if (!actorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const data = await svc.aceptarPropuesta({ propuestaId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // RF-21 / RF-22: confirmar intercambio
  confirmar: async (req: Request, res: Response) => {
    try {
      const intercambioId = Number(req.params.id);
      const actorId = req.user?.id; // 🔐

      if (!intercambioId) {
        throw new Error("id de intercambio requerido");
      }
      if (!actorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const data = await svc.confirmarIntercambio({ intercambioId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // RF-23: cancelar intercambio
  cancelar: async (req: Request, res: Response) => {
    try {
      const intercambioId = Number(req.params.id);
      const actorId = req.user?.id; // 🔐

      if (!intercambioId) {
        throw new Error("id de intercambio requerido");
      }
      if (!actorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const data = await svc.cancelarIntercambio({
        intercambioId,
        actorId,
        motivo: req.body?.motivo,
      });

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // RF-24: resumen para la página de perfil
  resumenUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.id);
      const page = num(req.query.page) ?? 1;
      const pageSize = num(req.query.pageSize) ?? 20;

      const data = await svc.resumenUsuario(usuarioId, { page, pageSize });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // Rechazar propuesta
  rechazarPropuesta: async (req: Request, res: Response) => {
    try {
      const propuestaId = Number(req.params.id);
      const actorId = req.user?.id; // 🔐

      if (!propuestaId) {
        throw new Error("id de propuesta requerido");
      }
      if (!actorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }

      const data = await svc.rechazarPropuesta({
        propuestaId,
        actorId,
        motivo: req.body?.motivo,
      });

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // Contraoferta de propuesta
  contraoferta: async (req: Request, res: Response) => {
    try {
      const propuestaId = Number(req.params.id);
      const actorId = req.user?.id; // 🔐
      const monto_ofertado = Number(req.body?.monto_ofertado);

      if (!propuestaId) {
        throw new Error("id de propuesta requerido");
      }
      if (!actorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado (sin usuario en token)" });
      }
      if (!monto_ofertado || monto_ofertado <= 0) {
        throw new Error("monto_ofertado inválido");
      }

      const data = await svc.contraofertarPropuesta({
        propuestaId,
        actorId,
        monto_ofertado,
        mensaje: req.body?.mensaje,
      });

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
