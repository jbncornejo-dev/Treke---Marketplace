// apps/api/src/modules/resenias/resenias.service.ts
import { pool } from '../../config/database/database';
import { SQL } from './resenias.sql';

export async function crearResenia(autorId: number, destinatarioId: number, calificacion: number, comentario: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Validar que no se auto-califique
    if (autorId === destinatarioId) throw new Error("No puedes calificarte a ti mismo");

    // 2. Validar que exista un intercambio COMPLETADO entre ellos
    const checkIntercambio = await client.query(`
      SELECT 1 FROM intercambios 
      WHERE estado = 'completado' 
      AND ( (comprador_id = $1 AND vendedor_id = $2) OR (vendedor_id = $1 AND comprador_id = $2) )
      LIMIT 1
    `, [autorId, destinatarioId]);

    if (checkIntercambio.rowCount === 0) {
      throw new Error("Solo puedes calificar a usuarios con los que hayas completado un intercambio.");
    }

    // 3. Validar duplicados
    const checkDup = await client.query(SQL.checkExiste, [autorId, destinatarioId]);

    // ⬇️ LÍNEA AÑADIDA PARA CORREGIR EL ERROR DE TYPESCRIPT
    if (checkDup.rowCount! > 0) throw new Error("Ya has calificado a este usuario.");

    // 4. Insertar
    await client.query(SQL.crearResenia, [calificacion, comentario, autorId, destinatarioId]);

    // 5. Recalcular reputación
    await client.query(SQL.actualizarReputacion, [destinatarioId]);

    await client.query('COMMIT');
    return { message: "Reseña creada y reputación actualizada" };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function obtenerResenias(usuarioId: number) {
  const r = await pool.query(SQL.listarPorUsuario, [usuarioId, 20, 0]);
  return r.rows;
}
