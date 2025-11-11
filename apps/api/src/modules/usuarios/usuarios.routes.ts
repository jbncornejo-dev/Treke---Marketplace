import { Router } from 'express';
import { UsuariosController as C } from './usuarios.controller';

const r = Router();

// Registro + Bono
r.post('/usuarios/register', C.register);

// Login mínimo
r.post('/auth/login', C.login);

// Perfil
r.post('/usuarios/register', C.register);
r.post('/auth/login', C.login);
r.get('/usuarios/:id/perfil', C.getPerfil);
r.put('/usuarios/:id/perfil', C.updatePerfil);
r.patch('/usuarios/:id/email', C.updateEmail);
r.patch('/usuarios/:id/foto', C.updateFoto);
// Admin (por ahora abierto)
r.get('/admin/usuarios', C.listar);
r.patch('/admin/usuarios/:id/rol', C.cambiarRol);
r.patch('/admin/usuarios/:id/suspender', C.suspender);
r.delete('/admin/usuarios/:id', C.eliminar);

//perfil
r.get('/usuarios/:id/panel', C.panel);

export default r;
