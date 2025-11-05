import { useEffect, useState } from 'react';
import { UsuariosAPI } from '../api';
import type { PerfilFull } from '../../../types/usuario';


export default function PerfilView({ userId }: { userId: number }) {
const [data, setData] = useState<PerfilFull | null>(null);
const [error, setError] = useState('');


useEffect(()=>{
UsuariosAPI.getPerfil(userId)
.then((r:any)=> setData(r.data))
.catch((e)=> setError(e.message));
},[userId]);


if (error) return <p>Error: {error}</p>;
if (!data) return <p>Cargando…</p>;


return (
<div className="space-y-2">
<img src={data.foto || 'https://www.gravatar.com/avatar/000?d=mp'} width={96} height={96} />
<h3>{data.full_name}</h3>
<p>{data.email}</p>
<p>Estado: {data.estado}</p>
<p>Créditos: {data.saldo_disponible} (retenidos: {data.saldo_retenido})</p>
<p>Reputación: {data.calificacion_prom} ⭐ — {data.total_resenias} reseñas</p>
<p>Intercambios completados: {data.total_intercambios}</p>
</div>
);
}