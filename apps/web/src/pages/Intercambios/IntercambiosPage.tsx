import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Package, 
  Send, 
  User, 
  AlertTriangle,
  Loader2,
  Star // 👈 Importado para el botón de reseña
} from "lucide-react";

import { 
  fetchMisIntercambios, 
  aceptarPropuesta, 
  rechazarPropuesta, 
  confirmarIntercambio,
  cancelarIntercambio,
  getMensajes,
  enviarMensaje,
  type PropuestaResumen, 
  type IntercambioResumen, 
  type MisIntercambiosResponse,
  type Mensaje
} from "../../api/intercambios";
import { getCurrentUserId } from "../../api/market";

// 👇 Importamos el modal de reseña (Asegúrate de haberlo creado en components)
import CreateReviewModal from "../../components/CreateReviewModal";

type Tab = "recibidas" | "enviadas" | "intercambios";

export default function IntercambiosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("recibidas");
  const [chatEstado, setChatEstado] = useState("");
  
  // Datos
  const [propuestas, setPropuestas] = useState<PropuestaResumen[]>([]);
  const [intercambios, setIntercambios] = useState<IntercambioResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // Chat State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPropuestaId, setChatPropuestaId] = useState<number | null>(null);
  const [chatTitle, setChatTitle] = useState("");

  // 👇 Estado para controlar a quién se está calificando
  const [reviewTarget, setReviewTarget] = useState<number | null>(null);

  useEffect(() => {
    const uid = getCurrentUserId();
    setCurrentUserId(uid);
    if(uid) load(uid);
  }, []);

  async function load(uid: number) {
    setLoading(true);
    try {
      const resp: MisIntercambiosResponse = await fetchMisIntercambios(uid);
      setPropuestas(resp.propuestas);
      setIntercambios(resp.intercambios);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrado
  const listToRender = () => {
    if (tab === "intercambios") return intercambios;
    return propuestas.filter(p => tab === "recibidas" ? p.tipo === "recibida" : p.tipo === "enviada");
  };

  // --- HANDLERS ---
  async function handlePropuestaAction(id: number, accion: 'aceptar' | 'rechazar') {
    if (!confirm(`¿Estás seguro de ${accion} esta propuesta?`)) return;
    try {
      if (accion === 'aceptar') await aceptarPropuesta(id);
      else await rechazarPropuesta(id);
      if(currentUserId) load(currentUserId);
    } catch (e: any) { alert(e.message); }
  }

  async function handleIntercambioAction(id: number, accion: 'confirmar' | 'cancelar') {
    const msg = accion === 'confirmar' 
        ? '¿Confirmas que se completó la entrega/recepción?' 
        : '¿Estás seguro de cancelar este intercambio? Esta acción puede afectar tu reputación.';
    
    if (!confirm(msg)) return;
    try {
      if (accion === 'confirmar') await confirmarIntercambio(id);
      else await cancelarIntercambio(id, "Cancelado por usuario");
      if(currentUserId) load(currentUserId);
    } catch (e: any) { alert(e.message); }
  }

  const openChat = (propuestaId: number, title: string, estado: string) => {
    setChatPropuestaId(propuestaId);
    setChatTitle(title);
    setChatEstado(estado);
    setChatOpen(true);
  };

  const badgeCount = propuestas.filter(p => p.estado === 'pendiente' && p.tipo === 'recibida').length;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      
      {/* HEADER STICKY */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Actividad</h1>
            <div className="w-9"></div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* TABS SEGMENTADOS */}
        <div className="flex p-1 bg-gray-200/60 rounded-xl overflow-hidden">
            <TabButton label="Recibidas" active={tab === "recibidas"} onClick={() => setTab("recibidas")} badge={badgeCount} />
            <TabButton label="Enviadas" active={tab === "enviadas"} onClick={() => setTab("enviadas")} />
            <TabButton label="Activos" active={tab === "intercambios"} onClick={() => setTab("intercambios")} />
        </div>

        {/* LISTA DE ITEMS */}
        <div className="space-y-4">
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                    <p className="text-gray-400 text-sm">Cargando actividad...</p>
                </div>
            ) : listToRender().length === 0 ? (
                <EmptyState tab={tab} />
            ) : (
                <>
                    {/* Render Intercambios */}
                    {tab === "intercambios" && (listToRender() as IntercambioResumen[]).map(item => (
                        <IntercambioCard 
                            key={item.id} 
                            data={item} 
                            currentUserId={currentUserId!} 
                            onAction={handleIntercambioAction}
                            onChat={() => openChat(item.propuesta_aceptada_id, item.titulo, item.estado)}
                            // 👇 Pasamos la función para abrir el modal
                            onReview={(targetId: number) => setReviewTarget(targetId)}
                        />
                    ))}

                    {/* Render Propuestas */}
                    {tab !== "intercambios" && (listToRender() as PropuestaResumen[]).map(item => (
                        <PropuestaCard 
                            key={item.id} 
                            data={item} 
                            isReceived={tab === "recibidas"} 
                            onAction={handlePropuestaAction}
                            onChat={() => openChat(item.id, item.titulo, item.estado)}
                        />
                    ))}
                </>
            )}
        </div>
      </main>

      {/* CHAT MODAL */}
      {chatOpen && chatPropuestaId && currentUserId && (
        <ChatModal 
            propuestaId={chatPropuestaId} 
            currentUserId={currentUserId} 
            title={chatTitle} 
            estado={chatEstado}
            onClose={() => setChatOpen(false)} 
        />
      )}

      {/* 👇 MODAL DE RESEÑAS */}
      {reviewTarget && (
        <CreateReviewModal 
            targetUserId={reviewTarget} 
            onClose={() => setReviewTarget(null)} 
        />
      )}

    </div>
  );
}

// --- 1. COMPONENTE TAB BUTTON ---
function TabButton({ label, active, onClick, badge }: { label: string, active: boolean, onClick: () => void, badge?: number }) {
    return (
        <button 
            onClick={onClick} 
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all relative ${
                active 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-black/5"
            }`}
        >
            {label}
            {badge && badge > 0 && (
                <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            )}
        </button>
    )
}

// --- 2. TARJETA DE PROPUESTA ---
function PropuestaCard({ data, isReceived, onAction, onChat }: any) {
    const isPending = data.estado === 'pendiente';

    return (
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isPending ? 'bg-amber-400' : 'bg-gray-200'}`} />

            <div className="flex justify-between items-start mb-2 pl-2">
                <div>
                    <h3 className="font-bold text-gray-900 line-clamp-1">{data.titulo}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">
                        {isReceived ? "Oferta recibida" : "Oferta enviada"} • Usuario #{data.contraparte_id}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-emerald-600 font-bold text-lg">{data.monto_intercambio} cr</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                        {data.estado}
                    </span>
                </div>
            </div>

            <div className="flex gap-2 mt-4 pl-2">
                <button 
                    onClick={onChat} 
                    className="flex-1 py-2.5 rounded-xl bg-gray-50 text-gray-600 font-semibold text-sm hover:bg-gray-100 flex items-center justify-center gap-2 transition-colors"
                >
                    <MessageCircle size={16} /> Chat
                </button>

                {isReceived && isPending && (
                    <>
                        <button 
                            onClick={() => onAction(data.id, 'rechazar')} 
                            className="w-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                            title="Rechazar"
                        >
                            <XCircle size={20} />
                        </button>
                        <button 
                            onClick={() => onAction(data.id, 'aceptar')} 
                            className="flex-1 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-sm hover:bg-emerald-600 shadow-md flex items-center justify-center gap-2 transition-all"
                        >
                            <CheckCircle2 size={16} /> Aceptar
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

// --- 3. TARJETA DE INTERCAMBIO (ACTIVO) ---
function IntercambioCard({ data, currentUserId, onAction, onChat, onReview }: any) {
    const soyComprador = data.comprador_id === currentUserId;
    const confirmadoPorMi = soyComprador ? data.confirm_comprador : data.confirm_vendedor;
    const confirmadoPorOtro = soyComprador ? data.confirm_vendedor : data.confirm_comprador;
    
    // 👇 Calculamos el ID del otro usuario para la reseña
    const otroUsuarioId = soyComprador ? data.vendedor_id : data.comprador_id;

    const isCompleted = data.estado === 'completado';
    const isActive = data.estado === 'activo';

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
            
            {/* Header Card */}
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : isCompleted ? 'bg-blue-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {isActive ? 'En Progreso' : data.estado}
                    </span>
                </div>
                <div className="text-xs font-medium text-gray-400">ID #{data.id}</div>
            </div>

            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{data.titulo}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Tu Rol: <span className="font-semibold text-gray-700">{soyComprador ? "Comprador (Recibes)" : "Vendedor (Entregas)"}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-emerald-600 font-extrabold text-xl">{data.monto_credito}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Créditos</p>
                    </div>
                </div>

                {/* Timeline de Confirmación */}
                {isActive && (
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-3 text-center">Estado de Confirmación</p>
                        <div className="flex items-center justify-between relative">
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
                            <div className="flex flex-col items-center bg-gray-50 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${confirmadoPorMi ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                    {confirmadoPorMi ? <CheckCircle2 size={16} /> : "1"}
                                </div>
                                <span className="text-[10px] font-bold mt-1 text-gray-600">Tú</span>
                            </div>
                            <div className="flex flex-col items-center bg-gray-50 px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${confirmadoPorOtro ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                                    {confirmadoPorOtro ? <CheckCircle2 size={16} /> : "2"}
                                </div>
                                <span className="text-[10px] font-bold mt-1 text-gray-600">Otro</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botonera */}
                <div className="flex gap-3">
                    <button onClick={onChat} className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
                        <MessageCircle size={20} />
                    </button>

                    {isActive && (
                        <>
                            {!confirmadoPorMi ? (
                                <button 
                                    onClick={() => onAction(data.id, 'confirmar')}
                                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={18} />
                                    Confirmar {soyComprador ? "Recepción" : "Entrega"}
                                </button>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-emerald-50 text-emerald-700 font-bold text-sm rounded-xl border border-emerald-100">
                                    <Clock size={16} className="mr-2 animate-pulse" /> Esperando al otro...
                                </div>
                            )}

                            <button 
                                onClick={() => onAction(data.id, 'cancelar')}
                                className="p-3 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 rounded-xl transition-all"
                            >
                                <AlertTriangle size={20} />
                            </button>
                        </>
                    )}

                    {/* 👇 BOTÓN DE CALIFICAR (Solo si completado) */}
                    {isCompleted && (
                        <button 
                            onClick={() => onReview(otroUsuarioId)}
                            className="flex-1 py-3 bg-amber-50 text-amber-600 font-bold rounded-xl border border-amber-100 hover:bg-amber-100 transition-all flex items-center justify-center gap-2"
                        >
                            <Star size={18} className="fill-amber-600" />
                            Calificar Usuario
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- 4. CHAT MODAL ---
function ChatModal({ propuestaId, currentUserId, title, onClose, estado }: any) {
    const [msgs, setMsgs] = useState<Mensaje[]>([]);
    const [txt, setTxt] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    const isDisabled = ['cancelado', 'rechazado', 'completado', 'cancelada', 'rechazada', 'finalizada'].includes(estado?.toLowerCase() || ""); 

    useEffect(() => {
        loadMsgs();
        const interval = setInterval(loadMsgs, 4000); 
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [msgs]);

    async function loadMsgs() {
        const data = await getMensajes(propuestaId);
        setMsgs(data);
    }

    async function send() {
        if (isDisabled || !txt.trim()) return;
        await enviarMensaje(propuestaId, txt);
        setTxt("");
        loadMsgs();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6">
            <div className="bg-white w-full max-w-md h-[85vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                            <User size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 leading-tight truncate max-w-[180px]">{title}</h3>
                            <p className="text-xs text-emerald-600 font-medium">En línea</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400">✖</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#efeae2] bg-opacity-30">
                     {isDisabled && (
                        <div className="flex justify-center my-4">
                            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">Chat cerrado ({estado})</span>
                        </div>
                     )}
                    {msgs.map(m => {
                        const esMio = m.remitente_id === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm shadow-sm relative group ${esMio ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                                    {m.contenido}
                                    <div className={`text-[9px] mt-1 text-right opacity-70 ${esMio ? 'text-emerald-50' : 'text-gray-400'}`}>
                                        {new Date(m.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>
                <div className="p-3 bg-white border-t border-gray-100">
                    <div className="flex items-end gap-2 bg-gray-100 rounded-24px px-2 py-2">
                         <input className="flex-1 bg-transparent border-none focus:ring-0 text-sm max-h-32 px-3 py-2 outline-none" placeholder={isDisabled ? "Chat deshabilitado" : "Escribe un mensaje..."} value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} disabled={isDisabled} />
                        <button onClick={send} disabled={isDisabled || !txt.trim()} className={`p-2 rounded-full mb-0.5 transition-all ${!txt.trim() || isDisabled ? 'bg-gray-300 text-white cursor-default' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transform hover:scale-105'}`}>
                            <Send size={18} className={!txt.trim() ? "" : "ml-0.5"} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function EmptyState({ tab }: { tab: string }) {
    const data: any = {
        recibidas: { icon: Package, text: "No tienes ofertas recibidas." },
        enviadas: { icon: Send, text: "No has enviado ofertas aún." },
        intercambios: { icon: Clock, text: "No tienes intercambios activos." }
    };
    const Info = data[tab] || data.recibidas;
    return (
        <div className="flex flex-col items-center justify-center py-20 opacity-60">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4"><Info.icon size={32} /></div>
            <p className="text-gray-500 font-medium">{Info.text}</p>
        </div>
    )
}