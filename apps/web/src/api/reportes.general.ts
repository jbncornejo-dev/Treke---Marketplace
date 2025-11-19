import { api } from "./client";

export type RankingItem = {
  usuario_id: number;
  email: string;
  intercambios: number;
  compras_creditos: number;
  creditos_comprados: number;
  tiene_suscripcion: boolean;
  puntaje: number;
  pos: number;
};

export type InactivoItem = {
  usuario_id: number;
  email: string;
  ultima_actividad: string; // ISO
};

export type ImpactoTotal = {
  co2: string | number | null;
  energia: string | number | null;
  agua: string | number | null;
  residuos: string | number | null;
  creditos: string | number | null;
};

export type IntercambiosPorCat = {
  categoria_id: number;
  categoria: string;
  intercambios: number;
};

export type ResumenSistema = {
  total: { completados: number; activos: number; total: number };
  ratio: {
    publicaciones: number;
    intercambios: number;
    ratio_intercambio_por_publicacion: number;
  };
};

/** NUEVAS INTERFACES para los otros indicadores */

export type ImpactoPorCategoriaItem = {
  categoria_id: number;
  categoria: string;
  nombre_factor: string;
  unidad_medida: string;
  total_peso_kg: string | number | null;
  valor_por_kg: string | number | null;
  total_impacto: string | number | null;
};

export type ActividadSostenibleItem = {
  total_usuarios_participantes: number;
  total_creditos_otorgados: string | number | null;
  tipo_actividad: string;
};

export type UsuariosActivosRolItem = {
  rol_id: number;
  rol: string;
  usuarios_activos_30d: number;
};

// ==========================
// Wrappers que devuelven data
// ==========================

export const getRanking = async (limit = 10) => {
  const r = await api.get<{ ok: boolean; data: RankingItem[] }>(
    `/api/reportesgeneral/ranking?limit=${limit}`
  );
  return (r as any).data ?? (r as any);
};

export const getInactivos = async (days = 30) => {
  const r = await api.get<{ ok: boolean; data: InactivoItem[] }>(
    `/api/reportesgeneral/inactivos?days=${days}`
  );
  return (r as any).data ?? (r as any);
};

export const getImpacto = async () => {
  const r = await api.get<{ ok: boolean; data: ImpactoTotal }>(
    `/api/reportesgeneral/impacto-total`
  );
  return (r as any).data ?? (r as any);
};

export const getIntercambiosPorCat = async () => {
  const r = await api.get<{ ok: boolean; data: IntercambiosPorCat[] }>(
    `/api/reportesgeneral/intercambios-categoria`
  );
  return (r as any).data ?? (r as any);
};

export const getResumen = async () => {
  const r = await api.get<{ ok: boolean; data: ResumenSistema }>(
    `/api/reportesgeneral/ratio`
  );
  return (r as any).data ?? (r as any);
};

// NUEVOS endpoints

export const getImpactoPorCategoria = async () => {
  const r = await api.get<{ ok: boolean; data: ImpactoPorCategoriaItem[] }>(
    `/api/reportesgeneral/impacto-categoria`
  );
  return (r as any).data ?? (r as any);
};

export const getActividadesSostenibles = async () => {
  const r = await api.get<{ ok: boolean; data: ActividadSostenibleItem[] }>(
    `/api/reportesgeneral/actividades-sostenibles`
  );
  return (r as any).data ?? (r as any);
};

export const getUsuariosActivosPorRol = async () => {
  const r = await api.get<{ ok: boolean; data: UsuariosActivosRolItem[] }>(
    `/api/reportesgeneral/usuarios-activos-rol`
  );
  return (r as any).data ?? (r as any);
};
