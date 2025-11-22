import { Router } from "express";
import * as C from "./report.controller";

const r = Router();

// Usuario común
r.get("/report/user/me/summary", C.userSummary);   // requiere x-user-id
r.get("/report/user/me/ranking", C.userRanking);   // idem
r.get("/report/user/me/history", C.userHistory);   // idem

// Emprendedor/ONG
r.get("/report/org/me/ventas", C.orgVentas);       // x-user-id
r.get("/report/org/me/wallet", C.orgWallet);       // x-user-id
r.get("/report/org/me/top-categorias", C.orgTopCategorias);

// Admin
r.get("/report/admin/overview", C.adminOverview);
r.get("/report/admin/top-categorias", C.adminTopCategorias);
r.get("/report/admin/top-usuarios", C.adminTopUsuarios);
r.get("/report/admin/usuarios-activos-por-rol", C.adminUsuariosActivosPorRol);
export default r;
