// apps/api/src/modules/intercambios/intercambios.routes.ts
import { Router } from "express";
import { IntercambiosController as C } from "./intercambios.controller";
import { authMiddleware, selfOrAdmin } from "../../middlewares/auth";

const r = Router();

// ==========================================
// 1. GESTIÓN DE PROPUESTAS
// ==========================================
r.post("/intercambios/propuestas", authMiddleware, C.iniciarPropuesta);
r.post("/intercambios/propuestas/:id/aceptar", authMiddleware, C.aceptarPropuesta);
r.post("/intercambios/propuestas/:id/rechazar", authMiddleware, C.rechazarPropuesta);


// ==========================================
// 2. GESTIÓN DE INTERCAMBIOS (Confirmación)
// ==========================================
r.post("/intercambios/:id/confirmar", authMiddleware, C.confirmar);
r.post("/intercambios/:id/cancelar", authMiddleware, C.cancelar);


// ==========================================
// 3. HISTORIAL Y PERFIL
// ==========================================
r.get("/usuarios/:id/intercambios", authMiddleware, selfOrAdmin, C.resumenUsuario);

// Agrega esto en tu archivo de rutas
r.get("/intercambios/propuestas/:id/mensajes", authMiddleware, C.listarMensajes);
r.post("/intercambios/propuestas/:id/mensajes", authMiddleware, C.enviarMensaje);

export default r;
