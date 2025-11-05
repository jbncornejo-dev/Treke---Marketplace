import { Router } from 'express';
import { UsuariosController as C } from './usuarios.controller';

const r = Router();

// Registro + Bono
r.post('/usuarios/register', C.register);

// Login mínimo
r.post('/auth/login', C.login);

// Perfil
r.get('/usuarios/:id/perfil', C.getPerfil);
r.put('/usuarios/:id/perfil', C.updatePerfil);
r.patch('/usuarios/:id/foto', C.updateFoto);
r.patch('/usuarios/:id/email', C.updateEmail);

// Admin (por ahora abierto)
r.get('/admin/usuarios', C.listar);
r.patch('/admin/usuarios/:id/rol', C.cambiarRol);
r.patch('/admin/usuarios/:id/suspender', C.suspender);

export default r;
