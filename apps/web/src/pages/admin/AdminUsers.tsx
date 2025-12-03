import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; // 👈 NUEVO
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  CheckCircle,
  Loader2,
  X
} from "lucide-react";
import * as Admin from "../../api/admin";

export default function AdminUsers() {
  const [rows, setRows] = useState<Admin.Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{type: 'success'|'error', text: string}|null>(null);
  const [filter, setFilter] = useState("");

  // Crear usuario
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ email:"", full_name:"", password:"", rol_id:10001, acepta_terminos:true });
  
  // Editar usuario
  const [edit, setEdit] = useState<{ id:number; full_name:string; email:string; rol_id:number }|null>(null);

  // Carga inicial
  useEffect(() => { refresh(); }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await Admin.listarUsuarios();
      setRows(data);
    } catch (e:any) {
      setMsg({ type: 'error', text: e?.message || "Error al cargar usuarios" });
    } finally {
      setLoading(false);
    }
  }

  // --- HANDLERS ---

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await Admin.crearUsuario(form);
      setForm({ email:"", full_name:"", password:"", rol_id:10001, acepta_terminos:true });
      setShowCreate(false);
      await refresh();
      setMsg({ type: 'success', text: "Usuario creado exitosamente" });
    } catch (e:any) {
      setMsg({ type: 'error', text: e?.message || "Error al crear" });
    }
  }

  async function handleSaveEdit() {
    if (!edit) return;
    try {
      if (edit.full_name) await Admin.updatePerfil(edit.id, { full_name: edit.full_name });
      if (edit.email) await Admin.updateEmail(edit.id, edit.email);
      if (edit.rol_id) await Admin.cambiarRol(edit.id, edit.rol_id);
      setEdit(null);
      await refresh();
      setMsg({ type: 'success', text: "Usuario actualizado" });
    } catch (e:any) {
      setMsg({ type: 'error', text: e?.message || "Error al actualizar" });
    }
  }

  async function handleSuspend(id:number) {
    if (!confirm("¿Suspender a este usuario? No podrá iniciar sesión.")) return;
    try {
      await Admin.suspender(id);
      await refresh();
      setMsg({ type: 'success', text: "Usuario suspendido" });
    } catch (e:any) {
      setMsg({ type: 'error', text: e?.message || "Error al suspender" });
    }
  }

  async function handleDelete(id:number) {
    if (!confirm("¿ELIMINAR DEFINITIVAMENTE? Esta acción no se puede deshacer.")) return;
    try {
      await Admin.eliminar(id);
      await refresh();
      setMsg({ type: 'success', text: "Usuario eliminado permanentemente" });
    } catch (e:any) {
      setMsg({ type: 'error', text: e?.message || "Error al eliminar" });
    }
  }

  // Filtrado local
  const filteredRows = rows.filter(u => 
    u.email.toLowerCase().includes(filter.toLowerCase()) || 
    u.full_name?.toLowerCase().includes(filter.toLowerCase())
  );

  const roles = useMemo(()=>[
    {id:10001, label:"Usuario"},
    {id:10002, label:"Emprendedor"},
    {id:10003, label:"Administrador"},
  ],[]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 selection:bg-emerald-100">
      
      {/* --- HEADER --- */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                 <Users className="text-emerald-600" /> Administración de Usuarios
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona roles, accesos y estados de la plataforma.
              </p>
           </div>
           
           <div className="flex items-center gap-3">
              {/* 👇 Botón para ir al mercado */}
              <Link
                to="/market"
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:border-emerald-200 transition-all shadow-sm"
              >
                Ir al mercado
              </Link>

              {/* Botón existente de nuevo usuario */}
              <button 
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 bg-gray-900 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-gray-200"
              >
                <Plus size={18} /> Nuevo Usuario
              </button>
           </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        
        {/* Mensajes Feedback */}
        {msg && (
           <div className={`p-4 rounded-xl flex items-center gap-2 text-sm font-medium animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {msg.type === 'success' ? <CheckCircle size={18}/> : <ShieldAlert size={18}/>}
              {msg.text}
              <button onClick={() => setMsg(null)} className="ml-auto opacity-50 hover:opacity-100"><X size={16}/></button>
           </div>
        )}

        {/* --- FILTROS Y BÚSQUEDA --- */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
           <Search size={20} className="text-gray-400" />
           <input 
              className="flex-1 outline-none text-sm placeholder:text-gray-400" 
              placeholder="Buscar por nombre o correo..." 
              value={filter}
              onChange={e => setFilter(e.target.value)}
           />
           <div className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">
              {filteredRows.length} resultados
           </div>
        </div>

        {/* --- TABLA DE USUARIOS --- */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
           {loading ? (
              <div className="p-12 flex justify-center text-emerald-600"><Loader2 className="animate-spin" size={32} /></div>
           ) : (
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold uppercase text-xs">
                       <tr>
                          <th className="px-6 py-4">Usuario</th>
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Estado</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filteredRows.map(u => (
                          <tr key={u.id} className="hover:bg-gray-50 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex flex-col">
                                   <span className="font-bold text-gray-900">{u.full_name || "Sin nombre"}</span>
                                   <span className="text-xs text-gray-500">{u.email}</span>
                                </div>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                                   u.rol_id === 10003 
                                   ? "bg-purple-50 text-purple-700 border-purple-100" 
                                   : u.rol_id === 10002 
                                      ? "bg-blue-50 text-blue-700 border-blue-100" 
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                }`}>
                                   {Admin.ROL_LABEL[u.rol_id] ?? "Rol Desconocido"}
                                </span>
                             </td>
                             <td className="px-6 py-4">
                                <span className={`flex items-center gap-1.5 text-xs font-medium ${
                                   u.estado === 'activo' ? 'text-emerald-600' : 'text-red-600'
                                }`}>
                                   <span className={`w-1.5 h-1.5 rounded-full ${u.estado === 'activo' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                   {u.estado.charAt(0).toUpperCase() + u.estado.slice(1)}
                                </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button 
                                      onClick={()=>setEdit({ id:u.id, email:u.email, full_name:u.full_name||"", rol_id:u.rol_id })}
                                      className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                      title="Editar"
                                   >
                                      <Edit2 size={16} />
                                   </button>
                                   <button 
                                      onClick={()=>handleSuspend(u.id)}
                                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                      title="Suspender"
                                   >
                                      <ShieldAlert size={16} />
                                   </button>
                                   <button 
                                      onClick={()=>handleDelete(u.id)}
                                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Eliminar"
                                   >
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
                 {!filteredRows.length && (
                    <div className="p-12 text-center text-gray-400">
                       No se encontraron usuarios que coincidan con la búsqueda.
                    </div>
                 )}
              </div>
           )}
        </div>

        {/* --- MODAL CREAR --- */}
        {showCreate && (
           <Modal title="Nuevo Usuario" onClose={() => setShowCreate(false)}>
                <form onSubmit={handleCreate} className="space-y-4">
                 <Input label="Nombre Completo" value={form.full_name} onChange={v => setForm({...form, full_name: v})} placeholder="Ej. Juan Pérez" />
                 <Input label="Correo Electrónico" value={form.email} onChange={v => setForm({...form, email: v})} placeholder="correo@ejemplo.com" />
                 <Input label="Contraseña" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="••••••" type="password" />
                 
                 <div className="space-y-1">
                  <label className="text-sm font-bold text-gray-600 ml-1">Rol</label>
                  <select 
                     className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-100"
                     value={form.rol_id} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm({...form,rol_id:Number(e.target.value)})}
                  >
                     {roles.map((r: {id: number; label: string}) => <option key={r.id} value={r.id}>{r.label}</option>)}
                  </select>
                 </div>

                 <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                  <button className="flex-1 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-emerald-600 transition-colors shadow-lg">Crear Usuario</button>
                 </div>
                </form>
           </Modal>
        )}

        {/* --- MODAL EDITAR --- */}
        {edit && (
           <Modal title={`Editar Usuario #${edit.id}`} onClose={() => setEdit(null)}>
              <div className="space-y-4">
                 <Input label="Nombre Completo" value={edit.full_name} onChange={v => setEdit({...edit, full_name: v})} />
                 <Input label="Correo Electrónico" value={edit.email} onChange={v => setEdit({...edit, email: v})} />
                 
                 <div className="space-y-1">
                    <label className="text-sm font-bold text-gray-600 ml-1">Rol</label>
                    <select 
                       className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-100"
                       value={edit.rol_id} onChange={e=>setEdit({...edit,rol_id:Number(e.target.value)})}
                    >
                       {roles.map(r=> <option key={r.id} value={r.id}>{r.label}</option>)}
                    </select>
                 </div>

                 <div className="pt-4 flex gap-3">
                    <button onClick={() => setEdit(null)} className="flex-1 py-3 rounded-xl border border-gray-200 font-semibold text-gray-600 hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSaveEdit} className="flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg">Guardar Cambios</button>
                 </div>
              </div>
           </Modal>
        )}

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---

function Modal({ title, children, onClose }: { title: string, children: React.ReactNode, onClose: () => void }) {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in">
         <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
               <h3 className="font-bold text-lg text-gray-900">{title}</h3>
               <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-6">
               {children}
            </div>
         </div>
      </div>
   )
}

// Definimos la interfaz para que TS sepa qué esperar
interface InputProps {
  label: string;
  value: string | number; // Aceptamos texto o números
  onChange: (value: string) => void; // Explicamos que devuelve un string
  placeholder?: string;
  type?: string;
}

function Input({ label, value, onChange, placeholder, type = "text" }: InputProps) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold text-gray-600 ml-1">{label}</label>
      <input
        type={type}
        className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
        value={value}
        // Aquí extraemos el value del evento y se lo pasamos limpio al padre
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
