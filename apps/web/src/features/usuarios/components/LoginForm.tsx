import { useState } from 'react';
import { UsuariosAPI } from '../api';
import type { LoginInput } from '../../../types/usuario';


export default function LoginForm({ onLogged }: { onLogged: (user: any)=>void }) {
const [form, setForm] = useState<LoginInput>({ email:'', password:'' });
const [msg, setMsg] = useState('');


const onSubmit = async (e: React.FormEvent) => {
e.preventDefault(); setMsg('');
try {
const r = await UsuariosAPI.login(form);
onLogged(r.user);
} catch (err: any) {
setMsg(err.message);
}
};


return (
<form onSubmit={onSubmit} className="space-y-3 max-w-md">
<h2>Login (dev)</h2>
<input className="w-full" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
<input className="w-full" placeholder="Contraseña" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
<button type="submit">Entrar</button>
{msg && <p>{msg}</p>}
</form>
);
}