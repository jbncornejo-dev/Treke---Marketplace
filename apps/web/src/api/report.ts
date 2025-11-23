// apps/web/src/api/report.ts
import { api } from "./client";
import { getCurrentUser } from "./auth";
import type {
  UserDashboardSummary,
  UserRankingData,
  MonetizacionIngresosMes,
  SaldoCreditosUsuarioRow,
  IntercambiosPorCategoria,
  AdminDashboard,
  RankingTopUsuario,
  UsuarioActivoPorRolRow,
  UserLastActivityRow,
} from "../types/report";

// Helper para saber si hay usuario logueado (solo para UX, ya no se manda por header)
function getCurrentUserIdSafe(): number | null {
  const u = getCurrentUser();
  if (!u) return null;

  if (typeof u === "number") {
    const n = Number(u);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof u === "string") {
    const n = Number(u);
    return Number.isFinite(n) ? n : null;
  }

  if (typeof u === "object" && u !== null && "id" in u) {
    const v = (u as any).id;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }

  return null;
}

/* ============================
 *  REPORTES – USUARIO
 * ============================*/

// GET /api/report/user/me/summary
export async function getUserSummary(): Promise<UserDashboardSummary> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const r = await api.get<{ ok: boolean; data: UserDashboardSummary }>(
    "/api/report/user/me/summary"
  );

  return (r as any).data ?? (r as any);
}

// GET /api/report/user/me/ranking → { me, top10 }
export async function getUserRanking(): Promise<UserRankingData> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const r = await api.get<{ ok: boolean; data: UserRankingData }>(
    "/api/report/user/me/ranking"
  );

  return (r as any).data ?? (r as any);
}

// (history lo dejamos para más adelante, backend devuelve 501)

/* ============================
 *  REPORTES – ORG / EMPRENDEDOR
 * ============================*/

// GET /api/report/org/me/ventas
export async function getOrgVentas(): Promise<MonetizacionIngresosMes[]> {
  const r = await api.get<{ ok: boolean; data: MonetizacionIngresosMes[] }>(
    "/api/report/org/me/ventas"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/org/me/wallet
export async function getOrgWallet(): Promise<SaldoCreditosUsuarioRow> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const r = await api.get<{ ok: boolean; data: SaldoCreditosUsuarioRow }>(
    "/api/report/org/me/wallet"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/org/me/top-categorias
export async function getOrgTopCategorias(): Promise<IntercambiosPorCategoria[]> {
  const r = await api.get<{ ok: boolean; data: IntercambiosPorCategoria[] }>(
    "/api/report/org/me/top-categorias"
  );
  return (r as any).data ?? (r as any);
}

/* ============================
 *  REPORTES – ADMIN
 * ============================*/

// GET /api/report/admin/overview
export async function getAdminOverview(): Promise<AdminDashboard> {
  const r = await api.get<{ ok: boolean; data: AdminDashboard }>(
    "/api/report/admin/overview"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/admin/top-categorias
export async function getAdminTopCategorias(): Promise<IntercambiosPorCategoria[]> {
  const r = await api.get<{ ok: boolean; data: IntercambiosPorCategoria[] }>(
    "/api/report/admin/top-categorias"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/admin/top-usuarios
export async function getAdminTopUsuarios(): Promise<RankingTopUsuario[]> {
  const r = await api.get<{ ok: boolean; data: RankingTopUsuario[] }>(
    "/api/report/admin/top-usuarios"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/admin/usuarios-activos-por-rol
export async function getAdminUsuariosActivosPorRol(): Promise<UsuarioActivoPorRolRow[]> {
  const r = await api.get<{ ok: boolean; data: UsuarioActivoPorRolRow[] }>(
    "/api/report/admin/usuarios-activos-por-rol"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/admin/users/last-activity
export async function getAdminUserLastActivityAll(): Promise<UserLastActivityRow[]> {
  const r = await api.get<{ ok: boolean; data: UserLastActivityRow[] }>(
    "/api/report/admin/users/last-activity"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/admin/users/inactivos-30d
export async function getAdminUsuariosInactivos30d(): Promise<UserLastActivityRow[]> {
  const r = await api.get<{ ok: boolean; data: UserLastActivityRow[] }>(
    "/api/report/admin/users/inactivos-30d"
  );
  return (r as any).data ?? (r as any);
}
