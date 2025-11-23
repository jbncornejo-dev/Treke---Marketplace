import { Router } from "express";
import * as C from "./report.controller";
import { authMiddleware, adminOnly } from "../../middlewares/auth";

const r = Router();

// Usuario común (necesita login)
r.get("/report/user/me/summary", authMiddleware, C.userSummary);
r.get("/report/user/me/ranking", authMiddleware, C.userRanking);
r.get("/report/user/me/history", authMiddleware, C.userHistory);

// Emprendedor/ONG (también usuario logueado; si quieres puedes validar rol en el controller)
r.get("/report/org/me/ventas", authMiddleware, C.orgVentas);
r.get("/report/org/me/wallet", authMiddleware, C.orgWallet);
r.get("/report/org/me/top-categorias", authMiddleware, C.orgTopCategorias);

// Admin
r.get("/report/admin/overview", authMiddleware, adminOnly, C.adminOverview);
r.get("/report/admin/top-categorias", authMiddleware, adminOnly, C.adminTopCategorias);
r.get("/report/admin/top-usuarios", authMiddleware, adminOnly, C.adminTopUsuarios);
r.get(
  "/report/admin/usuarios-activos-por-rol",
  authMiddleware,
  adminOnly,
  C.adminUsuariosActivosPorRol
);
r.get(
  "/report/admin/users/last-activity",
  authMiddleware,
  adminOnly,
  C.adminUserLastActivityAll
);
r.get(
  "/report/admin/users/inactivos-30d",
  authMiddleware,
  adminOnly,
  C.adminUsuariosInactivos30d
);

export default r;
