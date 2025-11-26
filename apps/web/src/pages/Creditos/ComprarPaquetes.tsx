import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getCatalogoCreditos, 
  comprarPaquete, 
  comprarPlan, 
  type PaqueteCredito, 
  type PlanSuscripcion, 
  type SuscripcionUser 
} from "../../api/creditos";

export default function CreditosPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"paquetes" | "planes">("paquetes");
  const [loading, setLoading] = useState(true);
  
  const [paquetes, setPaquetes] = useState<PaqueteCredito[]>([]);
  const [planes, setPlanes] = useState<PlanSuscripcion[]>([]);
  const [miSub, setMiSub] = useState<SuscripcionUser | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
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

  async function handleBuyPaquete(pkg: PaqueteCredito) {
    if (!confirm(`¿Comprar ${pkg.nombre_paq} por $${pkg.precio}?`)) return;
    try {
      await comprarPaquete(pkg.id);
      alert("¡Compra exitosa! Tus créditos han sido acreditados.");
      navigate(0); // Recargar para actualizar header de créditos
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  async function handleBuyPlan(plan: PlanSuscripcion) {
    if (!confirm(`¿Suscribirte al ${plan.nombre} por $${plan.precio}/mes?`)) return;
    try {
      await comprarPlan(plan.id);
      alert("¡Suscripción activada exitosamente!");
      loadData();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] pb-20">
      
      {/* Header Simple */}
      <div className="sticky top-0 z-10 bg-[#f6f8f7]/95 dark:bg-[#112117]/95 backdrop-blur-md p-4 flex items-center border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10">
           <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="flex-1 text-center font-bold text-lg">Tienda de Créditos</h1>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center p-4">
        <div className="bg-gray-200 dark:bg-white/10 p-1 rounded-xl flex">
          <button 
            onClick={() => setTab("paquetes")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "paquetes" ? "bg-white dark:bg-[#2ecc71] text-black dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
          >
            Paquetes
          </button>
          <button 
            onClick={() => setTab("planes")}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${tab === "planes" ? "bg-white dark:bg-[#2ecc71] text-black dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400"}`}
          >
            Suscripciones
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto p-4">
        {loading ? (
           <div className="text-center py-20">Cargando catálogo...</div>
        ) : tab === "paquetes" ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {paquetes.map(pkg => (
                <div key={pkg.id} className="bg-white dark:bg-[#1a2e22] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:border-[#2ecc71] transition-colors">
                   <div className="text-4xl mb-2">🪙</div>
                   <h3 className="text-xl font-bold text-gray-800 dark:text-white">{pkg.nombre_paq}</h3>
                   <p className="text-gray-500 text-sm mb-4">{pkg.descripcion}</p>
                   <div className="text-3xl font-extrabold text-[#2ecc71] mb-1">{pkg.cant_creditos} <span className="text-sm font-medium text-gray-400">créditos</span></div>
                   <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-6">${pkg.precio}</div>
                   <button 
                     onClick={() => handleBuyPaquete(pkg)}
                     className="w-full py-3 bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold rounded-xl transition-transform active:scale-95"
                   >
                     Comprar
                   </button>
                </div>
              ))}
           </div>
        ) : (
           <div className="space-y-6">
              {/* Estado de suscripción actual */}
              {miSub && (
                <div className="bg-linear-to-r from-blue-600 to-blue-400 text-white p-6 rounded-2xl shadow-lg mb-8">
                   <div className="flex justify-between items-center">
                      <div>
                        <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Tu Plan Actual</p>
                        <h2 className="text-2xl font-bold mt-1">{miSub.nombre_plan}</h2>
                      </div>
                      <div className="bg-white/20 px-3 py-1 rounded-lg text-sm font-medium backdrop-blur-sm">
                        {miSub.estado.toUpperCase()}
                      </div>
                   </div>
                   <p className="mt-4 text-sm opacity-90">
                     Vence el: {new Date(miSub.fecha_fin).toLocaleDateString()}
                   </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {planes.map(plan => {
                  const isCurrent = miSub?.nombre_plan === plan.nombre;
                  return (
                    <div key={plan.id} className={`relative bg-white dark:bg-[#1a2e22] p-6 rounded-2xl shadow-sm border flex flex-col ${isCurrent ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-100 dark:border-gray-700'}`}>
                       {isCurrent && <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">ACTIVO</span>}
                       
                       <h3 className="text-lg font-bold text-gray-800 dark:text-white">{plan.nombre}</h3>
                       <div className="my-4">
                          <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${plan.precio}</span>
                          <span className="text-gray-500 text-sm"> / mes</span>
                       </div>
                       
                       <ul className="flex-1 space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-300">
                          <li className="flex items-center gap-2">
                             <span className="text-[#2ecc71]">✓</span> 
                             <span className="font-bold">{plan.creditos_incluidos} créditos/mes</span>
                          </li>
                          {/* Renderizar beneficios si existen */}
                          {Array.isArray(plan.beneficios) && plan.beneficios.map((b: string, idx: number) => (
                             <li key={idx} className="flex items-center gap-2">
                                <span className="text-[#2ecc71]">✓</span> {b}
                             </li>
                          ))}
                       </ul>

                       <button 
                         onClick={() => handleBuyPlan(plan)}
                         disabled={isCurrent}
                         className={`w-full py-3 font-bold rounded-xl transition-transform active:scale-95 ${
                            isCurrent 
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                         }`}
                       >
                         {isCurrent ? "Plan Actual" : "Suscribirse"}
                       </button>
                    </div>
                  )
                })}
              </div>
           </div>
        )}
      </div>
    </div>
  );
}