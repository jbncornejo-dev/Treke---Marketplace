import { Router } from "express";
import { MarketController as C } from "./market.controller";
import { uploadMarketImages } from "./market.upload";


const r = Router();

r.get("/market/list", C.list);
r.get("/market/:id", C.detail);

// NUEVA ruta para crear publicación
r.post("/market", C.create);
r.post("/market/upload-images", uploadMarketImages, C.uploadImages);


r.post("/market/:id/fav", C.favAdd);
r.delete("/market/:id/fav", C.favRemove);

// catálogos
r.get("/catalogo/categorias", C.categorias);
r.get("/catalogo/estados-publicacion", C.estados);

// NUEVO catálogo de factores ecológicos
r.get("/catalogo/factores-ecologicos", C.factores);

export default r;
