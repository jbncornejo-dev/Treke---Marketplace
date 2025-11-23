import { Router } from "express";
import { CreditosController as C } from "./creditos.controller";
import { authMiddleware } from "../../middlewares/auth";

const r = Router();

// listar paquetes de créditos (público)
r.get("/creditos/paquetes", C.paquetes);

// saldo de billetera (requiere login)
r.get("/creditos/saldo", authMiddleware, C.saldo);

// comprar paquete (requiere login)
r.post("/creditos/comprar", authMiddleware, C.comprar);

export default r;
