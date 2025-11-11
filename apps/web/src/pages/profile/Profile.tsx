import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import { fetchPanel, getCurrentUserId } from "../../api/profile";
import type { PanelResponse } from "../../api/profile";

type Tab = "pubs" | "movs" | "impact";

export default function Profile() {
  const [data, setData] = useState<PanelResponse | null>(null);
  const [tab, setTab] = useState<Tab>("pubs");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  useEffect(() => {
    const id = getCurrentUserId();
    if (!id) {
      setMsg("Inicia sesión para ver tu perfil");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const d = await fetchPanel(id, { pubs_limit: 12, movs_limit: 20 });
        setData(d);
      } catch (e: any) {
        setMsg(e?.message || "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nombre = useMemo(() => {
    if (!data) return "";
    return data.usuario.full_name || data.usuario.email.split("@")[0];
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        <Header title="Mi Perfil" />
        <main className="mx-auto max-w-6xl p-6">Cargando…</main>
      </div>
    );
  }
  if (msg) {
    return (
      <div className="min-h-dvh bg-neutral-950 text-neutral-100">
        <Header title="Mi Perfil" />
        <main className="mx-auto max-w-6xl p-6">{msg}</main>
      </div>
    );
  }
  if (!data) return null;

  const saldo = Number(data.billetera?.saldo_disponible ?? 0);
  const trueques = Number(data.metricas?.intercambios_totales ?? 0);
  const co2 = Number(data.impacto?.total_co2_evitado ?? 0);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Mi Perfil" />
      <div className="mx-auto max-w-6xl p-4">
        {/* Header usuario */}
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
            {data.usuario.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.usuario.foto} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl opacity-70">👤</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{nombre}</h2>
            {data.usuario.acerca_de && (
              <p className="text-sm text-neutral-300">{data.usuario.acerca_de}</p>
            )}
          </div>
          <a href="/settings" className="rounded-lg border border-neutral-700 px-3 py-2 text-sm">Configuración</a>
        </div>

        {/* KPIs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <KPI label="Créditos Verdes" value={saldo.toLocaleString()} icon="🌿" highlight />
          <KPI label="Trueques" value={trueques.toString()} icon="🔁" />
          <KPI label="CO₂ Ahorrado" value={`${co2} kg`} icon="🌍" />
        </div>

        {/* Tabs */}
        <div className="mt-6 border-b border-neutral-800 flex">
          <TabBtn active={tab==="pubs"} onClick={()=>setTab("pubs")}>Mis Publicaciones</TabBtn>
          <TabBtn active={tab==="movs"} onClick={()=>setTab("movs")}>Transacciones</TabBtn>
          <TabBtn active={tab==="impact"} onClick={()=>setTab("impact")}>Impacto</TabBtn>
        </div>

        {/* Contenido */}
        <div className="mt-4">
          {tab === "pubs" && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              {data.publicaciones.map((p) => (
                <div key={p.id} className="rounded-xl border border-neutral-800 overflow-hidden">
                  <div className="aspect-square bg-neutral-900">
                    {p.foto_principal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.foto_principal} alt={p.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-60">Sin foto</div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-medium">{p.titulo}</p>
                    <p className="text-sm text-emerald-400 font-semibold">{p.valor_creditos} créditos</p>
                    <p className="text-xs text-neutral-400 mt-1">{p.categoria} • {p.estado_nombre}</p>
                  </div>
                </div>
              ))}
              {!data.publicaciones.length && (
                <p className="opacity-70">Aún no tienes publicaciones.</p>
              )}
            </div>
          )}

          {tab === "movs" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-300">
                  <tr>
                    <th className="px-2 py-2">Fecha</th>
                    <th className="px-2 py-2">Tipo</th>
                    <th className="px-2 py-2">Monto</th>
                    <th className="px-2 py-2">Saldo</th>
                    <th className="px-2 py-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientos.map(m => (
                    <tr key={m.id} className="border-t border-neutral-800">
                      <td className="px-2 py-2">{new Date(m.fecha_movimiento).toLocaleString()}</td>
                      <td className="px-2 py-2">{m.tipo_codigo}</td>
                      <td className={`px-2 py-2 ${m.monto_con_signo < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {m.monto_con_signo < 0 ? '-' : '+'}{Math.abs(m.monto_con_signo)}
                      </td>
                      <td className="px-2 py-2">{m.saldo_posterior}</td>
                      <td className="px-2 py-2">{m.descripcion ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!data.movimientos.length && <p className="opacity-70 mt-3">Sin movimientos.</p>}
            </div>
          )}

          {tab === "impact" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <KPI label="Créditos Ganados" value={Number(data.impacto?.total_creditos_ganados ?? 0).toString()} icon="🏆" />
              <KPI label="CO₂ Evitado" value={`${Number(data.impacto?.total_co2_evitado ?? 0)} kg`} icon="♻️" />
              <KPI label="Energía Ahorrada" value={`${Number(data.impacto?.total_energia_ahorrada ?? 0)} kWh`} icon="⚡" />
              <KPI label="Agua Preservada" value={`${Number(data.impacto?.total_agua_preservada ?? 0)} L`} icon="💧" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value, icon, highlight }: { label: string; value: string; icon: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 text-center ${highlight ? 'border-emerald-700' : 'border-neutral-800'}`}>
      <p className={`text-3xl font-bold ${highlight ? 'text-emerald-400' : ''}`}>{value}</p>
      <div className="text-sm opacity-80 mt-1 flex items-center justify-center gap-2">{icon}<span>{label}</span></div>
    </div>
  );
}

function TabBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: ()=>void }) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-1 py-3 text-sm font-semibold border-b-2 " +
        (active ? "border-emerald-500 text-emerald-400" : "border-transparent text-neutral-400 hover:text-neutral-200")
      }
    >
      {children}
    </button>
  );
}
