import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  Save, 
  Loader2, 
  Phone, 
  Calendar, 
  Home, 
  Briefcase 
} from "lucide-react";

import { 
  getMyProfile, 
  updateProfile, 
  getAddresses, 
  addAddress, 
  deleteAddress, 
  type Direccion 
} from "../../api/settings";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"perfil" | "direcciones">("perfil");
  
  // --- Estados Perfil ---
  const [profile, setProfile] = useState<any>(null);
  const [loadingP, setLoadingP] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // --- Estados Direcciones ---
  const [dirs, setDirs] = useState<Direccion[]>([]);
  const [newDir, setNewDir] = useState({ descripcion: "", calle_y_num: "", provincia: "", ciudad: "", es_principal: false });
  const [showDirForm, setShowDirForm] = useState(false);
  const [loadingAddr, setLoadingAddr] = useState(false);

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
    } finally {
      setInitialLoading(false);
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
      // Idealmente usar un Toast aquí
      alert("¡Perfil actualizado correctamente!");
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setLoadingP(false);
    }
  }

  async function saveAddress(e: React.FormEvent) {
    e.preventDefault();
    setLoadingAddr(true);
    try {
      await addAddress(newDir as any);
      setNewDir({ descripcion: "", calle_y_num: "", provincia: "", ciudad: "", es_principal: false });
      setShowDirForm(false);
      const d = await getAddresses();
      setDirs(d);
    } catch (e: any) {
      alert("Error al guardar dirección: " + e.message);
    } finally {
      setLoadingAddr(false);
    }
  }

  async function removeDir(id: number) {
    if(!confirm("¿Estás seguro de eliminar esta dirección?")) return;
    try {
      await deleteAddress(id);
      setDirs(prev => prev.filter(d => d.id !== id));
    } catch(e) {
      alert("Error al borrar");
    }
  }

  if (initialLoading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
           <Loader2 className="animate-spin text-emerald-500" size={32} />
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      
      {/* --- HEADER STICKY --- */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
            >
                <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Configuración</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto p-4 md:p-6">
        
        {/* --- TABS --- */}
        <div className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm flex mb-8">
           <TabButton 
              label="Editar Perfil" 
              icon={<User size={18}/>} 
              active={tab === "perfil"} 
              onClick={() => setTab("perfil")} 
           />
           <TabButton 
              label="Mis Direcciones" 
              icon={<MapPin size={18}/>} 
              active={tab === "direcciones"} 
              onClick={() => setTab("direcciones")} 
           />
        </div>

        {/* --- TAB: PERFIL --- */}
        {tab === "perfil" && profile && (
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                  {profile.foto ? (
                     <img src={profile.foto} alt="Avatar" className="w-full h-full object-cover"/>
                  ) : (
                     <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={24}/></div>
                  )}
               </div>
               <div>
                  <h2 className="text-xl font-bold">{profile.full_name || "Usuario"}</h2>
                  <p className="text-sm text-gray-500">{profile.email}</p>
               </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-5">
              <Input 
                 label="Nombre Completo" 
                 value={profile.full_name} 
                 onChange={v => setProfile({...profile, full_name: v})} 
                 icon={<User size={18}/>}
              />
              
              <Input 
                 label="Biografía" 
                 value={profile.acerca_de} 
                 onChange={v => setProfile({...profile, acerca_de: v})} 
                 textArea 
                 placeholder="Cuéntanos un poco sobre ti..."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input 
                     label="Teléfono" 
                     value={profile.telefono} 
                     onChange={v => setProfile({...profile, telefono: v})} 
                     icon={<Phone size={18}/>}
                     placeholder="+591 ..."
                  />
                  
                  <div className="space-y-1.5">
                     <label className="text-sm font-semibold text-gray-700 ml-1">Fecha de Nacimiento</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                           <Calendar size={18} />
                        </div>
                        <input 
                           type="date" 
                           className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-800"
                           value={profile.fecha_nacimiento ? new Date(profile.fecha_nacimiento).toISOString().split('T')[0] : ""}
                           onChange={e => setProfile({...profile, fecha_nacimiento: e.target.value})}
                        />
                     </div>
                  </div>
              </div>

              <div className="pt-4">
                 <button 
                    disabled={loadingP} 
                    className="w-full h-12 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-gray-200 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    {loadingP ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    {loadingP ? "Guardando..." : "Guardar Cambios"}
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB: DIRECCIONES --- */}
        {tab === "direcciones" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
             
             {/* Lista de Direcciones */}
             <div className="space-y-3">
                {dirs.map(d => (
                   <div key={d.id} className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-start justify-between group hover:border-emerald-200 transition-colors">
                      <div className="flex gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${d.es_principal ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                            {d.descripcion.toLowerCase().includes('casa') ? <Home size={18}/> : <MapPin size={18}/>}
                         </div>
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <h3 className="font-bold text-gray-900">{d.descripcion}</h3>
                               {d.es_principal && (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                     PRINCIPAL
                                  </span>
                               )}
                            </div>
                            <p className="text-sm text-gray-600">{d.calle_y_num}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{d.ciudad}, {d.provincia}</p>
                         </div>
                      </div>
                      <button 
                         onClick={() => removeDir(d.id)} 
                         className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                         title="Eliminar dirección"
                      >
                         <Trash2 size={18} />
                      </button>
                   </div>
                ))}
                
                {dirs.length === 0 && !showDirForm && (
                   <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-3">
                         <MapPin size={24} />
                      </div>
                      <p className="text-gray-500 text-sm">No tienes direcciones guardadas.</p>
                   </div>
                )}
             </div>

             {/* Formulario Agregar */}
             {!showDirForm ? (
                <button 
                   onClick={() => setShowDirForm(true)} 
                   className="w-full h-14 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-2xl text-gray-500 hover:text-emerald-600 font-bold hover:bg-emerald-50/50 transition-all flex items-center justify-center gap-2"
                >
                   <Plus size={20} />
                   Agregar Nueva Dirección
                </button>
             ) : (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                      <MapPin className="text-emerald-500" size={20} />
                      Nueva Dirección
                   </h3>
                   
                   <form onSubmit={saveAddress} className="space-y-4">
                      <Input 
                         label="Nombre (Ej. Casa, Trabajo)" 
                         value={newDir.descripcion} 
                         onChange={v => setNewDir({...newDir, descripcion: v})} 
                         icon={<Briefcase size={18}/>}
                      />
                      <Input 
                         label="Calle y Número" 
                         value={newDir.calle_y_num} 
                         onChange={v => setNewDir({...newDir, calle_y_num: v})} 
                         icon={<MapPin size={18}/>}
                      />
                      <div className="grid grid-cols-2 gap-4">
                         <Input label="Ciudad" value={newDir.ciudad} onChange={v => setNewDir({...newDir, ciudad: v})} />
                         <Input label="Provincia" value={newDir.provincia} onChange={v => setNewDir({...newDir, provincia: v})} />
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors" onClick={() => setNewDir({...newDir, es_principal: !newDir.es_principal})}>
                         <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${newDir.es_principal ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-gray-300'}`}>
                            {newDir.es_principal && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                         </div>
                         <span className="text-sm font-medium text-gray-700 select-none">Marcar como dirección principal</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                         <button 
                            type="button" 
                            onClick={() => setShowDirForm(false)} 
                            className="h-12 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                         >
                            Cancelar
                         </button>
                         <button 
                            disabled={loadingAddr}
                            className="h-12 rounded-xl bg-gray-900 hover:bg-emerald-600 text-white font-bold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                         >
                            {loadingAddr ? <Loader2 className="animate-spin" size={18}/> : "Guardar"}
                         </button>
                      </div>
                   </form>
                </div>
             )}
          </div>
        )}

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function TabButton({ label, active, onClick, icon }: { label: string; active: boolean; onClick: () => void, icon: React.ReactNode }) {
   return (
      <button 
         onClick={onClick} 
         className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            active 
            ? "bg-gray-900 text-white shadow-md" 
            : "text-gray-500 hover:bg-gray-50"
         }`}
      >
         {icon}
         {label}
      </button>
   );
}

function Input({ label, value, onChange, textArea, placeholder, icon }: { label: string; value: string; onChange: (v:string)=>void; textArea?: boolean; placeholder?: string; icon?: React.ReactNode }) {
   const safeValue = value === null || value === undefined ? "" : value;

   return (
      <div className="space-y-1.5">
         <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
         <div className="relative group">
            {icon && (
               <div className="absolute top-3.5 left-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none">
                  {icon}
               </div>
            )}
            
            {textArea ? (
               <textarea 
                  rows={3}
                  className={`w-full p-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none resize-none transition-all placeholder:text-gray-400 ${icon ? 'pl-10' : ''}`}
                  value={safeValue}
                  onChange={e => onChange(e.target.value)}
                  placeholder={placeholder}
               />
            ) : (
               <input 
                  className={`w-full p-3.5 rounded-xl bg-gray-50 border-none focus:bg-white focus:ring-2 focus:ring-emerald-100 outline-none transition-all placeholder:text-gray-400 ${icon ? 'pl-10' : ''}`}
                  value={safeValue}
                  onChange={e => onChange(e.target.value)}
                  placeholder={placeholder}
               />
            )}
         </div>
      </div>
   )
}