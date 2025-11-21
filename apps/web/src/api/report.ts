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
} from "../types/report";

// 🔐 Igual que en creditos.ts, pero local a este módulo
function getCurrentUserIdSafe(): number | null {
  const u = getCurrentUser();
  if (!u) return null;

  // Si ya es un número
  if (typeof u === "number") {
    const n = Number(u);
    return Number.isFinite(n) ? n : null;
  }

  // Si es un string "3" / "42"
  if (typeof u === "string") {
    const n = Number(u);
    return Number.isFinite(n) ? n : null;
  }

  // Si es un objeto { id: 3, ... }
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

  const headers = { "x-user-id": String(uid) };

  const r = await api.get<{ ok: boolean; data: UserDashboardSummary }>(
    "/api/report/user/me/summary",
    { headers } as any
  );

  // Normaliza: si el backend devuelve { ok, data } o sólo data
  return (r as any).data ?? (r as any);
}

// GET /api/report/user/me/ranking → { me, top10 }
export async function getUserRanking(): Promise<UserRankingData> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const headers = { "x-user-id": String(uid) };

  const r = await api.get<{ ok: boolean; data: UserRankingData }>(
    "/api/report/user/me/ranking",
    { headers } as any
  );

  return (r as any).data ?? (r as any);
}

// (Opcional) GET /api/report/user/me/history por ahora devuelve 501, así que
// no lo implemento aquí hasta que tengas la vista de historial creada.

/* ============================
 *  REPORTES – ORG / EMPRENDEDOR
 * ============================*/

// GET /api/report/org/me/ventas
// Usa vw_monetizacion_ingresos_por_mes (por ahora global)
export async function getOrgVentas(): Promise<MonetizacionIngresosMes[]> {
  const r = await api.get<{ ok: boolean; data: MonetizacionIngresosMes[] }>(
    "/api/report/org/me/ventas"
  );
  return (r as any).data ?? (r as any);
}

// GET /api/report/org/me/wallet
// Usa vw_saldo_creditos_usuario filtrado por usuario
export async function getOrgWallet(): Promise<SaldoCreditosUsuarioRow> {
  const uid = getCurrentUserIdSafe();
  if (!uid) {
    throw new Error("Usuario no autenticado");
  }

  const headers = { "x-user-id": String(uid) };

  const r = await api.get<{ ok: boolean; data: SaldoCreditosUsuarioRow }>(
    "/api/report/org/me/wallet",
    { headers } as any
  );

  return (r as any).data ?? (r as any);
}

// GET /api/report/org/me/top-categorias
// Usa vw_intercambios_por_categorias
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
// Resumen completo de monetización + impacto + uso de créditos
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
