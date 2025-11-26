import { Router } from "express";
import { CreditosController as C } from "./creditos.controller";
import { authMiddleware } from "../../middlewares/auth";

const r = Router();

// Obtener lista de paquetes, planes y mi suscripción actual
r.get("/creditos/catalogo", authMiddleware, C.getCatalogo);

// Comprar (Simulado)
r.post("/creditos/paquetes/comprar", authMiddleware, C.buyPaquete);
r.post("/creditos/planes/comprar", authMiddleware, C.buyPlan);

export default r;