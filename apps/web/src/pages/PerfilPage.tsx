import { useParams } from 'react-router-dom';
import PerfilView from '../features/usuarios/components/PerfilView';
import PerfilEditForm from '../features/usuarios/components/PerfilEditForm';


export default function PerfilPage() {
const { id } = useParams();
const userId = Number(id);
return (
<div className="p-4 space-y-6">
<h1>Mi Perfil</h1>
<PerfilView userId={userId} />
<h2>Editar</h2>
<PerfilEditForm userId={userId} />
</div>
);
}