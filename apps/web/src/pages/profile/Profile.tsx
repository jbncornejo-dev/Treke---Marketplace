import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Settings, 
  FileText, 
  Wallet, 
  Repeat, 
  Leaf, 
  Star, 
  MapPin, 
  Calendar, 
  Heart,
  Package,
  History,
  MessageSquare,
  ShieldAlert, // 👈 NUEVO
} from "lucide-react";
import { fetchPanel, getCurrentUserId, type PanelResponse } from "../../api/profile";

// Tipo Tab
type Tab = "pubs" | "movs" | "impact" | "reviews" | "favs";

// 👇 NUEVO: mismo ID de rol admin que usas en Login
const ADMIN_ROLE_ID = 10003;

function getStoredUser() {
  try {
    const raw = localStorage.getItem("treke_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function Profile() {
  const [data, setData] = useState<PanelResponse | null>(null);
  const [tab, setTab] = useState<Tab>("pubs");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  const storedUser = getStoredUser();                 // 👈 NUEVO
  const isAdmin = storedUser?.rol_id === ADMIN_ROLE_ID; // 👈 NUEVO

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

  // Loading State
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
       <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"/>
          <p className="text-gray-400 text-sm">Cargando perfil...</p>
       </div>
    </div>
  );
  
  // Error State
  if (msg) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
       <div className="bg-white p-6 rounded-2xl shadow-sm text-center max-w-sm">
          <p className="text-gray-500 mb-4">{msg}</p>
          <Link to="/login" className="text-emerald-600 font-bold hover:underline">Ir a Iniciar Sesión</Link>
       </div>
    </div>
  );
  
  if (!data) return null;

  const saldo = Number(data.billetera?.saldo_disponible ?? 0);
  const trueques = Number(data.metricas?.intercambios_totales ?? 0);
  const co2 = Number(data.impacto?.total_co2_evitado ?? 0);
  const rating = Number(data.usuario.calificacion_prom ?? 0);

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-24">
      
      {/* --- HEADER PERFIL --- */}
      <div className="bg-white border-b border-gray-100">
         <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
            
            <div className="flex flex-col md:flex-row md:items-start gap-8">
               
               {/* Avatar */}
               <div className="relative shrink-0 mx-auto md:mx-0">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full p-1 bg-white border border-gray-100 shadow-sm">
                     <div className="w-full h-full rounded-full bg-gray-100 overflow-hidden">
                        {data.usuario.foto ? (
                           <img src={data.usuario.foto} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
                              <span className="uppercase font-bold">{nombre.charAt(0)}</span>
                           </div>
                        )}
                     </div>
                  </div>
                  {/* Badge Nivel (Simulado) */}
                  <div className="absolute bottom-1 right-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm">
                     Nivel 1
                  </div>
               </div>

               {/* Info Principal */}
               <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{nombre}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500 mb-3">
                           <div className="flex items-center gap-1">
                              <Star size={14} className="text-amber-400 fill-amber-400"/>
                              <span className="font-semibold text-gray-900">{rating.toFixed(1)}</span>
                              <span className="text-gray-400">({data.usuario.total_resenias})</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <MapPin size={14}/>
                              <span>Bolivia</span>
                           </div>
                           <div className="flex items-center gap-1">
                              <Calendar size={14}/>
                              <span>Miembro desde 2025</span>
                           </div>
                        </div>
                        {data.usuario.acerca_de && (
                           <p className="text-gray-600 max-w-lg mx-auto md:mx-0 leading-relaxed text-sm">
                              {data.usuario.acerca_de}
                           </p>
                        )}
                     </div>

                     {/* Botones Acción */}
                     <div className="flex flex-wrap gap-3 justify-center md:justify-end shrink-0">
                        {/* 👇 Solo admins ven este botón */}
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm font-semibold hover:bg-emerald-100 hover:border-emerald-300 transition-all"
                            title="Panel de administración"
                          >
                            <ShieldAlert size={18} />
                            <span>Panel Admin</span>
                          </Link>
                        )}

                        <Link
                          to="/settings"
                          className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                          title="Configuración"
                        >
                          <Settings size={20} />
                        </Link>
                        <Link
                          to="/perfil/reportes"
                          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-medium shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5"
                        >
                          <FileText size={18} />
                          <span>Reportes</span>
                        </Link>
                     </div>
                  </div>
               </div>
            </div>

            {/* KPIs Grid */}
            <div className="grid grid-cols-3 gap-4 mt-10 border-t border-gray-50 pt-8">
               <div className="text-center md:text-left px-4 border-r border-gray-100 last:border-0">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1 text-emerald-600 font-bold text-2xl">
                     <Wallet size={24} className="text-emerald-500" />
                     {saldo.toLocaleString()}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Créditos Disponibles</p>
               </div>
               <div className="text-center md:text-left px-4 border-r border-gray-100 last:border-0">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1 text-gray-900 font-bold text-2xl">
                     <Repeat size={24} className="text-gray-400" />
                     {trueques}
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Intercambios</p>
               </div>
               <div className="text-center md:text-left px-4 border-r border-gray-100 last:border-0">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1 text-gray-900 font-bold text-2xl">
                     <Leaf size={24} className="text-gray-400" />
                     {co2} <span className="text-sm text-gray-500 font-medium self-end mb-1">kg</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">CO₂ Ahorrado</p>
               </div>
            </div>

         </div>
      </div>

      {/* --- NAVEGACIÓN TABS --- */}
      <div className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm border-b border-gray-200 mb-8">
         <div className="max-w-5xl mx-auto flex overflow-x-auto no-scrollbar">
            <TabButton active={tab === "pubs"} onClick={() => setTab("pubs")} icon={<Package size={18}/>} label="Publicaciones" />
            <TabButton active={tab === "favs"} onClick={() => setTab("favs")} icon={<Heart size={18}/>} label="Favoritos" />
            <TabButton active={tab === "movs"} onClick={() => setTab("movs")} icon={<History size={18}/>} label="Historial" />
            <TabButton active={tab === "impact"} onClick={() => setTab("impact")} icon={<Leaf size={18}/>} label="Impacto" />
            <TabButton active={tab === "reviews"} onClick={() => setTab("reviews")} icon={<MessageSquare size={18}/>} label="Reseñas" />
         </div>
      </div>

      {/* --- CONTENIDO --- */}
      <div className="max-w-5xl mx-auto px-4 min-h-[400px]">
         
         {/* TAB: PUBLICACIONES */}
         {tab === "pubs" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
               {data.publicaciones.map((p) => (
                  <Link to={`/market/${p.id}`} key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                        {p.foto_principal ? (
                           <img src={p.foto_principal} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={p.titulo} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                        )}
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur text-gray-700 text-[10px] font-bold px-2 py-1 rounded-full border border-gray-100 shadow-sm uppercase">
                           {p.estado_nombre}
                        </div>
                     </div>
                     <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{p.titulo}</h3>
                        <div className="flex items-center justify-between">
                           <span className="text-emerald-600 font-bold text-sm">{p.valor_creditos} Cr</span>
                           <span className="text-xs text-gray-400">{p.categoria}</span>
                        </div>
                     </div>
                  </Link>
               ))}
               {!data.publicaciones.length && <EmptyState icon={<Package size={48}/>} msg="No tienes publicaciones activas." sub="¡Sube tu primer producto hoy!" />}
            </div>
         )}

         {/* TAB: FAVORITOS */}
         {tab === "favs" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
               {data.favoritos && data.favoritos.map((p) => (
                  <Link to={`/market/${p.id}`} key={p.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className="aspect-4/3 bg-gray-100 relative overflow-hidden">
                        {p.foto_principal ? (
                           <img src={p.foto_principal} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={p.titulo} />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={24}/></div>
                        )}
                        <div className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm text-red-500">
                           <Heart size={14} className="fill-current"/>
                        </div>
                     </div>
                     <div className="p-4">
                        <h3 className="font-semibold text-gray-900 truncate mb-1">{p.titulo}</h3>
                        <p className="text-emerald-600 font-bold text-sm">{p.valor_creditos} Cr</p>
                     </div>
                  </Link>
               ))}
               {(!data.favoritos || !data.favoritos.length) && <EmptyState icon={<Heart size={48}/>} msg="No tienes favoritos guardados." sub="Explora el mercado para encontrar tesoros." />}
            </div>
         )}

         {/* TAB: HISTORIAL (Movimientos) */}
         {tab === "movs" && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-gray-50 text-gray-400 uppercase text-xs font-semibold">
                        <tr>
                           <th className="px-6 py-4">Fecha</th>
                           <th className="px-6 py-4">Detalle</th>
                           <th className="px-6 py-4 text-right">Monto</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-50">
                        {data.movimientos.map(m => (
                           <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                                 {new Date(m.fecha_movimiento).toLocaleDateString()}
                                 <div className="text-xs text-gray-400">{new Date(m.fecha_movimiento).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              </td>
                              <td className="px-6 py-4">
                                 <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.monto_con_signo > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                                       {m.monto_con_signo > 0 ? <Wallet size={16}/> : <Repeat size={16}/>}
                                    </div>
                                    <div>
                                       <p className="font-medium text-gray-900">{m.tipo_codigo}</p>
                                       <p className="text-xs text-gray-500 max-w-[200px] sm:max-w-md truncate">{m.descripcion}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className={`px-6 py-4 text-right font-bold ${m.monto_con_signo < 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                                 {m.monto_con_signo > 0 ? '+' : ''}{m.monto_con_signo} Cr
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               {!data.movimientos.length && <div className="p-12 text-center text-gray-400">Sin movimientos recientes</div>}
            </div>
         )}

         {/* TAB: IMPACTO */}
         {tab === "impact" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
               <ImpactCard label="Residuos Evitados" value={Number(data.impacto?.total_residuos_evitados?? 0).toString()} unit="u" icon="🗑️" />
               <ImpactCard label="CO₂ Evitado" value={Number(data.impacto?.total_co2_evitado ?? 0).toString()} unit="kg" icon="☁️" color="emerald" />
               <ImpactCard label="Energía Ahorrada" value={Number(data.impacto?.total_energia_ahorrada ?? 0).toString()} unit="kWh" icon="⚡" color="amber" />
               <ImpactCard label="Agua Preservada" value={Number(data.impacto?.total_agua_preservada ?? 0).toString()} unit="L" icon="💧" color="blue" />
            </div>
         )}

         {/* TAB: RESEÑAS */}
         {tab === "reviews" && (
            <div className="grid gap-5 md:grid-cols-2">
               {data.reviews && data.reviews.length > 0 ? (
                  data.reviews.map(r => (
                     <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                                 {r.autor_nombre?.charAt(0)}
                              </div>
                              <div>
                                 <p className="font-bold text-gray-900 text-sm">{r.autor_nombre}</p>
                                 <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex text-amber-400">
                              {[1,2,3,4,5].map(s => (
                                 <Star key={s} size={14} className={s <= r.calificacion ? "fill-current" : "text-gray-200 fill-current"} />
                              ))}
                           </div>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed italic">"{r.comentario}"</p>
                     </div>
                  ))
               ) : (
                  <EmptyState icon={<MessageSquare size={48}/>} msg="Aún no has recibido reseñas." sub="Completa intercambios para obtener calificaciones." />
               )}
            </div>
         )}

      </div>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function TabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void, icon?: React.ReactNode }) {
   return (
      <button
         onClick={onClick}
         className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            active 
            ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" 
            : "border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-100/50"
         }`}
      >
         {icon}
         {label}
      </button>
   );
}

function ImpactCard({ label, value, unit, icon, color = "gray" }: any) {
   const colors: any = {
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      gray: "bg-gray-50 text-gray-600 border-gray-100"
   };

   return (
      <div className={`p-6 rounded-2xl border ${colors[color]} flex items-center justify-between`}>
         <div>
            <p className="text-3xl font-bold mb-1">{value} <span className="text-sm font-medium opacity-60">{unit}</span></p>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70">{label}</p>
         </div>
         <div className="text-3xl opacity-80 grayscale-30%">{icon}</div>
      </div>
   )
}

function EmptyState({ icon, msg, sub }: { icon: React.ReactNode, msg: string, sub?: string }) {
   return (
      <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
         <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
            {icon}
         </div>
         <p className="text-gray-900 font-semibold text-lg">{msg}</p>
         {sub && <p className="text-gray-500 text-sm mt-1">{sub}</p>}
      </div>
   )
}
