import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPanel, getCurrentUserId, type PanelResponse } from "../../api/profile";

// 👇 Agregamos 'favs' al tipo Tab
type Tab = "pubs" | "movs" | "impact" | "reviews" | "favs";

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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] dark:bg-[#112117]"><div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2ecc71] border-t-transparent"/></div>;
  
  if (msg) return <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] dark:bg-[#112117] text-gray-500">{msg}</div>;
  
  if (!data) return null;

  const saldo = Number(data.billetera?.saldo_disponible ?? 0);
  const trueques = Number(data.metricas?.intercambios_totales ?? 0);
  const co2 = Number(data.impacto?.total_co2_evitado ?? 0);
  const rating = Number(data.usuario.calificacion_prom ?? 0);

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#112117] dark:text-[#f5f5f5] font-sans pb-24 transition-colors">
      
      {/* --- HEADER PERFIL --- */}
      <div className="bg-white dark:bg-[#1a2e22] border-b border-gray-200 dark:border-gray-800 pt-6 pb-4 px-4">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center gap-6">
            
            <div className="flex items-center gap-4 flex-1">
               <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-4 border-white dark:border-[#112117] shadow-md">
                  {data.usuario.foto ? (
                    <img src={data.usuario.foto} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">👤</div>
                  )}
               </div>
               <div>
                  <h2 className="text-2xl font-bold tracking-tight">{nombre}</h2>
                  <div className="flex items-center gap-2 text-sm mt-1">
                     <div className="flex text-amber-400"><Stars rating={rating} /></div>
                     <span className="text-gray-500 dark:text-gray-400 font-medium">{rating.toFixed(1)} ({data.usuario.total_resenias} reseñas)</span>
                  </div>
                  {data.usuario.acerca_de && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{data.usuario.acerca_de}</p>}
               </div>
            </div>

            <div className="flex gap-3 mt-2 md:mt-0">
               <Link to="/settings" className="h-10 px-4 flex items-center justify-center rounded-xl border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-white/5 text-sm font-medium transition-colors">Configuración</Link>
               <Link to="/perfil/reportes" className="h-10 px-4 flex items-center justify-center rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white text-sm font-bold shadow-lg shadow-green-500/20 transition-colors">Ver Reportes</Link>
            </div>
         </div>

         <div className="max-w-6xl mx-auto mt-8 grid grid-cols-3 gap-3 md:gap-6">
            <KPICard value={saldo.toLocaleString()} label="Créditos Verdes" icon="eco" color="text-[#2ecc71]" />
            <KPICard value={trueques.toString()} label="Trueques" icon="swap_horiz" />
            <KPICard value={`${co2} kg`} label="CO₂ Ahorrado" icon="co2" />
         </div>
      </div>

      {/* --- CONTENIDO PESTAÑAS --- */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
         
         {/* Navegación Tabs */}
         <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6 overflow-x-auto no-scrollbar">
            <TabButton active={tab === "pubs"} onClick={() => setTab("pubs")} label="Mis Publicaciones" />
            <TabButton active={tab === "favs"} onClick={() => setTab("favs")} label="Favoritos" /> {/* 👈 NUEVA TAB */}
            <TabButton active={tab === "movs"} onClick={() => setTab("movs")} label="Historial" />
            <TabButton active={tab === "impact"} onClick={() => setTab("impact")} label="Impacto" />
            <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} label="Reseñas" />
         </div>

         {/* Tab: PUBLICACIONES */}
         {tab === "pubs" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {data.publicaciones.map((p) => (
                  <Link to={`/market/${p.id}`} key={p.id} className="group bg-white dark:bg-[#1a2e22] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                     <div className="aspect-square bg-gray-100 dark:bg-black/20 relative">
                        {p.foto_principal ? (
                           <img src={p.foto_principal} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                           {p.estado_nombre}
                        </div>
                     </div>
                     <div className="p-3">
                        <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">{p.titulo}</h3>
                        <p className="text-[#2ecc71] font-bold text-sm mt-1">{p.valor_creditos} créditos</p>
                     </div>
                  </Link>
               ))}
               {!data.publicaciones.length && <EmptyState msg="No tienes publicaciones activas." />}
            </div>
         )}

         {/* Tab: FAVORITOS (NUEVO) */}
         {tab === "favs" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
               {data.favoritos && data.favoritos.map((p) => (
                  <Link to={`/market/${p.id}`} key={p.id} className="group bg-white dark:bg-[#1a2e22] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-all">
                     <div className="aspect-square bg-gray-100 dark:bg-black/20 relative">
                        {p.foto_principal ? (
                           <img src={p.foto_principal} className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                        {/* Corazón indicador */}
                        <div className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-black/50 rounded-full backdrop-blur-sm text-red-500">
                           <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        </div>
                     </div>
                     <div className="p-3">
                        <h3 className="font-medium truncate text-gray-900 dark:text-gray-100">{p.titulo}</h3>
                        <p className="text-[#2ecc71] font-bold text-sm mt-1">{p.valor_creditos} créditos</p>
                        <p className="text-xs text-gray-500 mt-1">{p.categoria}</p>
                     </div>
                  </Link>
               ))}
               {(!data.favoritos || !data.favoritos.length) && <EmptyState msg="No has guardado favoritos aún." />}
            </div>
         )}

         {/* Tab: MOVIMIENTOS */}
         {tab === "movs" && (
            <div className="bg-white dark:bg-[#1a2e22] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
               <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-white/5 text-gray-500 uppercase text-xs">
                     <tr>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3 text-right">Monto</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                     {data.movimientos.map(m => (
                        <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                           <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{new Date(m.fecha_movimiento).toLocaleDateString()}</td>
                           <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 dark:text-gray-200">{m.tipo_codigo}</p>
                              <p className="text-xs text-gray-500">{m.descripcion}</p>
                           </td>
                           <td className={`px-4 py-3 text-right font-bold ${m.monto_con_signo < 0 ? 'text-red-500' : 'text-[#2ecc71]'}`}>
                              {m.monto_con_signo > 0 ? '+' : ''}{m.monto_con_signo}
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
               {!data.movimientos.length && <div className="p-8 text-center text-gray-500">Sin movimientos recientes</div>}
            </div>
         )}

         {/* Tab: IMPACTO */}
         {tab === "impact" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               <ImpactCard label="Residuos Evitados" value={Number(data.impacto?.total_residuos_evitados?? 0).toString()} icon="🗑️" />
               <ImpactCard label="CO₂ Evitado" value={`${Number(data.impacto?.total_co2_evitado ?? 0)} kg`} icon="♻️" />
               <ImpactCard label="Energía Ahorrada" value={`${Number(data.impacto?.total_energia_ahorrada ?? 0)} kWh`} icon="⚡" />
               <ImpactCard label="Agua Preservada" value={`${Number(data.impacto?.total_agua_preservada ?? 0)} L`} icon="💧" />
            </div>
         )}

         {/* Tab: RESEÑAS */}
         {tab === "reviews" && (
            <div className="space-y-4">
               {data.reviews && data.reviews.length > 0 ? (
                  data.reviews.map(r => (
                     <div key={r.id} className="bg-white dark:bg-[#1a2e22] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-500">
                                 {r.autor_nombre?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">{r.autor_nombre}</p>
                                 <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex text-amber-400 text-sm">
                              <Stars rating={r.calificacion} />
                           </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 text-sm pl-[52px]">"{r.comentario}"</p>
                     </div>
                  ))
               ) : (
                  <EmptyState msg="Aún no has recibido reseñas." />
               )}
            </div>
         )}

      </div>
    </div>
  );
}

// --- SUBCOMPONENTES (Igual que antes) ---
function KPICard({ value, label, icon, color }: { value: string; label: string; icon: string; color?: string }) {
   return (
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-[#1a2e22] border border-gray-200 dark:border-gray-700 shadow-sm">
         <p className={`text-3xl font-bold ${color || 'text-gray-900 dark:text-white'}`}>{value}</p>
         <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <span className="material-symbols-outlined text-lg">{icon}</span>
            {label}
         </div>
      </div>
   );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
   return (
      <button
         onClick={onClick}
         className={`flex-1 pb-4 pt-2 text-sm font-bold border-b-[3px] transition-colors whitespace-nowrap px-4 ${
            active 
            ? "border-[#2ecc71] text-[#2ecc71]" 
            : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
         }`}
      >
         {label}
      </button>
   );
}

function ImpactCard({ label, value, icon }: any) {
   return (
      <div className="bg-white dark:bg-[#1a2e22] p-6 rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center gap-4">
         <div className="text-3xl">{icon}</div>
         <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{label}</p>
         </div>
      </div>
   )
}

function Stars({ rating }: { rating: number }) {
   return (
     <div className="flex">
       {[1, 2, 3, 4, 5].map((star) => (
         <svg key={star} className={`w-4 h-4 ${star <= Math.round(rating) ? "fill-current" : "text-gray-300 dark:text-gray-600 fill-current"}`} viewBox="0 0 20 20">
           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
         </svg>
       ))}
     </div>
   );
 }

function EmptyState({ msg }: { msg: string }) {
   return (
      <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
         <div className="text-4xl mb-2 opacity-50">📭</div>
         <p className="text-gray-500">{msg}</p>
      </div>
   )
}