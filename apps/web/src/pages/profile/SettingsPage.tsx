import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyProfile, updateProfile, getAddresses, addAddress, deleteAddress, type Direccion } from "../../api/settings";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"perfil" | "direcciones">("perfil");
  
  // --- Estados Perfil ---
  const [profile, setProfile] = useState<any>(null);
  const [loadingP, setLoadingP] = useState(false);

  // --- Estados Direcciones ---
  const [dirs, setDirs] = useState<Direccion[]>([]);
  const [newDir, setNewDir] = useState({ descripcion: "", calle_y_num: "", provincia: "", ciudad: "", es_principal: false });
  const [showDirForm, setShowDirForm] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const p = await getMyProfile();
      setProfile(p);
      const d = await getAddresses();
      setDirs(d);
    } catch (e) {
      console.error(e);
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoadingP(true);
    try {
      await updateProfile({
        full_name: profile.full_name || "",
        acerca_de: profile.acerca_de || "",
        telefono: profile.telefono || "",
        fecha_nacimiento: profile.fecha_nacimiento || null
      });
      alert("Perfil actualizado");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingP(false);
    }
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    try {
      await addAddress(newDir as any);
      setNewDir({ descripcion: "", calle_y_num: "", provincia: "", ciudad: "", es_principal: false });
      setShowDirForm(false);
      const d = await getAddresses();
      setDirs(d);
    } catch (e: any) {
      alert("Error al guardar dirección: " + e.message);
    }
  }

  async function removeDir(id: number) {
    if(!confirm("¿Borrar dirección?")) return;
    try {
      await deleteAddress(id);
      setDirs(prev => prev.filter(d => d.id !== id));
    } catch(e) {
      alert("Error al borrar");
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] dark:bg-[#112117] text-[#333] dark:text-[#f5f5f5] font-sans pb-20">
      
      {/* Header Simple */}
      <div className="sticky top-0 z-20 flex items-center px-4 py-3 bg-[#f6f8f7]/90 dark:bg-[#112117]/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="ml-2 text-lg font-bold">Configuración</h1>
      </div>

      <main className="max-w-2xl mx-auto p-4">
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-200 dark:bg-white/5 rounded-xl mb-6">
           <button 
             onClick={() => setTab("perfil")} 
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "perfil" ? "bg-white dark:bg-[#2ecc71] shadow-sm text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
           >
             Editar Perfil
           </button>
           <button 
             onClick={() => setTab("direcciones")} 
             className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${tab === "direcciones" ? "bg-white dark:bg-[#2ecc71] shadow-sm text-black dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
           >
             Direcciones
           </button>
        </div>

        {/* --- FORMULARIO PERFIL --- */}
      {tab === "perfil" && profile && (
        <form onSubmit={saveProfile} className="space-y-4">
           {/* CORRECCIÓN: Agregar || "" en todos los values */}
           <Input 
              label="Nombre Completo" 
              value={profile.full_name || ""} 
              onChange={v => setProfile({...profile, full_name: v})} 
           />
           <Input 
              label="Biografía / Acerca de" 
              value={profile.acerca_de || ""} 
              onChange={v => setProfile({...profile, acerca_de: v})} 
              textArea 
           />
           <Input 
              label="Teléfono" 
              value={profile.telefono || ""} 
              onChange={v => setProfile({...profile, telefono: v})} 
           />
           
           <div className="space-y-1">
              <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">Fecha de Nacimiento</label>
              <input 
                type="date" 
                className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#2ecc71] outline-none"
                // Validación extra para evitar crash si la fecha es null
                value={profile.fecha_nacimiento ? new Date(profile.fecha_nacimiento).toISOString().split('T')[0] : ""}
                onChange={e => setProfile({...profile, fecha_nacimiento: e.target.value})}
              />
           </div>

           <button disabled={loadingP} className="w-full h-12 mt-4 rounded-xl bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold shadow-lg transition-all disabled:opacity-50">
              {loadingP ? "Guardando..." : "Guardar Cambios"}
           </button>
        </form>
      )}

        {/* --- LISTA DIRECCIONES --- */}
        {tab === "direcciones" && (
          <div className="space-y-4">
             {dirs.map(d => (
                <div key={d.id} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2">
                         <span className="font-bold text-lg">{d.descripcion}</span>
                         {d.es_principal && <span className="text-[10px] font-bold bg-[#2ecc71]/20 text-[#2ecc71] px-2 py-0.5 rounded">PRINCIPAL</span>}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{d.calle_y_num}</p>
                      <p className="text-xs text-gray-400">{d.ciudad}, {d.provincia}</p>
                   </div>
                   <button onClick={() => removeDir(d.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
             ))}

             {!showDirForm ? (
                <button onClick={() => setShowDirForm(true)} className="w-full h-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                   + Agregar Nueva Dirección
                </button>
             ) : (
                <form onSubmit={saveAddress} className="p-4 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 space-y-3 animate-fade-in-up">
                   <h3 className="font-bold mb-2">Nueva Dirección</h3>
                   <Input label="Nombre (Ej. Casa, Trabajo)" value={newDir.descripcion} onChange={v => setNewDir({...newDir, descripcion: v})} />
                   <Input label="Calle y Número" value={newDir.calle_y_num} onChange={v => setNewDir({...newDir, calle_y_num: v})} />
                   <div className="grid grid-cols-2 gap-3">
                      <Input label="Ciudad" value={newDir.ciudad} onChange={v => setNewDir({...newDir, ciudad: v})} />
                      <Input label="Provincia" value={newDir.provincia} onChange={v => setNewDir({...newDir, provincia: v})} />
                   </div>
                   <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={newDir.es_principal} onChange={e => setNewDir({...newDir, es_principal: e.target.checked})} className="rounded text-[#2ecc71] focus:ring-[#2ecc71]" />
                      Marcar como principal
                   </label>
                   <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setShowDirForm(false)} className="flex-1 h-10 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-bold">Cancelar</button>
                      <button className="flex-1 h-10 rounded-lg bg-[#2ecc71] text-white text-sm font-bold">Guardar</button>
                   </div>
                </form>
             )}
          </div>
        )}

      </main>
    </div>
  );
}

// CORRECCIÓN EN EL COMPONENTE INPUT PARA EVITAR WARNINGS
function Input({ label, value, onChange, textArea }: { label: string; value: string; onChange: (v:string)=>void; textArea?: boolean }) {
   // Aseguramos que value nunca llegue undefined al input
   const safeValue = value === null || value === undefined ? "" : value;

   return (
      <div className="space-y-1">
         <label className="text-sm font-bold text-gray-500 dark:text-gray-400 ml-1">{label}</label>
         {textArea ? (
            <textarea 
               rows={3}
               className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#2ecc71] outline-none resize-none"
               value={safeValue}
               onChange={e => onChange(e.target.value)}
            />
         ) : (
            <input 
               className="w-full p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-[#2ecc71] outline-none"
               value={safeValue}
               onChange={e => onChange(e.target.value)}
            />
         )}
      </div>
   )
}