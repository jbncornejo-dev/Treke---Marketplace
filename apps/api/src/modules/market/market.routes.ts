import { Router } from "express";
import { MarketController as C } from "./market.controller";
import { uploadMarketImages } from "./market.upload";
import { authMiddleware } from "../../middlewares/auth";

const r = Router();

// públicas
r.get("/market/list", C.list);
r.get("/market/:id", C.detail);

// protegidas
r.post("/market", authMiddleware, C.create);
r.post(
  "/market/upload-images",
  authMiddleware,
  uploadMarketImages,
  C.uploadImages
);

r.post("/market/:id/fav", authMiddleware, C.favAdd);
r.delete("/market/:id/fav", authMiddleware, C.favRemove);

// catálogos (públicos)
r.get("/catalogo/categorias", C.categorias);
r.get("/catalogo/estados-publicacion", C.estados);
r.get("/catalogo/factores-ecologicos", C.factores);

export default r;
