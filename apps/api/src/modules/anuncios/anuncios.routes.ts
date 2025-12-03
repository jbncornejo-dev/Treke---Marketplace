// apps/api/src/modules/anuncios/anuncios.routes.ts
import { Router } from "express";
import { AnunciosController as C } from "./anuncios.controller";
import { authMiddleware, adminOnly } from "../../middlewares/auth";

const r = Router();

// Público: anuncios activos por ubicación (para los footers)
r.get("/anuncios/activos", C.listActivos);

// Registrar click (opcional, para métricas)
r.post("/anuncios/:id/click", C.registrarClick);

// Admin: listado y creación
r.get("/admin/anuncios", authMiddleware, adminOnly, C.adminList);
r.post("/admin/anuncios", authMiddleware, adminOnly, C.adminCreate);

export default r;
