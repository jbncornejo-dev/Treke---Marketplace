// apps/api/src/modules/report-user/userReport.routes.ts

import { Router } from "express";
import { UserReportController } from "./userReport.controller";
// import { requireAuth } from "../../middlewares/auth";

export const userReportRouter = Router();

/**
 * Prefijo en app.ts:
 * app.use("/api/user/reportes", userReportRouter);
 *
 * Entonces, por ejemplo:
 *   GET /api/user/reportes/1/dashboard
 *   GET /api/user/reportes/1/creditos
 *   GET /api/user/reportes/1/movimientos
 */

// ===============================
// DASHBOARD
// ===============================

// Dashboard "completo" (multi-query)
userReportRouter.get(
  "/:usuarioId/dashboard",
  // requireAuth,
  UserReportController.getDashboard
);

// Dashboard basado en vista agregada (opcional, por si lo usas luego)
userReportRouter.get(
  "/:usuarioId/dashboard/resumen",
  // requireAuth,
  UserReportController.getDashboardResumen
);

// ===============================
// ACTIVIDAD / RANKING
// ===============================

userReportRouter.get(
  "/:usuarioId/actividad",
  // requireAuth,
  UserReportController.getActividad
);

userReportRouter.get(
  "/:usuarioId/ranking",
  // requireAuth,
  UserReportController.getRanking
);

// ===============================
// CRÉDITOS / BILLETERA
// ===============================

userReportRouter.get(
  "/:usuarioId/creditos",
  // requireAuth,
  UserReportController.getCreditos
);

userReportRouter.get(
  "/:usuarioId/movimientos",
  // requireAuth,
  UserReportController.getMovimientos
);

// ===============================
// IMPACTO AMBIENTAL
// ===============================

userReportRouter.get(
  "/:usuarioId/impacto",
  // requireAuth,
  UserReportController.getImpacto
);

// ===============================
// SERIES TEMPORALES (gráficos)
// ===============================

userReportRouter.get(
  "/:usuarioId/series/creditos",
  // requireAuth,
  UserReportController.getCreditosPorMes
);

userReportRouter.get(
  "/:usuarioId/series/intercambios",
  // requireAuth,
  UserReportController.getIntercambiosPorMes
);

userReportRouter.get(
  "/:usuarioId/series/puntos",
  // requireAuth,
  UserReportController.getPuntosPorMes
);

// ===============================
// RESÚMENES ADICIONALES
// ===============================

userReportRouter.get(
  "/:usuarioId/publicaciones/resumen",
  // requireAuth,
  UserReportController.getPublicacionesResumen
);

userReportRouter.get(
  "/:usuarioId/referidos/resumen",
  // requireAuth,
  UserReportController.getReferidosResumen
);

userReportRouter.get(
  "/:usuarioId/suscripciones/resumen",
  // requireAuth,
  UserReportController.getSuscripcionesResumen
);


// Global TOP por intercambios completados
userReportRouter.get(
  "/ranking/top-intercambios",
  // requireAuth,
  UserReportController.getRankingTopIntercambios
);

// Global TOP por puntaje (gamificación)
userReportRouter.get(
  "/ranking/top-puntaje",
  // requireAuth,
  UserReportController.getRankingTopPuntaje
);