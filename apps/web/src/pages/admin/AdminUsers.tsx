import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  BarChart3,
  Megaphone,
  Trophy,
  Users,
  Settings,
  Bell,
  Package,
  Heart,
  History,
  Leaf,
  MessageSquare,
  Wallet,
  Star
} from "lucide-react";

import {
  fetchPanel,
  getCurrentUserId,
  type PanelResponse,
} from "../../api/profile";

// Tipo Tab
type Tab = "pubs" | "movs" | "impact" | "reviews" | "favs";

export default function AdminProfile() {
  const [data, setData] = useState<PanelResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("pubs");

  useEffect(() => {
    const id = getCurrentUserId();
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        // Traemos todo: publicaciones, movimientos, favoritos, etc.
        const d = await fetchPanel(id, { pubs_limit: 12, movs_limit: 20 });
        setData(d);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const nombre = useMemo(() => {
    if (!data) return "Administrador";
    return data.usuario.full_name || "Admin";
  }, [data]);

  const saldo = Number(data?.billetera?.saldo_disponible ?? 0);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20">
      
      {/* --- HEADER ADMIN (Violeta) --- */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Info Perfil */}
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-violet-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                   {data?.usuario.foto ? (
                      <img src={data.usuario.foto} className="w-full h-full object-cover" />
                   ) : (
                      <ShieldCheck size={40} className="text-violet-600" />
                   )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full border-2 border-white shadow-sm">
                   ADMIN
                </div>
              </div>
              
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{nombre}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 justify-center md:justify-start">
                    <span className="flex items-center gap-1"><Wallet size={14} className="text-violet-500"/> {saldo} Créditos</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400"/> {Number(data?.usuario.calificacion_prom).toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="flex gap-3">
               <button className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                  <Bell size={20} />
               </button>
               <Link to="/settings" className="p-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-violet-50 hover:text-violet-600 transition-colors">
                  <Settings size={20} />
               </Link>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-10">

        {/* --- 1. HERRAMIENTAS DE GESTIÓN (Exclusivo Admin) --- */}
        <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                Panel de Control
                <span className="h-px bg-gray-200 flex-1"></span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <AdminToolCard to="/admin/usuarios" title="Usuarios" desc="Roles y Accesos" icon={<Users size={24} />} color="violet" />
                <AdminToolCard to="/admin/reportes" title="Reportes" desc="Métricas Globales" icon={<BarChart3 size={24} />} color="blue" />
                <AdminToolCard to="/perfil/gamificacion" title="Gamificación" desc="Niveles y Logros" icon={<Trophy size={24} />} color="amber" />
                <AdminToolCard to="/admin/anuncios" title="Anuncios" desc="Publicidad" icon={<Megaphone size={24} />} color="rose" />
            </div>
        </section>

        {/* --- 2. ACTIVIDAD PERSONAL (Igual que perfil normal) --- */}
        <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                Tu Actividad Personal
                <span className="h-px bg-gray-200 flex-1"></span>
            </h2>

            {/* Tabs de Navegación */}
            <div className="flex overflow-x-auto no-scrollbar gap-2 mb-6 border-b border-gray-200 pb-1">
                <TabButton active={tab === "pubs"} onClick={() => setTab("pubs")} icon={<Package size={18} />} label="Publicaciones" />
                <TabButton active={tab === "favs"} onClick={() => setTab("favs")} icon={<Heart size={18} />} label="Favoritos" />
                <TabButton active={tab === "movs"} onClick={() => setTab("movs")} icon={<History size={18} />} label="Historial" />
                <TabButton active={tab === "impact"} onClick={() => setTab("impact")} icon={<Leaf size={18} />} label="Impacto" />
                <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} icon={<MessageSquare size={18} />} label="Reseñas" />
            </div>

            {/* Contenido de Tabs */}
            <div className="min-h-[300px]">
                
                {/* PUBLICACIONES */}
                {tab === "pubs" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {data?.publicaciones.map((p) => (
                            <Link to={`/market/${p.id}`} key={p.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                                <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                                    {p.foto_principal ? (
                                        <img src={p.foto_principal} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : ( <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div> )}
                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm uppercase">{p.estado_nombre}</div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 truncate mb-1">{p.titulo}</h3>
                                    <span className="text-violet-600 font-bold text-sm">{p.valor_creditos} Cr</span>
                                </div>
                            </Link>
                        ))}
                        {!data?.publicaciones.length && <EmptyState icon={<Package size={32}/>} msg="No tienes publicaciones." />}
                    </div>
                )}

                {/* FAVORITOS */}
                {tab === "favs" && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {data?.favoritos && data.favoritos.map((p) => (
                            <Link to={`/market/${p.id}`} key={p.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
                                <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                                    {p.foto_principal ? (
                                        <img src={p.foto_principal} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : ( <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div> )}
                                    <div className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-500"><Heart size={14} className="fill-current"/></div>
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-gray-900 truncate mb-1">{p.titulo}</h3>
                                    <span className="text-violet-600 font-bold text-sm">{p.valor_creditos} Cr</span>
                                </div>
                            </Link>
                        ))}
                        {(!data?.favoritos || !data.favoritos.length) && <EmptyState icon={<Heart size={32}/>} msg="No tienes favoritos." />}
                    </div>
                )}

                {/* HISTORIAL */}
                {tab === "movs" && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-400 uppercase text-xs">
                                <tr><th className="px-6 py-3">Fecha</th><th className="px-6 py-3">Detalle</th><th className="px-6 py-3 text-right">Monto</th></tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data?.movimientos.map(m => (
                                    <tr key={m.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-gray-500">{new Date(m.fecha_movimiento).toLocaleDateString()}</td>
                                        <td className="px-6 py-3">
                                            <p className="font-medium text-gray-900">{m.tipo_codigo}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{m.descripcion}</p>
                                        </td>
                                        <td className={`px-6 py-3 text-right font-bold ${m.monto_con_signo > 0 ? 'text-violet-600' : 'text-gray-900'}`}>
                                            {m.monto_con_signo > 0 ? '+' : ''}{m.monto_con_signo}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!data?.movimientos.length && <EmptyState icon={<History size={32}/>} msg="Sin movimientos." />}
                    </div>
                )}

                {/* IMPACTO */}
                {tab === "impact" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ImpactCard label="Residuos Evitados" value={Number(data?.impacto?.total_residuos_evitados?? 0)} unit="u" icon="🗑️" />
                        <ImpactCard label="CO₂ Evitado" value={Number(data?.impacto?.total_co2_evitado ?? 0)} unit="kg" icon="☁️" color="emerald" />
                        <ImpactCard label="Energía" value={Number(data?.impacto?.total_energia_ahorrada ?? 0)} unit="kWh" icon="⚡" color="amber" />
                        <ImpactCard label="Agua" value={Number(data?.impacto?.total_agua_preservada ?? 0)} unit="L" icon="💧" color="blue" />
                    </div>
                )}

                {/* RESEÑAS */}
                {tab === "reviews" && (
                    <div className="grid gap-4 md:grid-cols-2">
                        {data?.reviews?.length ? data.reviews.map(r => (
                            <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-sm">{r.autor_nombre}</span>
                                    <div className="flex text-amber-400"><Star size={12} className="fill-current"/> <span className="text-xs text-gray-500 ml-1">{r.calificacion}</span></div>
                                </div>
                                <p className="text-sm text-gray-600 italic">"{r.comentario}"</p>
                            </div>
                        )) : <EmptyState icon={<MessageSquare size={32}/>} msg="Sin reseñas." />}
                    </div>
                )}

            </div>
        </section>

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function AdminToolCard({ to, title, desc, icon, color }: any) {
    const colors: any = {
        violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white",
        blue:   "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
        amber:  "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
        rose:   "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white",
    };
    return (
        <Link to={to} className="group bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${colors[color]}`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{title}</h3>
                <p className="text-xs text-gray-500">{desc}</p>
            </div>
        </Link>
    );
}

function TabButton({ label, active, onClick, icon }: any) {
    return (
       <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
             active ? "bg-violet-100 text-violet-700" : "text-gray-500 hover:bg-gray-100"
          }`}
       >
          {icon} {label}
       </button>
    );
 }

 function ImpactCard({ label, value, unit, icon, color = "gray" }: any) {
    const colors: any = {
       emerald: "border-emerald-200 bg-emerald-50",
       amber: "border-amber-200 bg-amber-50",
       blue: "border-blue-200 bg-blue-50",
       gray: "border-gray-200 bg-gray-50"
    };
    return (
       <div className={`p-4 rounded-xl border ${colors[color]} flex items-center justify-between`}>
          <div>
             <p className="text-2xl font-bold">{value} <span className="text-xs opacity-60">{unit}</span></p>
             <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</p>
          </div>
          <div className="text-2xl opacity-80 grayscale-30%">{icon}</div>
       </div>
    )
 }
 
 function EmptyState({ icon, msg }: { icon: React.ReactNode, msg: string }) {
    return (
       <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-60">
          <div className="mb-2">{icon}</div>
          <p className="text-sm font-medium">{msg}</p>
       </div>
    )
 }