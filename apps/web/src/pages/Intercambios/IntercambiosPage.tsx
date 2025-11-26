import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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

  // Lógica de filtrado para la vista
  const listToRender = () => {
    if (tab === "intercambios") return intercambios;
    return propuestas.filter(p => tab === "recibidas" ? p.tipo === "recibida" : p.tipo === "enviada");
  };

  // --- HANDLERS PROPUESTAS ---
  async function handlePropuestaAction(id: number, accion: 'aceptar' | 'rechazar') {
    if (!confirm(`¿Confirmar ${accion}?`)) return;
    try {
      if (accion === 'aceptar') await aceptarPropuesta(id);
      else await rechazarPropuesta(id);
      if(currentUserId) load(currentUserId);
    } catch (e: any) { alert(e.message); }
  }

  // --- HANDLERS INTERCAMBIOS ---
  async function handleIntercambioAction(id: number, accion: 'confirmar' | 'cancelar') {
    const verbo = accion === 'confirmar' ? 'Confirmar recepción/entrega' : 'Cancelar intercambio';
    if (!confirm(`¿${verbo}?`)) return;
    try {
      if (accion === 'confirmar') await confirmarIntercambio(id);
      else await cancelarIntercambio(id, "Cancelado por usuario");
      if(currentUserId) load(currentUserId);
    } catch (e: any) { alert(e.message); }
  }

  // --- HANDLER CHAT ---
  const openChat = (propuestaId: number, title: string, estado: string) => {
    setChatPropuestaId(propuestaId);
    setChatTitle(title);
    setChatEstado(estado); // <--- Guardamos el estado
    setChatOpen(true);
  };

  const badgeCount = propuestas.filter(p => p.estado === 'pendiente' && p.tipo === 'recibida').length;

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] pb-20">
      
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-[#f6f8f7]/95 dark:bg-[#112117]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">Actividad</h1>
        <div className="w-10"></div>
      </div>

      {/* TABS */}
      <div className="flex bg-white dark:bg-[#1a2e22] border-b border-gray-200 dark:border-gray-800">
        <TabButton label="Recibidas" active={tab === "recibidas"} onClick={() => setTab("recibidas")} badge={badgeCount} />
        <TabButton label="Enviadas" active={tab === "enviadas"} onClick={() => setTab("enviadas")} />
        <TabButton label="Intercambios" active={tab === "intercambios"} onClick={() => setTab("intercambios")} />
      </div>

      {/* LISTA */}
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        {loading ? (
             <div className="text-center py-10 opacity-50">Cargando...</div>
        ) : listToRender().length === 0 ? (
             <div className="text-center py-20 opacity-50">No hay actividad en esta sección</div>
        ) : tab === "intercambios" ? (
             (listToRender() as IntercambioResumen[]).map(item => (
                <IntercambioCard 
                   key={item.id} 
                   data={item} 
                   currentUserId={currentUserId!} 
                   onAction={handleIntercambioAction}
                   onChat={() => openChat(item.propuesta_aceptada_id, item.titulo, item.estado)}
                   //propuestaId={(item as any).propuesta_aceptada_id} 
                />
             ))
        ) : (
             (listToRender() as PropuestaResumen[]).map(item => (
                <PropuestaCard 
                   key={item.id} 
                   data={item} 
                   isReceived={tab === "recibidas"} 
                   onAction={handlePropuestaAction}
                   onChat={() => openChat(item.id, item.titulo, item.estado)}
                />
             ))
        )}
      </div>

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
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function TabButton({ label, active, onClick, badge }: any) {
    return (
        <button onClick={onClick} className={`flex-1 py-3 text-sm font-bold relative border-b-2 ${active ? "border-[#2ecc71] text-[#2ecc71]" : "border-transparent text-gray-500"}`}>
            {label}
            {badge > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5">{badge}</span>}
        </button>
    )
}

function PropuestaCard({ data, isReceived, onAction, onChat }: any) {
    return (
        <div className="bg-white dark:bg-[#1a2e22] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-100">{data.titulo}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${data.estado === 'pendiente' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {data.estado}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
                {isReceived ? `Oferta de Usuario #${data.contraparte_id}` : `Tu oferta a Usuario #${data.contraparte_id}`}
                <span className="block font-bold text-[#2ecc71]">{data.monto_intercambio} créditos</span>
            </p>
            
            <div className="flex gap-2 mt-2">
                {/* Botón Chat siempre disponible */}
                <button onClick={onChat} className="flex-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 py-2 rounded-lg text-sm font-bold">
                    💬 Chat
                </button>

                {isReceived && data.estado === 'pendiente' && (
                    <>
                        <button onClick={() => onAction(data.id, 'rechazar')} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold">Rechazar</button>
                        <button onClick={() => onAction(data.id, 'aceptar')} className="flex-1 bg-[#2ecc71] text-white py-2 rounded-lg text-sm font-bold">Aceptar</button>
                    </>
                )}
            </div>
        </div>
    )
}

function IntercambioCard({ data, currentUserId, onAction, onChat}: any) {
    const soyComprador = data.comprador_id === currentUserId;
    const confirmadoPorMi = soyComprador ? data.confirm_comprador : data.confirm_vendedor;
    const isCompleted = data.estado === 'completado';
    const isCancelled = data.estado === 'cancelado';

    return (
        <div className="bg-white dark:bg-[#1a2e22] p-4 rounded-xl shadow-md border-l-4 border-l-[#2ecc71]">
            <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Intercambio #{data.id}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${isCompleted ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {data.estado}
                </span>
            </div>
            
            <h3 className="font-bold text-lg mb-1">{data.titulo}</h3>
            <p className="text-sm text-gray-500 mb-4">
                Rol: <span className="font-semibold">{soyComprador ? "Comprador" : "Vendedor"}</span> • 
                Valor: <span className="text-[#2ecc71] font-bold">{data.monto_credito} cr</span>
            </p>

            {/* Acciones solo si está ACTIVO */}
            {data.estado === 'activo' && (
                <div className="space-y-3">
                    <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-lg text-sm">
                        <p className="mb-1 font-medium">Estado de Confirmación:</p>
                        <div className="flex gap-4">
                            <span className={data.confirm_comprador ? "text-green-600" : "text-gray-400"}>
                                {data.confirm_comprador ? "☑" : "☐"} Comprador
                            </span>
                            <span className={data.confirm_vendedor ? "text-green-600" : "text-gray-400"}>
                                {data.confirm_vendedor ? "☑" : "☐"} Vendedor
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={onChat} className="px-4 py-2 bg-gray-200 dark:bg-white/10 rounded-lg text-xl">💬</button>
                        
                        {!confirmadoPorMi ? (
                             <button 
                               onClick={() => onAction(data.id, 'confirmar')}
                               className="flex-1 bg-[#2ecc71] text-white font-bold py-2 rounded-lg hover:bg-[#27ae60]"
                             >
                                Confirmar {soyComprador ? "Recepción" : "Entrega"}
                             </button>
                        ) : (
                             <div className="flex-1 flex items-center justify-center text-[#2ecc71] font-bold text-sm bg-green-50 rounded-lg">
                                Esperando a la contraparte...
                             </div>
                        )}

                        <button 
                           onClick={() => onAction(data.id, 'cancelar')}
                           className="px-3 py-2 text-red-500 font-bold text-sm border border-red-200 rounded-lg hover:bg-red-50"
                        >
                           ✖
                        </button>
                    </div>
                </div>
            )}
            
            {/* Si ya terminó */}
            {(isCompleted || isCancelled) && (
                 <div className="mt-2 text-center text-sm text-gray-400 italic">
                    Este intercambio ha finalizado.
                 </div>
            )}
        </div>
    )
}

function ChatModal({ propuestaId, currentUserId, title, onClose, estado }: any) {
    const [msgs, setMsgs] = useState<Mensaje[]>([]);
    const [txt, setTxt] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // ✅ CORRECCIÓN AQUÍ: Cubrimos todas las variantes de texto que vienen de la BD
    const isDisabled = [
        'cancelado', 
        'cancelada', 
        'rechazado', 
        'rechazada', 
        'completado', // Opcional: si tampoco quieres que hablen cuando ya terminó
        'completada',
        'finalizada'
    ].includes(estado?.toLowerCase() || ""); 

    useEffect(() => {
        loadMsgs();
        const interval = setInterval(loadMsgs, 5000); 
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
        // ✅ PROTECCIÓN EXTRA: Si está deshabilitado, no enviamos nada aunque aprieten Enter
        if (isDisabled) return; 
        if (!txt.trim()) return;
        
        await enviarMensaje(propuestaId, txt);
        setTxt("");
        loadMsgs();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#1a2e22] w-full max-w-md h-[80vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-black/20">
                    <div className="overflow-hidden">
                        <h3 className="font-bold truncate">{title}</h3>
                        {/* Indicador visual */}
                        {isDisabled && <span className="text-xs text-red-500 font-bold uppercase block">Conversación cerrada</span>}
                    </div>
                    <button onClick={onClose} className="text-gray-500 text-xl ml-2 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center">✖</button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f0f2f5] dark:bg-[#112117]">
                    {msgs.map(m => {
                        const esMio = m.remitente_id === currentUserId;
                        return (
                            <div key={m.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                                    esMio 
                                    ? 'bg-[#2ecc71] text-white rounded-tr-none' 
                                    : 'bg-white dark:bg-[#2a3e32] text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                                }`}>
                                    {m.contenido}
                                    <div className={`text-[10px] mt-1 text-right ${esMio ? 'text-green-100' : 'text-gray-400'}`}>
                                        {new Date(m.fecha_envio).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white dark:bg-[#1a2e22] border-t border-gray-200 dark:border-gray-700 flex gap-2">
                    {isDisabled ? (
                        <div className="flex-1 bg-gray-100 dark:bg-black/20 rounded-lg px-4 py-3 text-sm text-center text-gray-500 italic">
                            No puedes enviar mensajes porque el intercambio está {estado}.
                        </div>
                    ) : (
                        <>
                            <input 
                                className="flex-1 bg-gray-100 dark:bg-black/20 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#2ecc71] outline-none transition-all"
                                placeholder="Escribe un mensaje..."
                                value={txt}
                                onChange={e => setTxt(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && send()}
                                disabled={isDisabled} 
                            />
                            <button 
                                onClick={send} 
                                disabled={isDisabled || !txt.trim()}
                                className="bg-[#2ecc71] text-white p-2 rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#27ae60] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ➤
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}