// apps/api/src/modules/profile-public/profilePublic.sql.ts
export const ProfilePublicSQL = {
  // PERFIL PÚBLICO BÁSICO
  publicProfile: `
    SELECT
      u.id AS usuario_id,
      u.email,
      p.full_name,
      p.acerca_de,
      p.foto,
      p.created_at AS perfil_created_at,
      ru.calificacion_prom,
      ru.total_resenias,
      ru.total_estrellas,
      -- Conteo rápido de publicaciones activas
      (
        SELECT COUNT(*)
        FROM publicaciones pub
        JOIN estado_publicacion e ON e.id = pub.estado_id
        WHERE pub.usuario_id = u.id
          AND pub.deleted_at IS NULL
          AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
          AND e.nombre = 'disponible'
      ) AS total_publicaciones
    FROM usuario u
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    LEFT JOIN reputacion_user ru ON ru.usuario_id = u.id
    WHERE u.id = $1
  `,

  // PUBLICACIONES PÚBLICAS DEL USUARIO (para el perfil)
  publicPublications: `
    SELECT
      pub.id,
      pub.titulo,
      pub.descripcion,
      pub.valor_creditos,
      pub.ubicacion_texto,
      pub.peso_aprox_kg,
      pub.created_at,
      c.nombre  AS categoria,
      c.color   AS categoria_color,
      c.icono   AS categoria_icono,
      e.nombre  AS estado_nombre,
      (
        SELECT f.foto_url
        FROM fotos f
        WHERE f.publicacion_id = pub.id
        ORDER BY f.es_principal DESC, f.orden ASC, f.id ASC
        LIMIT 1
      ) AS foto_principal
    FROM publicaciones pub
    JOIN categoria c          ON c.id = pub.categoria_id
    JOIN estado_publicacion e ON e.id = pub.estado_id
    WHERE pub.usuario_id = $1
      AND pub.deleted_at IS NULL
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND e.nombre = 'disponible'
    ORDER BY pub.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  publicPublicationsCount: `
    SELECT COUNT(*)::int AS total
    FROM publicaciones pub
    JOIN estado_publicacion e ON e.id = pub.estado_id
    WHERE pub.usuario_id = $1
      AND pub.deleted_at IS NULL
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND e.nombre = 'disponible'
  `,

  // TODAS LAS RESEÑAS VISIBLES DEL USUARIO (perfil)
  userReviews: `
    SELECT 
      r.id, 
      r.calificacion, 
      r.comentario, 
      r.created_at,
      r.autor_id,
      pa.full_name AS autor_nombre,
      pa.foto      AS autor_foto
    FROM resenia r
    JOIN perfil_usuario pa ON pa.usuario_id = r.autor_id
    WHERE r.destinatario_id = $1
      AND r.deleted_at IS NULL
      AND r.es_visible = true
    ORDER BY r.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  userReviewsCount: `
    SELECT COUNT(*)::int AS total
    FROM resenia r
    WHERE r.destinatario_id = $1
      AND r.deleted_at IS NULL
      AND r.es_visible = true
  `,

  // RESEÑA ESPECÍFICA DEL "VIEWER" HACIA ESTE USUARIO
  viewerReview: `
    SELECT 
      r.id, 
      r.calificacion, 
      r.comentario, 
      r.created_at
    FROM resenia r
    WHERE r.destinatario_id = $1
      AND r.autor_id = $2
      AND r.deleted_at IS NULL
      AND r.es_visible = true
    LIMIT 1
  `,

  // CHECK: ¿EXISTE INTERCAMBIO COMPLETADO ENTRE AUTOR Y DESTINATARIO?
  checkCompletedTrade: `
    SELECT 1
    FROM intercambios i
    WHERE i.estado = 'completado'
      AND (
        (i.comprador_id = $1 AND i.vendedor_id = $2)
        OR
        (i.comprador_id = $2 AND i.vendedor_id = $1)
      )
    LIMIT 1
  `,

  // UPSERT DE RESEÑA (autor -> destinatario)
  upsertReview: `
    INSERT INTO resenia (calificacion, comentario, autor_id, destinatario_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (autor_id, destinatario_id)
    DO UPDATE SET 
      calificacion = EXCLUDED.calificacion,
      comentario   = EXCLUDED.comentario,
      es_visible   = true,
      deleted_at   = NULL,
      updated_at   = now()
    RETURNING id, calificacion, comentario, created_at, autor_id, destinatario_id;
  `
};
