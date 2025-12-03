import { Router } from 'express';
import { ReseniasController as C } from './resenias.controller';
import { authMiddleware } from '../../middlewares/auth';

const r = Router();

// ==========================================
// Rutas de Reseñas
// Base URL sugerida: /api/resenias
// ==========================================

// POST /api/resenias -> Crear una reseña (Requiere estar logueado)
r.post('/', authMiddleware, C.crear);

// GET /api/resenias/:usuario_id -> Ver las reseñas que ha recibido un usuario
// Nota: Usamos authMiddleware si quieres que solo usuarios registrados vean las reseñas,
// o puedes quitarlo si el perfil es público. Por consistencia con tu app, lo dejo protegido.
r.get('/:usuario_id', authMiddleware, C.listarPorUsuario);

export default r;