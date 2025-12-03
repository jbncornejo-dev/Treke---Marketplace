// apps/api/src/modules/resenias/resenias.sql.ts
export const SQL = {
  // Verificar si ya existe una reseña para este intercambio (opcional, si vinculas por ID) 
  // O verificar si ya existe reseña de A hacia B:
  checkExiste: `
    SELECT 1 FROM resenia 
    WHERE autor_id = $1 AND destinatario_id = $2
  `,

  // Insertar la reseña
  crearResenia: `
    INSERT INTO resenia (calificacion, comentario, autor_id, destinatario_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, created_at;
  `,

  // Actualizar o Insertar la tabla de reputación (Upsert)
  actualizarReputacion: `
    INSERT INTO reputacion_user (usuario_id, total_resenias, total_estrellas, calificacion_prom, updated_at)
    SELECT 
      $1,
      COUNT(*),
      SUM(calificacion),
      ROUND(AVG(calificacion), 2),
      NOW()
    FROM resenia 
    WHERE destinatario_id = $1 AND deleted_at IS NULL
    ON CONFLICT (usuario_id) 
    DO UPDATE SET
      total_resenias = EXCLUDED.total_resenias,
      total_estrellas = EXCLUDED.total_estrellas,
      calificacion_prom = EXCLUDED.calificacion_prom,
      updated_at = NOW();
  `,

  // Obtener reseñas de un usuario
  listarPorUsuario: `
    SELECT 
      r.id, r.calificacion, r.comentario, r.created_at,
      p.full_name as autor_nombre, p.foto as autor_foto
    FROM resenia r
    JOIN perfil_usuario p ON p.usuario_id = r.autor_id
    WHERE r.destinatario_id = $1 AND r.deleted_at IS NULL
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `
};