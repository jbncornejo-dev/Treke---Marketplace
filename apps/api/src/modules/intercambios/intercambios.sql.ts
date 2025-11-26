// apps/api/src/modules/intercambios/intercambios.sql.ts
export const IntercambiosSQL = {
  // --- LECTURAS ---

  getPublicacionBasic: `
    SELECT id, usuario_id, estado_id, valor_creditos, titulo
    FROM publicaciones
    WHERE id = $1 AND deleted_at IS NULL
  `,

  getPropuestaBasic: `
    SELECT p.*, pub.usuario_id as vendedor_id
    FROM propuesta p
    JOIN publicaciones pub ON pub.id = p.publicacion_id
    WHERE p.id = $1
  `,

  getIntercambioBasic: `
    SELECT i.*, p.demandante_id as comprador_id, i.vendedor_id
    FROM intercambios i
    JOIN propuesta p ON p.id = i.propuesta_aceptada_id
    WHERE i.id = $1
  `,

  // --- ACCIONES (Sin monto_ofertado) ---

  // RF-18: Crear propuesta (Precio fijo según publicación)
  crearPropuesta: `
    INSERT INTO propuesta (
      estado,
      mensaje,
      publicacion_id,
      demandante_id,
      ultimo_actor_id
    )
    VALUES ('pendiente', $1, $2, $3, $3)
    RETURNING *;
  `,

  // RF-19/20: Aceptar Propuesta (Llama a tu SP)
  callAceptarPropuesta: `
    CALL sp_aceptar_propuesta($1::int, $2::int);
  `,

  // RF-21/22: Confirmaciones (Solo flags, el trigger hace el resto)
  confirmarComprador: `
    UPDATE intercambios
    SET confirm_comprador = TRUE, updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  confirmarVendedor: `
    UPDATE intercambios
    SET confirm_vendedor = TRUE, updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  // RF-23: Cancelar
  cancelarIntercambio: `
    UPDATE intercambios
    SET estado = 'cancelado', updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  // Rechazar
  rechazarPropuesta: `
    UPDATE propuesta
    SET estado = 'rechazada', updated_at = now()
    WHERE id = $1
    RETURNING *;
  `,

  // --- LISTADOS (Sin p.monto_ofertado) ---
  listarResumenUsuario: `
    SELECT * FROM (
      SELECT
        p.id,
        'enviada'::text AS tipo,
        p.estado,
        p.created_at,
        pub.titulo,
        -- Ya no existe monto_ofertado, mostramos el valor de la pub
        pub.valor_creditos AS monto_intercambio,
        pub.id AS publicacion_id,
        pub.usuario_id AS contraparte_id,
        (p.estado = 'pendiente' AND (p.ultimo_actor_id IS NULL OR p.ultimo_actor_id <> $1)) AS puede_responder
      FROM propuesta p
      JOIN publicaciones pub ON pub.id = p.publicacion_id
      WHERE p.demandante_id = $1

      UNION ALL

      SELECT
        p.id,
        'recibida'::text AS tipo,
        p.estado,
        p.created_at,
        pub.titulo,
        pub.valor_creditos AS monto_intercambio,
        pub.id AS publicacion_id,
        p.demandante_id AS contraparte_id,
        (p.estado = 'pendiente' AND (p.ultimo_actor_id IS NULL OR p.ultimo_actor_id <> $1)) AS puede_responder
      FROM propuesta p
      JOIN publicaciones pub ON pub.id = p.publicacion_id
      WHERE pub.usuario_id = $1
    ) t
    ORDER BY created_at DESC, id DESC
    LIMIT $2 OFFSET $3;
  `,

  listarIntercambiosUsuario: `
    SELECT
      i.*,
      pub.titulo,
      pub.valor_creditos AS valor_original_pub,
      pub.id AS publicacion_id
    FROM intercambios i
    JOIN propuesta p ON p.id = i.propuesta_aceptada_id
    JOIN publicaciones pub ON pub.id = p.publicacion_id
    WHERE i.comprador_id = $1 OR i.vendedor_id = $1
    ORDER BY i.fecha_de_aceptacion DESC, i.id DESC
    LIMIT $2 OFFSET $3;
  `
};