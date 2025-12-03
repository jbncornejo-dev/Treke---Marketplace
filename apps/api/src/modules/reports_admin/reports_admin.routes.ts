// apps/api/src/modules/reports_admin/reports_admin.routes.ts
import { Router } from "express";
import { AdminReportsController } from "./reports_admin.controller";

const router = Router();

// Prefijo en app principal: app.use("/api/admin/reportes", router);

// DASHBOARD
router.get("/dashboard", AdminReportsController.getDashboardReport);

// COMUNIDAD (incluye rankings de comunidad que ya salen de getComunidadData)
router.get("/comunidad", AdminReportsController.getComunidadReport);

// RANKING (si quieres endpoint extra solo de rankings agregados)
router.get("/ranking", AdminReportsController.getRankingReport);

// PUBLICACIONES & CATÁLOGO
router.get("/publicaciones", AdminReportsController.getPublicacionesReport);

// IMPACTO AMBIENTAL
router.get("/impacto", AdminReportsController.getImpactoReport);

// MONETIZACIÓN (modo reciente)
router.get("/monetizacion", AdminReportsController.getMonetizacionReport);

// MONETIZACIÓN HISTÓRICA (para los gráficos de línea grandes)
router.get(
  "/monetizacion/historico",
  AdminReportsController.getMonetizacionHistoricoReport
);

// INTERCAMBIOS (lo que te está dando 404 ahora mismo)
router.get("/intercambios", AdminReportsController.getIntercambiosReport);

export default router;
