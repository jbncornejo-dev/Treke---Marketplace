export const MarketSQL = {
  list: `
    WITH base AS (
      SELECT
        pub.id, pub.titulo, pub.descripcion, pub.valor_creditos,
        pub.ubicacion_texto, pub.latitud, pub.longitud,
        pub.created_at, pub.usuario_id, pub.categoria_id, pub.estado_id,
        c.nombre  AS categoria,
        e.nombre  AS estado_nombre,
        p.full_name AS vendedor_nombre,
        ru.calificacion_prom AS vendedor_rating,
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
      LEFT JOIN perfil_usuario p ON p.usuario_id = pub.usuario_id
      LEFT JOIN reputacion_user ru ON ru.usuario_id = pub.usuario_id
      WHERE pub.deleted_at IS NULL
        AND pub.es_visible = TRUE
        AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
        AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
        AND ($2::int  IS NULL OR pub.categoria_id = $2)
        AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
        AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
        AND ($5::int  IS NULL OR pub.estado_id = $5)
    ),
    enriched AS (
      SELECT
        b.*,
        CASE
          WHEN $6::numeric IS NULL OR $7::numeric IS NULL THEN NULL
          ELSE sqrt(
            ((COALESCE(b.latitud,0)  - $6)::numeric * (COALESCE(b.latitud,0)  - $6)::numeric) +
            ((COALESCE(b.longitud,0) - $7)::numeric * (COALESCE(b.longitud,0) - $7)::numeric)
          ) * 111.11
        END AS distancia_km
      FROM base b
    )
    SELECT *
    FROM enriched
    WHERE
      ($8::numeric IS NULL OR distancia_km <= $8)
    ORDER BY
      CASE WHEN $9 = 'near'       THEN distancia_km END ASC NULLS LAST,
      CASE WHEN $9 = 'price_asc'  THEN valor_creditos END ASC NULLS LAST,
      CASE WHEN $9 = 'price_desc' THEN valor_creditos END DESC NULLS LAST,
      CASE WHEN $9 = 'recent'     THEN created_at END DESC NULLS LAST,
      created_at DESC
    LIMIT $10 OFFSET $11
  `,

  listCount: `
    SELECT COUNT(*)::int AS total
    FROM publicaciones pub
    WHERE pub.deleted_at IS NULL
      AND pub.es_visible = TRUE
      AND (pub.fecha_expiracion IS NULL OR pub.fecha_expiracion > NOW())
      AND ($1::text IS NULL OR pub.titulo ILIKE '%'||$1||'%' OR pub.descripcion ILIKE '%'||$1||'%')
      AND ($2::int  IS NULL OR pub.categoria_id = $2)
      AND ($3::int  IS NULL OR pub.valor_creditos >= $3)
      AND ($4::int  IS NULL OR pub.valor_creditos <= $4)
      AND ($5::int  IS NULL OR pub.estado_id = $5)
  `,

  detail: `
    SELECT
      pub.*,
      c.nombre  AS categoria,
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

  // catálogos
  cats: `SELECT id, nombre FROM categoria ORDER BY nombre`,
  estados: `SELECT id, nombre FROM estado_publicacion ORDER BY id`,

    // Factores ecológicos disponibles para marcar en la creación de publicaciones
  factores: `
    SELECT
      id,
      nombre_factor,
      unidad_medida,
      desc_calc
    FROM factores_ecologicos
    ORDER BY id;
  `,

  // Creación de publicación básica
  createPublication: `
    INSERT INTO publicaciones (
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      latitud,
      longitud,
      peso_aprox_kg,
      usuario_id,
      categoria_id,
      estado_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING id;
  `,

  // Inserción de fotos asociadas
  insertFoto: `
    INSERT INTO fotos (publicacion_id, foto_url, orden, es_principal)
    VALUES ($1, $2, $3, $4);
  `,

  // Buscar id de estado por nombre (por ej. "disponible")
  estadoPorNombre: `
    SELECT id
    FROM estado_publicacion
    WHERE nombre = $1
    LIMIT 1;
  `,

};

