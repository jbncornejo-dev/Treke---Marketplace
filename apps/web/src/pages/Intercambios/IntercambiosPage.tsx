import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  fetchMisIntercambios, 
  aceptarPropuesta, 
  rechazarPropuesta, 
  type PropuestaResumen, 
  type MisIntercambiosResponse 
} from "../../api/intercambios";
import { getCurrentUserId } from "../../api/market";

type Tab = "recibidas" | "enviadas";

export default function IntercambiosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("recibidas");
  const [list, setList] = useState<PropuestaResumen[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos al montar o cambiar pestaña
  useEffect(() => {
    load();
  }, [tab]);

  async function load() {
    setLoading(true);
    const uid = getCurrentUserId();
    
    if (!uid) {
        // Manejar caso no logueado
        setLoading(false);
        return;
    }

    try {
      // 1. Obtenemos TODAS las propuestas del usuario
      const resp: MisIntercambiosResponse = await fetchMisIntercambios(uid);
      
      // 2. Filtramos según la pestaña actual ("recibida" o "enviada")
      // Nota: El backend devuelve un campo 'tipo' que es 'enviada' o 'recibida'
      const filtradas = resp.propuestas.filter(p => 
        tab === "recibidas" ? p.tipo === "recibida" : p.tipo === "enviada"
      );
      
      setList(filtradas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleResponder(id: number, accion: 'aceptar' | 'rechazar') {
    const texto = accion === 'aceptar' ? 'aceptar' : 'rechazar';
    if (!confirm(`¿Estás seguro de ${texto} esta propuesta?`)) return;
    
    try {
      if (accion === 'aceptar') {
        await aceptarPropuesta(id);
      } else {
        await rechazarPropuesta(id);
      }
      load(); // Recargar para ver el nuevo estado
    } catch (error: any) {
      alert(error.message || "Error al procesar la solicitud");
    }
  }

  // Calcular pendientes para el badge
  const pendientesCount = list.filter(p => p.estado === 'pendiente').length;

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] font-sans transition-colors">
      
      {/* --- HEADER --- */}
      <div className="flex items-center bg-[#f6f8f7]/95 dark:bg-[#112117]/95 p-4 pb-2 justify-between sticky top-0 z-20 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Intercambios
        </h2>
        <div className="flex w-12 items-center justify-end">
          {/* Espacio reservado para balance visual */}
        </div>
      </div>

      {/* --- TABS --- */}
      <div>
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-4 justify-between bg-white dark:bg-[#1a2e22]/50">
          <button 
            onClick={() => setTab("recibidas")}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 relative transition-colors ${
                tab === "recibidas" 
                ? "border-b-[#2ecc71] text-[#2ecc71]" 
                : "border-b-transparent text-gray-500 dark:text-gray-400"
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Recibidas</p>
            {tab === "recibidas" && pendientesCount > 0 && (
                <span className="absolute top-2 right-4 md:right-10 bg-[#2ecc71] text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {pendientesCount}
                </span>
            )}
          </button>
          <button 
            onClick={() => setTab("enviadas")}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 relative transition-colors ${
                tab === "enviadas" 
                ? "border-b-[#2ecc71] text-[#2ecc71]" 
                : "border-b-transparent text-gray-500 dark:text-gray-400"
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-[0.015em]">Enviadas</p>
          </button>
        </div>
      </div>

      {/* --- LISTA DE TARJETAS --- */}
      <div className="p-4 space-y-4 max-w-3xl mx-auto w-full">
        
        {loading ? (
           <div className="py-20 flex justify-center">
             <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#2ecc71] border-t-transparent"/>
           </div>
        ) : list.length === 0 ? (
           <div className="py-20 text-center opacity-60 flex flex-col items-center">
              <span className="text-5xl mb-4">📭</span>
              <p className="text-lg font-medium">No tienes propuestas {tab}.</p>
           </div>
        ) : (
           list.map(p => (
             <ProposalCard 
               key={p.id} 
               propuesta={p} 
               isReceived={tab === "recibidas"} 
               onAction={handleResponder} 
             />
           ))
        )}

      </div>
    </div>
  );
}

// Subcomponente Card
function ProposalCard({ propuesta, isReceived, onAction }: { propuesta: PropuestaResumen, isReceived: boolean, onAction: (id: number, action: 'aceptar' | 'rechazar') => void }) {
  // Ajustamos los nombres de campos a lo que viene en PropuestaResumen
  const { estado, titulo, monto_intercambio, contraparte_id } = propuesta;

  // Configuración visual del estado
  const statusConfig: any = {
    pendiente: { bg: "bg-orange-500", text: "Pendiente", opacity: "opacity-100" },
    aceptada:  { bg: "bg-[#2ecc71]", text: "Aceptada",  opacity: "opacity-60" },
    rechazada: { bg: "bg-red-500",   text: "Rechazada", opacity: "opacity-60" },
  }[estado] || { bg: "bg-gray-500", text: estado, opacity: "opacity-100" };

  return (
    <div className={`bg-white dark:bg-[#1a2e22] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden ${statusConfig.opacity}`}>
      
      {/* Cuerpo Principal */}
      <div className="flex gap-4 p-4 justify-between">
        <div className="flex items-start gap-4">
          
          {/* Icono Genérico (Ya que el SQL actual no devuelve la foto, usamos un placeholder elegante) */}
          <div className="bg-gray-100 dark:bg-white/10 rounded-lg size-[60px] shrink-0 flex items-center justify-center text-2xl">
            📦
          </div>

          {/* Textos */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-base font-medium leading-normal text-gray-900 dark:text-gray-100">
                {isReceived 
                   ? <span>Propuesta de <span className="font-bold">Usuario #{contraparte_id}</span> por tu <span className="font-semibold">'{titulo}'</span></span>
                   : <span>Tu oferta para <span className="font-bold">Usuario #{contraparte_id}</span> por <span className="font-semibold">'{titulo}'</span></span>
                }
            </p>
            <p className="text-sm font-normal leading-normal text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              {/* Valor Fijo */}
              <span className="text-[#2ecc71] font-bold flex items-center gap-1">
                 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M17,8C8,10,5.9,16.17,3.82,21.34L5.71,22l1-2.3A4.49,4.49,0,0,0,8,20C19,20,22,3,22,3,21,5,14,5.25,9,6.25S2,11.5,2,13.5a6.22,6.22,0,0,0,1.75,3.75C7,13,15,7,17,8Z"/></svg>
                 {monto_intercambio} créditos
              </span>
            </p>
          </div>
        </div>

        {/* Badge de Estado */}
        <div className="shrink-0">
            <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${statusConfig.bg}`}>
                {statusConfig.text}
            </span>
        </div>
      </div>

      {/* Botones de Acción (Solo si es RECIBIDA y PENDIENTE) */}
      {isReceived && estado === 'pendiente' && (
        <div className="flex justify-stretch border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-1 gap-3 flex-wrap px-4 py-3 justify-end">
            <button 
                onClick={() => onAction(propuesta.id, 'rechazar')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
            >
                <span className="truncate">Rechazar</span>
            </button>
            <button 
                onClick={() => onAction(propuesta.id, 'aceptar')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#2ecc71] hover:bg-[#27ae60] text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-lg shadow-green-500/20 transition-colors"
            >
                <span className="truncate">Aceptar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}