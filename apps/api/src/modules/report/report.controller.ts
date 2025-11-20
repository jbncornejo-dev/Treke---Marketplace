import { Request, Response } from "express";
import * as S from "./report.service";


const uidFrom = (req: Request) => {
  const fromHeader = req.header("x-user-id");
  const fromQuery  = req.query.usuario_id as string | undefined;
  const fromBody   = (req.body as any)?.usuario_id;

  const raw = fromHeader ?? fromQuery ?? fromBody ?? null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

export const userSummary = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");
    const data = await S.userSummary(uid);
    res.json({ ok: true, data });
  } catch (e:any) { res.status(400).json({ ok:false, error: e.message }); }
};

export const userRanking = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");
    const data = await S.userRanking(uid);
    res.json({ ok: true, data });
  } catch (e:any) { res.status(400).json({ ok:false, error: e.message }); }
};

export const userHistory = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req);
    if (!uid) throw new Error("x-user-id requerido");
    const data = await S.userHistory(uid);
    res.json({ ok: true, data });
  } catch (e:any) { res.status(400).json({ ok:false, error: e.message }); }
};

export const orgVentas = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req); if (!uid) throw new Error("x-user-id requerido");
    const data = await S.orgVentas(uid);
    res.json({ ok: true, data });
  } catch (e:any) { res.status(400).json({ ok:false, error: e.message }); }
};

export const orgWallet = async (req: Request, res: Response) => {
  try {
    const uid = uidFrom(req); if (!uid) throw new Error("x-user-id requerido");
    const data = await S.orgWallet(uid);
    res.json({ ok: true, data });
  } catch (e:any) { res.status(400).json({ ok:false, error: e.message }); }
};

export const orgTopCategorias = async (_: Request, res: Response) => {
  const data = await S.orgTopCategorias(); res.json({ ok: true, data });
};

export const adminOverview = async (_: Request, res: Response) => {
  const data = await S.adminOverview(); res.json({ ok: true, data });
};

export const adminTopCategorias = async (_: Request, res: Response) => {
  const data = await S.adminTopCategorias(); res.json({ ok: true, data });
};

export const adminTopUsuarios = async (_: Request, res: Response) => {
  const data = await S.adminTopUsuarios(); res.json({ ok: true, data });
};
