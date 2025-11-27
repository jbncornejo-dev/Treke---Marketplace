// apps/web/src/pages/profile/UserReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import { getUserSummary, getUserRanking } from "../../api/report";
import type { UserDashboardSummary, UserRankingData } from "../../types/report";

import KPICard from "../../components/Reportes/KPICard";
import ProgressBar from "../../components/Reportes/ProgressBar";
import SectionCard from "../../components/Reportes/SectionCard";
import BarChartSimple, {
  type SimpleChartDatum,
} from "../../components/Reportes/Graficas/BarChartSimple";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

type Status = "idle" | "loading" | "success" | "error";

/** Colores para los gráficos */
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

/**
 * Extendemos el tipo original para poder leer
 * los campos nuevos que devuelve el dashboard del backend
 * (resumen_creditos, movimientos, impacto_ambiental, etc.).
 */
type UserDashboardSummaryExtended = UserDashboardSummary & {
  resumen_creditos?: any | null;
  movimientos?: any[]; // detalle de movimientos de créditos
  impacto_ambiental?: any | null; // impacto ambiental personal
  compras_creditos?: any | null; // por compatibilidad con el backend nuevo
};

/**
 * Impacto ambiental total de toda la comunidad
 * (viene de /api/admin/reportes/impacto → impacto_total)
 */
type GlobalImpactoTotal = {
  co2: string;
  energia: string;
  agua: string;
  residuos: string;
  creditos: string;
} | null;

export default function UserReportsPage() {
  const [summary, setSummary] = useState<UserDashboardSummaryExtended | null>(
    null
  );
  const [rankingData, setRankingData] = useState<UserRankingData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  // Impacto ambiental global (todos los usuarios, vista admin)
  const [globalImpacto, setGlobalImpacto] = useState<GlobalImpactoTotal>(null);

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        setMsg("");

        // 1) Datos personales del usuario (dashboard) + ranking global
        const [s, r] = await Promise.all([getUserSummary(), getUserRanking()]);

        setSummary(s as UserDashboardSummaryExtended);
        setRankingData(r);
        setStatus("success");

        // 2) Intentar cargar impacto ambiental global (no crítico si falla)
        try {
          const resp = await fetch("/api/admin/reportes/impacto");
          if (resp.ok) {
            const json = await resp.json();
            setGlobalImpacto(json?.impacto_total ?? null);
          }
        } catch (e) {
          console.warn(
            "No se pudo cargar el impacto ambiental global (no es crítico):",
            e
          );
        }
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudieron cargar tus reportes");
        setStatus("error");
      }
    })();
  }, []);

  // Normalizamos top10 para evitar null
  const top10 = rankingData?.top10 ?? [];

  const topChartData: SimpleChartDatum[] = useMemo(
    () =>
      top10.map((u) => ({
        name: u.nombre,
        value: Number(u.intercambios_hechos ?? 0),
      })),
    [top10]
  );

  // Progreso hacia el top 1 (en función de intercambios)
  const progresoTop = useMemo(() => {
    if (!rankingData?.me || !top10.length) return 0;
    const meInt = Number(rankingData.me.intercambios ?? 0);
    const top1 = top10[0];
    const topInt = Number(top1.intercambios_hechos ?? 0);
    if (topInt <= 0) return 0;
    return Math.min(100, (meInt / topInt) * 100);
  }, [rankingData, top10]);

  // Extract helpers del summary (por compatibilidad con backend viejo/nuevo)
  const actividad = summary?.actividad;
  const saldo =
    summary?.saldo ?? (summary as any)?.saldo ?? null; // por si el tipo cambió
  const compras =
    summary?.compras ??
    (summary as any)?.compras_creditos ??
    (summary as any)?.compras ??
    null;
  const resumenCreditos =
    (summary as any)?.resumen_creditos ?? (summary as any)?.resumen ?? null;
  const movimientos: any[] = (summary as any)?.movimientos ?? [];
  const impactoPersonal = (summary as any)?.impacto_ambiental ?? null;

  // Datos para gráfico de movimientos (últimos 12)
  const movimientosChartData = useMemo(
    () =>
      movimientos.slice(0, 12).map((m) => ({
        fecha: m.fecha_movimiento
          ? new Date(m.fecha_movimiento).toLocaleDateString()
          : "",
        monto: Number(m.monto_signed ?? 0),
      })),
    [movimientos]
  );

  // Datos para gráfico de impacto personal vs global
  const impactoVsGlobalData = useMemo(() => {
    if (!impactoPersonal || !globalImpacto) return [];
    return [
      {
        nombre: "CO₂",
        personal: Number(impactoPersonal.total_co2_evitado ?? 0),
        global: Number(globalImpacto.co2 ?? 0),
      },
      {
        nombre: "Energía",
        personal: Number(impactoPersonal.total_energia_ahorrada ?? 0),
        global: Number(globalImpacto.energia ?? 0),
      },
      {
        nombre: "Agua",
        personal: Number(impactoPersonal.total_agua_preservada ?? 0),
        global: Number(globalImpacto.agua ?? 0),
      },
      {
        nombre: "Residuos",
        personal: Number(impactoPersonal.total_residuos_evitados ?? 0),
        global: Number(globalImpacto.residuos ?? 0),
      },
    ];
  }, [impactoPersonal, globalImpacto]);

  // Datos para pastel de impacto personal
  const impactoPersonalPieData = useMemo(() => {
    if (!impactoPersonal) return [];
    return [
      {
        name: "CO₂",
        value: Number(impactoPersonal.total_co2_evitado ?? 0),
      },
      {
        name: "Energía",
        value: Number(impactoPersonal.total_energia_ahorrada ?? 0),
      },
      {
        name: "Agua",
        value: Number(impactoPersonal.total_agua_preservada ?? 0),
      },
      {
        name: "Residuos",
        value: Number(impactoPersonal.total_residuos_evitados ?? 0),
      },
    ].filter((d) => d.value > 0);
  }, [impactoPersonal]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header title="Mis reportes" />
      <main className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Estado de carga / error */}
        {status === "loading" && (
          <p className="animate-pulse text-sm text-slate-400">
            Cargando tus reportes…
          </p>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-500/60 bg-red-900/20 px-4 py-3 text-sm">
            <p className="font-medium text-red-300">
              Ocurrió un error al cargar la información.
            </p>
            <p className="mt-1 text-slate-200/80">{msg}</p>
          </div>
        )}

        {status === "success" && summary && (
          <>
            {/* =====================================
             * 1) RESUMEN RÁPIDO (KPIs)
             * ===================================== */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Créditos totales en billetera"
                value={saldo?.saldo_total ?? 0}
                helperText={
                  saldo
                    ? `Disponible: ${saldo.saldo_disponible} · Retenido: ${saldo.saldo_retenido}`
                    : "No se encontró una billetera asociada."
                }
              />
              <KPICard
                label="Créditos comprados (histórico)"
                value={compras?.creditos_total ?? 0}
                helperText={
                  compras
                    ? `Compras completadas: ${compras.compras_ok} · Total gastado: ${compras.bs_total} Bs`
                    : "Todavía no has comprado créditos."
                }
              />
              <KPICard
                label="Intercambios completados (ranking)"
                value={rankingData?.me?.intercambios ?? 0}
                helperText={
                  rankingData?.me
                    ? `Posición global: #${rankingData.me.rank_intercambios}`
                    : "Aún no figuras en el ranking."
                }
              />
              <KPICard
                label="Créditos ganados por impacto"
                value={impactoPersonal?.total_creditos_ganados ?? 0}
                helperText={
                  impactoPersonal
                    ? "Créditos obtenidos por intercambios sostenibles."
                    : "Aún no registras impacto ambiental."
                }
              />
            </section>

            {/* =====================================
             * 2) INFO PERSONAL + IMPACTO GLOBAL
             * ===================================== */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
              {/* Información personal / resumen de cuenta */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-200">
                  Mi información de cuenta
                </h2>
                {resumenCreditos ? (
                  <div className="mt-2 space-y-1 text-sm text-slate-300">
                    <p>
                      <span className="font-semibold">Nombre:</span>{" "}
                      {resumenCreditos.full_name ?? "—"}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {resumenCreditos.email}
                    </p>
                    <p>
                      <span className="font-semibold">Rol:</span>{" "}
                      {resumenCreditos.rol ?? "usuario"}
                    </p>
                    <p>
                      <span className="font-semibold">
                        En la plataforma desde:
                      </span>{" "}
                      {resumenCreditos.created_at
                        ? new Date(
                            resumenCreditos.created_at
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    No se encontró resumen detallado de tu cuenta.
                  </p>
                )}

                {actividad && (
                  <div className="mt-4 border-t border-slate-800 pt-3 text-sm text-slate-300">
                    <p className="font-semibold text-slate-200">
                      Actividad reciente
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">Última actividad:</span>{" "}
                      {new Date(
                        actividad.ultima_actividad
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Impacto ambiental total de la comunidad */}
              <div className="rounded-2xl border border-emerald-700/60 bg-emerald-900/10 p-4">
                <h2 className="text-sm font-semibold text-emerald-200">
                  Impacto ambiental de la comunidad
                </h2>
                {globalImpacto ? (
                  <>
                    <div className="mt-3 grid gap-3 text-sm text-emerald-100 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase text-emerald-300/80">
                          CO₂ evitado
                        </p>
                        <p className="text-lg font-semibold">
                          {globalImpacto.co2} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-emerald-300/80">
                          Energía ahorrada
                        </p>
                        <p className="text-lg font-semibold">
                          {globalImpacto.energia} kWh
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-emerald-300/80">
                          Agua preservada
                        </p>
                        <p className="text-lg font-semibold">
                          {globalImpacto.agua} L
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-emerald-300/80">
                          Residuos evitados
                        </p>
                        <p className="text-lg font-semibold">
                          {globalImpacto.residuos} kg
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 h-40">
                      <ResponsiveContainer>
                        <BarChart
                          data={[
                            {
                              nombre: "CO₂",
                              valor: Number(globalImpacto.co2 ?? 0),
                            },
                            {
                              nombre: "Energía",
                              valor: Number(globalImpacto.energia ?? 0),
                            },
                            {
                              nombre: "Agua",
                              valor: Number(globalImpacto.agua ?? 0),
                            },
                            {
                              nombre: "Residuos",
                              valor: Number(globalImpacto.residuos ?? 0),
                            },
                          ]}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#064e3b"
                          />
                          <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#022c22",
                              border: "1px solid #064e3b",
                            }}
                          />
                          <Bar
                            dataKey="valor"
                            name="Impacto total"
                            fill="#22c55e"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <p className="mt-2 text-xs text-emerald-200/80">
                      Estos datos son el impacto total generado por todos los
                      usuarios mediante sus intercambios sostenibles.
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-emerald-100/70">
                    Aún no hay datos de impacto global o no se pudieron cargar.
                  </p>
                )}
              </div>
            </section>

            {/* =====================================
             * 3) ACTIVIDAD + BILLETERA + COMPRAS
             * ===================================== */}
            <section className="grid gap-4 md:grid-cols-3">
              {/* Actividad (detalle) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-200">
                  Actividad reciente
                </h2>
                {actividad ? (
                  <div className="mt-2 space-y-1 text-sm text-slate-300">
                    <p>
                      <span className="font-semibold">Última actividad:</span>{" "}
                      {new Date(
                        actividad.ultima_actividad
                      ).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {actividad.email}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Todavía no registras actividad en el sistema.
                  </p>
                )}
              </div>

              {/* Saldo */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-200">
                  Mi saldo de créditos
                </h2>
                {saldo ? (
                  <>
                    <div className="mt-2 space-y-1 text-sm text-slate-300">
                      <p>
                        <span className="font-semibold">Disponible:</span>{" "}
                        {saldo.saldo_disponible}
                      </p>
                      <p>
                        <span className="font-semibold">Retenido:</span>{" "}
                        {saldo.saldo_retenido}
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        {saldo.saldo_total}
                      </p>
                    </div>
                    <div className="mt-4 h-36">
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={[
                              {
                                name: "Disponible",
                                value: Number(
                                  saldo.saldo_disponible ?? 0
                                ),
                              },
                              {
                                name: "Retenido",
                                value: Number(
                                  saldo.saldo_retenido ?? 0
                                ),
                              },
                            ]}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={30}
                            outerRadius={55}
                            paddingAngle={2}
                          >
                            {[0, 1].map((idx) => (
                              <Cell
                                key={idx}
                                fill={
                                  CHART_COLORS[idx % CHART_COLORS.length]
                                }
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
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    No se encontró una billetera asociada.
                  </p>
                )}
              </div>

              {/* Compras */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                <h2 className="text-sm font-semibold text-slate-200">
                  Compras de créditos
                </h2>
                {compras ? (
                  <>
                    <div className="mt-2 space-y-1 text-sm text-slate-300">
                      <p>
                        <span className="font-semibold">
                          Transacciones completadas:
                        </span>{" "}
                        {compras.compras_ok}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Total gastado (Bs):
                        </span>{" "}
                        {compras.bs_total}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Créditos comprados:
                        </span>{" "}
                        {compras.creditos_total}
                      </p>
                    </div>
                    {impactoPersonal && (
                      <div className="mt-4 h-36">
                        <ResponsiveContainer>
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: "Créditos comprados",
                                  value: Number(
                                    compras.creditos_total ?? 0
                                  ),
                                },
                                {
                                  name: "Créditos ganados",
                                  value: Number(
                                    impactoPersonal.total_creditos_ganados ??
                                      0
                                  ),
                                },
                              ]}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={30}
                              outerRadius={55}
                              paddingAngle={2}
                            >
                              {[0, 1].map((idx) => (
                                <Cell
                                  key={idx}
                                  fill={
                                    CHART_COLORS[idx % CHART_COLORS.length]
                                  }
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
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">
                    Todavía no has comprado créditos.
                  </p>
                )}
              </div>
            </section>

            {/* =====================================
             * 4) IMPACTO AMBIENTAL PERSONAL
             * ===================================== */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-100">
                Mi impacto ambiental
              </h2>
              {impactoPersonal ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <KPICard
                      label="CO₂ evitado (kg)"
                      value={impactoPersonal.total_co2_evitado ?? 0}
                      helperText="Por todos tus intercambios registrados."
                    />
                    <KPICard
                      label="Energía ahorrada (kWh)"
                      value={impactoPersonal.total_energia_ahorrada ?? 0}
                    />
                    <KPICard
                      label="Agua preservada (L)"
                      value={impactoPersonal.total_agua_preservada ?? 0}
                    />
                    <KPICard
                      label="Residuos evitados (kg)"
                      value={impactoPersonal.total_residuos_evitados ?? 0}
                    />
                    <KPICard
                      label="Créditos verdes ganados"
                      value={impactoPersonal.total_creditos_ganados ?? 0}
                    />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <SectionCard title="Distribución de mi impacto">
                      {impactoPersonalPieData.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          No hay datos suficientes para graficar tu impacto.
                        </p>
                      ) : (
                        <div className="h-56">
                          <ResponsiveContainer>
                            <PieChart>
                              <Pie
                                data={impactoPersonalPieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={40}
                                outerRadius={70}
                                paddingAngle={2}
                              >
                                {impactoPersonalPieData.map((_d, idx) => (
                                  <Cell
                                    key={idx}
                                    fill={
                                      CHART_COLORS[idx % CHART_COLORS.length]
                                    }
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
                      )}
                    </SectionCard>

                    <SectionCard title="Comparación con el impacto global">
                      {impactoVsGlobalData.length === 0 ? (
                        <p className="text-sm text-slate-400">
                          Aún no se puede comparar tu impacto con el global.
                        </p>
                      ) : (
                        <div className="h-56">
                          <ResponsiveContainer>
                            <BarChart data={impactoVsGlobalData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#1e293b"
                              />
                              <XAxis
                                dataKey="nombre"
                                tick={{ fontSize: 11 }}
                              />
                              <YAxis tick={{ fontSize: 11 }} />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#020617",
                                  border: "1px solid #1e293b",
                                }}
                              />
                              <Legend />
                              <Bar
                                dataKey="personal"
                                name="Tú"
                                fill="#22c55e"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="global"
                                name="Comunidad"
                                fill="#0ea5e9"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </SectionCard>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">
                  Aún no tienes registros de impacto ambiental. Cuando completes
                  más intercambios, aquí verás cuánto CO₂, residuos, agua y
                  energía has ayudado a ahorrar.
                </p>
              )}
            </section>

            {/* =====================================
             * 5) HISTORIAL DE TRANSACCIONES
             * ===================================== */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-100">
                Historial de transacciones de créditos
              </h2>
              <SectionCard title="Movimientos recientes en tu billetera">
                {movimientos.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Todavía no tienes movimientos en tu billetera de créditos.
                  </p>
                ) : (
                  <>
                    {/* Gráfico de línea para ver evolución de montos */}
                    <div className="mb-4 h-48">
                      <ResponsiveContainer>
                        <LineChart data={movimientosChartData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#1e293b"
                          />
                          <XAxis
                            dataKey="fecha"
                            tick={{ fontSize: 11 }}
                            interval="preserveStartEnd"
                          />
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
                            dataKey="monto"
                            name="Monto del movimiento"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 text-sm">
                      <table className="min-w-full border-separate border-spacing-y-1">
                        <thead>
                          <tr className="text-xs uppercase tracking-wide text-slate-400">
                            <th className="px-3 py-2 text-left">Fecha</th>
                            <th className="px-3 py-2 text-left">Tipo</th>
                            <th className="px-3 py-2 text-right">Monto</th>
                            <th className="px-3 py-2 text-right">
                              Saldo posterior
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {movimientos.slice(0, 10).map((m) => (
                            <tr
                              key={m.movimiento_id}
                              className="hover:bg-slate-900/80"
                            >
                              <td className="px-3 py-1.5 text-slate-100/90">
                                {m.fecha_movimiento
                                  ? new Date(
                                      m.fecha_movimiento
                                    ).toLocaleString()
                                  : "—"}
                              </td>
                              <td className="px-3 py-1.5 text-slate-100/90">
                                {m.tipo_codigo} – {m.tipo_descripcion}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-100/90">
                                {m.monto_signed}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-100/90">
                                {m.saldo_posterior}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {movimientos.length > 10 && (
                        <p className="px-3 pb-2 pt-1 text-xs text-slate-500">
                          Mostrando 10 de {movimientos.length} movimientos. Si
                          quieres, luego puedes agregar filtros o paginación.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </SectionCard>
            </section>

            {/* =====================================
             * 6) PARTICIPACIÓN Y RANKING GLOBAL
             * ===================================== */}
            {rankingData && (
              <section className="space-y-4">
                <h2 className="text-base font-semibold text-slate-100">
                  Participación y ranking global
                </h2>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
                  {/* Mi ranking + barra de progreso */}
                  <SectionCard title="Mi posición y progreso hacia el top">
                    {rankingData.me ? (
                      <div className="space-y-3 text-sm text-slate-300">
                        <ul className="space-y-1">
                          <li>
                            <span className="font-semibold">
                              Ranking por intercambios:
                            </span>{" "}
                            #{rankingData.me.rank_intercambios}
                          </li>
                          <li>
                            <span className="font-semibold">
                              Intercambios completados:
                            </span>{" "}
                            {rankingData.me.intercambios}
                          </li>
                          <li>
                            <span className="font-semibold">
                              Compras de créditos:
                            </span>{" "}
                            {rankingData.me.compras_creditos}
                          </li>
                          <li>
                            <span className="font-semibold">
                              Créditos comprados:
                            </span>{" "}
                            {rankingData.me.creditos_comprados}
                          </li>
                          <li>
                            <span className="font-semibold">
                              Suscripción activa:
                            </span>{" "}
                            {rankingData.me.tiene_suscripcion ? "Sí" : "No"}
                          </li>
                          <li>
                            <span className="font-semibold">Puntaje:</span>{" "}
                            {rankingData.me.puntaje}
                          </li>
                        </ul>

                        <div className="border-t border-slate-800 pt-2">
                          <p className="mb-1 text-xs text-slate-400">
                            Progreso de tus intercambios respecto al usuario top
                            del ranking.
                          </p>
                          <ProgressBar percentage={progresoTop} />
                        </div>
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        Aún no figuras en el ranking. Completa intercambios y
                        participa para subir.
                      </p>
                    )}
                  </SectionCard>

                  {/* Top 10 con tabla + gráfico (solo barras) */}
                  <SectionCard title="Top 10 usuarios por intercambios">
                    {top10.length === 0 ? (
                      <p className="text-sm text-slate-400">
                        No hay suficientes datos para mostrar el ranking.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40">
                          <table className="min-w-full text-left text-xs">
                            <thead className="border-b border-slate-800 text-slate-400">
                              <tr>
                                <th className="py-1 pr-4">#</th>
                                <th className="py-1 pr-4">Usuario</th>
                                <th className="py-1 pr-4 text-right">
                                  Intercambios
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {top10.map((u) => (
                                <tr
                                  key={u.usuario_id}
                                  className="border-b border-slate-900/80 last:border-0"
                                >
                                  <td className="py-1 pr-4">
                                    #{u.rank_intercambios}
                                  </td>
                                  <td className="py-1 pr-4">{u.nombre}</td>
                                  <td className="py-1 pr-4 text-right">
                                    {u.intercambios_hechos}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="h-40">
                          {/* Barra simple ya existente */}
                          <BarChartSimple data={topChartData} />
                        </div>
                      </div>
                    )}
                  </SectionCard>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
