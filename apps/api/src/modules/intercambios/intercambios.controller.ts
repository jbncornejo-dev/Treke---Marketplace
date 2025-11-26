// apps/api/src/modules/intercambios/intercambios.controller.ts
import { Request, Response } from "express";
import * as svc from "./intercambios.service";

const num = (v: any) => (v ? Number(v) : null);

export const IntercambiosController = {
  
  iniciarPropuesta: async (req: Request, res: Response) => {
    try {
      const publicacionId = num(req.body?.publicacion_id);
      const demandanteId = req.user?.id; 
      
      if (!demandanteId) return res.status(401).json({ error: "No autorizado" });
      if (!publicacionId) throw new Error("publicacion_id requerido");

      // Eliminado monto_ofertado
      const data = await svc.iniciarPropuesta({
        publicacionId,
        demandanteId,
        mensaje: req.body?.mensaje
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  aceptarPropuesta: async (req: Request, res: Response) => {
    try {
      const propuestaId = num(req.params.id);
      const actorId = req.user?.id;
      if (!propuestaId || !actorId) throw new Error("Datos incompletos");

      const data = await svc.aceptarPropuesta({ propuestaId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  confirmar: async (req: Request, res: Response) => {
    try {
      const intercambioId = num(req.params.id);
      const actorId = req.user?.id;
      if (!intercambioId || !actorId) throw new Error("Datos incompletos");

      const data = await svc.confirmarIntercambio({ intercambioId, actorId });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  cancelar: async (req: Request, res: Response) => {
    try {
      const intercambioId = num(req.params.id);
      const actorId = req.user?.id;
      if (!intercambioId || !actorId) throw new Error("Datos incompletos");

      const data = await svc.cancelarIntercambio({
        intercambioId, actorId, motivo: req.body?.motivo
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  resumenUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = num(req.params.id);
      if (!usuarioId) throw new Error("ID usuario requerido");
      const page = num(req.query.page) || 1;
      const pageSize = num(req.query.pageSize) || 20;

      const data = await svc.resumenUsuario(usuarioId, { page, pageSize });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  rechazarPropuesta: async (req: Request, res: Response) => {
    try {
      const propuestaId = num(req.params.id);
      const actorId = req.user?.id;
      if (!propuestaId || !actorId) throw new Error("Datos incompletos");

      const data = await svc.rechazarPropuesta({
        propuestaId, actorId, motivo: req.body?.motivo
      });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // MENSAJES
  listarMensajes: async (req: Request, res: Response) => {
    try {
      // Ojo: usamos propuestaId porque los mensajes están ligados a la propuesta
      const propuestaId = num(req.params.id); 
      const userId = req.user?.id;
      if (!propuestaId || !userId) throw new Error("Datos incompletos");

      const data = await svc.listarMensajes(propuestaId, userId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  enviarMensaje: async (req: Request, res: Response) => {
    try {
      const propuestaId = num(req.params.id);
      const userId = req.user?.id;
      const { contenido } = req.body;
      if (!propuestaId || !userId || !contenido) throw new Error("Datos incompletos");

      const data = await svc.enviarMensaje(propuestaId, userId, contenido);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};