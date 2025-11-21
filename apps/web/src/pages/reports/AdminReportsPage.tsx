// apps/web/src/pages/admin/AdminReportsPage.tsx
import { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  getAdminOverview,
  getAdminTopCategorias,
  getAdminTopUsuarios,
} from "../../api/report";
import type {
  AdminDashboard,
  IntercambiosPorCategoria,
  RankingTopUsuario,
  ConsumoVsGeneracion,
  MonetizacionIngresosMes,
} from "../../types/report";

type Status = "idle" | "loading" | "success" | "error";

export default function AdminReportsPage() {
  const [overview, setOverview] = useState<AdminDashboard | null>(null);
  const [topCategorias, setTopCategorias] = useState<IntercambiosPorCategoria[]>([]);
  const [topUsuarios, setTopUsuarios] = useState<RankingTopUsuario[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setStatus("loading");
        setMsg("");

        const [ov, cats, users] = await Promise.all([
          getAdminOverview(),
          getAdminTopCategorias(),
          getAdminTopUsuarios(),
        ]);

        setOverview(ov);
        setTopCategorias(cats || []);
        setTopUsuarios(users || []);
        setStatus("success");
      } catch (e: any) {
        console.error(e);
        setMsg(e?.message || "No se pudo cargar el dashboard de administración");
        setStatus("error");
      }
    })();
  }, []);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Dashboard de administración" />
      <main className="mx-auto max-w-6xl p-4 space-y-6">
        {status === "loading" && <p>Cargando dashboard…</p>}
        {status === "error" && (
          <div className="rounded-lg border border-red-500/70 bg-red-500/10 px-3 py-2 text-sm">
            {msg}
          </div>
        )}

        {status === "success" && overview && (
          <>
            {/* Sección Monetización - tarjetas resumen */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Monetización</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {/* Ingresos totales */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <h3 className="text-xs font-semibold text-neutral-300">
                    Ingresos totales por créditos
                  </h3>
                  {overview.ingresos_total ? (
                    <div className="mt-2 space-y-1 text-sm text-neutral-300">
                      <p>
                        <span className="font-semibold">Compras OK:</span>{" "}
                        {overview.ingresos_total.compras_ok}
                      </p>
                      <p>
                        <span className="font-semibold">Créditos vendidos:</span>{" "}
                        {overview.ingresos_total.creditos_total}
                      </p>
                      <p>
                        <span className="font-semibold">Ingresos (Bs):</span>{" "}
                        {overview.ingresos_total.bs_total}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-400">
                      Sin registros de monetización todavía.
                    </p>
                  )}
                </div>

                {/* Adopción de suscripción */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <h3 className="text-xs font-semibold text-neutral-300">
                    Adopción de suscripción premium
                  </h3>
                  {overview.adopcion_suscripcion ? (
                    <div className="mt-2 space-y-1 text-sm text-neutral-300">
                      <p>
                        <span className="font-semibold">Registros:</span>{" "}
                        {overview.adopcion_suscripcion.total_registros}
                      </p>
                      <p>
                        <span className="font-semibold">Activas:</span>{" "}
                        {overview.adopcion_suscripcion.activas}
                      </p>
                      <p>
                        <span className="font-semibold">
                          Usuarios con suscripción:
                        </span>{" "}
                        {
                          overview.adopcion_suscripcion
                            .usuarios_con_suscripcion
                        }
                      </p>
                      <p>
                        <span className="font-semibold">Ratio activas:</span>{" "}
                        {overview.adopcion_suscripcion.ratio_activas != null
                          ? Number(
                              overview.adopcion_suscripcion.ratio_activas
                            ).toFixed(2)
                          : "N/D"}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-400">
                      No hay datos de suscripciones.
                    </p>
                  )}
                </div>

                {/* Intercambios */}
                <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                  <h3 className="text-xs font-semibold text-neutral-300">
                    Estado de los intercambios
                  </h3>
                  {overview.total_intercambios ? (
                    <div className="mt-2 space-y-1 text-sm text-neutral-300">
                      <p>
                        <span className="font-semibold">
                          Completados:
                        </span>{" "}
                        {overview.total_intercambios.completados}
                      </p>
                      <p>
                        <span className="font-semibold">Activos:</span>{" "}
                        {overview.total_intercambios.activos}
                      </p>
                      <p>
                        <span className="font-semibold">Total:</span>{" "}
                        {overview.total_intercambios.total}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-400">
                      No hay intercambios registrados.
                    </p>
                  )}
                </div>
              </div>

              {/* Ingresos por mes */}
              <SubTablaIngresosPorMes
                rows={overview.ingresos_por_mes || []}
              />

              {/* Consumo vs generación */}
              <SubTablaConsumoVsGeneracion
                rows={overview.consumo_vs_generacion || []}
              />
            </section>

            {/* Impacto ambiental */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">Impacto ambiental</h2>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
                {overview.impacto_total ? (
                  <ul className="space-y-1 text-sm text-neutral-300">
                    <li>
                      <span className="font-semibold">CO₂ evitado:</span>{" "}
                      {overview.impacto_total.co2} kg
                    </li>
                    <li>
                      <span className="font-semibold">Energía ahorrada:</span>{" "}
                      {overview.impacto_total.energia} kWh
                    </li>
                    <li>
                      <span className="font-semibold">Agua preservada:</span>{" "}
                      {overview.impacto_total.agua} L
                    </li>
                    <li>
                      <span className="font-semibold">Residuos evitados:</span>{" "}
                      {overview.impacto_total.residuos} kg
                    </li>
                    <li>
                      <span className="font-semibold">
                        Créditos otorgados:
                      </span>{" "}
                      {overview.impacto_total.creditos}
                    </li>
                  </ul>
                ) : (
                  <p className="text-sm text-neutral-400">
                    Aún no se ha calculado el impacto ambiental.
                  </p>
                )}
              </div>
            </section>

            {/* Categorías */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold">
                Categorías con más intercambios
              </h2>
              {topCategorias.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No hay datos suficientes de categorías.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 text-neutral-400">
                      <tr>
                        <th className="py-2 px-3">Categoría</th>
                        <th className="py-2 px-3 text-right">
                          Total intercambios
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategorias.map((c) => (
                        <tr
                          key={c.categoria_id}
                          className="border-b border-neutral-900/80 last:border-0"
                        >
                          <td className="py-2 px-3">{c.categoria}</td>
                          <td className="py-2 px-3 text-right">
                            {c.intercambios}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Top usuarios */}
            <section className="space-y-3 pb-6">
              <h2 className="text-sm font-semibold">
                Top usuarios por intercambios
              </h2>
              {topUsuarios.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No hay datos del ranking global de usuarios.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-neutral-800 bg-neutral-900/60">
                  <table className="min-w-full text-left text-xs">
                    <thead className="border-b border-neutral-800 text-neutral-400">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Usuario</th>
                        <th className="py-2 px-3 text-right">
                          Intercambios completados
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUsuarios.map((u) => (
                        <tr
                          key={u.usuario_id}
                          className="border-b border-neutral-900/80 last:border-0"
                        >
                          <td className="py-2 px-3 text-xs">
                            #{u.rank_intercambios}
                          </td>
                          <td className="py-2 px-3">{u.nombre}</td>
                          <td className="py-2 px-3 text-right">
                            {u.intercambios_hechos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function SubTablaIngresosPorMes({ rows }: { rows: MonetizacionIngresosMes[] }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-xs font-semibold text-neutral-300">
        Ingresos por mes
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="py-2 px-3">Periodo</th>
              <th className="py-2 px-3 text-right">Compras OK</th>
              <th className="py-2 px-3 text-right">Créditos</th>
              <th className="py-2 px-3 text-right">Ingresos (Bs)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.periodo}
                className="border-b border-neutral-900/80 last:border-0"
              >
                <td className="py-2 px-3">{row.periodo}</td>
                <td className="py-2 px-3 text-right">{row.compras_ok}</td>
                <td className="py-2 px-3 text-right">
                  {row.creditos_total}
                </td>
                <td className="py-2 px-3 text-right">{row.bs_total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubTablaConsumoVsGeneracion({
  rows,
}: {
  rows: ConsumoVsGeneracion[];
}) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4">
      <h3 className="text-xs font-semibold text-neutral-300">
        Consumo de créditos vs generación
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="min-w-full text-left text-xs">
          <thead className="border-b border-neutral-800 text-neutral-400">
            <tr>
              <th className="py-2 px-3">Origen</th>
              <th className="py-2 px-3 text-right">Total créditos</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.origen}
                className="border-b border-neutral-900/80 last:border-0"
              >
                <td className="py-2 px-3">{row.origen}</td>
                <td className="py-2 px-3 text-right">{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-neutral-400">
        Este indicador compara créditos que provienen de compra directa vs
        créditos generados por intercambios u otras acciones.
      </p>
    </div>
  );
}
