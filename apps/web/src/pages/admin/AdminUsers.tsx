import { useEffect, useMemo, useState } from "react";
import Header from "../../components/Header";
import * as Admin from "../../api/admin";

export default function AdminUsers() {
  const [rows, setRows] = useState<Admin.Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [form, setForm] = useState({ email:"", full_name:"", password:"", rol_id:10001, acepta_terminos:true });
  const [edit, setEdit] = useState<{ id:number; full_name:string; email:string; rol_id:number }|null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const data = await Admin.listarUsuarios();
      setRows(data);
    } catch (e:any) {
      setMsg(e?.message || "No se pudo listar usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    try {
      await Admin.crearUsuario(form);
      setForm({ email:"", full_name:"", password:"", rol_id:10001, acepta_terminos:true });
      await refresh();
      setMsg("✅ Usuario creado");
    } catch (e:any) {
      setMsg("❌ " + (e?.message || "Error al crear"));
    }
  }

  async function handleSaveEdit() {
    if (!edit) return;
    setMsg("");
    try {
      if (edit.full_name) await Admin.updatePerfil(edit.id, { full_name: edit.full_name });
      if (edit.email) await Admin.updateEmail(edit.id, edit.email);
      if (edit.rol_id) await Admin.cambiarRol(edit.id, edit.rol_id);
      setEdit(null);
      await refresh();
      setMsg("✅ Usuario actualizado");
    } catch (e:any) {
      setMsg("❌ " + (e?.message || "Error al actualizar"));
    }
  }

  async function handleSuspend(id:number) {
    setMsg("");
    try {
      await Admin.suspender(id);
      await refresh();
      setMsg("✅ Usuario suspendido");
    } catch (e:any) {
      setMsg("❌ " + (e?.message || "Error al suspender"));
    }
  }

  async function handleDelete(id:number) {
    if (!confirm("¿Eliminar este usuario?")) return;
    setMsg("");
    try {
      await Admin.eliminar(id);
      await refresh();
      setMsg("✅ Usuario eliminado");
    } catch (e:any) {
      setMsg("❌ " + (e?.message || "Error al eliminar"));
    }
  }

  const roles = useMemo(()=>[
    {id:10001, label:"Usuario"},
    {id:10002, label:"Emprendedor"},
    {id:10003, label:"Administrador"},
  ],[]);

  return (
    <div className="min-h-dvh bg-neutral-950 text-neutral-100">
      <Header title="Administración" />
      <main className="mx-auto max-w-6xl p-6 space-y-6">
        {msg && <div className="rounded-lg border border-neutral-700 p-3 text-sm">{msg}</div>}

        {/* Crear */}
        <section className="rounded-2xl border border-neutral-800 p-5">
          <h2 className="text-lg font-semibold mb-3">Crear usuario</h2>
          <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-4">
            <input className="rounded-xl bg-neutral-900/60 px-3 py-2" placeholder="Email"
              value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))}/>
            <input className="rounded-xl bg-neutral-900/60 px-3 py-2" placeholder="Nombre completo"
              value={form.full_name} onChange={e=>setForm(s=>({...s,full_name:e.target.value}))}/>
            <input className="rounded-xl bg-neutral-900/60 px-3 py-2" placeholder="Contraseña"
              value={form.password} onChange={e=>setForm(s=>({...s,password:e.target.value}))}/>
            <select className="rounded-xl bg-neutral-900/60 px-3 py-2"
              value={form.rol_id} onChange={e=>setForm(s=>({...s,rol_id:Number(e.target.value)}))}>
              {roles.map(r=> <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <button className="md:col-span-4 rounded-xl border border-neutral-700 px-4 py-2 hover:bg-neutral-900">
              Crear
            </button>
          </form>
        </section>

        {/* Listado */}
        <section className="rounded-2xl border border-neutral-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Usuarios</h2>
            <button onClick={refresh} className="rounded-lg border border-neutral-700 px-3 py-1 text-sm">Refrescar</button>
          </div>

          {loading ? <p>Cargando...</p> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-neutral-300">
                  <tr>
                    <th className="px-2 py-2">ID</th>
                    <th className="px-2 py-2">Email</th>
                    <th className="px-2 py-2">Nombre</th>
                    <th className="px-2 py-2">Rol</th>
                    <th className="px-2 py-2">Estado</th>
                    <th className="px-2 py-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(u=>(
                    <tr key={u.id} className="border-t border-neutral-800">
                      <td className="px-2 py-2">{u.id}</td>
                      <td className="px-2 py-2">{u.email}</td>
                      <td className="px-2 py-2">{u.full_name ?? "-"}</td>
                      <td className="px-2 py-2">{Admin.ROL_LABEL[u.rol_id] ?? u.rol_id}</td>
                      <td className="px-2 py-2">{u.estado}</td>
                      <td className="px-2 py-2 space-x-2">
                        <button className="underline text-blue-300" onClick={()=>setEdit({ id:u.id, email:u.email, full_name:u.full_name||"", rol_id:u.rol_id })}>Editar</button>
                        <button className="underline text-yellow-300" onClick={()=>handleSuspend(u.id)}>Suspender</button>
                        <button className="underline text-red-400" onClick={()=>handleDelete(u.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!rows.length && <p className="opacity-70 mt-4">No hay usuarios.</p>}
            </div>
          )}
        </section>

        {/* Modal Edición */}
        {edit && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-neutral-700 bg-neutral-950 p-5 space-y-3">
              <h3 className="text-lg font-semibold">Editar usuario #{edit.id}</h3>
              <input className="w-full rounded-xl bg-neutral-900/60 px-3 py-2" placeholder="Email"
                value={edit.email} onChange={e=>setEdit(s=>s?{...s,email:e.target.value}:s)}/>
              <input className="w-full rounded-xl bg-neutral-900/60 px-3 py-2" placeholder="Nombre completo"
                value={edit.full_name} onChange={e=>setEdit(s=>s?{...s,full_name:e.target.value}:s)}/>
              <select className="w-full rounded-xl bg-neutral-900/60 px-3 py-2"
                value={edit.rol_id} onChange={e=>setEdit(s=>s?{...s,rol_id:Number(e.target.value)}:s)}>
                {roles.map(r=> <option key={r.id} value={r.id}>{r.label}</option>)}
              </select>
              <div className="flex gap-2 justify-end">
                <button className="rounded-lg border border-neutral-700 px-3 py-1" onClick={()=>setEdit(null)}>Cancelar</button>
                <button className="rounded-lg border border-green-700 px-3 py-1" onClick={handleSaveEdit}>Guardar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
