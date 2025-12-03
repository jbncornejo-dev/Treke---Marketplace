// apps/api/src/modules/gamificacion/gamificacion.routes.ts
import { Router } from "express";
import * as GamificacionController from "./gamificacion.controller";
// import { requireAuth } from "../../middlewares/auth"; // si lo usas

export const gamificacionRouter = Router();

// Base sugerida en app principal:
// app.use("/api/gamificacion", gamificacionRouter);

// Resumen de puntos / nivel del usuario
gamificacionRouter.get(
  "/usuarios/:usuarioId/resumen",
  // requireAuth,
  GamificacionController.getResumen
);

// Historial de puntos del usuario (paginado)
gamificacionRouter.get(
  "/usuarios/:usuarioId/historial",
  // requireAuth,
  GamificacionController.getHistorial
);

// Logros del usuario (acciones + stats)
gamificacionRouter.get(
  "/usuarios/:usuarioId/logros",
  // requireAuth,
  GamificacionController.getLogros
);

// Listado global de niveles
gamificacionRouter.get(
  "/niveles",
  // requireAuth,
  GamificacionController.getNiveles
);

// Listado global de acciones que dan puntos
gamificacionRouter.get(
  "/acciones",
  // requireAuth,
  GamificacionController.getAcciones
);

// Reclamar / registrar login diario (recompensa diaria)
gamificacionRouter.post(
  "/usuarios/:usuarioId/login-diario",
  // requireAuth,
  GamificacionController.registrarLoginDiario
);
