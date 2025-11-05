import { useState } from 'react';
import LoginForm from '../features/usuarios/components/LoginForm';
import RegisterForm from '../features/usuarios/components/RegisterForm';


export default function Home() {
const [user, setUser] = useState<any>(null);
return (
<div className="p-4 space-y-6">
<h1>TREKE – Demo HU 7.1 (sin auth)</h1>
{!user ? (
<div className="grid md:grid-cols-2 gap-8">
<RegisterForm />
<LoginForm onLogged={setUser} />
</div>
) : (
<div>
<p>Sesión DEV: {user.email} (id: {user.id})</p>
<a href={`/perfil/${user.id}`}>Ir a mi perfil</a>
</div>
)}
</div>
);
}