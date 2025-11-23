// apps/api/src/modules/intercambios/intercambios.routes.ts
import { Router } from "express";
import { IntercambiosController as C } from "./intercambios.controller";
import { authMiddleware, selfOrAdmin } from "../../middlewares/auth";

const r = Router();

r.post("/intercambios/propuestas", authMiddleware, C.iniciarPropuesta);
r.post("/intercambios/propuestas/:id/aceptar", authMiddleware, C.aceptarPropuesta);
r.post("/intercambios/propuestas/:id/rechazar", authMiddleware, C.rechazarPropuesta);
r.post("/intercambios/propuestas/:id/contraoferta", authMiddleware, C.contraoferta);

r.post("/intercambios/:id/confirmar", authMiddleware, C.confirmar);
r.post("/intercambios/:id/cancelar", authMiddleware, C.cancelar);

r.get("/usuarios/:id/intercambios", authMiddleware, selfOrAdmin, C.resumenUsuario);

export default r;
