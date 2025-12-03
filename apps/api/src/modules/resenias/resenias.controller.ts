import { Request, Response } from 'express';
import * as svc from './resenias.service';

export const ReseniasController = {
  
  // Crear una nueva reseña
  crear: async (req: Request, res: Response) => {
    try {
      // El autor es el usuario que está logueado (viene del token)
      const autorId = req.user?.id;
      
      if (!autorId) {
        return res.status(401).json({ ok: false, error: 'Usuario no autenticado' });
      }

      const { destinatario_id, calificacion, comentario } = req.body;

      // Validaciones básicas de entrada
      if (!destinatario_id || !calificacion) {
        return res.status(400).json({ ok: false, error: 'Destinatario y calificación son obligatorios' });
      }

      const data = await svc.crearResenia(autorId, Number(destinatario_id), Number(calificacion), comentario);
      
      return res.json({ ok: true, message: 'Reseña creada con éxito', data });
    } catch (e: any) {
      // Retornamos error 400 para validaciones de negocio (ej. "Ya calificaste a este usuario")
      return res.status(400).json({ ok: false, error: e.message });
    }
  },

  // Listar las reseñas de un usuario específico
  listarPorUsuario: async (req: Request, res: Response) => {
    try {
      const usuarioId = Number(req.params.usuario_id);
      
      if (isNaN(usuarioId)) {
        return res.status(400).json({ ok: false, error: 'ID de usuario inválido' });
      }

      const data = await svc.obtenerResenias(usuarioId);
      
      return res.json({ ok: true, data });
    } catch (e: any) {
      return res.status(400).json({ ok: false, error: e.message });
    }
  }
};