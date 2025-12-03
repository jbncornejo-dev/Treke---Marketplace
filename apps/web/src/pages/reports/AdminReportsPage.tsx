import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* ============================================
 * Colores para los gráficos
 * ============================================ */

const CHART_COLORS = [
  "#22c55e", // emerald
  "#0ea5e9", // sky
  "#eab308", // amber
  "#f97316", // orange
  "#a855f7", // violet
  "#ef4444", // red
  "#14b8a6", // teal
  "#6366f1", // indigo
];

/* ============================================
 * Tipos de datos (adaptados al backend)
 * ============================================ */

type MonetizacionResumen = {
  ingresos_total: {
    compras_ok: number;
    bs_total: string;
    creditos_total: string;
  } | null;
  ingresos_por_mes: any[];
  ingresos_por_semana: any[];
  ingresos_por_anio: any[];
};

type ComunidadResumen = {
  usuarios_por_estado: any[];
  usuarios_activos_por_rol: any[];
  crecimiento_comunidad_mensual: any[];
};

type ImpactoAdminReport = {
  impacto_total: {
    co2: string;
    energia: string;
    agua: string;
    residuos: string;
    creditos: string;
  } | null;
  impacto_por_categoria: any[];
  participacion_actividades_sostenibles: any[];
  impacto_mensual: any[];
  top_usuarios_impacto: any[];
  eficiencia_impacto_por_credito: any[];
  impacto_por_rol: any[];
};

type IntercambiosResumen = {
  total_intercambios: {
    completados: number;
    activos: number;
    total: number;
  } | null;
  intercambios_por_categorias: any[];
};

type AdminDashboardGlobal = {
  monetizacion_resumen: MonetizacionResumen;
  comunidad_resumen: ComunidadResumen;
  impacto_resumen: ImpactoAdminReport;
  intercambios_resumen: IntercambiosResumen;
};

type AdminComunidadReport = {
  actividad_usuarios: any[];
  usuarios_inactivos_30d: any[];
  usuarios_por_estado: any[];
  usuarios_activos_por_rol: any[];
  crecimiento_comunidad_mensual: any[];
  crecimiento_comunidad_trimestral: any[];
};

type AdminPublicacionesReport = {
  publicaciones_por_mes: any[];
  publicaciones_por_status_y_categoria: any[];
  publicaciones_por_antiguedad_y_estado: any[];
  alertas_publicaciones_antiguas: any[];
  top_publicaciones_por_favoritos: any[];
  actividad_por_ubicacion: any[];
  calidad_publicacion_fotografica: any[];
  valor_promedio_inventario_mensual: any[];
  tasa_abandono_carritos: any[];
};

type AdminIntercambiosReport = {
  total_intercambios: IntercambiosResumen["total_intercambios"];
  intercambios_por_categorias: any[];
  ratio_demanda_por_categoria: any[];
  categorias_intercambio_popular: any[];
  volumen_mensajeria_por_propuesta: any[];
  transacciones_sin_resenia: any[];
};

type AdminMonetizacionReport = {
  ingresos_total: MonetizacionResumen["ingresos_total"];
  ingresos_por_mes: any[];
  ingresos_por_semana: any[];
  ingresos_por_anio: any[];
  creditos_comprados_por_usuario: any[];
  saldos_creditos_usuarios: any[];
  consumo_vs_generacion: any[];
  ingresos_por_venta_de_creditos: any[];
  crecimiento_creditos_mensual: any[];
  crecimiento_creditos_trimestral: any[];
  ingreso_promedio_por_usuario_pagador: any[];
  mrr_por_plan: any[];
  distribucion_de_saldos: any[];
  distribucion_saldo_creditos_rangos: any[];
  distribucion_origen_creditos_mensual: any[];
  liquidez_creditos_usuario: any[];
  inversion_usuario_creditos: any[];
  creditos_ganados_vs_comprados: any[];
};

type AdminImpactoReport = ImpactoAdminReport;

type AdminSuscripcionesRankingReport = {
  ranking_participacion: any[];
  ranking_participacion_con_posicion: any[];
  ranking_top10: any[];
  adopcion_suscripcion: any | null;
  retencion_suscripcion_por_plan: any[];
  usuarios_por_tipo_suscripcion: any[];
  ranking_reputacion: any[];
  usuarios_solo_bonos_cero_inversion: any[];
  usuarios_ganadores_de_bonos_premium: any[];
};

/* ============================================
 * UI Helpers
 * ============================================ */

type TabKey =
  | "dashboard"
  | "comunidad"
  | "publicaciones"
  | "monetizacion"
  | "impacto"
  | "intercambios"
  | "suscripciones";

const TABS: { key: TabKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "comunidad", label: "Comunidad" },
  { key: "publicaciones", label: "Publicaciones & catálogo" },
  { key: "monetizacion", label: "Monetización" },
  { key: "impacto", label: "Impacto Ambiental" },
  { key: "intercambios", label: "Intercambios" },
  { key: "suscripciones", label: "Suscripciones & Ranking" },
];

function KpiCard(props: {
  title: string;
  value: string | number | null | undefined;
  subtitle?: string;
}) {
  const { title, value, subtitle } = props;
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 shadow-md">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">
        {value ?? "-"}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-400">{subtitle}</div>
      )}
    </div>
  );
}

function SectionCard(props: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-300">
        {props.title}
      </h2>
      {props.description && (
        <p className="mb-3 text-xs text-slate-400">{props.description}</p>
      )}
      {props.children}
    </section>
  );
}

function SimpleTable(props: {
  columns: { key: string; label: string }[];
  rows: any[];
  maxRows?: number;
}) {
  const { columns, rows, maxRows = 5 } = props;
  const safeRows = rows ?? [];
  const sliced = safeRows.slice(0, maxRows);
  if (!sliced.length) {
    return (
      <p className="text-sm text-slate-500">
        No hay datos suficientes para esta tabla.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto text-sm">
      <table className="min-w-full border-separate border-spacing-y-1">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className="border-b border-slate-800 bg-slate-900 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sliced.map((row, idx) => (
            <tr key={idx} className="hover:bg-slate-900/80">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-1.5 text-slate-100/90">
                  {String(row?.[c.key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {safeRows.length > maxRows && (
        <p className="mt-2 text-xs text-slate-500">
          Mostrando {maxRows} de {safeRows.length} filas. Ajusta esta tabla si
          necesitas paginación.
        </p>
      )}
    </div>
  );
}

/* ============================================
 * Página principal de reportes admin
 * ============================================ */

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dashboard, setDashboard] = useState<AdminDashboardGlobal | null>(null);
  const [comunidad, setComunidad] = useState<AdminComunidadReport | null>(null);
  const [publicaciones, setPublicaciones] =
    useState<AdminPublicacionesReport | null>(null);
  const [intercambios, setIntercambios] =
    useState<AdminIntercambiosReport | null>(null);
  const [monetizacion, setMonetizacion] =
    useState<AdminMonetizacionReport | null>(null);
  const [impacto, setImpacto] = useState<AdminImpactoReport | null>(null);
  const [suscripciones, setSuscripciones] =
    useState<AdminSuscripcionesRankingReport | null>(null);
  const [monetizacionDia, setMonetizacionDia] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          dashRes,
          comRes,
          pubRes,
          intRes,
          monRes,
          impRes,
          susRes,
          monDiaRes,
        ] = await Promise.all([
          fetch("/api/admin/reportes/dashboard"),
          fetch("/api/admin/reportes/comunidad"),
          fetch("/api/admin/reportes/publicaciones"),
          fetch("/api/admin/reportes/intercambios"),
          fetch("/api/admin/reportes/monetizacion"),
          fetch("/api/admin/reportes/impacto"),
          fetch("/api/admin/reportes/suscripciones-ranking"),
          fetch("/api/admin/reportes/monetizacion-dia"),
        ]);

        if (
          !dashRes.ok ||
          !comRes.ok ||
          !pubRes.ok ||
          !intRes.ok ||
          !monRes.ok ||
          !impRes.ok ||
          !susRes.ok ||
          !monDiaRes.ok
        ) {
          throw new Error("Alguna petición HTTP falló");
        }

        const [
          dashJson,
          comJson,
          pubJson,
          intJson,
          monJson,
          impJson,
          susJson,
          monDiaJson,
        ] = await Promise.all([
          dashRes.json(),
          comRes.json(),
          pubRes.json(),
          intRes.json(),
          monRes.json(),
          impRes.json(),
          susRes.json(),
          monDiaRes.json(),
        ]);

        setDashboard(dashJson);
        setComunidad(comJson);
        setPublicaciones(pubJson);
        setIntercambios(intJson);
        setMonetizacion(monJson);
        setImpacto(impJson);
        setSuscripciones(susJson);
        setMonetizacionDia(monDiaJson);
      } catch (e: any) {
        console.error(e);
        setError(
          e?.message || "Error al cargar los reportes del administrador."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-slate-200">
        <p className="animate-pulse text-sm text-slate-400">
          Cargando reportes del administrador...
        </p>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="p-6 text-slate-200">
        <p className="mb-2 text-red-400">
          Ocurrió un error al cargar los reportes.
        </p>
        <p className="text-sm text-slate-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">
              Panel de Reportes – Administrador
            </h1>
            <p className="text-xs text-slate-400">
              Comunidad · Publicaciones · Monetización · Impacto ambiental ·
              Intercambios · Suscripciones
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                activeTab === tab.key
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {activeTab === "dashboard" && (
          <DashboardTab
            data={dashboard}
            impacto={impacto}
            intercambios={intercambios}
          />
        )}
        {activeTab === "comunidad" && comunidad && (
          <ComunidadTab data={comunidad} />
        )}
        {activeTab === "publicaciones" && publicaciones && (
          <PublicacionesTab data={publicaciones} />
        )}
        {activeTab === "monetizacion" && monetizacion && (
          <MonetizacionTab data={monetizacion} ingresosDia={monetizacionDia} />
        )}
        {activeTab === "impacto" && impacto && <ImpactoTab data={impacto} />}
        {activeTab === "intercambios" && intercambios && (
          <IntercambiosTab data={intercambios} />
        )}
        {activeTab === "suscripciones" && suscripciones && (
          <SuscripcionesTab data={suscripciones} />
        )}
      </main>
    </div>
  );
}

/* ============================================
 * Tabs específicas
 * ============================================ */

function DashboardTab(props: {
  data: AdminDashboardGlobal;
  impacto: AdminImpactoReport | null;
  intercambios: AdminIntercambiosReport | null;
}) {
  const { data, impacto, intercambios } = props;

  const ingresosTotal = data.monetizacion_resumen.ingresos_total;

  const usuariosTotales = data.comunidad_resumen.usuarios_por_estado.reduce(
    (acc: number, row: any) => acc + Number(row.total_usuarios ?? 0),
    0
  );

  const usuariosActivos = Number(
    data.comunidad_resumen.usuarios_por_estado.find(
      (r: any) => r.estado === "activo"
    )?.total_usuarios ?? 0
  );

  const ingresosPorMes = data.monetizacion_resumen.ingresos_por_mes ?? [];
  const crecimientoComunidad =
    data.comunidad_resumen.crecimiento_comunidad_mensual ?? [];

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Ingresos totales (Bs)"
          value={ingresosTotal?.bs_total ?? "-"}
          subtitle="Basado en vw_monetizacion_ingresos_total"
        />
        <KpiCard
          title="Créditos monetizados"
          value={ingresosTotal?.creditos_total ?? "-"}
          subtitle="Total de créditos vendidos por compras"
        />
        <KpiCard
          title="Usuarios registrados"
          value={usuariosTotales}
          subtitle="Distribuidos por estado de cuenta "
        />
        <KpiCard
          title="Usuarios activos"
          value={usuariosActivos}
          subtitle="Solo estado = activo"
        />
        <KpiCard
          title="Intercambios completados"
          value={intercambios?.total_intercambios?.completados ?? "-"}
          subtitle={`Basado en vw_total_intercambios · Activos: ${
            intercambios?.total_intercambios?.activos ?? 0
          }`}
        />
      </div>

      {/* Gráficos resumen: ingresos vs crecimiento de usuarios */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Evolución mensual de ingresos (Bs)"
          description="Tendencia de ingresos por venta de créditos a lo largo del tiempo."
        >
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <LineChart
                data={ingresosPorMes.map((row: any) => ({
                  periodo: row.periodo,
                  bs_total: Number(row.bs_total ?? 0),
                  creditos_total: Number(row.creditos_total ?? 0),
                }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bs_total"
                  name="Bs totales"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="creditos_total"
                  name="Créditos vendidos"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Crecimiento mensual de la comunidad"
          description="Altas de usuarios nuevos y acumulado total por mes."
        >
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <BarChart
                data={crecimientoComunidad.map((row: any) => ({
                  periodo: row.periodo,
                  nuevos: Number(row.usuarios_nuevos_mes ?? 0),
                  acumulado: Number(row.total_acumulado ?? 0),
                }))}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b" }}
                />
                <Legend />
                <Bar
                  dataKey="nuevos"
                  name="Nuevos usuarios"
                  stackId="a"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="acumulado"
                  name="Total acumulado"
                  stackId="a"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Comunidad resumen (tablas + pie) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Usuarios por estado"
          description="Cuenta usuarios por estado (activo, inactivo, suspendido, pendiente, etc.)."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-48">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={data.comunidad_resumen.usuarios_por_estado.map(
                      (row: any) => ({
                        name: row.estado,
                        value: Number(row.total_usuarios ?? 0),
                      })
                    )}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                  >
                    {data.comunidad_resumen.usuarios_por_estado.map(
                      (_: any, idx: number) => (
                        <Cell
                          key={idx}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <SimpleTable
              columns={[
                { key: "estado", label: "Estado" },
                { key: "total_usuarios", label: "Total" },
              ]}
              rows={data.comunidad_resumen.usuarios_por_estado}
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Usuarios activos por rol"
          description="Muestra usuarios totales y activos por rol, con el porcentaje de activos."
        >
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart
                data={data.comunidad_resumen.usuarios_activos_por_rol.map(
                  (row: any) => ({
                    rol_nombre: row.rol_nombre,
                    usuarios_totales: Number(row.usuarios_totales ?? 0),
                    usuarios_activos: Number(row.usuarios_activos ?? 0),
                  })
                )}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="rol_nombre" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="usuarios_totales"
                  name="Totales"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="usuarios_activos"
                  name="Activos"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* Impacto resumen (tablas + KPIs) */}
      {impacto && (
        <div className="grid gap-4 lg:grid-cols-2">
          <SectionCard
            title="Impacto ambiental total"
            description="Suma global de CO₂ evitado, energía ahorrada, agua preservada, residuos evitados y créditos verdes."
          >
            <div className="grid gap-3 md:grid-cols-2">
              <KpiCard
                title="CO₂ evitado (kg)"
                value={impacto.impacto_total?.co2 ?? "-"}
              />
              <KpiCard
                title="Energía ahorrada (kWh)"
                value={impacto.impacto_total?.energia ?? "-"}
              />
              <KpiCard
                title="Agua preservada (L)"
                value={impacto.impacto_total?.agua ?? "-"}
              />
              <KpiCard
                title="Residuos evitados (kg)"
                value={impacto.impacto_total?.residuos ?? "-"}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="Top categorías por impacto"
            description="Impacto ambiental total por categoría de publicación (vista global admin)."
          >
            <div className="h-56">
              <ResponsiveContainer>
                <BarChart
                  data={(impacto.impacto_por_categoria ?? []).map(
                    (row: any) => ({
                      categoria: row.categoria,
                      impacto_total: Number(row.impacto_total ?? 0),
                    })
                  )}
                  margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#020617",
                      border: "1px solid #1e293b",
                    }}
                  />
                  <Bar
                    dataKey="impacto_total"
                    name="Impacto total"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function ComunidadTab({ data }: { data: AdminComunidadReport }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Usuarios activos"
          value={
            data.usuarios_por_estado.find(
              (r: any) => r.estado === "activo"
            )?.total_usuarios ?? "-"
          }
          subtitle="Basado en vw_conteo_usuarios_por_estado"
        />
        <KpiCard
          title="Usuarios inactivos (>30d)"
          value={data.usuarios_inactivos_30d.length}
          subtitle="Más de 30 días sin actividad."
        />
        <KpiCard
          title="Roles con usuarios"
          value={data.usuarios_activos_por_rol.length}
        />
        <KpiCard
          title="Registros de actividad"
          value={data.actividad_usuarios.length}
        />
      </div>

      <SectionCard
        title="Actividad reciente de usuarios"
        description="Ultima actividad registrada por usuario (movimientos, publicaciones o intercambios)."
      >
        <SimpleTable
          columns={[
            { key: "email", label: "Usuario" },
            { key: "ultima_actividad", label: "Última actividad" },
          ]}
          rows={data.actividad_usuarios}
          maxRows={10}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Crecimiento mensual de comunidad"
          description="Altas de usuarios nuevos por mes y acumulado total."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart
                data={data.crecimiento_comunidad_mensual.map((row: any) => ({
                  periodo: row.periodo,
                  usuarios_nuevos_mes: Number(row.usuarios_nuevos_mes ?? 0),
                  total_acumulado: Number(row.total_acumulado ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="usuarios_nuevos_mes"
                  name="Nuevos"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="total_acumulado"
                  name="Acumulado"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "periodo", label: "Periodo" },
              { key: "usuarios_nuevos_mes", label: "Nuevos" },
              { key: "total_acumulado", label: "Acumulado" },
            ]}
            rows={data.crecimiento_comunidad_mensual}
          />
        </SectionCard>

        <SectionCard
          title="Crecimiento trimestral de comunidad"
          description="Altas de usuarios nuevos por trimestre y acumulado total."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.crecimiento_comunidad_trimestral.map(
                  (row: any) => ({
                    periodo_trimestre: row.periodo_trimestre,
                    usuarios_nuevos_trimestre: Number(
                      row.usuarios_nuevos_trimestre ?? 0
                    ),
                    total_acumulado: Number(row.total_acumulado ?? 0),
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo_trimestre" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="usuarios_nuevos_trimestre"
                  name="Nuevos"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="total_acumulado"
                  name="Acumulado"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "periodo_trimestre", label: "Trimestre" },
              { key: "usuarios_nuevos_trimestre", label: "Nuevos" },
              { key: "total_acumulado", label: "Acumulado" },
            ]}
            rows={data.crecimiento_comunidad_trimestral}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function PublicacionesTab({ data }: { data: AdminPublicacionesReport }) {
  const totalPublicaciones = data.publicaciones_por_status_y_categoria.reduce(
    (acc: number, row: any) => acc + Number(row.total_publicaciones ?? 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* KPIs de publicaciones */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Publicaciones totales"
          value={totalPublicaciones}
          subtitle="Agrupa todas las categorías y estados."
        />
        <KpiCard
          title="Publicaciones con favoritos"
          value={data.top_publicaciones_por_favoritos.length}
          subtitle="Ranking por favoritos."
        />
        <KpiCard
          title="Alertas de publicaciones antiguas"
          value={data.alertas_publicaciones_antiguas.length}
          subtitle="Activas por mas de 90 días."
        />
        <KpiCard
          title="Ubicaciones activas"
          value={data.actividad_por_ubicacion.length}
          subtitle="Actividad por ubicacion de publicaciones."
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Publicaciones por mes"
          description="Cuenta cuántas publicaciones se crean por mes y año."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart
                data={data.publicaciones_por_mes.map((row: any) => ({
                  periodo: `${row.anio}-${row.mes_num}`,
                  total_publicaciones: Number(row.total_publicaciones ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total_publicaciones"
                  name="Publicaciones"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "anio", label: "Año" },
              { key: "mes_num", label: "Mes" },
              { key: "mes_nombre", label: "Nombre mes" },
              { key: "total_publicaciones", label: "Total publ." },
            ]}
            rows={data.publicaciones_por_mes}
            maxRows={12}
          />
        </SectionCard>

        <SectionCard
          title="Publicaciones por estado y categoría"
          description="Conteo de publicaciones agrupadas por categoría y estado."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.publicaciones_por_status_y_categoria.map(
                  (row: any) => ({
                    categoria: row.categoria,
                    total_publicaciones: Number(row.total_publicaciones ?? 0),
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Bar
                  dataKey="total_publicaciones"
                  name="Publicaciones"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "categoria", label: "Categoría" },
              { key: "estado_publicacion", label: "Estado" },
              { key: "total_publicaciones", label: "Publicaciones" },
            ]}
            rows={data.publicaciones_por_status_y_categoria}
            maxRows={15}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Publicaciones por antigüedad y estado"
          description="Agrupa publicaciones por rango de antigüedad (días) y estado."
        >
          <SimpleTable
            columns={[
              { key: "rango_antiguedad", label: "Rango de días" },
              { key: "estado_publicacion", label: "Estado" },
              { key: "total_publicaciones", label: "Publicaciones" },
            ]}
            rows={data.publicaciones_por_antiguedad_y_estado}
            maxRows={15}
          />
        </SectionCard>

        <SectionCard
          title="Tasa de abandono / pausa"
          description="Porcentaje de publicaciones pausadas vs totales por usuario."
        >
          <SimpleTable
            columns={[
              { key: "email", label: "Usuario" },
              { key: "publicaciones_activas", label: "Activas" },
              { key: "publicaciones_pausadas", label: "Pausadas" },
              { key: "tasa_abandono", label: "Tasa abandono (%)" },
            ]}
            rows={data.tasa_abandono_carritos}
            maxRows={10}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Actividad por ubicación"
        description="Resume publicaciones, intercambios completados y usuarios activos por ubicación."
      >
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <BarChart
              data={data.actividad_por_ubicacion.map((row: any) => ({
                ubicacion: row.ubicacion,
                total_publicaciones: Number(row.total_publicaciones ?? 0),
                intercambios_completados: Number(
                  row.intercambios_completados ?? 0
                ),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="ubicacion" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                }}
              />
              <Legend />
              <Bar
                dataKey="total_publicaciones"
                name="Publicaciones"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="intercambios_completados"
                name="Intercambios compl."
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <SimpleTable
          columns={[
            { key: "ubicacion", label: "Ubicación" },
            { key: "total_publicaciones", label: "Publicaciones" },
            {
              key: "intercambios_completados",
              label: "Intercambios compl.",
            },
            { key: "usuarios_activos", label: "Usuarios activos" },
          ]}
          rows={data.actividad_por_ubicacion}
          maxRows={15}
        />
      </SectionCard>

      <SectionCard
        title="Calidad de publicación fotográfica (opcional)"
        description="Mide por categoría cuántas publicaciones activas no tienen foto principal."
      >
        <SimpleTable
          columns={[
            { key: "categoria", label: "Categoría" },
            {
              key: "total_publicaciones_activas",
              label: "Publ. activas",
            },
            { key: "publicaciones_sin_foto", label: "Sin foto" },
            { key: "porcentaje_sin_foto", label: "% sin foto" },
          ]}
          rows={data.calidad_publicacion_fotografica}
          maxRows={15}
        />
      </SectionCard>

      <SectionCard
        title="Valor promedio de inventario mensual"
        description="Valor promedio en créditos de las publicaciones por mes."
      >
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <LineChart
              data={data.valor_promedio_inventario_mensual.map((row: any) => ({
                periodo: row.periodo,
                valor_promedio_creditos: Number(
                  row.valor_promedio_creditos ?? 0
                ),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor_promedio_creditos"
                name="Valor promedio (créditos)"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SimpleTable
          columns={[
            { key: "periodo", label: "Periodo" },
            {
              key: "valor_promedio_creditos",
              label: "Valor promedio (créditos)",
            },
          ]}
          rows={data.valor_promedio_inventario_mensual}
        />
      </SectionCard>
    </div>
  );
}

function MonetizacionTab({
  data,
  ingresosDia,
}: {
  data: AdminMonetizacionReport;
  ingresosDia: any[];
}) {
  const total = data.ingresos_total;
  const ingresosPorDia = Array.isArray(ingresosDia)
    ? ingresosDia
    : (ingresosDia as any)?.data ?? [];

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ingresos totales (Bs)"
          value={total?.bs_total ?? "-"}
          subtitle="vw_monetizacion_ingresos_total: resumen global de ingresos."
        />
        <KpiCard
          title="Créditos vendidos"
          value={total?.creditos_total ?? "-"}
          subtitle="Total de créditos vendidos por compras."
        />
        <KpiCard
          title="Usuarios pagadores"
          value={data.ingreso_promedio_por_usuario_pagador.length}
          subtitle="Usuarios con al menos una compra."
        />
        <KpiCard
          title="Planes con ingresos MRR"
          value={data.mrr_por_plan.length}
          subtitle="vw_mrr_por_plan."
        />
      </div>

      {/* 0) Ingresos por día */}
      <SectionCard
        title="Ingresos por día"
        description="Ingresos y créditos vendidos agrupados por día."
      >
        <div className="h-64 w-full">
          <ResponsiveContainer>
            <LineChart
              data={ingresosPorDia.map((row: any) => ({
                fecha_dia: row.fecha_dia,
                bs_total: Number(row.bs_total ?? 0),
                creditos_total: Number(row.creditos_total ?? 0),
                compras_ok: Number(row.compras_ok ?? 0),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="fecha_dia" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="bs_total"
                name="Ingresos (Bs)"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="creditos_total"
                name="Créditos vendidos"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <SimpleTable
          columns={[
            { key: "fecha_dia", label: "Día" },
            { key: "bs_total", label: "Ingresos (Bs)" },
            { key: "creditos_total", label: "Créditos vendidos" },
            { key: "compras_ok", label: "Compras ok" },
          ]}
          rows={ingresosPorDia}
          maxRows={14}
        />
      </SectionCard>

      {/* 1) Ingresos por periodo: semana, mes, año */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          title="Ingresos por semana"
          description="Ingresos y créditos vendidos agrupados por semana."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.ingresos_por_semana.map((row: any) => ({
                  semana_inicio: row.semana_inicio,
                  bs_total: Number(row.bs_total ?? 0),
                  creditos_total: Number(row.creditos_total ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="semana_inicio" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="bs_total"
                  name="Ingresos (Bs)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="creditos_total"
                  name="Créditos vendidos"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "semana_inicio", label: "Semana (inicio)" },
              { key: "anio_iso", label: "Año" },
              { key: "semana_iso", label: "Semana ISO" },
              { key: "bs_total", label: "Ingresos (Bs)" },
              { key: "creditos_total", label: "Créditos vendidos" },
            ]}
            rows={data.ingresos_por_semana}
            maxRows={12}
          />
        </SectionCard>

        <SectionCard
          title="Ingresos por mes"
          description="Ingresos y créditos vendidos por compras de créditos agrupados por mes."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart
                data={data.ingresos_por_mes.map((row: any) => ({
                  periodo: row.periodo,
                  bs_total: Number(row.bs_total ?? 0),
                  creditos_total: Number(row.creditos_total ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="bs_total"
                  name="Ingresos (Bs)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="creditos_total"
                  name="Créditos vendidos"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "periodo", label: "Periodo" },
              { key: "bs_total", label: "Ingresos (Bs)" },
              { key: "creditos_total", label: "Créditos vendidos" },
            ]}
            rows={data.ingresos_por_mes}
            maxRows={12}
          />
        </SectionCard>

        <SectionCard
          title="Ingresos por año"
          description="Ingresos y créditos vendidos agrupados por año."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.ingresos_por_anio.map((row: any) => ({
                  anio: row.anio,
                  bs_total: Number(row.bs_total ?? 0),
                  creditos_total: Number(row.creditos_total ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="bs_total"
                  name="Ingresos (Bs)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="creditos_total"
                  name="Créditos vendidos"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "anio", label: "Año" },
              { key: "bs_total", label: "Ingresos (Bs)" },
              { key: "creditos_total", label: "Créditos vendidos" },
            ]}
            rows={data.ingresos_por_anio}
          />
        </SectionCard>
      </div>

      {/* 2) Crecimiento de créditos (mensual / trimestral) */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Crecimiento mensual de créditos"
          description="Créditos vendidos e ingreso por venta de créditos por mes."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart
                data={data.crecimiento_creditos_mensual.map((row: any) => ({
                  periodo: row.periodo,
                  creditos_vendidos_mes: Number(
                    row.creditos_vendidos_mes ?? 0
                  ),
                  ingreso_total_mes: Number(row.ingreso_total_mes ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="creditos_vendidos_mes"
                  name="Créditos vendidos"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="ingreso_total_mes"
                  name="Ingresos (Bs)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "periodo", label: "Mes" },
              { key: "creditos_vendidos_mes", label: "Créditos vendidos" },
              { key: "ingreso_total_mes", label: "Ingresos (Bs)" },
            ]}
            rows={data.crecimiento_creditos_mensual}
            maxRows={12}
          />
        </SectionCard>

        <SectionCard
          title="Crecimiento trimestral de créditos"
          description="Créditos vendidos e ingreso por trimestre, con acumulado de créditos."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.crecimiento_creditos_trimestral.map(
                  (row: any) => ({
                    periodo_trimestre: row.periodo_trimestre,
                    creditos_vendidos_trimestre: Number(
                      row.creditos_vendidos_trimestre ?? 0
                    ),
                    ingreso_total_trimestre: Number(
                      row.ingreso_total_trimestre ?? 0
                    ),
                  })
                )}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo_trimestre" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="creditos_vendidos_trimestre"
                  name="Créditos vendidos"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="ingreso_total_trimestre"
                  name="Ingresos (Bs)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "periodo_trimestre", label: "Trimestre" },
              {
                key: "creditos_vendidos_trimestre",
                label: "Créditos vendidos",
              },
              {
                key: "ingreso_total_trimestre",
                label: "Ingresos (Bs)",
              },
              {
                key: "creditos_acumulados_total",
                label: "Créditos acumulados",
              },
            ]}
            rows={data.crecimiento_creditos_trimestral}
          />
        </SectionCard>
      </div>

      {/* 3) Detalle por producto (paquetes) y origen de créditos */}
      <SectionCard
        title="Ingresos por paquetes de créditos"
        description="Rendimiento por paquete (ventas, ingresos y créditos vendidos)."
      >
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <BarChart
              data={data.ingresos_por_venta_de_creditos.map((row: any) => ({
                nombre_paq: row.nombre_paq,
                ingreso_total_bs: Number(row.ingreso_total_bs ?? 0),
                total_ventas: Number(row.total_ventas ?? 0),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="nombre_paq" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                }}
              />
              <Legend />
              <Bar
                dataKey="ingreso_total_bs"
                name="Ingresos (Bs)"
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="total_ventas"
                name="Ventas"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <SimpleTable
          columns={[
            { key: "nombre_paq", label: "Paquete" },
            { key: "precio", label: "Precio (Bs)" },
            { key: "cant_creditos", label: "Créditos" },
            { key: "total_ventas", label: "Ventas" },
            { key: "ingreso_total_bs", label: "Ingresos totales (Bs)" },
          ]}
          rows={data.ingresos_por_venta_de_creditos}
          maxRows={10}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Consumo vs generación de créditos"
          description="Resume créditos generados y gastados según el tipo de movimiento (compra/intercambio/otros)."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.consumo_vs_generacion.map((row: any) => ({
                    name: row.origen,
                    value: Number(row.total ?? 0),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {data.consumo_vs_generacion.map((_row: any, idx: number) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "origen", label: "Origen" },
              { key: "total", label: "Total créditos" },
            ]}
            rows={data.consumo_vs_generacion}
          />
        </SectionCard>

        <SectionCard
          title="Distribución del origen de créditos (mensual)"
          description="Origen de créditos (compra/intercambios/otros) por mes."
        >
          <SimpleTable
            columns={[
              { key: "periodo", label: "Periodo" },
              { key: "origen", label: "Origen" },
              { key: "total_creditos", label: "Total créditos" },
            ]}
            rows={data.distribucion_origen_creditos_mensual}
            maxRows={12}
          />
        </SectionCard>
      </div>

      {/* 4) Distribución de saldos y liquidez */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Distribución de saldos (créditos totales)"
          description="Distribución de usuarios en rangos de saldo total de créditos."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.distribucion_de_saldos.map((row: any) => ({
                    name: row.rango_saldo,
                    value: Number(row.total_usuarios ?? 0),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {data.distribucion_de_saldos.map(
                    (_row: any, idx: number) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "rango_saldo", label: "Rango saldo (créditos)" },
              { key: "total_usuarios", label: "Usuarios" },
            ]}
            rows={data.distribucion_de_saldos}
          />
        </SectionCard>

        <SectionCard
          title="Distribución de créditos por rangos"
          description="Distribuye usuarios según rangos de saldo total en billetera."
        >
          <SimpleTable
            columns={[
              { key: "rango_creditos", label: "Rango de créditos" },
              { key: "total_usuarios", label: "Usuarios" },
            ]}
            rows={data.distribucion_saldo_creditos_rangos}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Liquidez de créditos por usuario"
          description="Compara lo invertido vs el saldo disponible para medir la 'liquidez' de créditos."
        >
          <SimpleTable
            columns={[
              { key: "email", label: "Usuario" },
              { key: "total_bs_invertidos", label: "Bs invertidos" },
              { key: "saldo_disponible", label: "Saldo disponible" },
              { key: "saldo_retenido", label: "Saldo retenido" },
              { key: "saldo_total", label: "Saldo total" },
              { key: "porcentaje_liquidez", label: "% liquidez" },
            ]}
            rows={data.liquidez_creditos_usuario}
            maxRows={10}
          />
        </SectionCard>

        <SectionCard
          title="Inversión total por usuario"
          description="Inversión total y créditos comprados por cada usuario."
        >
          <SimpleTable
            columns={[
              { key: "nombre_completo", label: "Usuario" },
              { key: "email", label: "Email" },
              {
                key: "total_creditos_comprados",
                label: "Créditos comprados",
              },
              { key: "total_inversion_bs", label: "Total invertido (Bs)" },
            ]}
            rows={data.inversion_usuario_creditos}
            maxRows={10}
          />
        </SectionCard>
      </div>

      {/* 5) MRR y ticket promedio */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="MRR estimado por plan"
          description="Estima el ingreso mensual recurrente (MRR) por cada plan de suscripción activo."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={data.mrr_por_plan.map((row: any) => ({
                  nombre_plan: row.nombre_plan,
                  mrr_estimado_bs: Number(row.mrr_estimado_bs ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="nombre_plan" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Bar
                  dataKey="mrr_estimado_bs"
                  name="MRR estimado (Bs/mes)"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "nombre_plan", label: "Plan" },
              { key: "mrr_estimado_bs", label: "MRR estimado (Bs/mes)" },
            ]}
            rows={data.mrr_por_plan}
          />
        </SectionCard>

        <SectionCard
          title="Ingreso promedio por usuario pagador"
          description="Cuánto gasta en promedio cada usuario que compra créditos."
        >
          <SimpleTable
            columns={[
              { key: "email", label: "Usuario" },
              { key: "bs_total", label: "Total gastado (Bs)" },
              { key: "compras_ok", label: "Compras" },
              {
                key: "ingreso_promedio_por_compra",
                label: "Ticket promedio (Bs)",
              },
            ]}
            rows={data.ingreso_promedio_por_usuario_pagador}
            maxRows={15}
          />
        </SectionCard>
      </div>

      {/* 6) Créditos ganados vs comprados */}
      <SectionCard
        title="Créditos ganados vs comprados"
        description="Compara créditos comprados vs créditos ganados por bonos, por usuario."
      >
        <SimpleTable
          columns={[
            { key: "email", label: "Usuario" },
            { key: "creditos_comprados", label: "Comprados" },
            { key: "creditos_ganados", label: "Ganados" },
            { key: "total_creditos", label: "Total" },
            { key: "porcentaje_comprado", label: "% Comprado" },
          ]}
          rows={data.creditos_ganados_vs_comprados}
          maxRows={15}
        />
      </SectionCard>

      {/* 7) Tablas simples adicionales */}
      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Créditos comprados por usuario (detalle simple)"
          description="Cuántas compras hizo cada usuario y cuánto compró (Bs y créditos)."
        >
          <SimpleTable
            columns={[
              { key: "usuario_id", label: "ID usuario" },
              { key: "compras_ok", label: "Compras ok" },
              { key: "bs_total", label: "Total Bs" },
              { key: "creditos_total", label: "Créditos totales" },
            ]}
            rows={data.creditos_comprados_por_usuario}
            maxRows={15}
          />
        </SectionCard>

        <SectionCard
          title="Saldos crudos de créditos por usuario"
          description="Saldo disponible, retenido y total de créditos por usuario."
        >
          <SimpleTable
            columns={[
              { key: "usuario_id", label: "ID usuario" },
              { key: "saldo_disponible", label: "Saldo disponible" },
              { key: "saldo_retenido", label: "Saldo retenido" },
              { key: "saldo_total", label: "Saldo total" },
            ]}
            rows={data.saldos_creditos_usuarios}
            maxRows={15}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function ImpactoTab({ data }: { data: AdminImpactoReport }) {
  const impactoPorCategoria = data.impacto_por_categoria ?? [];
  const impactoPorRol = data.impacto_por_rol ?? [];
  const topUsuarios = data.top_usuarios_impacto ?? [];
  const impactoMensual = data.impacto_mensual ?? [];
  const eficiencia = data.eficiencia_impacto_por_credito ?? [];
  const participacion = data.participacion_actividades_sostenibles?.[0] ?? null;

  const impactoMensualCo2 = impactoMensual
    .filter((row: any) => row.nombre_factor === "CO2 evitado")
    .map((row: any) => ({
      periodo: row.periodo,
      impacto_total: Number(row.impacto_total ?? 0),
    }));

  return (
    <div className="space-y-6">
      {/* KPIs de impacto total */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="CO₂ total (kg)"
          value={data.impacto_total?.co2 ?? "-"}
        />
        <KpiCard
          title="Energía total (kWh)"
          value={data.impacto_total?.energia ?? "-"}
        />
        <KpiCard
          title="Agua total (L)"
          value={data.impacto_total?.agua ?? "-"}
        />
        <KpiCard
          title="Residuos evitados (kg)"
          value={data.impacto_total?.residuos ?? "-"}
        />
        <KpiCard
          title="Créditos verdes"
          value={data.impacto_total?.creditos ?? "-"}
        />
      </div>

      {/* Participación en actividades sostenibles */}
      <SectionCard
        title="Participación en actividades sostenibles"
        description="Créditos otorgados por recompensas y cuántos usuarios participan."
      >
        {participacion ? (
          <div className="grid gap-4 md:grid-cols-2">
            <KpiCard
              title="Usuarios participantes"
              value={participacion.total_usuarios_participantes}
              subtitle={`Tipo actividad: ${participacion.tipo_actividad}`}
            />
            <KpiCard
              title="Créditos otorgados"
              value={participacion.total_creditos_otorgados}
              subtitle="Recompensa total por actividades"
            />
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Aún no se registran actividades sostenibles.
          </p>
        )}
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Impacto por categoría"
          description="Impacto ambiental total por categoría de publicación a nivel global (admin)."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <BarChart
                data={impactoPorCategoria.map((row: any) => ({
                  categoria: row.categoria,
                  impacto_total: Number(row.impacto_total ?? 0),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Bar
                  dataKey="impacto_total"
                  name="Impacto total"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "categoria", label: "Categoría" },
              { key: "impacto_total", label: "Impacto total" },
              { key: "peso_total_kg", label: "Peso total (kg)" },
              { key: "nombre_factor", label: "Factor" },
            ]}
            rows={impactoPorCategoria}
            maxRows={10}
          />
        </SectionCard>

        <SectionCard
          title="Impacto por rol"
          description="Agrupa el impacto por rol para comparar tipos de participantes (CO₂)."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={impactoPorRol.map((row: any) => ({
                    name: row.rol,
                    value: Number(row.co2 ?? 0),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {impactoPorRol.map((_row: any, idx: number) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "rol", label: "Rol" },
              { key: "total_usuarios", label: "Usuarios" },
              { key: "co2", label: "CO₂" },
              { key: "residuos", label: "Residuos" },
            ]}
            rows={impactoPorRol}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Top usuarios por impacto"
        description="Basado en vw_user_impacto_ambiental: ranking de usuarios por CO₂ evitado, residuos evitados y créditos ganados."
      >
        <SimpleTable
          columns={[
            { key: "rank_por_co2", label: "#" },
            { key: "full_name", label: "Usuario" },
            { key: "total_co2_evitado", label: "CO₂ evitado" },
            { key: "total_residuos_evitados", label: "Residuos evitados" },
            { key: "total_creditos_ganados", label: "Créditos ganados" },
          ]}
          rows={topUsuarios}
          maxRows={15}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Impacto mensual por CO₂"
          description="Serie mensual de impacto agregado de CO₂ evitado."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <LineChart data={impactoMensualCo2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impacto_total"
                  name="CO₂ evitado (kg)"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Eficiencia de impacto por crédito"
          description="Relación entre créditos verdes ganados y el impacto generado (CO₂/credito, residuos/credito) por usuario."
        >
          <SimpleTable
            columns={[
              { key: "email", label: "Usuario" },
              { key: "total_creditos_ganados", label: "Créditos" },
              { key: "co2_por_credito", label: "CO₂/credito" },
              { key: "residuos_por_credito", label: "Residuos/credito" },
            ]}
            rows={eficiencia}
            maxRows={10}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function IntercambiosTab({ data }: { data: AdminIntercambiosReport }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          title="Intercambios completados"
          value={data.total_intercambios?.completados ?? "-"}
          subtitle="Basado en vw_total_intercambios."
        />
        <KpiCard
          title="Intercambios activos"
          value={data.total_intercambios?.activos ?? "-"}
        />
        <KpiCard
          title="Intercambios totales"
          value={data.total_intercambios?.total ?? "-"}
        />
      </div>

      <SectionCard
        title="Intercambios por categoría"
        description="Cuántos intercambios se completan por categoría."
      >
        <div className="h-56 w-full">
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data.intercambios_por_categorias.map((row: any) => ({
                  name: row.categoria,
                  value: Number(row.intercambios ?? 0),
                }))}
                dataKey="value"
                nameKey="name"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
              >
                {data.intercambios_por_categorias.map(
                  (_row: any, idx: number) => (
                    <Cell
                      key={idx}
                      fill={CHART_COLORS[idx % CHART_COLORS.length]}
                    />
                  )
                )}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #1e293b",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <SimpleTable
          columns={[
            { key: "categoria", label: "Categoría" },
            { key: "intercambios", label: "Intercambios" },
          ]}
          rows={data.intercambios_por_categorias}
          maxRows={10}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Demanda por categoría"
          description="Relación entre intercambios completados y número de publicaciones por categoría."
        >
          <SimpleTable
            columns={[
              { key: "categoria", label: "Categoría" },
              { key: "total_publicaciones", label: "Publicaciones" },
              {
                key: "total_intercambios_completados",
                label: "Intercambios compl.",
              },
              {
                key: "ratio_intercambio_porcentaje",
                label: "% conversión",
              },
            ]}
            rows={data.ratio_demanda_por_categoria}
          />
        </SectionCard>

        <SectionCard
          title="Categorías más populares"
          description="Ranking de categorías según intercambios completados e interacción."
        >
          <SimpleTable
            columns={[
              { key: "ranking_popularidad", label: "#" },
              { key: "categoria", label: "Categoría" },
              {
                key: "intercambios_completados",
                label: "Intercambios compl.",
              },
              {
                key: "publicaciones_participantes",
                label: "Publicaciones",
              },
            ]}
            rows={data.categorias_intercambio_popular}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Propuestas con más mensajes"
          description="Cantidad de mensajes por propuesta, con estado y publicación asociada."
        >
          <SimpleTable
            columns={[
              { key: "propuesta_id", label: "ID Propuesta" },
              { key: "publicacion", label: "Publicación" },
              { key: "estado", label: "Estado" },
              { key: "total_mensajes", label: "Mensajes" },
            ]}
            rows={data.volumen_mensajeria_por_propuesta}
            maxRows={10}
          />
        </SectionCard>

        <SectionCard
          title="Intercambios sin reseñas"
          description="Intercambios completados en los que falta al menos una reseña (comprador o vendedor)."
        >
          <SimpleTable
            columns={[
              { key: "intercambio_id", label: "ID" },
              { key: "monto_credito", label: "Créditos" },
              { key: "fecha_completado", label: "Fecha" },
              { key: "comprador_email", label: "Comprador" },
              { key: "vendedor_email", label: "Vendedor" },
            ]}
            rows={data.transacciones_sin_resenia}
            maxRows={10}
          />
        </SectionCard>
      </div>
    </div>
  );
}

function SuscripcionesTab({
  data,
}: {
  data: AdminSuscripcionesRankingReport;
}) {
  const adopcion = data.adopcion_suscripcion;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
        <KpiCard
          title="Usuarios en ranking participación"
          value={data.ranking_participacion.length}
          subtitle="vw_ranking_participacion."
        />
        <KpiCard
          title="Top 10 destacados"
          value={data.ranking_top10.length}
        />
        <KpiCard
          title="Planes con usuarios activos"
          value={data.usuarios_por_tipo_suscripcion.length}
          subtitle="vw_usuarios_por_tipo_suscripcion."
        />
        <KpiCard
          title="Usuarios solo con bonos"
          value={data.usuarios_solo_bonos_cero_inversion.length}
          subtitle="vw_usuarios_con_solo_bonos_cero_inversion."
        />
        <KpiCard
          title="Total suscripciones"
          value={adopcion?.total_registros ?? "-"}
          subtitle={`vw_adopcion_suscripcion · Activas: ${
            adopcion?.activas ?? 0
          }`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Usuarios por tipo de suscripción"
          description="Usuarios activos por plan, precio del plan y ARR estimado."
        >
          <div className="h-56 w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.usuarios_por_tipo_suscripcion.map(
                    (row: any) => ({
                      name: row.nombre_plan,
                      value: Number(row.total_usuarios_activos ?? 0),
                    })
                  )}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {data.usuarios_por_tipo_suscripcion.map(
                    (_row: any, idx: number) => (
                      <Cell
                        key={idx}
                        fill={CHART_COLORS[idx % CHART_COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    border: "1px solid #1e293b",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <SimpleTable
            columns={[
              { key: "nombre_plan", label: "Plan" },
              { key: "total_usuarios_activos", label: "Usuarios activos" },
              { key: "precio_plan", label: "Precio (Bs)" },
              {
                key: "arr_anual_estimado",
                label: "ARR estimado (Bs/año)",
              },
            ]}
            rows={data.usuarios_por_tipo_suscripcion}
          />
        </SectionCard>

        <SectionCard
          title="Retención por plan / segmento"
          description="Segmenta usuarios por suscripción y calcula promedios de gasto, saldo e intercambios."
        >
          <SimpleTable
            columns={[
              { key: "segmento", label: "Segmento" },
              { key: "total_usuarios", label: "Usuarios" },
              { key: "gasto_promedio_bs", label: "Gasto promedio (Bs)" },
              {
                key: "intercambios_promedio",
                label: "Intercambios promedio",
              },
            ]}
            rows={data.retencion_suscripcion_por_plan}
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Top 10 por participación"
        description="Ranking de usuarios según intercambios, compras de créditos y suscripción."
      >
        <SimpleTable
          columns={[
            { key: "rank_intercambios", label: "#" },
            { key: "nombre", label: "Usuario" },
            { key: "intercambios_hechos", label: "Intercambios" },
          ]}
          rows={data.ranking_top10}
          maxRows={10}
        />
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Ranking de reputación"
          description="Resume reputación (promedio y cantidad de reseñas) y volumen de intercambios."
        >
          <SimpleTable
            columns={[
              { key: "email", label: "Usuario" },
              { key: "calificacion_prom", label: "⭐ Prom." },
              { key: "total_resenias", label: "Reseñas" },
              { key: "volumen_intercambios", label: "Intercambios" },
            ]}
            rows={data.ranking_reputacion}
            maxRows={15}
          />
        </SectionCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard
          title="Ranking de participación (completo)"
          description="Personas con mayor participacion según intercambios, compras de créditos y suscripción."
        >
          <SimpleTable
            columns={[
              { key: "rank_intercambios", label: "#" },
              { key: "email", label: "Usuario" },
              { key: "intercambios", label: "Intercambios" },
              { key: "compras_creditos", label: "Compras de créditos" },
              { key: "creditos_comprados", label: "Créditos comprados" },
              { key: "tiene_suscripcion", label: "Suscrito" },
              { key: "puntaje", label: "Puntaje" },
            ]}
            rows={data.ranking_participacion_con_posicion}
            maxRows={20}
          />
        </SectionCard>

        <SectionCard
          title="Usuarios solo con bonos y cero inversión"
          description="Usuarios que solo tienen créditos por bonos y nunca compraron créditos."
        >
          <SimpleTable
            columns={[
              { key: "full_name", label: "Usuario" },
              { key: "email", label: "Email" },
              {
                key: "creditos_por_bonos",
                label: "Créditos obtenidos por bonos",
              },
            ]}
            rows={data.usuarios_solo_bonos_cero_inversion}
            maxRows={20}
          />
        </SectionCard>
      </div>
    </div>
  );
}
