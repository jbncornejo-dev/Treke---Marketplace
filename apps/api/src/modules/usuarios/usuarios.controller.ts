import { Request, Response } from 'express';
import * as svc from './usuarios.service';

export const UsuariosController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, acepta_terminos, rol_id } = req.body;
      const data = await svc.registrarUsuario({ email, password, full_name, acepta_terminos, rol_id });
      res.json({ ok: true, ...data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const data = await svc.loginPlano(email, password);
      res.json(data);
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  getPerfil: async (req: Request, res: Response) => {
    try {
      const id = +req.params.id;
      const data = await svc.getPerfil(id);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(404).json({ ok: false, error: e.message });
    }
  },

  updatePerfil: async (req: Request, res: Response) => {
    try {
      const id = +req.params.id;
      const data = await svc.actualizarPerfil(id, req.body);
      res.json({ ok: true, data, message: 'Perfil actualizado' });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  updateFoto: async (req: Request, res: Response) => {
    try {
      const id = +req.params.id;
      const { foto } = req.body;
      const data = await svc.actualizarFoto(id, foto);
      res.json({ ok: true, data, message: 'Foto actualizada' });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  updateEmail: async (req: Request, res: Response) => {
    try {
      const id = +req.params.id;
      const { email } = req.body;
      const data = await svc.actualizarEmail(id, email);
      res.json({ ok: true, data, message: 'Email actualizado: confirmar para activar' });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // Admin base
  listar: async (req: Request, res: Response) => {
    try {
      const data = await svc.listarUsuarios({ ...req.query });
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  cambiarRol: async (req: Request, res: Response) => {
    try {
      const usuarioId = +req.params.id;
      const { nuevoRolId } = req.body;
      const data = await svc.cambiarRol(0, usuarioId, +nuevoRolId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  suspender: async (req: Request, res: Response) => {
    try {
      const usuarioId = +req.params.id;
      const data = await svc.suspenderUsuario(0, usuarioId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
