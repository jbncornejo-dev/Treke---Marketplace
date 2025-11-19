import { api } from "./client";

export type IngresosTotal = {
  compras_ok: number | null;
  bs_total: string | number | null;
  creditos_total: string | number | null;
};

export type IngresosMes = {
  periodo: string; // ISO del 1er día del mes
  compras_ok: number;
  bs_total: string | number | null;
  creditos_total: string | number | null;
};

export type CreditosPorUsuario = {
  usuario_id: number;
  compras_ok: number;
  creditos_comprados: string | number | null;
  bs_gastados: string | number | null;
};

export type SaldoUsuario = {
  usuario_id: number;
  saldo_disponible: string | number;
  saldo_retenido: string | number;
  saldo_total: string | number;
};

export type ConsumoVsGeneracion = {
  origen:
    | "compra_directa"
    | "generado_intercambios"
    | "gastado_intercambios"
    | "otros";
  total: string | number;
};

export type Suscripciones = {
  total_registros: number;
  activas: number;
  usuarios_con_suscripcion: number;
  ratio_activas: string | number | null;
};

// Wrappers que devuelven data

export const getIngresosTotal = async () => {
  const r = await api.get<{ ok: boolean; data: IngresosTotal }>(
    `/api/admin/reportes/monetizacion/ingresos/total`
  );
  return (r as any).data ?? (r as any);
};

export const getIngresosMes = async () => {
  const r = await api.get<{ ok: boolean; data: IngresosMes[] }>(
    `/api/admin/reportes/monetizacion/ingresos/por-mes`
  );
  return (r as any).data ?? (r as any);
};

export const getCreditosPorUsuario = async () => {
  const r = await api.get<{ ok: boolean; data: CreditosPorUsuario[] }>(
    `/api/admin/reportes/monetizacion/creditos/comprados-por-usuario`
  );
  return (r as any).data ?? (r as any);
};

export const getSaldos = async () => {
  const r = await api.get<{ ok: boolean; data: SaldoUsuario[] }>(
    `/api/admin/reportes/monetizacion/creditos/saldos`
  );
  return (r as any).data ?? (r as any);
};

export const getConsumoVsGeneracion = async () => {
  const r = await api.get<{ ok: boolean; data: ConsumoVsGeneracion[] }>(
    `/api/admin/reportes/monetizacion/consumo-vs-generacion`
  );
  return (r as any).data ?? (r as any);
};

export const getSuscripciones = async () => {
  const r = await api.get<{ ok: boolean; data: Suscripciones }>(
    `/api/admin/reportes/monetizacion/suscripciones/adopcion`
  );
  return (r as any).data ?? (r as any);
};
