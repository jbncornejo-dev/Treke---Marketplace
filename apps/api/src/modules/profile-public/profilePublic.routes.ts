// apps/api/src/modules/profile-public/profilePublic.routes.ts
import { Router } from "express";
import { ProfilePublicController as C } from "./profilePublic.controller";
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth";

const r = Router();

// GET perfil público (con viewer opcional)
r.get("/:usuarioId", optionalAuthMiddleware, C.getPublicProfile);

// POST reseña (requiere auth)
r.post("/:usuarioId/review", authMiddleware, C.upsertReview);

export default r;
