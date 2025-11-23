// apps/web/src/api/profile.ts
import { api } from "./client";

export type PanelResponse = {
  usuario: {
    id: number;
    email: string;
    estado: string;
    rol_id: number;
    rol_nombre?: string;
    full_name?: string;
    acerca_de?: string;
    foto?: string;
    ultimo_login?: string;
    created_at: string;
  };
  billetera: { id?: number; saldo_disponible: number; saldo_retenido: number };
  metricas: {
    publicaciones_activas: number;
    intercambios_totales: number;
    total_creditos_comprados: string | number;
  };
  impacto: null | {
    total_co2_evitado: string | number;
    total_energia_ahorrada: string | number;
    total_agua_preservada: string | number;
    total_residuos_evitados: string | number;
    total_creditos_ganados: string | number;
  };
  publicaciones: Array<{
    id: number;
    titulo: string;
    descripcion: string;
    valor_creditos: number;
    created_at: string;
    categoria: string;
    estado_nombre: string;
    foto_principal?: string | null;
  }>;
  movimientos: Array<{
    id: number;
    fecha_movimiento: string;
    monto: number;
    monto_con_signo: number;
    saldo_anterior: number;
    saldo_posterior: number;
    tipo_codigo: string;
    tipo_descripcion: string;
    es_debito: boolean;
    descripcion?: string | null;
    tipo_referencia?: string | null;
    referencia_id?: number | null;
  }>;
};

export function getCurrentUserId(): number | null {
  try {
    const raw = localStorage.getItem("treke_user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return Number(u?.id) || null;
  } catch {
    return null;
  }
}

export async function fetchPanel(
  usuarioId: number,
  opts?: {
    pubs_limit?: number;
    pubs_offset?: number;
    movs_limit?: number;
    movs_offset?: number;
  }
): Promise<PanelResponse> {
  const q = new URLSearchParams();
  if (opts?.pubs_limit != null) q.set("pubs_limit", String(opts.pubs_limit));
  if (opts?.pubs_offset != null) q.set("pubs_offset", String(opts.pubs_offset));
  if (opts?.movs_limit != null) q.set("movs_limit", String(opts.movs_limit));
  if (opts?.movs_offset != null) q.set("movs_offset", String(opts.movs_offset));

  const path =
    `/api/usuarios/${usuarioId}/panel` + (q.toString() ? `?${q}` : "");
  const resp = await api.get<{ ok: boolean; data: PanelResponse }>(path);
  return (resp as any).data ?? (resp as any);
}
