import { Router } from 'express';
import { UsuariosController as C } from './usuarios.controller';
import { authMiddleware, adminOnly, selfOrAdmin } from '../../middlewares/auth';

const r = Router();

// Registro + Login (públicos)
r.post('/usuarios/register', C.register);
r.post('/auth/login', C.login);

// Perfil (solo el propio usuario o admin)
r.get('/usuarios/:id/perfil', authMiddleware, selfOrAdmin, C.getPerfil);
r.put('/usuarios/:id/perfil', authMiddleware, selfOrAdmin, C.updatePerfil);
r.patch('/usuarios/:id/email', authMiddleware, selfOrAdmin, C.updateEmail);
r.patch('/usuarios/:id/foto', authMiddleware, selfOrAdmin, C.updateFoto);
r.get('/usuarios/:id/panel', authMiddleware, selfOrAdmin, C.panel);

// Admin (solo administradores)
r.get('/admin/usuarios', authMiddleware, adminOnly, C.listar);
r.patch('/admin/usuarios/:id/rol', authMiddleware, adminOnly, C.cambiarRol);
r.patch('/admin/usuarios/:id/suspender', authMiddleware, adminOnly, C.suspender);
r.delete('/admin/usuarios/:id', authMiddleware, adminOnly, C.eliminar);

// Rutas Direcciones
r.get('/usuarios/:id/direcciones', authMiddleware, selfOrAdmin, C.listarDirecciones);
r.post('/usuarios/:id/direcciones', authMiddleware, selfOrAdmin, C.crearDireccion);
r.delete('/usuarios/:id/direcciones/:did', authMiddleware, selfOrAdmin, C.borrarDireccion);


export default r;
