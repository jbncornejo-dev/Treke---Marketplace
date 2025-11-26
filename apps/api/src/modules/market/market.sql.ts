export const MarketSQL = {
  // 1. LISTADO (Sin geolocalización ni es_visible)
  // Se eliminó la lógica de distancia y los filtros de lat/long ($6, $7, $8 en la versión anterior)
  // Revisa los índices de los parámetros ($) en tu backend al llamar a esta query.
  list: `
    SELECT
      pub.id, pub.titulo, pub.descripcion, pub.valor_creditos,
      pub.ubicacion_texto,
      pub.peso_aprox_kg,
      pub.created_at, pub.usuario_id, pub.categoria_id, pub.estado_id,
      c.nombre  AS categoria,
      c.color   AS categoria_color,
      c.icono   AS categoria_icono,
      e.nombre  AS estado_nombre,
      p.full_name AS vendedor_nombre,
      ru.calificacion_prom AS vendedor_rating,
      (
        SELECT f.foto_url
        FROM fotos f
        WHERE f.publicacion_id = pub.id
        ORDER BY f.es_principal DESC, f.orden ASC, f.id ASC
        LIMIT 1
      ) AS foto_principal,
      -- 👇 NUEVA COLUMNA: Comprueba si existe en la tabla de favoritos para el usuario $9
      CASE 
        WHEN $9::int IS NOT NULL AND EXISTS (
          SELECT 1 FROM lista_favoritos lf 
          WHERE lf.publicacion_id = pub.id AND lf.usuario_id = $9
        ) THEN true 
        ELSE false 
      END AS is_fav

    FROM publicaciones pub
    JOIN categoria c          ON c.id = pub.categoria_id
    JOIN estado_publicacion e ON e.id = pub.estado_id
    LEFT JOIN perfil_usuario p ON p.usuario_id = pub.usuario_id
    LEFT JOIN reputacion_user ru ON ru.usuario_id = pub.usuario_id
    WHERE pub.deleted_at IS NULL
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND e.nombre = 'disponible'   
      AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
      AND ($2::int  IS NULL OR pub.categoria_id = $2)
      AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
      AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
      AND ($5::int  IS NULL OR pub.estado_id = $5)
    ORDER BY
      CASE WHEN $6 = 'price_asc'  THEN valor_creditos END ASC NULLS LAST,
      CASE WHEN $6 = 'price_desc' THEN valor_creditos END DESC NULLS LAST,
      CASE WHEN $6 = 'recent'     THEN pub.created_at END DESC NULLS LAST,
      pub.created_at DESC
    LIMIT $7 OFFSET $8
  `,

  // 2. CONTEO (Ajustado sin es_visible)
  listCount: `
    SELECT COUNT(*)::int AS total
    FROM publicaciones pub
    JOIN estado_publicacion e ON e.id = pub.estado_id
    WHERE pub.deleted_at IS NULL
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND e.nombre = 'disponible'
      AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
      AND ($2::int  IS NULL OR pub.categoria_id = $2)
      AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
      AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
      AND ($5::int  IS NULL OR pub.estado_id = $5)
  `,

  // 3. DETALLE (Agregamos peso_aprox_kg y datos extra de categoría)
  detail: `
    SELECT
      pub.*,
      c.nombre  AS categoria,
      c.icono   AS categoria_icono,
      c.color   AS categoria_color,
      e.nombre  AS estado_nombre,
      u.email   AS vendedor_email,
      p.full_name AS vendedor_nombre,
      ru.calificacion_prom AS vendedor_rating
    FROM publicaciones pub
    JOIN categoria c          ON c.id = pub.categoria_id
    JOIN estado_publicacion e ON e.id = pub.estado_id
    JOIN usuario u            ON u.id = pub.usuario_id
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    LEFT JOIN reputacion_user ru ON ru.usuario_id = u.id
    WHERE pub.id = $1 AND pub.deleted_at IS NULL
  `,

  detailFotos: `
    SELECT id, foto_url, orden, es_principal
    FROM fotos
    WHERE publicacion_id = $1
    ORDER BY es_principal DESC, orden ASC, id ASC
  `,

  detailPropuestasCount: `
    SELECT COUNT(*)::int AS total_propuestas
    FROM propuesta
    WHERE publicacion_id = $1
  `,

  // Favoritos (Sin cambios en lógica, pero revisa si la tabla lista_favoritos existe, asumo que sí)
  favAdd: `
    INSERT INTO lista_favoritos (usuario_id, publicacion_id)
    VALUES ($1, $2)
    ON CONFLICT (usuario_id, publicacion_id) DO NOTHING
    RETURNING id
  `,
  favRemove: `
    DELETE FROM lista_favoritos
    WHERE usuario_id = $1 AND publicacion_id = $2
    RETURNING id
  `,
  favCheck: `
    SELECT 1 FROM lista_favoritos WHERE usuario_id = $1 AND publicacion_id = $2
  `,

  // 4. CATÁLOGOS (Actualizado con icono y color)
  cats: `
    SELECT id, nombre, icono, color, categoria_padre_id 
    FROM categoria 
    ORDER BY nombre
  `,
  
  // 5. ESTADOS (Filtrado por es_activo)
  estados: `
    SELECT id, nombre 
    FROM estado_publicacion 
    WHERE es_activo = true
    ORDER BY id
  `,

  // 6. CREACIÓN (Eliminadas latitud/longitud, reordenados los índices)
  createPublication: `
    INSERT INTO publicaciones (
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      peso_aprox_kg,
      usuario_id,
      categoria_id,
      estado_id
    )
    VALUES (
      $1,            -- titulo
      $2,            -- descripcion
      $3,            -- valor_creditos
      $4,            -- ubicacion_texto
      $5,            -- peso_aprox_kg (Movido aquí, antes era latitud)
      $6::integer,   -- usuario_id
      $7::integer,   -- categoria_id
      $8::integer    -- estado_id
    )
    RETURNING id;
  `,

  insertFoto: `
    INSERT INTO fotos (publicacion_id, foto_url, orden, es_principal)
    VALUES ($1, $2, $3, $4);
  `,

  estadoPorNombre: `
    SELECT id
    FROM estado_publicacion
    WHERE nombre = $1
    LIMIT 1;
  `,

  getSellerReviews: `
    SELECT 
      r.id, 
      r.calificacion, 
      r.comentario, 
      r.created_at,
      p.full_name as autor_nombre,
      p.foto as autor_foto
    FROM resenia r
    JOIN perfil_usuario p ON p.usuario_id = r.autor_id
    WHERE r.destinatario_id = $1 
      AND r.deleted_at IS NULL 
      AND r.es_visible = true
    ORDER BY r.created_at DESC
    LIMIT 5
  `
};