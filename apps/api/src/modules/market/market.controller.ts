// apps/api/src/modules/market/market.controller.ts
import * as svc from "./market.service";
import { Request, Response } from "express";

// Helpers para conversión segura de tipos
const num = (v: any) => (Number.isFinite(Number(v)) ? Number(v) : null);

function toNumberOrNull(raw: any): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function toIntOrNull(raw: any): number | null {
  const n = toNumberOrNull(raw);
  if (n === null) return null;
  return Number.isInteger(n) ? n : null;
}

function requireInt(raw: any, field: string): number {
  const n = toIntOrNull(raw);
  if (n === null) {
    throw new Error(`${field} debe ser un entero válido`);
  }
  return n;
}

function requireNumber(raw: any, field: string): number {
  const n = toNumberOrNull(raw);
  if (n === null) {
    throw new Error(`${field} debe ser un número válido`);
  }
  return n;
}

export const MarketController = {
  // LISTADO PÚBLICO
  list: async (req: Request, res: Response) => {
    try {
      // 👇 Obtenemos el ID del usuario si está logueado (el middleware opcional debe haberlo puesto aquí)
      const viewerId = req.user?.id ? Number(req.user.id) : null; 

      const data = await svc.list({
        q: (req.query.q as string) ?? null,
        categoria_id: num(req.query.categoria_id),
        min_cred: num(req.query.min_cred),
        max_cred: num(req.query.max_cred),
        estado_id: num(req.query.estado_id),
        sort: (req.query.sort as any) ?? "recent",
        limit: req.query.limit ? Number(req.query.limit) : 12,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      }, viewerId); // 👈 Pasamos el viewerId

      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // DETALLE
  detail: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        throw new Error("id de publicación inválido");
      }

      const viewer = req.user?.id ?? null; // 🔐 opcional
      const data = await svc.detail(id, viewer);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // FAVORITOS
  favAdd: async (req: Request, res: Response) => {
    try {
      const pubId = Number(req.params.id);
      if (!Number.isFinite(pubId)) throw new Error("id de publicación inválido");

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ ok: false, error: "No autorizado" });

      const data = await svc.favAdd(userId, pubId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  favRemove: async (req: Request, res: Response) => {
    try {
      const pubId = Number(req.params.id);
      if (!Number.isFinite(pubId)) throw new Error("id de publicación inválido");

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ ok: false, error: "No autorizado" });

      const data = await svc.favRemove(userId, pubId);
      res.json({ ok: true, data });
    } catch (e: any) {
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // CREAR PUBLICACIÓN
  create: async (req: Request, res: Response) => {
    try {
      // console.log("BODY CREAR PUBLICACION:", req.body);
      const usuario_id = req.user?.id;
      if (!usuario_id) {
        return res.status(401).json({ ok: false, error: "No autorizado" });
      }

      // 1. Extraemos SOLO lo que usamos (Eliminé latitud y longitud aquí)
      const {
        titulo,
        descripcion,
        valor_creditos,
        ubicacion_texto,
        peso_aprox_kg,
        categoria_id,
        estado_id,
        factor_ids,
        sin_impacto,
        fotos,
      } = req.body ?? {};

      if (!titulo || !descripcion || !ubicacion_texto) {
        throw new Error("titulo, descripcion y ubicacion_texto son requeridos");
      }

      // Validaciones numéricas
      const valorCreditosNum = requireInt(valor_creditos, "valor_creditos");
      const categoriaIdNum = requireInt(categoria_id, "categoria_id");

      // Peso
      const pesoNum =
        peso_aprox_kg === undefined || peso_aprox_kg === null || peso_aprox_kg === ""
          ? 0
          : requireNumber(peso_aprox_kg, "peso_aprox_kg");

      // Estado
      const estadoIdNum =
        estado_id === undefined || estado_id === null || estado_id === ""
          ? undefined
          : requireInt(estado_id, "estado_id");

      // Factores (aunque el servicio no los use ahora, los procesamos para que no rompa si los activas luego)
      const factoresIdsNum: number[] = Array.isArray(factor_ids)
        ? factor_ids
            .map((x: any) => toIntOrNull(x))
            .filter((x: number | null): x is number => x !== null)
        : [];

      const fotosArr: string[] = Array.isArray(fotos) ? fotos : [];

      // Llamada al servicio
      const data = await svc.createPublication({
        titulo,
        descripcion,
        valor_creditos: valorCreditosNum,
        ubicacion_texto,
        peso_aprox_kg: pesoNum,
        categoria_id: categoriaIdNum,
        usuario_id,
        estado_id: estadoIdNum,
        factor_ids: factoresIdsNum,
        sin_impacto: !!sin_impacto,
        fotos: fotosArr,
      });

      res.status(201).json({ ok: true, data });
    } catch (e: any) {
      console.error("Error en create /market:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },

  // CATÁLOGOS
  categorias: async (_: Request, res: Response) => {
    const data = await svc.categorias();
    res.json({ ok: true, data });
  },

  estados: async (_: Request, res: Response) => {
    const data = await svc.estadosPublicacion();
    res.json({ ok: true, data });
  },

  // UPLOAD
  uploadImages: async (req: Request, res: Response) => {
    try {
      const files = (req as any).files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        throw new Error("No se recibieron archivos");
      }

      const baseUrl = process.env.API_PUBLIC_URL || `${req.protocol}://${req.get("host")}`;
      const urls = files.map((f) => {
        return `${baseUrl}/uploads/market/${f.filename}`;
      });

      res.json({ ok: true, data: urls });
    } catch (e: any) {
      console.error("Error uploadImages:", e);
      res.status(400).json({ ok: false, error: e.message });
    }
  },
};