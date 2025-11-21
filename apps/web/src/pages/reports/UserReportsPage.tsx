// apps/web/src/pages/profile/UserReportsPage.tsx
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import { getUserSummary, getUserRanking } from "../../api/report";
import type { UserDashboardSummary, UserRankingData } from "../../types/report";

type Status = "idle" | "loading" | "success" | "error";

export default function UserReportsPage() {
  const [summary, setSummary] = useState<UserDashboardSummary | null>(null);
  const [rankingData, setRankingData] = useState<UserRankingData | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        setMsg("");
        const [s, r] = await Promise.all([getUserSummary(), getUserRanking()]);
        setSummary(s);
        setRankingData(r);
        setStatus("success");
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudieron cargar tus reportes");
        setStatus("error");
      }
    })();
  }, []);

  // Mismas clases base que Profile.tsx
  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Mis reportes" />
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        {status === "loading" && <p>Cargando tus reportes…</p>}
        {status === "error" && (
          <div className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {status === "success" && summary && (
          <>
            {/* Resumen rápido */}
            <section className="grid gap-4 md:grid-cols-3">
              {/* Actividad */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <h2 className="text-sm font-semibold text-neutral-200">
                  Actividad reciente
                </h2>
                {summary.actividad ? (
                  <div className="mt-2 space-y-1 text-sm text-neutral-300">
                    <p>
                      <span className="font-semibold">Última actividad:</span>{" "}
                      {new Date(
                        summary.actividad.ultima_actividad
                      ).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {summary.actividad.email}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-neutral-400">
                    Todavía no registras actividad en el sistema.
                  </p>
                )}
              </div>

              {/* Saldo */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <h2 className="text-sm font-semibold text-neutral-200">
                  Mi saldo de créditos
                </h2>
                {summary.saldo ? (
                  <div className="mt-2 space-y-1 text-sm text-neutral-300">
                    <p>
                      <span className="font-semibold">Disponible:</span>{" "}
                      {summary.saldo.saldo_disponible}
                    </p>
                    <p>
                      <span className="font-semibold">Retenido:</span>{" "}
                      {summary.saldo.saldo_retenido}
                    </p>
                    <p>
                      <span className="font-semibold">Total:</span>{" "}
                      {summary.saldo.saldo_total}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-neutral-400">
                    No se encontró una billetera asociada.
                  </p>
                )}
              </div>

              {/* Compras */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                <h2 className="text-sm font-semibold text-neutral-200">
                  Compras de créditos
                </h2>
                {summary.compras ? (
                  <div className="mt-2 space-y-1 text-sm text-neutral-300">
                    <p>
                      <span className="font-semibold">
                        Transacciones completadas:
                      </span>{" "}
                      {summary.compras.compras_ok}
                    </p>
                    <p>
                      <span className="font-semibold">Total gastado (Bs):</span>{" "}
                      {summary.compras.bs_total}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Créditos comprados:
                      </span>{" "}
                      {summary.compras.creditos_total}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-neutral-400">
                    Todavía no has comprado créditos.
                  </p>
                )}
              </div>
            </section>

            {/* Ranking */}
            {rankingData && (
              <section className="space-y-4">
                <h2 className="text-base font-semibold">Participación</h2>
                <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
                  {/* Mi ranking */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <h3 className="text-sm font-semibold text-neutral-200">
                      Mi posición
                    </h3>
                    {rankingData.me ? (
                      <ul className="mt-2 space-y-1 text-sm text-neutral-300">
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
                    ) : (
                      <p className="mt-2 text-sm text-neutral-400">
                        Aún no figuras en el ranking. Completa intercambios y
                        participa para subir.
                      </p>
                    )}
                  </div>

                  {/* Top 10 */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                    <h3 className="text-sm font-semibold text-neutral-200">
                      Top 10 usuarios
                    </h3>
                    {rankingData.top10.length === 0 ? (
                      <p className="mt-2 text-sm text-neutral-400">
                        No hay suficientes datos para mostrar el ranking.
                      </p>
                    ) : (
                      <div className="mt-2 overflow-x-auto">
                        <table className="min-w-full text-left text-xs">
                          <thead className="border-b border-neutral-800 text-neutral-400">
                            <tr>
                              <th className="py-1 pr-4">#</th>
                              <th className="py-1 pr-4">Usuario</th>
                              <th className="py-1 pr-4 text-right">
                                Intercambios
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rankingData.top10.map((u) => (
                              <tr
                                key={u.usuario_id}
                                className="border-b border-neutral-900/80 last:border-0"
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
                    )}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
