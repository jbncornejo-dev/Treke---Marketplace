// apps/api/src/middlewares/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

export interface JwtUser {
  id: number;
  email: string;
  rol_id: number;
  estado: string;
}

// Extiende el tipo de Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

// ⚙️ Config JWT (usa casts en vez de tipos explícitos en la izquierda)
const JWT_SECRET = (process.env.JWT_SECRET || "dev-secret") as Secret;

// Aquí NO ponemos ": SignOptions['expiresIn']" a la izquierda,
// sólo hacemos cast en la derecha.
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

// Firmar tokens
export function signToken(user: JwtUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      rol_id: user.rol_id,
      estado: user.estado,
    },
    JWT_SECRET,
    {
      // si TS sigue molestando, este cast también lo silencia del todo
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

// Middleware: requiere usuario autenticado
export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ ok: false, error: "No autorizado (token faltante)" });
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = payload;
    return next();
  } catch (e) {
    return res
      .status(401)
      .json({ ok: false, error: "Token inválido o expirado" });
  }
}

// Middleware: solo admin (asumiendo rol_id=10003 es admin)
export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }
  if (req.user.rol_id !== 10003) {
    return res.status(403).json({ ok: false, error: "Solo administradores" });
  }
  return next();
}

// Middleware: el propio usuario o admin
export function selfOrAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: "No autorizado" });
  }

  const targetId = Number(req.params.id);
  if (Number.isNaN(targetId)) {
    return res.status(400).json({ ok: false, error: "ID inválido" });
  }

  if (req.user.rol_id === 10003 || req.user.id === targetId) {
    return next();
  }

  return res
    .status(403)
    .json({ ok: false, error: "No tienes permiso para esta acción" });
}

// Middleware: Intenta autenticar, pero si falla no bloquea (para rutas públicas personalizadas)
export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  // Si no hay header o no es Bearer, seguimos como invitado (sin req.user)
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring("Bearer ".length);

  try {
    // Intentamos verificar. Si es válido, inyectamos el usuario.
    const payload = jwt.verify(token, JWT_SECRET) as JwtUser;
    req.user = payload;
  } catch (e) {
    // Si el token expiró o es inválido, simplemente lo ignoramos y seguimos como invitado.
    // No devolvemos error 401.
  }
  
  return next();
}