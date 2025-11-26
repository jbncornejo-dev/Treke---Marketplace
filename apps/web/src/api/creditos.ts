import { api } from "./client";

export type PaqueteCredito = {
  id: number;
  nombre_paq: string;
  descripcion: string;
  cant_creditos: number;
  precio: number;
};

export type PlanSuscripcion = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_dias: number;
  creditos_incluidos: number;
  beneficios: string[]; // JSONB suele venir como array
};

export type SuscripcionUser = {
  id: number;
  nombre_plan: string;
  fecha_ini: string;
  fecha_fin: string;
  estado: string;
};

export type CatalogoResponse = {
  paquetes: PaqueteCredito[];
  planes: PlanSuscripcion[];
  suscripcionActual: SuscripcionUser | null;
};

export async function getCatalogoCreditos() {
  const resp = await api.get<{ ok: boolean; data: CatalogoResponse }>("/api/creditos/catalogo");
  return (resp as any).data ?? null;
}

export async function comprarPaquete(paqueteId: number) {
  const resp = await api.post("/api/creditos/paquetes/comprar", { paqueteId });
  return (resp as any).data;
}

export async function comprarPlan(planId: number) {
  const resp = await api.post("/api/creditos/planes/comprar", { planId });
  return (resp as any).data;
}