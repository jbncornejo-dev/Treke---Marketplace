import { useState } from 'react';
import { UsuariosAPI } from '../api';
import type { RegisterInput } from '../../../types/usuario';


export default function RegisterForm() {
const [form, setForm] = useState<RegisterInput>({ email:'', password:'', full_name:'', acepta_terminos:false });
const [msg, setMsg] = useState<string>('');
const [loading, setLoading] = useState(false);


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true); setMsg('');
try {
const r = await UsuariosAPI.register(form);
setMsg('Registrado. Se acreditaron +5 créditos.');
console.log(r);
} catch (err: any) {
setMsg(err.message);
} finally { setLoading(false); }
};


return (
<form onSubmit={onSubmit} className="space-y-3 max-w-md">
<h2>Registro rápido</h2>
<input className="w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
<input className="w-full" placeholder="Nombre completo" value={form.full_name} onChange={e=>setForm({...form, full_name:e.target.value})} />
<input className="w-full" placeholder="Contraseña" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
<label className="flex items-center gap-2">
<input type="checkbox" checked={form.acepta_terminos} onChange={e=>setForm({...form, acepta_terminos:e.target.checked})} />
<span>Acepto términos y condiciones</span>
</label>
<button disabled={loading} type="submit">{loading? 'Registrando...' : 'Registrarme'}</button>
{msg && <p>{msg}</p>}
</form>
);
}