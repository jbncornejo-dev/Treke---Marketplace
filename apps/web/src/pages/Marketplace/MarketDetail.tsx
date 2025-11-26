import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  detail,
  toggleFav,
  type MarketDetail,
  getCurrentUserId,
} from "../../api/market";
import { iniciarPropuesta } from "../../api/intercambios";

const uid = getCurrentUserId();

export default function MarketDetailPage() {
  const navigate = useNavigate();
  const id = Number(window.location.pathname.split("/").pop());
  const [data, setData] = useState<MarketDetail | null>(null);
  const [msg, setMsg] = useState("");
  const [mainImage, setMainImage] = useState<string>(""); // Para cambiar foto principal

  // Estados Modal
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>("");
  const [offerMessage, setOfferMessage] = useState<string>("");
  const [loadingProp, setLoadingProp] = useState(false);

  async function load() {
    setMsg("");
    try {
      const d = await detail(id);
      setData(d);
      // Poner la foto principal por defecto
      const principal = d.fotos.find(f => f.es_principal) || d.fotos[0];
      if (principal) setMainImage(principal.foto_url);
    } catch (e: any) {
      setMsg(e?.message || "No se pudo cargar");
    }
  }

  useEffect(() => { load(); }, []);

  async function onToggleFav() {
    if (!data) return;
    try {
      await toggleFav(data.id, !data.is_fav);
      setData({ ...data, is_fav: !data.is_fav });
    } catch (e: any) {
      alert(e?.message || "Error al actualizar favorito");
    }
  }

  function abrirModalPropuesta() {
    if (!data) return;
    if (!uid) return alert("Inicia sesión para continuar");
    if (uid === data.usuario_id) return alert("No puedes ofertar en tu propia publicación");

    setOfferAmount(String(data.valor_creditos));
    setOfferMessage("");
    setShowProposalModal(true);
  }

  async function enviarPropuesta() {
    if (!data) return;

    // ❌ ELIMINAR ESTO: Ya no validamos monto manual
    /*
    const monto = Number(offerAmount);
    if (!Number.isFinite(monto) || monto <= 0) return alert("Monto inválido");
    */

    setLoadingProp(true);
    try {
      // ✅ CORREGIDO: Llamamos solo con ID y Mensaje
      // El backend tomará el precio automáticamente de la base de datos
      await iniciarPropuesta(data.id, offerMessage || undefined);
      
      setShowProposalModal(false);
      alert("¡Propuesta enviada correctamente!");
      
      // Limpiar mensaje opcional si quieres
      // setOfferMessage(""); 
      
      load(); 
    } catch (e: any) {
      alert(e?.message || "Error al enviar propuesta");
    } finally {
      setLoadingProp(false);
    }
}

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f8f7] dark:bg-[#112117] text-gray-500">
        {msg ? msg : <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2ecc71] border-t-transparent"/>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] font-sans pb-20">
      
      {/* --- HEADER SIMPLE --- */}
      <div className="sticky top-0 z-20 flex items-center px-4 py-3 bg-[#f6f8f7]/90 dark:bg-[#112117]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="ml-2 text-lg font-bold truncate">{data.titulo}</h1>
      </div>

      <main className="max-w-6xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA IZQUIERDA: FOTOS */}
        <div className="lg:col-span-7 space-y-4">
          {/* Foto Principal */}
          <div className="aspect-square w-full bg-gray-200 dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 relative group">
             {mainImage ? (
               <img src={mainImage} alt={data.titulo} className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Sin fotos</div>
             )}
             
             {/* Botón Favorito Flotante */}
             <button 
               onClick={onToggleFav}
               className="absolute top-4 right-4 p-3 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur hover:bg-white dark:hover:bg-black/70 transition-all shadow-sm"
             >
                <svg className={`w-6 h-6 ${data.is_fav ? "text-red-500 fill-current" : "text-gray-600 dark:text-gray-300"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
             </button>
          </div>

          {/* Galería Miniaturas */}
          {data.fotos.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {data.fotos.map(f => (
                <button 
                  key={f.id} 
                  onClick={() => setMainImage(f.foto_url)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 ${mainImage === f.foto_url ? "border-[#2ecc71]" : "border-transparent"}`}
                >
                  <img src={f.foto_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: INFO */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Info Principal */}
          <div>
            <div className="flex items-start justify-between gap-4">
               <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{data.titulo}</h2>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[#2ecc71] text-2xl font-bold">
               {data.valor_creditos} <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">créditos</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
               <Badge>{data.categoria}</Badge>
               <Badge>{data.estado_nombre}</Badge>
               {data.peso_aprox_kg > 0 && <Badge>{data.peso_aprox_kg} kg</Badge>}
            </div>
          </div>

          {/* Descripción */}
          <div className="bg-white dark:bg-[#1a2e22] p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
             <h3 className="font-bold text-sm text-gray-400 mb-2 uppercase tracking-wider">Descripción</h3>
             <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
               {data.descripcion}
             </p>
             <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {data.ubicacion_texto}
             </div>
          </div>

          {/* Tarjeta de Vendedor */}
          <div className="bg-white dark:bg-[#1a2e22] p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold text-gray-500 overflow-hidden">
                   {/* Avatar o Inicial */}
                   {data.vendedor_nombre?.charAt(0) || "U"}
                </div>
                <div>
                   <p className="font-bold text-gray-900 dark:text-gray-100">
                      {data.vendedor_nombre || "Usuario Treke"}
                   </p>
                   <div className="flex items-center gap-1 text-sm text-amber-400">
                      <span className="font-bold text-gray-700 dark:text-gray-300 mr-1">
                        {Number(data.vendedor_rating || 0).toFixed(1)}
                      </span>
                      <Stars rating={Number(data.vendedor_rating || 0)} />
                   </div>
                </div>
             </div>
             {/* Botón de contacto o Perfil (Opcional) */}
             <button className="text-sm text-[#2ecc71] font-medium hover:underline">Ver perfil</button>
          </div>

          {/* Botón de Acción Principal */}
          <button 
            onClick={abrirModalPropuesta}
            className="w-full py-4 rounded-2xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold text-lg shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-all"
          >
             Iniciar Intercambio
          </button>

          <p className="text-center text-xs text-gray-400">
             {data.total_propuestas} personas ya han ofertado
          </p>

        </div>

        {/* SECCIÓN DE RESEÑAS (Full Width abajo) */}
        <div className="col-span-1 lg:col-span-12 mt-8">
           <h3 className="text-xl font-bold mb-4 px-1">Reseñas del Vendedor</h3>
           
           {data.reviews && data.reviews.length > 0 ? (
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.reviews.map((rev) => (
                  <div key={rev.id} className="bg-white dark:bg-[#1a2e22] p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                     <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-bold">
                           {rev.autor_nombre?.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold">{rev.autor_nombre}</span>
                        <div className="flex text-amber-400 text-xs ml-auto">
                           <Stars rating={rev.calificacion} />
                        </div>
                     </div>
                     <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">
                        "{rev.comentario}"
                     </p>
                     <p className="text-xs text-gray-400 mt-3">
                        {new Date(rev.created_at).toLocaleDateString()}
                     </p>
                  </div>
                ))}
             </div>
           ) : (
             <div className="text-center py-8 bg-gray-100 dark:bg-white/5 rounded-2xl text-gray-500">
                Este usuario aún no tiene reseñas.
             </div>
           )}
        </div>

      </main>

      {/* MODAL DE PROPUESTA */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-[#1a2e22] rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in-up">
            <h3 className="text-xl font-bold mb-1">Realizar Oferta</h3>
            <p className="text-sm text-gray-500 mb-4">Ofrece tus créditos por "{data.titulo}"</p>

            <div className="space-y-4">
              {/* ✅ CAMBIAR POR ESTO */}
              <div className="bg-gray-100 p-3 rounded-lg mb-4">
                <p className="text-sm text-gray-500">Valor del intercambio:</p>
                <p className="text-xl font-bold text-[#2ecc71]">
                  {data.valor_creditos} Créditos
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  * El valor es fijo.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mensaje (Opcional)</label>
                <textarea
                  rows={3}
                  className="w-full p-4 rounded-xl bg-gray-100 dark:bg-black/20 border-none focus:ring-2 focus:ring-[#2ecc71] resize-none"
                  placeholder="Hola, me interesa tu producto..."
                  value={offerMessage}
                  onChange={(e) => setOfferMessage(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setShowProposalModal(false)}
                className="flex-1 h-12 rounded-xl border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={enviarPropuesta}
                disabled={loadingProp}
                className="flex-1 h-12 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
              >
                {loadingProp ? "Enviando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- SUBCOMPONENTES VISUALES ---

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-transparent">
      {children}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  // Genera array [1, 2, 3, 4, 5]
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg 
          key={star}
          className={`w-3 h-3 ${star <= Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300 dark:text-gray-600 fill-current"}`} 
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
