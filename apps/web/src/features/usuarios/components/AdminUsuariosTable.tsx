import { useEffect, useState } from 'react';
import { UsuariosAPI } from '../api';
import type { Usuario } from '../../../types/usuario';


export default function AdminUsuariosTable() {
const [data, setData] = useState<Usuario[]>([]);
const [q, setQ] = useState('');
const [estado, setEstado] = useState('');
const [rol, setRol] = useState<number | ''>('');


const fetchData = async () => {
const r:any = await UsuariosAPI.list({ q, estado, rol: rol? Number(rol): undefined, page:1, pageSize:20 });
setData(r.data || []);
};
useEffect(()=>{ fetchData(); },[]);


const onRol = async (id:number, nuevoRolId:number)=>{ await UsuariosAPI.cambiarRol(id, nuevoRolId); fetchData(); };
const onSusp = async (id:number)=>{ await UsuariosAPI.suspender(id); fetchData(); };

return (
<div className="space-y-2">
<div className="flex gap-2">
<input placeholder="Buscar nombre/email" value={q} onChange={e=>setQ(e.target.value)} />
<select value={estado} onChange={e=>setEstado(e.target.value)}>
<option value="">Estado</option>
<option value="activo">activo</option>
<option value="pendiente_verificacion">pendiente_verificacion</option>
<option value="inactivo">inactivo</option>
<option value="suspendido">suspendido</option>
</select>
<select value={rol} onChange={e=>setRol(e.target.value ? Number(e.target.value) : '')}>
<option value="">Rol</option>
<option value="10001">usuario</option>
<option value="10002">emprendedor</option>
<option value="10003">administrador</option>
</select>
<button onClick={fetchData}>Filtrar</button>
</div>
<table>
<thead>
<tr>
<th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Acciones</th>
</tr>
</thead>
<tbody>
{data.map(u=> (
<tr key={u.id}>
<td>{u.id}</td>
<td>{(u as any).full_name || '-'}</td>
<td>{u.email}</td>
<td>{u.rol_id}</td>
<td>{u.estado}</td>
<td className="space-x-1">
<button onClick={()=>onRol(u.id, 10001)}>Usuario</button>
<button onClick={()=>onRol(u.id, 10002)}>Empr.</button>
<button onClick={()=>onRol(u.id, 10003)}>Admin</button>
<button onClick={()=>onSusp(u.id)}>Suspender</button>
</td>
</tr>
))}
</tbody>
</table>
</div>
);
}