import { useState } from 'react';
import { UsuariosAPI } from '../api';
import type { UpdatePerfilInput } from '../../../types/usuario';


export default function PerfilEditForm({ userId }: { userId: number }) {
const [form, setForm] = useState<UpdatePerfilInput>({});
const [msg, setMsg] = useState('');


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault(); setMsg('');
try {
await UsuariosAPI.updatePerfil(userId, form);
setMsg('Perfil actualizado');
} catch (e: any) { setMsg(e.message); }
};


return (
<form onSubmit={onSubmit} className="space-y-2 max-w-md">
<input className="w-full" placeholder="Nombre" onChange={e=>setForm({...form, full_name:e.target.value})} />
<input className="w-full" placeholder="Teléfono" onChange={e=>setForm({...form, telefono:e.target.value})} />
<input className="w-full" placeholder="Fecha de nacimiento (YYYY-MM-DD)" onChange={e=>setForm({...form, fecha_nacimiento:e.target.value})} />
<textarea className="w-full" placeholder="Acerca de" onChange={e=>setForm({...form, acerca_de:e.target.value})} />
<button type="submit">Guardar</button>
{msg && <p>{msg}</p>}
</form>
);
}