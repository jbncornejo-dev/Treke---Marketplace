// src/pages/admin/AdminReportsPage.tsx
import { useEffect, useState, type ReactNode } from "react";

import {
  getDashboard,
  getComunidad,
  getPublicaciones,
  getMonetizacion,
  getImpacto,
  getIntercambios,
} from "../../api/reports_admin";

import type {
  DashboardResponse,
  ComunidadResponse,
  PublicacionesResponse,
  MonetizacionResponse,
  ImpactoResponse,
  IntercambiosResponse,
} from "../../api/reports_admin";

import SectionCard from "../../components/Reportes/SectionCard";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const tabs = [
  "Dashboard",
  "Comunidad",
  "Publicaciones & catálogo",
  "Monetización",
  "Impacto Ambiental",
  "Intercambios",
] as const;

type TabKey = (typeof tabs)[number];

const CHART_COLORS = [
  "#10b981",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
  "#f97316",
  "#eab308",
  "#ec4899",
  "#06b6d4",
];

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("Dashboard");

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [comunidad, setComunidad] = useState<ComunidadResponse | null>(null);
  const [publicaciones, setPublicaciones] =
    useState<PublicacionesResponse | null>(null);
  const [monetizacion, setMonetizacion] =
    useState<MonetizacionResponse | null>(null);
  const [impacto, setImpacto] = useState<ImpactoResponse | null>(null);
  const [intercambios, setIntercambios] =
    useState<IntercambiosResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashR, comR, pubR, monR, impR, intR] = await Promise.all([
          getDashboard(),
          getComunidad(),
          getPublicaciones(),
          getMonetizacion(),
          getImpacto(),
          getIntercambios(),
        ]);

        setDashboard(dashR ?? null);
        setComunidad(comR ?? null);
        setPublicaciones(pubR ?? null);
        setMonetizacion(monR ?? null);
        setImpacto(impR ?? null);
        setIntercambios(intR ?? null);
      } catch (e: any) {
        console.error("Error cargando reportes admin:", e);
        setError(e?.message ?? "Error cargando reportes");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-neutral-300">
        Cargando reportes de administrador...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm text-red-400">{error}</p>
        <p className="text-xs text-neutral-400">
          Revisa la consola del backend por posibles errores en las vistas SQL.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Tabs superiores */}
      <div className="flex gap-2 rounded-full bg-neutral-900/70 p-1">
        {tabs.map((t) => {
          const active = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={[
                "rounded-full px-4 py-1 text-xs font-medium transition",
                active
                  ? "bg-emerald-500 text-neutral-900 shadow"
                  : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700",
              ].join(" ")}
            >
              {t}
            </button>
          );
        })}
      </div>

      {/* Contenido por tab */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* ============== DASHBOARD ============== */}
        {activeTab === "Dashboard" &&
          dashboard &&
          (() => {
            const raw = dashboard as any;
            const resumen = raw?.resumen ?? raw;

            if (!resumen) {
              return (
                <SectionCard title="Resumen general">
                  <div className="text-xs text-neutral-400">
                    Sin datos de dashboard disponibles.
                  </div>
                </SectionCard>
              );
            }

            return (
              <SectionCard title="Resumen general">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <KPI
                    label="Ingresos totales (Bs)"
                    value={resumen.ingresos_total_bs}
                  />
                  <KPI
                    label="Créditos vendidos"
                    value={resumen.creditos_vendidos_total}
                  />
                  <KPI
                    label="Usuarios registrados"
                    value={resumen.usuarios_registrados}
                  />
                  <KPI
                    label="Usuarios activos"
                    value={resumen.usuarios_activos}
                  />
                  <KPI
                    label="Intercambios completados"
                    value={resumen.intercambios_completados}
                  />
                  <KPI
                    label="CO₂ evitado (kg)"
                    value={resumen.impacto_total_co2_kg}
                  />
                  <KPI
                    label="Energía ahorrada (kWh)"
                    value={resumen.impacto_total_energia_kwh}
                  />
                  <KPI
                    label="Agua preservada (L)"
                    value={resumen.impacto_total_agua_l}
                  />
                </div>
              </SectionCard>
            );
          })()}

        {/* ============== COMUNIDAD ============== */}
        {activeTab === "Comunidad" && comunidad && (
          <>
            <SectionCard title="Usuarios por estado">
              <SimpleTable
                headers={["Estado", "Total"]}
                rows={(comunidad.estados ?? []).map((r) => [
                  r.estado,
                  r.total_usuarios,
                ])}
              />
            </SectionCard>

            <SectionCard title="Crecimiento mensual">
              <SimpleTable
                headers={["Periodo", "Nuevos", "Acumulado"]}
                rows={(comunidad.crecimiento_mensual ?? []).map((r) => [
                  r.periodo,
                  r.usuarios_nuevos_mes,
                  r.total_acumulado,
                ])}
              />
            </SectionCard>

            <SectionCard title="Crecimiento trimestral">
              <SimpleTable
                headers={["Periodo", "Nuevos", "Acumulado"]}
                rows={(comunidad.crecimiento_trimestral ?? []).map((r) => [
                  r.periodo_label,
                  r.usuarios_nuevos_trimestre,
                  r.total_acumulado,
                ])}
              />
            </SectionCard>

            <SectionCard title="Crecimiento anual">
              <SimpleTable
                headers={["Año", "Nuevos", "Acumulado"]}
                rows={(comunidad.crecimiento_anual ?? []).map((r) => [
                  r.anio,
                  r.usuarios_nuevos_anio,
                  r.total_acumulado,
                ])}
              />
            </SectionCard>

            <SectionCard title="Usuarios inactivos &gt; 30 días">
              <SimpleTable
                headers={["Nombre", "Email", "Último login", "Intervalo"]}
                rows={(comunidad.inactivos_30d ?? []).map((r) => [
                  r.full_name ?? "-",
                  r.email,
                  r.ultimo_login,
                  r.intervalo_desde_ultimo_login,
                ])}
              />
            </SectionCard>

            <SectionCard title="Actividad reciente de usuarios">
              <SimpleTable
                headers={["Nombre", "Email", "Última actividad", "Tipo"]}
                rows={(comunidad.actividad_reciente ?? []).map((r) => [
                  r.full_name ?? "-",
                  r.email,
                  r.ultima_actividad,
                  r.tipo_actividad,
                ])}
              />
            </SectionCard>

            <SectionCard title="Ranking por intercambios (TOP 10)">
              <SimpleTable
                headers={["#", "Usuario", "Intercambios"]}
                rows={(comunidad.ranking_intercambios ?? []).map((r) => [
                  r.ranking,
                  r.full_name ?? r.email,
                  r.intercambios_completados,
                ])}
              />
            </SectionCard>

            <SectionCard title="Ranking participación (TOP 10)">
              <SimpleTable
                headers={[
                  "#",
                  "Usuario",
                  "Puntaje",
                  "Intercambios",
                  "Compras créditos",
                ]}
                rows={(comunidad.ranking_participacion ?? []).map((r) => [
                  r.ranking,
                  r.full_name ?? r.email,
                  r.puntaje,
                  r.intercambios,
                  r.compras_creditos,
                ])}
              />
            </SectionCard>

            <SectionCard title="Mejor reputación (TOP 10)">
              <SimpleTable
                headers={["#", "Usuario", "Promedio", "Reseñas"]}
                rows={(comunidad.ranking_reputacion_mejor ?? []).map((r) => [
                  r.ranking,
                  r.full_name ?? r.email,
                  r.calificacion_prom,
                  r.total_resenias,
                ])}
              />
            </SectionCard>

            <SectionCard title="Peor reputación (TOP 10)">
              <SimpleTable
                headers={["#", "Usuario", "Promedio", "Reseñas"]}
                rows={(comunidad.ranking_reputacion_peor ?? []).map((r) => [
                  r.ranking,
                  r.full_name ?? r.email,
                  r.calificacion_prom,
                  r.total_resenias,
                ])}
              />
            </SectionCard>
          </>
        )}

        {/* ============== PUBLICACIONES & CATÁLOGO ============== */}
        {activeTab === "Publicaciones & catálogo" && publicaciones && (
          <>
            <SectionCard title="Resumen de publicaciones">
              <div className="grid grid-cols-1 gap-2 text-sm">
                <KPI
                  label="Total publicaciones"
                  value={publicaciones.resumen.total_publicaciones}
                />
                <KPI
                  label="Con favoritos"
                  value={publicaciones.resumen.publicaciones_con_favoritos}
                />
                <KPI
                  label="Activas &gt; 90 días"
                  value={publicaciones.resumen.publicaciones_activas_mas_90d}
                />
              </div>
            </SectionCard>

            <SectionCard title="Publicaciones activas &gt; 90 días">
              <SimpleTable
                headers={["Título", "Dueño", "Ubicación", "Intervalo activa"]}
                rows={(publicaciones.activas_mas_90d ?? []).map((r) => [
                  r.titulo,
                  r.dueno_nombre ?? r.dueno_email,
                  r.ubicacion_texto,
                  r.intervalo_activa,
                ])}
              />
            </SectionCard>

            <SectionCard title="Publicaciones por categoría">
              <SimpleTable
                headers={["Categoría", "Total publicaciones"]}
                rows={(publicaciones.por_categoria ?? []).map((r) => [
                  r.categoria_nombre,
                  r.total_publicaciones,
                ])}
              />
            </SectionCard>

            <SectionCard title="Publicaciones por ubicación">
              <SimpleTable
                headers={["Ubicación", "Total publicaciones"]}
                rows={(publicaciones.por_ubicacion ?? []).map((r) => [
                  r.ubicacion_texto,
                  r.total_publicaciones ?? r.total_publicaciones,
                ])}
              />
            </SectionCard>

            <SectionCard title="Intercambiadas vs no intercambiadas">
              <SimpleTable
                headers={["Total", "Intercambiadas", "No intercambiadas"]}
                rows={[
                  [
                    publicaciones.intercambiadas_resumen.total_publicaciones,
                    publicaciones.intercambiadas_resumen
                      .publicaciones_intercambiadas,
                    publicaciones.intercambiadas_resumen
                      .publicaciones_no_intercambiadas,
                  ],
                ]}
              />
            </SectionCard>
          </>
        )}

        {/* ============== MONETIZACIÓN ============== */}
{activeTab === "Monetización" &&
  monetizacion &&
  (() => {
    const raw = monetizacion as any;

    const resumen =
      raw?.resumen_totales ?? raw?.resumen ?? raw;

    const usuariosPagadores =
      raw?.usuarios_pagadores_resumen ?? raw?.usuarios_pagadores;
    const ingresosPorFuente = raw?.ingresos_por_fuente ?? [];
    const rankingGasto =
      raw?.ranking_usuarios_gasto_total ?? raw?.ranking_gasto_total ?? [];
    const ingresosDia = raw?.ingresos_dia ?? [];
    const ingresosSemana = raw?.ingresos_semana ?? [];
    const ingresosMes = raw?.ingresos_mes ?? [];
    const ingresosAnio = raw?.ingresos_anio ?? [];
    const inflacionMensual =
      raw?.inflacion_creditos_mensual ?? raw?.inflacion_mensual ?? [];
    const creditosGanVsComp =
      raw?.creditos_ganados_vs_comprados ?? [];
    const rankingCreditosAcum =
      raw?.ranking_usuarios_creditos_acumulados ??
      raw?.ranking_creditos_acumulados ??
      [];

    if (!resumen) {
      return (
        <SectionCard title="Resumen monetización">
          <div className="text-xs text-neutral-400">
            Sin datos de monetización disponibles.
          </div>
        </SectionCard>
      );
    }

    const resumenDistribucion = [
      {
        name: "Créditos",
        value: Number(resumen.ingresos_bs_creditos ?? 0),
      },
      {
        name: "Planes",
        value: Number(resumen.ingresos_bs_planes ?? 0),
      },
      {
        name: "Anuncios",
        value: Number(resumen.ingresos_bs_anuncios ?? 0),
      },
    ];

    return (
      <>
        {/* 1) Resumen monetización + gráfico de distribución */}
        <SectionCard title="Resumen monetización">
          <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <KPI
                label="Ingresos totales (Bs)"
                value={resumen.ingresos_total_bs}
              />
              <KPI
                label="Créditos vendidos totales"
                value={resumen.creditos_vendidos_creditos}
              />
              <KPI
                label="Ingresos por planes (Bs)"
                value={resumen.ingresos_bs_planes}
              />
              <KPI
                label="Ingresos por anuncios (Bs)"
                value={resumen.ingresos_bs_anuncios}
              />
            </div>
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={resumenDistribucion}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {resumenDistribucion.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartWrapper>
          </div>
        </SectionCard>

        {/* 2) Usuarios pagadores vs sin pago (gráfico + tabla) */}
        <SectionCard title="Usuarios pagadores vs usuarios sin pago">
          <div className="grid gap-4 lg:grid-cols-[1.2fr,1fr]">
            <div>
              {usuariosPagadores ? (
                <SimpleTable
                  headers={["Total usuarios", "Pagadores", "Sin pago"]}
                  rows={[
                    [
                      usuariosPagadores.total_usuarios,
                      usuariosPagadores.usuarios_pagadores,
                      usuariosPagadores.usuarios_sin_pago,
                    ],
                  ]}
                />
              ) : (
                <div className="text-xs text-neutral-400">
                  Sin datos de usuarios pagadores.
                </div>
              )}
            </div>
            {usuariosPagadores && (
              <ChartWrapper>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        {
                          name: "Pagadores",
                          value:
                            Number(
                              usuariosPagadores.usuarios_pagadores ?? 0
                            ) || 0,
                        },
                        {
                          name: "Sin pago",
                          value:
                            Number(
                              usuariosPagadores.usuarios_sin_pago ?? 0
                            ) || 0,
                        },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#4b5563" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartWrapper>
            )}
          </div>
        </SectionCard>

        {/* 3) Ingresos por fuente (barras mejoradas + tabla) */}
        <SectionCard title="Ingresos por fuente (créditos / planes / anuncios)">
          <div className="grid gap-4 lg:grid-cols-[1.3fr,1fr]">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ingresosPorFuente.map((r: any) => ({
                    name: r.fuente,
                    ingresos: Number(r.ingresos_total_bs ?? 0),
                    creditos: Number(r.creditos_totales ?? 0),
                  }))}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos (Bs)"
                    barSize={28}
                    radius={[8, 8, 8, 8]}
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>
            <SimpleTable
              headers={["Fuente", "Ingresos (Bs)", "Créditos"]}
              rows={ingresosPorFuente.map((r: any) => [
                r.fuente,
                r.ingresos_total_bs,
                r.creditos_totales,
              ])}
            />
          </div>
        </SectionCard>

        {/* 4) Ingresos por día (línea + tabla) */}
        <SectionCard title="Ingresos por día">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ingresosDia.map((r: any) => ({
                    fecha: r.fecha_dia,
                    total: Number(r.ingresos_total_bs ?? 0),
                    creditos: Number(r.ingresos_bs_creditos ?? 0),
                    planes: Number(r.ingresos_bs_planes ?? 0),
                    anuncios: Number(r.ingresos_bs_anuncios ?? 0),
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total (Bs)"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="creditos"
                    name="Créditos (Bs)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planes"
                    name="Planes (Bs)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="anuncios"
                    name="Anuncios (Bs)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Fecha",
                "Total (Bs)",
                "Créditos (Bs)",
                "Planes (Bs)",
                "Anuncios (Bs)",
              ]}
              rows={ingresosDia.map((r: any) => [
                r.fecha_dia,
                r.ingresos_total_bs,
                r.ingresos_bs_creditos,
                r.ingresos_bs_planes,
                r.ingresos_bs_anuncios,
              ])}
            />
          </div>
        </SectionCard>

        {/* 5) Ingresos por semana (línea + tabla) */}
        <SectionCard title="Ingresos por semana">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ingresosSemana.map((r: any) => ({
                    semana: `${r.anio_iso}-W${r.semana_iso}`,
                    total: Number(r.ingresos_total_bs ?? 0),
                    creditos: Number(r.ingresos_bs_creditos ?? 0),
                    planes: Number(r.ingresos_bs_planes ?? 0),
                    anuncios: Number(r.ingresos_bs_anuncios ?? 0),
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="semana" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total (Bs)"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="creditos"
                    name="Créditos (Bs)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planes"
                    name="Planes (Bs)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="anuncios"
                    name="Anuncios (Bs)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Semana",
                "Fecha inicio",
                "Total (Bs)",
                "Créditos (Bs)",
                "Planes (Bs)",
                "Anuncios (Bs)",
              ]}
              rows={ingresosSemana.map((r: any) => [
                `${r.anio_iso}-W${r.semana_iso}`,
                r.semana_inicio,
                r.ingresos_total_bs,
                r.ingresos_bs_creditos,
                r.ingresos_bs_planes,
                r.ingresos_bs_anuncios,
              ])}
            />
          </div>
        </SectionCard>

        {/* 6) Ingresos por mes (línea + tabla) */}
        <SectionCard title="Ingresos por mes">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ingresosMes.map((r: any) => ({
                    periodo: r.periodo_label,
                    total: Number(r.ingresos_total_bs ?? 0),
                    creditos: Number(r.ingresos_bs_creditos ?? 0),
                    planes: Number(r.ingresos_bs_planes ?? 0),
                    anuncios: Number(r.ingresos_bs_anuncios ?? 0),
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total (Bs)"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="creditos"
                    name="Créditos (Bs)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planes"
                    name="Planes (Bs)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="anuncios"
                    name="Anuncios (Bs)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Mes",
                "Total (Bs)",
                "Créditos (Bs)",
                "Planes (Bs)",
                "Anuncios (Bs)",
                "Créditos vendidos",
              ]}
              rows={ingresosMes.map((r: any) => [
                r.periodo_label,
                r.ingresos_total_bs,
                r.ingresos_bs_creditos,
                r.ingresos_bs_planes,
                r.ingresos_bs_anuncios,
                r.creditos_vendidos_creditos,
              ])}
            />
          </div>
        </SectionCard>

        {/* 7) Ingresos por año (línea + tabla) */}
        <SectionCard title="Ingresos por año">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={ingresosAnio.map((r: any) => ({
                    anio: r.anio,
                    total: Number(r.ingresos_total_bs ?? 0),
                    creditos: Number(r.ingresos_bs_creditos ?? 0),
                    planes: Number(r.ingresos_bs_planes ?? 0),
                    anuncios: Number(r.ingresos_bs_anuncios ?? 0),
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total (Bs)"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="creditos"
                    name="Créditos (Bs)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="planes"
                    name="Planes (Bs)"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="anuncios"
                    name="Anuncios (Bs)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Año",
                "Total (Bs)",
                "Créditos (Bs)",
                "Planes (Bs)",
                "Anuncios (Bs)",
                "Créditos vendidos",
              ]}
              rows={ingresosAnio.map((r: any) => [
                r.anio,
                r.ingresos_total_bs,
                r.ingresos_bs_creditos,
                r.ingresos_bs_planes,
                r.ingresos_bs_anuncios,
                r.creditos_vendidos_creditos,
              ])}
            />
          </div>
        </SectionCard>

        {/* 8) Ranking usuarios que más gastaron (barras bonitas + tabla) */}
        <SectionCard title="Ranking usuarios que más gastaron (créditos, planes, anuncios)">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankingGasto.map((r: any) => ({
                    name: r.full_name ?? r.email,
                    total: Number(r.gasto_total_bs ?? 0),
                  }))}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 80,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={160}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="total"
                    name="Total (Bs)"
                    barSize={22}
                    radius={[6, 6, 6, 6]}
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "#",
                "Usuario",
                "Gasto créditos (Bs)",
                "Gasto planes (Bs)",
                "Gasto anuncios (Bs)",
                "Total (Bs)",
              ]}
              rows={rankingGasto.map((r: any) => [
                r.ranking,
                r.full_name ?? r.email,
                r.gasto_creditos_bs,
                r.gasto_planes_bs,
                r.gasto_anuncios_bs,
                r.gasto_total_bs,
              ])}
            />
          </div>
        </SectionCard>

        {/* 9) Inflación de créditos por mes (línea + tabla) */}
        <SectionCard title="Inflación de créditos por mes">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={inflacionMensual.map((r: any) => ({
                    periodo: r.periodo_label,
                    generados: Number(r.creditos_generados ?? 0),
                    gastados: Number(r.creditos_gastados ?? 0),
                    inflacion: Number(r.inflacion_neta ?? 0),
                  }))}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="generados"
                    name="Generados"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="gastados"
                    name="Gastados"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="inflacion"
                    name="Inflación neta"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Mes",
                "Créditos generados",
                "Créditos gastados",
                "Inflación neta",
              ]}
              rows={inflacionMensual.map((r: any) => [
                r.periodo_label,
                r.creditos_generados,
                r.creditos_gastados,
                r.inflacion_neta,
              ])}
            />
          </div>
        </SectionCard>

        {/* 10) Créditos ganados vs comprados por usuario (barras mejoradas + tabla) */}
        <SectionCard title="Créditos ganados vs comprados por usuario">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={creditosGanVsComp.map((r: any) => ({
                    name: r.full_name ?? r.email,
                    comprados: Number(r.creditos_comprados ?? 0),
                    ganados: Number(r.creditos_ganados ?? 0),
                  }))}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 80,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={160}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="comprados"
                    name="Comprados"
                    barSize={20}
                    radius={[6, 6, 6, 6]}
                    fill="#3b82f6"
                  />
                  <Bar
                    dataKey="ganados"
                    name="Ganados"
                    barSize={20}
                    radius={[6, 6, 6, 6]}
                    fill="#10b981"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={[
                "Usuario",
                "Créditos comprados",
                "Créditos ganados",
                "Total créditos",
                "% comprados",
              ]}
              rows={creditosGanVsComp.map((r: any) => [
                r.full_name ?? r.email,
                r.creditos_comprados,
                r.creditos_ganados,
                r.total_creditos,
                r.porcentaje_comprado,
              ])}
            />
          </div>
        </SectionCard>

        {/* 11) Usuarios con más créditos acumulados (barras mejoradas + tabla) */}
        <SectionCard title="Usuarios con más créditos acumulados (ranking)">
          <div className="space-y-3">
            <ChartWrapper>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={rankingCreditosAcum.map((r: any) => ({
                    name: r.full_name ?? r.email,
                    saldo: Number(r.saldo_total ?? 0),
                  }))}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 80,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={160}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="saldo"
                    name="Saldo total"
                    barSize={22}
                    radius={[6, 6, 6, 6]}
                    fill="#a855f7"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartWrapper>

            <SimpleTable
              headers={["#", "Usuario", "Saldo total de créditos"]}
              rows={rankingCreditosAcum.map((r: any) => [
                r.ranking,
                r.full_name ?? r.email,
                r.saldo_total,
              ])}
            />
          </div>
        </SectionCard>
      </>
    );
  })()}

        {/* ============== IMPACTO AMBIENTAL ============== */}
        {activeTab === "Impacto Ambiental" && impacto && (
          <>
            <SectionCard title="Totales globales">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <KPI
                  label="CO₂ evitado (kg)"
                  value={impacto.totales.total_co2_evitado}
                />
                <KPI
                  label="Energía ahorrada (kWh)"
                  value={impacto.totales.total_energia_ahorrada}
                />
                <KPI
                  label="Agua preservada (L)"
                  value={impacto.totales.total_agua_preservada}
                />
                <KPI
                  label="Residuos evitados (kg)"
                  value={impacto.totales.total_residuos_evitados}
                />
              </div>
            </SectionCard>

            <SectionCard title="Impacto por factor">
              <SimpleTable
                headers={["Factor", "Unidad", "Valor total"]}
                rows={(impacto.totales_por_factor ?? []).map((r) => [
                  r.nombre_factor,
                  r.unidad_medida,
                  r.valor_total,
                ])}
              />
            </SectionCard>

            <SectionCard title="Impacto por rol">
              <SimpleTable
                headers={[
                  "Rol",
                  "Usuarios",
                  "CO₂ (kg)",
                  "Energía",
                  "Agua",
                  "Residuos",
                ]}
                rows={(impacto.por_rol ?? []).map((r) => [
                  r.rol_nombre,
                  r.total_usuarios,
                  r.total_co2_evitado,
                  r.total_energia_ahorrada,
                  r.total_agua_preservada,
                  r.total_residuos_evitados,
                ])}
              />
            </SectionCard>

            <SectionCard title="Ranking usuarios por impacto (TOP 10)">
              <SimpleTable
                headers={["#", "Usuario", "CO₂ (kg)", "Créditos verdes"]}
                rows={(impacto.ranking_usuarios ?? []).map((r) => [
                  r.ranking,
                  r.full_name ?? r.email,
                  r.total_co2_evitado,
                  r.total_creditos_ganados,
                ])}
              />
            </SectionCard>

            <SectionCard title="Impacto por categoría">
              <SimpleTable
                headers={[
                  "Categoría",
                  "Factor",
                  "Unidad",
                  "Impacto total",
                  "Peso total (kg)",
                ]}
                rows={(impacto.por_categoria ?? []).map((r) => [
                  r.categoria_nombre,
                  r.nombre_factor,
                  r.unidad_medida,
                  r.impacto_total,
                  r.peso_total_kg,
                ])}
              />
            </SectionCard>

            <SectionCard title="Impacto por ubicación">
              <SimpleTable
                headers={[
                  "Ubicación",
                  "Factor",
                  "Unidad",
                  "Impacto total",
                  "Peso total (kg)",
                ]}
                rows={(impacto.por_ubicacion ?? []).map((r) => [
                  r.ubicacion_texto,
                  r.nombre_factor,
                  r.unidad_medida,
                  r.impacto_total,
                  r.peso_total_kg,
                ])}
              />
            </SectionCard>
          </>
        )}

        {/* ============== INTERCAMBIOS ============== */}
        {activeTab === "Intercambios" && intercambios && (
          <>
            <SectionCard title="Resumen de estados">
              <SimpleTable
                headers={[
                  "Total",
                  "Completados",
                  "Pendientes",
                  "Cancelados",
                  "Expirados",
                ]}
                rows={[
                  [
                    intercambios.resumen.total_intercambios,
                    intercambios.resumen.intercambios_completados,
                    intercambios.resumen.intercambios_pendientes,
                    intercambios.resumen.intercambios_cancelados,
                    intercambios.resumen.intercambios_expirados,
                  ],
                ]}
              />
            </SectionCard>

            <SectionCard title="Conteo por estado">
              <SimpleTable
                headers={["Estado", "Total"]}
                rows={(intercambios.estados_conteo ?? []).map((r) => [
                  r.estado,
                  r.total,
                ])}
              />
            </SectionCard>

            <SectionCard title="Intercambios por categoría">
              <SimpleTable
                headers={["Categoría", "Intercambios completados"]}
                rows={(intercambios.por_categoria ?? []).map((r) => [
                  r.categoria_nombre,
                  r.intercambios_completados,
                ])}
              />
            </SectionCard>

            <SectionCard title="Categorías más populares (TOP 10)">
              <SimpleTable
                headers={["#", "Categoría", "Intercambios completados"]}
                rows={(intercambios.categorias_populares ?? []).map((r) => [
                  r.ranking,
                  r.categoria_nombre,
                  r.intercambios_completados,
                ])}
              />
            </SectionCard>

            <SectionCard title="Intercambios por ubicación">
              <SimpleTable
                headers={["Ubicación", "Intercambios completados"]}
                rows={(intercambios.por_ubicacion ?? []).map((r) => [
                  r.ubicacion_texto,
                  r.intercambios_completados,
                ])}
              />
            </SectionCard>
          </>
        )}
      </div>
    </div>
  );
}

// ============== COMPONENTES DE APOYO ==============

function KPI({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col rounded-xl bg-neutral-900/70 px-3 py-2">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-semibold text-neutral-50">
        {value ?? "-"}
      </span>
    </div>
  );
}

function ChartWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="h-64 w-full rounded-xl bg-neutral-950/70 px-2 py-2">
      {children}
    </div>
  );
}

function renderCellValue(v: ReactNode | null): ReactNode {
  if (v === null || v === undefined) return "-";

  if (typeof v === "object") {
    const anyV: any = v;

    if (
      "days" in anyV ||
      "hours" in anyV ||
      "minutes" in anyV ||
      "milliseconds" in anyV
    ) {
      const d = anyV.days ?? 0;
      const h = anyV.hours ?? 0;
      const m = anyV.minutes ?? 0;
      return `${d}d ${h}h ${m}m`;
    }

    return JSON.stringify(v);
  }

  return v;
}

function SimpleTable({
  headers,
  rows,
}: {
  headers: ReactNode[];
  rows: (ReactNode | null)[][];
}) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-neutral-800">
      <table className="min-w-full text-left text-xs text-neutral-200">
        <thead className="bg-neutral-900/80 text-[11px] uppercase text-neutral-400">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-800 bg-neutral-950/60">
          {(!rows || rows.length === 0) && (
            <tr>
              <td
                className="px-3 py-3 text-center text-neutral-500"
                colSpan={headers.length}
              >
                Sin datos
              </td>
            </tr>
          )}
          {rows.map((r, ri) => (
            <tr key={ri}>
              {r.map((v, ci) => (
                <td key={ci} className="px-3 py-2">
                  {renderCellValue(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
