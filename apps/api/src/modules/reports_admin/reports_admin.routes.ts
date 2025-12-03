// src/modules/reports_admin/reports_admin.routes.ts
import { Router } from "express";
import { AdminReportsController } from "./reports_admin.controller";

const router = Router();

// Rutas para obtener los reportes de todas las secciones
router.get("/dashboard", AdminReportsController.getDashboardReport);
router.get("/comunidad", AdminReportsController.getComunidadReport);
router.get("/ranking", AdminReportsController.getRankingReport);
router.get("/publicaciones", AdminReportsController.getPublicacionesReport);
router.get("/impacto", AdminReportsController.getImpactoReport);
router.get("/monetizacion", AdminReportsController.getMonetizacionReport);

export default router;
