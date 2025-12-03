// apps/web/src/pages/reports/UserReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import KPICard from "../../components/Reportes/KPICard";
import SectionCard from "../../components/Reportes/SectionCard";
import {
  getUserDashboard,
  getTopRankingIntercambios,
  getTopRankingPuntaje,
  getUserCreditosSeries,
  getUserIntercambiosSeries,
  getUserPuntosSeries,
  type UserDashboardResponse,
  type UserRankingTopIntercambios,
  type UserRankingTopPuntaje,
  type UserCreditosMes,
  type UserIntercambiosMes,
  type UserPuntosMes,
} from "../../api/reports_user";

import { getCurrentUserId } from "../../api/profile";

type Status = "idle" | "loading" | "success" | "error";

export default function UserReportsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [data, setData] = useState<UserDashboardResponse | null>(null);

  const [topIntercambios, setTopIntercambios] = useState<
    UserRankingTopIntercambios[]
  >([]);
  const [topPuntaje, setTopPuntaje] = useState<UserRankingTopPuntaje[]>([]);

  const [seriesCreditos, setSeriesCreditos] = useState<UserCreditosMes[]>([]);
  const [seriesIntercambios, setSeriesIntercambios] = useState<
    UserIntercambiosMes[]
  >([]);
  const [seriesPuntos, setSeriesPuntos] = useState<UserPuntosMes[]>([]);

  const usuarioId = useMemo(() => getCurrentUserId(), []);

  useEffect(() => {
    if (!usuarioId) {
      setStatus("error");
      setErrorMsg("Debes iniciar sesión para ver tus reportes personales.");
      return;
    }

    (async () => {
      try {
        setStatus("loading");
        setErrorMsg("");

        const [
          dashboardResp,
          rankingInterResp,
          rankingPuntajeResp,
          creditosSeriesResp,
          intercSeriesResp,
          puntosSeriesResp,
        ] = await Promise.all([
          getUserDashboard(usuarioId),
          getTopRankingIntercambios(10),
          getTopRankingPuntaje(10),
          getUserCreditosSeries(usuarioId),
          getUserIntercambiosSeries(usuarioId),
          getUserPuntosSeries(usuarioId),
        ]);

        setData(dashboardResp);
        setTopIntercambios(rankingInterResp);
        setTopPuntaje(rankingPuntajeResp);
        setSeriesCreditos(creditosSeriesResp);
        setSeriesIntercambios(intercSeriesResp);
        setSeriesPuntos(puntosSeriesResp);

        setStatus("success");
      } catch (err: any) {
        console.error("Error cargando reportes de usuario:", err);
        setErrorMsg(
          err?.message || "No se pudieron cargar tus reportes personales"
        );
        setStatus("error");
      }
    })();
  }, [usuarioId]);

  const actividad = data?.actividad ?? null;
  const ranking = data?.ranking ?? null;
  const resumen = data?.resumen_creditos ?? null;
  const saldo = data?.saldo ?? null;
  const compras = data?.compras_creditos ?? null;
  const movimientos = data?.movimientos ?? [];
  const impacto = data?.impacto_ambiental ?? null;
  const suscripcion = (data as any)?.suscripcion_resumen ?? null; // por si tu tipo aún no lo tiene

  const movimientosTop10 = useMemo(
    () => movimientos.slice(0, 10),
    [movimientos]
  );

  // Max para rankings (para altura de barras)
  const maxIntercambios = useMemo(
    () =>
      topIntercambios.reduce(
        (max, r) => (r.intercambios > max ? r.intercambios : max),
        0
      ),
    [topIntercambios]
  );

  const maxPuntaje = useMemo(
    () =>
      topPuntaje.reduce((max, r) => (r.puntaje > max ? r.puntaje : max), 0),
    [topPuntaje]
  );

  // Max para series
  const maxCreditos = useMemo(() => {
    if (seriesCreditos.length === 0) return 0;
    return seriesCreditos.reduce((max, s) => {
      const localMax = Math.max(
        s.creditos_ingresados || 0,
        s.creditos_gastados || 0
      );
      return localMax > max ? localMax : max;
    }, 0);
  }, [seriesCreditos]);

  const maxIntercambiosMes = useMemo(() => {
    if (seriesIntercambios.length === 0) return 0;
    return seriesIntercambios.reduce(
      (max, s) =>
        s.total_intercambios > max ? s.total_intercambios : max,
      0
    );
  }, [seriesIntercambios]);

  const maxPuntosMes = useMemo(() => {
    if (seriesPuntos.length === 0) return 0;
    return seriesPuntos.reduce(
      (max, s) => (s.puntos_mes > max ? s.puntos_mes : max),
      0
    );
  }, [seriesPuntos]);

  const formatPeriodoLabel = (label: string) => {
    if (!label.includes("-")) return label;
    const [year, month] = label.split("-");
    return `${month}/${year.slice(2)}`;
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        {/* Título */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-50">
              Mis reportes personales
            </h1>
            <p className="text-xs text-slate-400">
              Vista general de tu actividad, créditos e impacto ambiental.
            </p>
          </div>
        </div>

        {/* Estados */}
        {status === "loading" && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
            Cargando tus reportes personales…
          </div>
        )}

        {status === "error" && (
          <div className="rounded-xl border border-red-500/60 bg-red-900/20 px-4 py-3 text-sm">
            <p className="font-medium text-red-300">
              Ocurrió un error al cargar la información.
            </p>
            <p className="mt-1 text-slate-200/80">{errorMsg}</p>
          </div>
        )}

        {status === "success" && data && (
          <>
            {/* 1) KPIs rápidos (ahora más grandes por el KPICard) */}
            <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <KPICard
                label="Créditos totales en billetera"
                value={Number(saldo?.saldo_total ?? 0)}
                helperText={
                  saldo
                    ? `Disponible: ${saldo.saldo_disponible} · Retenido: ${saldo.saldo_retenido}`
                    : "No se encontró una billetera asociada."
                }
              />

              <KPICard
                label="Créditos comprados (histórico)"
                value={Number(compras?.creditos_total ?? 0)}
                helperText={
                  compras
                    ? `Compras completadas: ${compras.compras_ok} · Invertido: ${compras.bs_total} Bs`
                    : "Todavía no has comprado créditos."
                }
              />

              <KPICard
                label="Intercambios completados"
                value={Number(
                  (resumen?.intercambios_como_comprador ?? 0) +
                    (resumen?.intercambios_como_vendedor ?? 0)
                )}
                helperText={
                  resumen
                    ? `Comprador: ${resumen.intercambios_como_comprador} · Vendedor: ${resumen.intercambios_como_vendedor}`
                    : "Aún no tienes intercambios completados."
                }
              />

              <KPICard
                label="Créditos verdes ganados"
                value={Number(impacto?.total_creditos_ganados ?? 0)}
                helperText={
                  impacto
                    ? "Créditos obtenidos por impacto ambiental positivo."
                    : "Aún no has generado impacto ambiental registrado."
                }
              />
            </section>

            {/* 2) Info cuenta + actividad */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-[1.1fr_1fr]">
              <SectionCard title="Mi información de cuenta">
                {resumen ? (
                  <div className="space-y-1 text-sm text-slate-200">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {resumen.email}
                    </p>
                    <p>
                      <span className="font-semibold">Rol:</span>{" "}
                      {resumen.rol ?? "usuario"}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Fecha de registro:
                      </span>{" "}
                      {resumen.created_at
                        ? new Date(resumen.created_at).toLocaleString()
                        : "—"}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Créditos comprados:
                      </span>{" "}
                      {resumen.creditos_comprados}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Total invertido en créditos (Bs):
                      </span>{" "}
                      {resumen.bs_total_invertido}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    No se encontró un resumen detallado de tu cuenta.
                  </p>
                )}

                {ranking && (
                  <div className="mt-4 border-t border-slate-800 pt-3 text-sm text-slate-200">
                    <p className="font-semibold text-slate-100">
                      Mi participación en la comunidad
                    </p>
                    <p className="mt-1">
                      <span className="font-semibold">
                        Ranking por intercambios:
                      </span>{" "}
                      #{ranking.rank_intercambios}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Intercambios completados:
                      </span>{" "}
                      {ranking.intercambios}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Suscripción actual:
                      </span>{" "}
                      {suscripcion
                        ? suscripcion.tiene_suscripcion_activa
                          ? suscripcion.plan_nombre ?? "Plan activo"
                          : "Sin suscripción activa"
                        : ranking.tiene_suscripcion
                        ? "Con suscripción activa"
                        : "Sin suscripción"}
                    </p>
                    <p>
                      <span className="font-semibold">Puntaje:</span>{" "}
                      {ranking.puntaje}
                    </p>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="Mi actividad reciente">
                {actividad ? (
                  <div className="space-y-1 text-sm text-slate-200">
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {actividad.email}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Última actividad:
                      </span>{" "}
                      {actividad.ultima_actividad
                        ? new Date(
                            actividad.ultima_actividad
                          ).toLocaleString()
                        : "—"}
                    </p>
                    {actividad.tipo_actividad && (
                      <p>
                        <span className="font-semibold">
                          Tipo de actividad:
                        </span>{" "}
                        {actividad.tipo_actividad}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Todavía no registras actividad en el sistema.
                  </p>
                )}
              </SectionCard>
            </section>

            {/* 3) Rankings con gráfico de barras vertical */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-slate-100">
                Rankings de la comunidad
              </h2>

              {/* Top por intercambios */}
              <SectionCard title="Top 10 por intercambios completados">
                {topIntercambios.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente actividad para mostrar el ranking.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex h-56 items-end gap-3 overflow-x-auto pb-2">
                      {topIntercambios.map((row) => {
                        const esActual =
                          row.usuario_id === resumen?.usuario_id;
                        const pct =
                          maxIntercambios > 0
                            ? (row.intercambios / maxIntercambios) * 100
                            : 0;

                        return (
                          <div
                            key={`bar-inter-${row.usuario_id}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex h-40 w-8 items-end rounded-xl bg-slate-900/70">
                              <div
                                className={`w-full rounded-xl bg-gradient-to-t ${
                                  esActual
                                    ? "from-emerald-400 to-emerald-200"
                                    : "from-emerald-700 to-emerald-400"
                                }`}
                                style={{
                                  height: `${Math.max(pct, 10)}%`,
                                }}
                                title={`${row.display_name}: ${row.intercambios} intercambios`}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-200">
                              #{row.rank_intercambios}
                            </span>
                            <span className="max-w-[72px] truncate text-[10px] text-slate-300">
                              {row.display_name}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-300">
                              {row.intercambios}
                            </span>
                            {esActual && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-200">
                                Tú
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Barras más altas = más intercambios completados. La barra
                      verde clara indica tu posición.
                    </p>
                  </div>
                )}
              </SectionCard>

              {/* Top por puntaje */}
              <SectionCard title="Top 10 por puntaje (gamificación)">
                {topPuntaje.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente actividad para mostrar el ranking de
                    puntaje.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="flex h-56 items-end gap-3 overflow-x-auto pb-2">
                      {topPuntaje.map((row) => {
                        const esActual =
                          row.usuario_id === resumen?.usuario_id;
                        const pct =
                          maxPuntaje > 0
                            ? (row.puntaje / maxPuntaje) * 100
                            : 0;

                        return (
                          <div
                            key={`bar-punt-${row.usuario_id}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex h-40 w-8 items-end rounded-xl bg-slate-900/70">
                              <div
                                className={`w-full rounded-xl bg-gradient-to-t ${
                                  esActual
                                    ? "from-sky-400 to-sky-200"
                                    : "from-sky-700 to-sky-400"
                                }`}
                                style={{
                                  height: `${Math.max(pct, 10)}%`,
                                }}
                                title={`${row.display_name}: ${row.puntaje} pts`}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-200">
                              #{row.rank_puntaje}
                            </span>
                            <span className="max-w-[72px] truncate text-[10px] text-slate-300">
                              {row.display_name}
                            </span>
                            <span className="text-[11px] font-semibold text-sky-300">
                              {row.puntaje}
                            </span>
                            {esActual && (
                              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[9px] font-semibold text-sky-200">
                                Tú
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      El puntaje resume tus acciones de gamificación (registro,
                      publicaciones, intercambios, reseñas, referidos, etc.).
                    </p>
                  </div>
                )}
              </SectionCard>
            </section>

            {/* 4) Gráficos de series (opcional, ya estaban) */}
            <section className="grid gap-4 lg:grid-cols-3">
              {/* Créditos por mes */}
              <SectionCard title="Créditos por mes">
                {seriesCreditos.length === 0 || maxCreditos === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente historial de créditos para mostrar el
                    gráfico.
                  </p>
                ) : (
                  <>
                    <div className="flex h-48 items-end gap-2 overflow-x-auto">
                      {seriesCreditos.map((s) => {
                        const inPct =
                          (s.creditos_ingresados / maxCreditos) * 100 || 0;
                        const outPct =
                          (s.creditos_gastados / maxCreditos) * 100 || 0;

                        return (
                          <div
                            key={`cred-${s.periodo_label}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex h-32 w-6 flex-col justify-end gap-0.5">
                              <div
                                className="w-full rounded-t-md bg-emerald-400"
                                style={{ height: `${Math.max(inPct, 6)}%` }}
                                title={`Ingresados: ${s.creditos_ingresados}`}
                              />
                              <div
                                className="w-full rounded-b-md bg-sky-400"
                                style={{ height: `${Math.max(outPct, 6)}%` }}
                                title={`Gastados: ${s.creditos_gastados}`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-300">
                              {formatPeriodoLabel(s.periodo_label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Verde: créditos que ingresaron a tu billetera. Azul:
                      créditos gastados.
                    </p>
                  </>
                )}
              </SectionCard>

              {/* Intercambios por mes */}
              <SectionCard title="Intercambios por mes">
                {seriesIntercambios.length === 0 ||
                maxIntercambiosMes === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente historial de intercambios.
                  </p>
                ) : (
                  <>
                    <div className="flex h-48 items-end gap-2 overflow-x-auto">
                      {seriesIntercambios.map((s) => {
                        const compPct =
                          (s.intercambios_completados /
                            (maxIntercambiosMes || 1)) *
                          100;
                        const pendPct =
                          (s.intercambios_pendientes /
                            (maxIntercambiosMes || 1)) *
                          100;

                        return (
                          <div
                            key={`int-${s.periodo_label}`}
                            className="flex flex-col items-center gap-1"
                          >
                            <div className="flex h-32 w-6 flex-col justify-end">
                              <div
                                className="w-full rounded-t-md bg-emerald-400"
                                style={{ height: `${Math.max(compPct, 6)}%` }}
                                title={`Completados: ${s.intercambios_completados}`}
                              />
                              <div
                                className="w-full rounded-b-md bg-amber-400"
                                style={{ height: `${Math.max(pendPct, 0)}%` }}
                                title={`Activos/pendientes: ${s.intercambios_pendientes}`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-300">
                              {formatPeriodoLabel(s.periodo_label)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="mt-2 text-[11px] text-slate-400">
                      Verde: intercambios completados. Amarillo: activos o
                      pendientes.
                    </p>
                  </>
                )}
              </SectionCard>

              {/* Puntos por mes */}
              <SectionCard title="Puntos ganados por mes">
                {seriesPuntos.length === 0 || maxPuntosMes === 0 ? (
                  <p className="text-sm text-slate-400">
                    Todavía no acumulas suficientes acciones para mostrar la
                    curva de puntos.
                  </p>
                ) : (
                  <>
                    <div className="h-44 w-full">
                      <svg
                        viewBox="0 0 100 100"
                        className="h-full w-full text-emerald-400"
                        preserveAspectRatio="none"
                      >
                        <line
                          x1="0"
                          y1="100"
                          x2="100"
                          y2="100"
                          className="stroke-slate-600"
                          strokeWidth={0.5}
                        />
                        {seriesPuntos.length > 1 && (
                          <polyline
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.4}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            points={seriesPuntos
                              .map((s, idx) => {
                                const x =
                                  (idx /
                                    (seriesPuntos.length - 1 || 1)) *
                                  100;
                                const y =
                                  100 -
                                  (s.puntos_mes / (maxPuntosMes || 1)) *
                                    90;
                                return `${x},${y}`;
                              })
                              .join(" ")}
                          />
                        )}
                        {seriesPuntos.map((s, idx) => {
                          const x =
                            (idx /
                              (Math.max(seriesPuntos.length - 1, 1))) *
                            100;
                          const y =
                            100 -
                            (s.puntos_mes / (maxPuntosMes || 1)) * 90;
                          return (
                            <circle
                              key={`pt-${s.periodo_label}`}
                              cx={x}
                              cy={y}
                              r={1.4}
                              className="fill-emerald-400"
                            />
                          );
                        })}
                      </svg>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-slate-300">
                      {seriesPuntos.map((s) => (
                        <span key={`lbl-${s.periodo_label}`}>
                          {formatPeriodoLabel(s.periodo_label)}:{" "}
                          <span className="font-semibold text-emerald-300">
                            {s.puntos_mes} pts
                          </span>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </SectionCard>
            </section>

            {/* 5) Historial de movimientos */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-100">
                Historial de movimientos de créditos
              </h2>
              <SectionCard title="Movimientos recientes">
                {movimientosTop10.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Todavía no tienes movimientos en tu billetera de créditos.
                  </p>
                ) : (
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
                        {movimientosTop10.map((m) => (
                          <tr
                            key={m.movimiento_id}
                            className="align-middle hover:bg-slate-900/60"
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
                    {movimientos.length > movimientosTop10.length && (
                      <p className="px-3 pb-2 pt-1 text-xs text-slate-500">
                        Mostrando {movimientosTop10.length} de{" "}
                        {movimientos.length} movimientos.
                      </p>
                    )}
                  </div>
                )}
              </SectionCard>
            </section>

            {/* 6) Impacto ambiental */}
            <section className="space-y-3">
              <h2 className="text-base font-semibold text-slate-100">
                Mi impacto ambiental
              </h2>
              <SectionCard>
                {impacto ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <KPICard
                      label="CO₂ evitado (kg)"
                      value={impacto.total_co2_evitado ?? 0}
                      helperText="Por tus intercambios completados."
                    />
                    <KPICard
                      label="Energía ahorrada (kWh)"
                      value={impacto.total_energia_ahorrada ?? 0}
                    />
                    <KPICard
                      label="Agua preservada (L)"
                      value={impacto.total_agua_preservada ?? 0}
                    />
                    <KPICard
                      label="Residuos evitados (kg)"
                      value={impacto.total_residuos_evitados ?? 0}
                    />
                    <KPICard
                      label="Créditos verdes ganados"
                      value={impacto.total_creditos_ganados ?? 0}
                      helperText={
                        impacto.ultima_actualizacion
                          ? `Actualizado por última vez: ${new Date(
                              impacto.ultima_actualizacion
                            ).toLocaleDateString()}`
                          : undefined
                      }
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">
                    Aún no se ha calculado tu impacto ambiental.
                  </p>
                )}
              </SectionCard>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
