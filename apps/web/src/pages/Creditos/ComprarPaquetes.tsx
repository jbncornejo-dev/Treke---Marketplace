import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Check, 
  Sparkles, 
  CreditCard, 
  Loader2, 
  ShieldCheck,
  Crown,
  Coins
} from "lucide-react";

import { 
  getCatalogoCreditos, 
  comprarPaquete, 
  comprarPlan, 
  type PaqueteCredito, 
  type PlanSuscripcion, 
  type SuscripcionUser 
} from "../../api/creditos";


import AdsFooter from "../../components/AdsFooter";



export default function CreditosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"paquetes" | "planes">("paquetes");
  const [loading, setLoading] = useState(true);
  
  // Datos
  const [paquetes, setPaquetes] = useState<PaqueteCredito[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  const [miSub, setMiSub] = useState<SuscripcionUser | null>(null);

  // Estado Modal Compra
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{type: 'paquete'|'plan', data: any} | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const data = await getCatalogoCreditos();
      if (data) {
        setPaquetes(data.paquetes);
        setPlanes(data.planes);
        setMiSub(data.suscripcionActual);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // --- HANDLERS ---
  const openPurchaseModal = (type: 'paquete'|'plan', data: any) => {
      setSelectedItem({ type, data });
      setModalOpen(true);
  };

  const confirmPurchase = async () => {
      if (!selectedItem) return;
      setProcessing(true);
      try {
          if (selectedItem.type === 'paquete') {
              await comprarPaquete(selectedItem.data.id);
              // Podrías mostrar un Toast de éxito aquí
          } else {
              await comprarPlan(selectedItem.data.id);
          }
          setModalOpen(false);
          setSelectedItem(null);
          loadData(); // Recargar datos para ver cambios reflejados
      } catch (e: any) {
          alert("Error en la transacción: " + e.message);
      } finally {
          setProcessing(false);
      }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      
      {/* --- HEADER --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                <ArrowLeft size={20} />
            </button>
            <h1 className="font-bold text-lg">Tienda</h1>
            <div className="w-9"></div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-8">
        
        {/* --- TABS --- */}
        <div className="flex justify-center">
            <div className="bg-gray-200 p-1 rounded-xl inline-flex relative">
                <div 
                    className={`absolute inset-y-1 w-1/2 bg-white rounded-lg shadow-sm transition-transform duration-300 ease-out ${
                        tab === "paquetes" ? "translate-x-0" : "translate-x-full"
                    }`} 
                />
                <button 
                    onClick={() => setTab("paquetes")}
                    className={`relative z-10 px-6 py-2 w-32 text-sm font-bold transition-colors ${tab === "paquetes" ? "text-gray-900" : "text-gray-500"}`}
                >
                    Créditos
                </button>
                <button 
                    onClick={() => setTab("planes")}
                    className={`relative z-10 px-6 py-2 w-32 text-sm font-bold transition-colors ${tab === "planes" ? "text-gray-900" : "text-gray-500"}`}
                >
                    Planes
                </button>
            </div>
        </div>

        {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
                <p className="text-gray-400 text-sm">Cargando ofertas...</p>
             </div>
        ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* --- VISTA: PAQUETES (Créditos) --- */}
                {tab === "paquetes" && (
                    <div className="space-y-6">
                        <div className="text-center max-w-lg mx-auto mb-8">
                            <h2 className="text-2xl font-bold mb-2">Recarga tu Billetera</h2>
                            <p className="text-gray-500 text-sm">Los créditos te permiten intercambiar bienes y servicios en la plataforma.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {paquetes.map((pkg) => (
                                <div key={pkg.id} className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    {/* Decoración Background */}
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Coins size={64} className="text-amber-500" />
                                    </div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4">
                                            <Sparkles size={24} />
                                        </div>
                                        
                                        <h3 className="text-lg font-bold text-gray-900">{pkg.nombre_paq}</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-4">{pkg.descripcion || "Paquete de créditos estándar"}</p>
                                        
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-extrabold text-gray-900">{pkg.cant_creditos}</span>
                                            <span className="text-sm font-medium text-amber-600">Créditos</span>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-50">
                                            <button 
                                                onClick={() => openPurchaseModal('paquete', pkg)}
                                                className="w-full py-3 rounded-xl bg-gray-900 text-white font-bold text-sm shadow-lg hover:bg-amber-500 transition-colors flex items-center justify-center gap-2"
                                            >
                                                Comprar por ${pkg.precio}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- VISTA: PLANES (Suscripciones) --- */}
                {tab === "planes" && (
                    <div className="space-y-8">
                        {/* Hero Card: Suscripción Actual */}
                        {miSub && (
                            <div className="relative overflow-hidden rounded-3xl bg-gray-900 text-white p-6 md:p-8 shadow-xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                                <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                                
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-emerald-500/30">
                                                {miSub.estado}
                                            </span>
                                            <span className="text-sm text-gray-400">Renueva el {new Date(miSub.fecha_fin).toLocaleDateString()}</span>
                                        </div>
                                        <h2 className="text-3xl font-bold mb-1">{miSub.nombre_plan}</h2>
                                        <p className="text-gray-400 text-sm">Disfruta de tus beneficios exclusivos.</p>
                                    </div>
                                    <div className="shrink-0">
                                        <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Próximo Cobro</p>
                                            <p className="text-xl font-mono">$0.00</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center max-w-lg mx-auto mt-12 mb-8">
                            <h2 className="text-2xl font-bold mb-2">Elige tu Plan Ideal</h2>
                            <p className="text-gray-500 text-sm">Desbloquea funciones premium y obtén créditos mensuales automáticos.</p>
                        </div>

                        {/* Lista de Planes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {planes.map(plan => {
                                const isCurrent = miSub?.nombre_plan === plan.nombre;
                                const isPremium = plan.nombre.toLowerCase().includes('pro') || plan.nombre.toLowerCase().includes('gold');

                                return (
                                    <div 
                                        key={plan.id} 
                                        className={`relative flex flex-col p-6 rounded-3xl border transition-all duration-300 ${
                                            isCurrent 
                                            ? "bg-white border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg scale-[1.02]" 
                                            : isPremium 
                                                ? "bg-gray-900 text-white border-gray-800 shadow-xl md:-translate-y-4" 
                                                : "bg-white border-gray-200 text-gray-900"
                                        }`}
                                    >
                                        {isPremium && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lienar-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                                                RECOMENDADO
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg">{plan.nombre}</h3>
                                            <div className="mt-2 flex items-baseline gap-1">
                                                <span className="text-3xl font-extrabold">${plan.precio}</span>
                                                <span className={`text-sm ${isPremium ? 'text-gray-400' : 'text-gray-500'}`}>/mes</span>
                                            </div>
                                        </div>

                                        <ul className="space-y-3 mb-8 flex-1">
                                            <li className="flex items-start gap-3 text-sm">
                                                <div className={`mt-0.5 p-0.5 rounded-full ${isPremium ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600'}`}>
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                <span className={isPremium ? 'text-gray-300' : 'text-gray-600'}>
                                                    <strong className={isPremium ? 'text-white' : 'text-gray-900'}>{plan.creditos_incluidos} créditos</strong> mensuales
                                                </span>
                                            </li>
                                            {/* Renderizado seguro de beneficios */}
                                            {Array.isArray(plan.beneficios) && plan.beneficios.map((b: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm">
                                                    <div className={`mt-0.5 p-0.5 rounded-full ${isPremium ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        <Check size={12} strokeWidth={3} />
                                                    </div>
                                                    <span className={isPremium ? 'text-gray-300' : 'text-gray-600'}>{b}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button 
                                            onClick={() => !isCurrent && openPurchaseModal('plan', plan)}
                                            disabled={isCurrent}
                                            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                                                isCurrent
                                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                : isPremium
                                                    ? "bg-white text-gray-900 hover:bg-gray-200"
                                                    : "bg-gray-900 text-white hover:bg-emerald-600"
                                            }`}
                                        >
                                            {isCurrent ? "Plan Actual" : "Elegir Plan"}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      {/* --- MODAL DE CONFIRMACIÓN DE COMPRA --- */}
      {modalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            
            {/* Modal */}
            <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className={`h-24 flex items-center justify-center ${selectedItem.type === 'paquete' ? 'bg-amber-100' : 'bg-gray-900'}`}>
                    {selectedItem.type === 'paquete' ? (
                        <Coins size={48} className="text-amber-500" />
                    ) : (
                        <Crown size={48} className="text-white" />
                    )}
                </div>

                <div className="p-6 text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Confirmar Compra
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                        Estás a punto de adquirir:
                    </p>

                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6">
                        <p className="font-bold text-lg text-gray-800">
                            {selectedItem.type === 'paquete' 
                                ? selectedItem.data.nombre_paq 
                                : selectedItem.data.nombre}
                        </p>
                        <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                            ${selectedItem.data.precio}
                        </p>
                        {selectedItem.type === 'plan' && <p className="text-xs text-gray-400">Facturado mensualmente</p>}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-6 justify-center">
                        <ShieldCheck size={14} /> Pagos seguros y encriptados
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={() => setModalOpen(false)}
                            className="py-3 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={confirmPurchase}
                            disabled={processing}
                            className={`py-3 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${
                                selectedItem.type === 'paquete' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-black'
                            }`}
                        >
                            {processing ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                            {processing ? "Procesando..." : "Pagar Ahora"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}
        {/* ...sección de paquetes, planes, etc... */}

    <AdsFooter ubicacion="creditos" />

    </div>
  );
}