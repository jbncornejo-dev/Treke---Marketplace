// apps/web/src/types/report.ts

// 🧑‍💻 Vistas de actividad de usuario
export interface UserLastActivityRow {
  usuario_id: number;
  email: string;
  ultima_actividad: string; // ISO
}

// 🧑‍💻 Vistas de ranking (vw_ranking_participacion + rankingMeWithPosition)
export interface RankingParticipacionRow {
  usuario_id: number;
  email: string;
  intercambios: number;
  compras_creditos: number;
  creditos_comprados: number;
  tiene_suscripcion: boolean;
  puntaje: number;
  rank_intercambios?: number; // sólo cuando viene de rankingMeWithPosition / WithPosition
}

// 💰 Vista vw_saldo_creditos_usuario
export interface SaldoCreditosUsuarioRow {
  usuario_id: number;
  saldo_disponible: number;
  saldo_retenido: number;
  saldo_total: number;
}

// 💳 Vista vw_creditos_comprados_por_usuario
export interface CreditosCompradosUsuarioRow {
  usuario_id: number;
  compras_ok: number;
  bs_total: string;        // NUMERIC(10,2) → string
  creditos_total: number;  // BIGINT/INT → number
}

// 📊 Resumen de dashboard de usuario (S.getUserSummary)
export interface UserDashboardSummary {
  actividad: UserLastActivityRow | null;
  ranking: RankingParticipacionRow | null;
  saldo: SaldoCreditosUsuarioRow | null;
  compras: CreditosCompradosUsuarioRow | null;
}

// 📈 /report/user/me/ranking → { me, top10 }
export interface UserRankingMe extends RankingParticipacionRow {
  rank_intercambios: number;
}

// Top 10 a partir de rankingTop10WithNombre
export interface RankingTopUsuario {
  usuario_id: number;
  intercambios_hechos: number;
  rank_intercambios: number;
  nombre: string;
}

export interface UserRankingData {
  me: UserRankingMe | null;
  top10: RankingTopUsuario[];
}

// 💵 Monetización global
export interface MonetizacionIngresosTotal {
  compras_ok: number;
  bs_total: string;
  creditos_total: number;
}

// 💵 Monetización por mes (vw_monetizacion_ingresos_por_mes)
export interface MonetizacionIngresosMes {
  periodo: string;      // ej: "2025-11"
  compras_ok: number;
  bs_total: string;
  creditos_total: number;
}

// 🌱 Impacto ambiental acumulado (vw_impacto_ambiental_total)
export interface ImpactoAmbientalTotal {
  co2: number;
  energia: number;
  agua: number;
  residuos: number;
  creditos: number;
}

// ⭐ Adopción de suscripción (vw_adopcion_suscripcion)
export interface AdopcionSuscripcion {
  total_registros: number;
  activas: number;
  usuarios_con_suscripcion: number;
  ratio_activas: number;
}

// 🔁 Totales de intercambios (vw_total_intercambios)
export interface TotalIntercambios {
  completados: number;
  activos: number;
  total: number;
}

// 🔄 Consumo vs generación (vw_consumo_vs_generacion)
export interface ConsumoVsGeneracion {
  origen: string; // ej: "COMPRA", "INTERCAMBIO"
  total: number;
}

// 📦 Intercambios por categoría (vw_intercambios_por_categorias)
export interface IntercambiosPorCategoria {
  categoria_id: number;
  categoria: string;
  intercambios: number;
}

// 📉 Ratio publicaciones vs intercambios (vw_ratio_demanda_por_categoria)
export interface RatioDemandaPorCategoria {
  categoria_id: number;
  categoria: string;
  total_publicaciones: number;
  total_intercambios_completados: number;
  ratio_intercambio_porcentaje: number;
}

// 👣 Participación en actividades sostenibles (vw_participacion_actividades_sostenibles)
export interface ParticipacionActividadSostenible {
  total_usuarios_participantes: number;
  total_creditos_otorgados: number;
  tipo_actividad: string;
}

// 📆 vista_publicaciones_por_mes
export interface PublicacionesPorMesRow {
  anio: number;
  mes_num: number;
  mes_nombre: string;
  total_publicaciones: number;
}

// 🖼️ vw_calidad_de_publicacion_fotografica
export interface CalidadPublicacionFotograficaRow {
  categoria: string;
  total_publicaciones_activas: number;
  publicaciones_sin_foto: number;
  porcentaje_sin_foto: number;
}

// 🧮 Dashboard global de admin (S.getAdminDashboard)
export interface AdminDashboard {
  ingresos_total: MonetizacionIngresosTotal | null;
   ingresos_por_dia?: MonetizacionIngresosDia[];
  ingresos_por_mes: MonetizacionIngresosMes[];
  impacto_total: ImpactoAmbientalTotal | null;
  adopcion_suscripcion: AdopcionSuscripcion | null;
  total_intercambios: TotalIntercambios | null;
  consumo_vs_generacion: ConsumoVsGeneracion[];
}

export interface UsuarioActivoPorRolRow {
  usuario_id: number;
  email: string;
  rol: string;
  ultima_actividad: string; // ISO
}
// apps/web/src/types/report.ts

// ============================================
// EMPRENDEDOR / ORG
// ============================================

export interface EmprendedorResumenRow {
  usuario_id: number;
  email: string;
  full_name: string | null;
  rol: string;
  publicaciones_activas: number;
  publicaciones_intercambiadas: number;
  intercambios_como_vendedor: number;
  creditos_ganados_por_ventas: number;
  calificacion_prom: number | string | null;
  total_resenias: number;
  total_co2_evitado: string | number;
  total_energia_ahorrada: string | number;
  total_agua_preservada: string | number;
  total_residuos_evitados: string | number;
}

export interface EmprendedorIngresoMensualRow {
  periodo: string; // "2025-01", etc.
  creditos_ganados: string | number;
}

export interface EmprendedorIngresoCategoriaRow {
  categoria_id: number;
  categoria: string;
  intercambios_completados: number;
  creditos_ganados_categoria: string | number;
}

export interface EmprendedorPublicacionDetalleRow {
  publicacion_id: number;
  titulo: string;
  estado_publicacion: string;
  valor_creditos: number;
  created_at: string;
  updated_at: string | null;
  intercambios_completados: number;
  ultima_venta: string | null;
  creditos_ganados_publicacion: string | number;
}

export interface EmprendedorImpactoCategoriaRow {
  categoria_id: number;
  categoria: string;
  factor_id: number;
  nombre_factor: string;
  unidad_medida: string;
  impacto_total: string | number;
}

export interface EmprendedorClienteRecurrenteRow {
  cliente_id: number;
  cliente_email: string;
  intercambios_completados: number;
}

/**
 * Dashboard completo de emprendedor / organización (OrgDashboard)
 * coincide con lo que devuelve getEmprendedorDashboard en backend
 */
export interface OrgDashboard {
  resumen: EmprendedorResumenRow | null;
  ingresos_mensuales: EmprendedorIngresoMensualRow[];
  ingresos_por_categoria: EmprendedorIngresoCategoriaRow[];
  publicaciones: EmprendedorPublicacionDetalleRow[];
  impacto_por_categoria: EmprendedorImpactoCategoriaRow[];
  clientes_recurrentes: EmprendedorClienteRecurrenteRow[];
}

// 💵 Monetización por día (vw_monetizacion_ingresos_por_dia)
export interface MonetizacionIngresosDia {
  fecha: string;        // '2025-11-26' (ISO date)
  compras_ok: number;
  bs_total: string;     // NUMERIC(10,2) → string
  creditos_total: number;
}
