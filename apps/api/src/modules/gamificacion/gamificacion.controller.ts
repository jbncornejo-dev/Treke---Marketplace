// apps/api/src/modules/gamificacion/gamificacion.controller.ts
import { Request, Response } from "express";
import * as GamificacionService from "./gamificacion.service";

// =========================
// GET /usuarios/:usuarioId/resumen
// =========================
export async function getResumen(req: Request, res: Response) {
  const usuarioId = Number(req.params.usuarioId);

  if (!usuarioId || Number.isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ ok: false, message: "usuarioId inválido en la ruta" });
  }

  try {
    const data = await GamificacionService.resumenUsuario(usuarioId);
    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] getResumen error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}

// =========================
// GET /usuarios/:usuarioId/historial
// =========================
export async function getHistorial(req: Request, res: Response) {
  const usuarioId = Number(req.params.usuarioId);
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 20);

  if (!usuarioId || Number.isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ ok: false, message: "usuarioId inválido en la ruta" });
  }

  try {
    const data = await GamificacionService.historialUsuario(usuarioId, {
      page,
      pageSize,
    });
    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] getHistorial error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}

// =========================
// GET /usuarios/:usuarioId/logros
// =========================
export async function getLogros(req: Request, res: Response) {
  const usuarioId = Number(req.params.usuarioId);

  if (!usuarioId || Number.isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ ok: false, message: "usuarioId inválido en la ruta" });
  }

  try {
    const data = await GamificacionService.logrosUsuario(usuarioId);
    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] getLogros error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}

// =========================
// GET /niveles
// =========================
export async function getNiveles(_req: Request, res: Response) {
  try {
    const data = await GamificacionService.listarNiveles();
    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] getNiveles error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}

// =========================
// GET /acciones
// =========================
export async function getAcciones(_req: Request, res: Response) {
  try {
    const data = await GamificacionService.listarAcciones();
    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] getAcciones error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}

// =========================
// POST /usuarios/:usuarioId/login-diario
// (Reclamar recompensa diaria / registrar login)
// =========================
export async function registrarLoginDiario(req: Request, res: Response) {
  const usuarioId = Number(req.params.usuarioId);

  if (!usuarioId || Number.isNaN(usuarioId)) {
    return res
      .status(400)
      .json({ ok: false, message: "usuarioId inválido en la ruta" });
  }

  try {
    // Llama a la función que dispara la lógica de login diario
    await GamificacionService.registrarLoginDiario(usuarioId);

    // Devuelve el resumen actualizado después de reclamar la recompensa
    const data = await GamificacionService.resumenUsuario(usuarioId);

    return res.json({ ok: true, data });
  } catch (e: any) {
    console.error("[Gamificación] registrarLoginDiario error:", e);
    return res.status(500).json({ ok: false, message: e.message });
  }
}
