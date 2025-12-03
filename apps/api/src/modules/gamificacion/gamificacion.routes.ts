// apps/api/src/modules/gamificacion/gamificacion.routes.ts
import { Router } from "express";
import { GamificacionController as C } from "./gamificacion.controller";
import { authMiddleware, selfOrAdmin } from "../../middlewares/auth";

const r = Router();

/**
 * Prefijo en app.ts:
 *   app.use("/api/gamificacion", r);
 */

// Rutas por usuario
r.get(
  "/usuarios/:id/resumen",
  authMiddleware,
  selfOrAdmin,
  C.resumenUsuario
);

r.get(
  "/usuarios/:id/historial",
  authMiddleware,
  selfOrAdmin,
  C.historialUsuario
);

r.get(
  "/usuarios/:id/logros",
  authMiddleware,
  selfOrAdmin,
  C.logrosUsuario
);

// 🔥 Rutas globales de catálogo (lo que te falta)
r.get(
  "/niveles",
  authMiddleware,
  C.listarNiveles
);

r.get(
  "/acciones",
  authMiddleware,
  C.listarAcciones
);

export default r;
