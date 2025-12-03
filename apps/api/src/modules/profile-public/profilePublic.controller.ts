// apps/api/src/modules/profile-public/profilePublic.controller.ts
import { Request, Response } from "express";
import * as svc from "./profilePublic.service";

export const ProfilePublicController = {
  // GET /api/profiles/:usuarioId  (perfil público + publicaciones + reseñas)
  getPublicProfile: async (req: Request, res: Response) => {
    try {
      // ✅ usar usuarioId porque así está en la ruta
      const usuarioId = Number(req.params.usuarioId);
      if (!Number.isFinite(usuarioId)) {
        throw new Error("id de usuario inválido");
      }

      const viewerId = req.user?.id ? Number(req.user.id) : null;

      const pubLimit = req.query.pub_limit ? Number(req.query.pub_limit) : 6;
      const pubOffset = req.query.pub_offset ? Number(req.query.pub_offset) : 0;

      const revLimit = req.query.rev_limit ? Number(req.query.rev_limit) : 5;
      const revOffset = req.query.rev_offset ? Number(req.query.rev_offset) : 0;

      const data = await svc.getPublicProfile({
        usuarioId,
        viewerId,
        pubLimit,
        pubOffset,
        reviewLimit: revLimit,
        reviewOffset: revOffset,
      });

      // Solo info pública
      res.json({ ok: true, data });
    } catch (e: any) {
      console.error("getPublicProfile error:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // POST /api/profiles/:usuarioId/review  (crear/editar reseña)
  upsertReview: async (req: Request, res: Response) => {
    try {
      // ✅ también usuarioId aquí
      const destinatarioId = Number(req.params.usuarioId);
      if (!Number.isFinite(destinatarioId)) {
        throw new Error("id de usuario inválido");
      }

      const autorId = req.user?.id ? Number(req.user.id) : null;

      if (!autorId) {
        return res
          .status(401)
          .json({ ok: false, error: "No autorizado" });
      }

      const { calificacion, comentario } = req.body ?? {};

      const data = await svc.upsertReview({
        autorId,
        destinatarioId,
        calificacion: Number(calificacion),
        comentario: comentario ?? null,
      });

      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      console.error("upsertReview error:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};
