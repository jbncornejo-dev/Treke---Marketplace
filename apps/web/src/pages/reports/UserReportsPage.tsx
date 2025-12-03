// apps/web/src/pages/reports/UserReportsPage.tsx
import { useEffect, useState, useMemo } from "react";
import Header from "../../components/Header";
import KPICard from "../../components/Reportes/KPICard";
import SectionCard from "../../components/Reportes/SectionCard";
import {
  getUserDashboard,
  getTopRankingIntercambios,
  getTopRankingPuntaje,
  type UserDashboardResponse,
  type UserRankingTopIntercambios,
  type UserRankingTopPuntaje,
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

        const [dashboardResp, rankingInterResp, rankingPuntajeResp] =
          await Promise.all([
            getUserDashboard(usuarioId),
            getTopRankingIntercambios(10),
            getTopRankingPuntaje(10),
          ]);

        setData(dashboardResp);
        setTopIntercambios(rankingInterResp);
        setTopPuntaje(rankingPuntajeResp);
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
  const suscripcion = data?.suscripcion_resumen ?? null;

  const movimientosTop10 = useMemo(
    () => movimientos.slice(0, 10),
    [movimientos]
  );

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-slate-50">
            Mis reportes personales
          </h1>
          <p className="text-xs text-slate-400">
            Vista general de tu actividad, créditos e impacto ambiental.
          </p>
        </div>

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
            {/* 1) KPIs RÁPIDOS */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                    ? `Compras completadas: ${compras.compras_ok} · Total invertido: ${compras.bs_total} Bs`
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
                    ? `Como comprador: ${resumen.intercambios_como_comprador} · Como vendedor: ${resumen.intercambios_como_vendedor}`
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

            {/* 2) INFO CUENTA + ACTIVIDAD */}
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

                    {suscripcion ? (
                      <p>
                        <span className="font-semibold">
                          Suscripción actual:
                        </span>{" "}
                        {suscripcion.tiene_suscripcion_activa
                          ? suscripcion.plan_nombre ?? "Plan activo"
                          : "Sin suscripción activa"}
                      </p>
                    ) : (
                      <p>
                        <span className="font-semibold">
                          Suscripción actual:
                        </span>{" "}
                        {ranking.tiene_suscripcion
                          ? "Con suscripción activa"
                          : "Sin suscripción"}
                      </p>
                    )}

                    <p>
                      <span className="font-semibold">Puntaje:</span>{" "}
                      {ranking.puntaje}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      El puntaje es tu score de gamificación: sube al
                      registrarte, completar perfil, publicar, completar
                      intercambios, recibir buenas reseñas, referir amigos y
                      entrar diariamente a TREKE.
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

            {/* 3) RANKINGS GLOBALES */}
            <section className="space-y-4">
              <h2 className="text-base font-semibold text-slate-100">
                Rankings de la comunidad
              </h2>

              {/* 3.1 Ranking por intercambios */}
              <SectionCard title="Top 10 por intercambios completados">
                {topIntercambios.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente actividad para mostrar el ranking.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 text-sm">
                    <table className="min-w-full border-separate border-spacing-y-1">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-2 text-left">Posición</th>
                          <th className="px-3 py-2 text-left">Usuario</th>
                          <th className="px-3 py-2 text-right">
                            Intercambios completados
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {topIntercambios.map((row) => {
                          const esActual =
                            row.usuario_id === resumen?.usuario_id;
                          return (
                            <tr
                              key={`top-inter-${row.usuario_id}`}
                              className={
                                "align-middle hover:bg-slate-900/60" +
                                (esActual
                                  ? " bg-emerald-900/40 border border-emerald-500/30"
                                  : "")
                              }
                            >
                              <td className="px-3 py-1.5 text-slate-100/90">
                                #{row.rank_intercambios}
                                {esActual && (
                                  <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                    Tú
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1.5 text-slate-100/90">
                                {row.display_name}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-100/90">
                                {row.intercambios}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>

              {/* 3.2 Ranking por puntaje */}
              <SectionCard title="Top 10 por puntaje (gamificación)">
                {topPuntaje.length === 0 ? (
                  <p className="text-sm text-slate-400">
                    Aún no hay suficiente actividad para mostrar el ranking de
                    puntaje.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/40 text-sm">
                    <table className="min-w-full border-separate border-spacing-y-1">
                      <thead>
                        <tr className="text-xs uppercase tracking-wide text-slate-400">
                          <th className="px-3 py-2 text-left">Posición</th>
                          <th className="px-3 py-2 text-left">Usuario</th>
                          <th className="px-3 py-2 text-right">Puntaje</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPuntaje.map((row) => {
                          const esActual =
                            row.usuario_id === resumen?.usuario_id;
                          return (
                            <tr
                              key={`top-puntaje-${row.usuario_id}`}
                              className={
                                "align-middle hover:bg-slate-900/60" +
                                (esActual
                                  ? " bg-emerald-900/40 border border-emerald-500/30"
                                  : "")
                              }
                            >
                              <td className="px-3 py-1.5 text-slate-100/90">
                                #{row.rank_puntaje}
                                {esActual && (
                                  <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                    Tú
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-1.5 text-slate-100/90">
                                {row.display_name}
                              </td>
                              <td className="px-3 py-1.5 text-right text-slate-100/90">
                                {row.puntaje}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionCard>
            </section>

            {/* 4) IMPACTO AMBIENTAL */}
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

            {/* 5) MOVIMIENTOS */}
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
          </>
        )}
      </main>
    </div>
  );
}
