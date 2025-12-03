// src/pages/admin/AdminReportsPage.tsx
import { useEffect, useState, type ReactNode } from "react";

import {
  getDashboard,
  getComunidad,
  getPublicaciones,
  getMonetizacion,
  getMonetizacionHistorico, // NUEVO
  getImpacto,
  getIntercambios,
} from "../../api/reports_admin";

import type {
  DashboardResponse,
  ComunidadResponse,
  PublicacionesResponse,
  MonetizacionResponse,
  MonetizacionHistoricoResponse, // NUEVO
  ImpactoResponse,
  IntercambiosResponse,
} from "../../api/reports_admin";

import SectionCard from "../../components/Reportes/SectionCard";

const tabs = [
  "Dashboard",
  "Comunidad",
  "Publicaciones & catálogo",
  "Monetización",
  "Impacto Ambiental",
  "Intercambios",
] as const;

type TabKey = (typeof tabs)[number];

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

  // NUEVO: estado para histórico de monetización y modo
  const [monetizacionHistorico, setMonetizacionHistorico] =
    useState<MonetizacionHistoricoResponse | null>(null);
  const [monetizacionModo, setMonetizacionModo] =
    useState<"reciente" | "historico">("reciente");
  const [loadingMonHist, setLoadingMonHist] = useState(false);
  const [errorMonHist, setErrorMonHist] = useState<string | null>(null);

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
          getMonetizacion(), // solo modo "reciente"
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
            // dashboard puede venir como { resumen: {...} } o directamente como {...}
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
                  value={
                    publicaciones.resumen.publicaciones_activas_mas_90d
                  }
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

            // Puede venir como { resumen_totales: {...} } o parecido
            const resumen =
              raw?.resumen_totales ?? raw?.resumen ?? raw;

            const usuariosPagadores = raw?.usuarios_pagadores_resumen ?? raw?.usuarios_pagadores;
            const ingresosPorFuente = raw?.ingresos_por_fuente ?? [];
            const rankingGasto = raw?.ranking_usuarios_gasto_total ?? raw?.ranking_gasto_total ?? [];
            const ingresosDia = raw?.ingresos_dia ?? [];
            const ingresosSemana = raw?.ingresos_semana ?? [];
            const ingresosMes = raw?.ingresos_mes ?? [];
            const ingresosAnio = raw?.ingresos_anio ?? [];
            const inflacionMensual = raw?.inflacion_creditos_mensual ?? raw?.inflacion_mensual ?? [];
            const creditosGanVsComp =
              raw?.creditos_ganados_vs_comprados ?? [];
            const rankingCreditosAcum =
              raw?.ranking_usuarios_creditos_acumulados ??
              raw?.ranking_creditos_acumulados ??
              [];

            // NUEVO: elegir dataset según modo
            const isHistorico = monetizacionModo === "historico";
            const ingresosDiaToShow = isHistorico
              ? monetizacionHistorico?.ingresos_dia_historico ?? ingresosDia
              : ingresosDia;
            const ingresosSemanaToShow = isHistorico
              ? monetizacionHistorico?.ingresos_semana_historico ??
                ingresosSemana
              : ingresosSemana;

            if (!resumen) {
              return (
                <SectionCard title="Resumen monetización">
                  <div className="text-xs text-neutral-400">
                    Sin datos de monetización disponibles.
                  </div>
                </SectionCard>
              );
            }

            return (
              <>
                {/* NUEVO: Toggle de modo reciente / histórico */}
                <SectionCard title="Modo de visualización">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-neutral-400">
                      {monetizacionModo === "reciente"
                        ? "Mostrando ingresos por día (última semana) e ingresos por semana (último mes)."
                        : "Mostrando histórico completo de ingresos por día y por semana."}
                    </div>
                    <div className="inline-flex rounded-full bg-neutral-800 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => setMonetizacionModo("reciente")}
                        className={[
                          "rounded-full px-3 py-1 transition",
                          monetizacionModo === "reciente"
                            ? "bg-emerald-500 text-neutral-900"
                            : "text-neutral-200",
                        ].join(" ")}
                      >
                        Reciente
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          // si ya lo tenemos en memoria, no volvemos a pedirlo
                          if (monetizacionHistorico) {
                            setMonetizacionModo("historico");
                            return;
                          }
                          try {
                            setLoadingMonHist(true);
                            setErrorMonHist(null);
                            const data = await getMonetizacionHistorico();
                            setMonetizacionHistorico(data);
                            setMonetizacionModo("historico");
                          } catch (e: any) {
                            console.error(
                              "Error cargando monetización histórica:",
                              e
                            );
                            setErrorMonHist(
                              e?.message ?? "Error cargando histórico"
                            );
                          } finally {
                            setLoadingMonHist(false);
                          }
                        }}
                        disabled={loadingMonHist}
                        className={[
                          "rounded-full px-3 py-1 transition",
                          monetizacionModo === "historico"
                            ? "bg-emerald-500 text-neutral-900"
                            : "text-neutral-200",
                          loadingMonHist ? "opacity-60" : "",
                        ].join(" ")}
                      >
                        {loadingMonHist ? "Cargando..." : "Histórico"}
                      </button>
                    </div>
                  </div>
                  {errorMonHist && (
                    <p className="mt-2 text-xs text-red-400">
                      {errorMonHist}
                    </p>
                  )}
                </SectionCard>

                {/* 1) Ingresos totales + créditos vendidos totales */}
                <SectionCard title="Resumen monetización">
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
                </SectionCard>

                {/* 2) Usuarios con al menos una compra vs sin pago */}
                <SectionCard title="Usuarios pagadores vs usuarios sin pago">
                  {usuariosPagadores ? (
                    <SimpleTable
                      headers={[
                        "Total usuarios",
                        "Pagadores",
                        "Sin pago",
                      ]}
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
                </SectionCard>

                {/* 3) Ingresos por créditos vs planes vs anuncios */}
                <SectionCard title="Ingresos por fuente (créditos / planes / anuncios)">
                  <SimpleTable
                    headers={["Fuente", "Ingresos (Bs)", "Créditos"]}
                    rows={ingresosPorFuente.map((r: any) => [
                      r.fuente,
                      r.ingresos_total_bs,
                      r.creditos_totales,
                    ])}
                  />
                </SectionCard>

                {/* 4) Ingresos por día */}
                <SectionCard
                  title={
                    monetizacionModo === "reciente"
                      ? "Ingresos por día (última semana)"
                      : "Ingresos por día (histórico)"
                  }
                >
                  <SimpleTable
                    headers={[
                      "Fecha",
                      "Total (Bs)",
                      "Créditos (Bs)",
                      "Planes (Bs)",
                      "Anuncios (Bs)",
                    ]}
                    rows={ingresosDiaToShow.map((r: any) => [
                      r.fecha_dia,
                      r.ingresos_total_bs,
                      r.ingresos_bs_creditos,
                      r.ingresos_bs_planes,
                      r.ingresos_bs_anuncios,
                    ])}
                  />
                </SectionCard>

                {/* 5) Ingresos por semana */}
                <SectionCard
                  title={
                    monetizacionModo === "reciente"
                      ? "Ingresos por semana (último mes)"
                      : "Ingresos por semana (histórico)"
                  }
                >
                  <SimpleTable
                    headers={[
                      "Semana",
                      "Fecha inicio",
                      "Total (Bs)",
                      "Créditos (Bs)",
                      "Planes (Bs)",
                      "Anuncios (Bs)",
                    ]}
                    rows={ingresosSemanaToShow.map((r: any) => [
                      `${r.anio_iso}-W${r.semana_iso}`,
                      r.semana_inicio,
                      r.ingresos_total_bs,
                      r.ingresos_bs_creditos,
                      r.ingresos_bs_planes,
                      r.ingresos_bs_anuncios,
                    ])}
                  />
                </SectionCard>

                {/* 6) Ingresos por mes (siempre histórico) */}
                <SectionCard title="Ingresos por mes (histórico)">
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
                </SectionCard>

                {/* 7) Ingresos por año (siempre histórico) */}
                <SectionCard title="Ingresos por año (histórico)">
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
                </SectionCard>

                {/* 8) Ranking usuarios que más gastaron */}
                <SectionCard title="Ranking usuarios que más gastaron (créditos, planes, anuncios)">
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
                </SectionCard>

                {/* 9) Inflación de créditos por mes */}
                <SectionCard title="Inflación de créditos por mes">
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
                </SectionCard>

                {/* 10) Créditos ganados vs comprados */}
                <SectionCard title="Créditos ganados vs comprados por usuario">
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
                </SectionCard>

                {/* 11) Usuarios con más créditos acumulados */}
                <SectionCard title="Usuarios con más créditos acumulados (ranking)">
                  <SimpleTable
                    headers={["#", "Usuario", "Saldo total de créditos"]}
                    rows={rankingCreditosAcum.map((r: any) => [
                      r.ranking,
                      r.full_name ?? r.email,
                      r.saldo_total,
                    ])}
                  />
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

function renderCellValue(v: ReactNode | null): ReactNode {
  if (v === null || v === undefined) return "-";

  // Caso especial: objetos tipo interval de pg (days, hours, minutes, milliseconds)
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

    // Fallback: por si llega algún otro objeto raro
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
