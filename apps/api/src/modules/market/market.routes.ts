// apps/api/src/modules/market/market.routes.ts
import { Router } from "express";
import { MarketController as C } from "./market.controller";
import { uploadMarketImages } from "./market.upload";
// 👇 IMPORTAR optionalAuthMiddleware
import { authMiddleware, optionalAuthMiddleware } from "../../middlewares/auth";

const r = Router();

// =========================================================
// 1. RUTAS ESPECÍFICAS
// =========================================================

// Listado: Agregamos optionalAuthMiddleware para detectar si el usuario dio like
r.get("/market/list", optionalAuthMiddleware, C.list);

r.get("/market/categorias", C.categorias);
r.get("/market/estados", C.estados);

// =========================================================
// 2. RUTAS PROTEGIDAS ESPECÍFICAS
// =========================================================

r.post("/market", authMiddleware, C.create);

r.post(
  "/market/upload-images",
  authMiddleware,
  uploadMarketImages,
  C.uploadImages
);

// =========================================================
// 3. RUTAS DINÁMICAS (CON :id) -> SIEMPRE AL FINAL
// =========================================================

// Detalle: También aquí para saber si el usuario que entra ya le dio like
r.get("/market/:id", optionalAuthMiddleware, C.detail);

r.post("/market/:id/fav", authMiddleware, C.favAdd);
r.delete("/market/:id/fav", authMiddleware, C.favRemove);

export default r;
