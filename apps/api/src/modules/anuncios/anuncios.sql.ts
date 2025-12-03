// apps/api/src/modules/anuncios/anuncios.sql.ts
export const AnunciosSQL = {
  // Anuncios públicos activos para un footer concreto
  listActivosByUbicacion: `
    SELECT 
      id, titulo, contenido, imagen_url, enlace_destino, ubicacion,
      fecha_ini, fecha_fin, esta_activo, presupuesto, clicks, impresiones
    FROM anuncios
    WHERE esta_activo = TRUE
      AND fecha_ini <= CURRENT_DATE
      AND fecha_fin >= CURRENT_DATE
      AND (ubicacion = $1 OR ubicacion = 'global')
    ORDER BY created_at DESC
  `,

  // Listado admin de todos los anuncios
  adminListAll: `
    SELECT 
      id, titulo, contenido, imagen_url, enlace_destino, ubicacion,
      fecha_ini, fecha_fin, esta_activo, presupuesto, clicks, impresiones,
      anunciante_id, created_at, updated_at
    FROM anuncios
    ORDER BY created_at DESC
  `,

  // Crear un anuncio nuevo
  crearAnuncio: `
    INSERT INTO anuncios (
      titulo, contenido, imagen_url, enlace_destino,
      ubicacion, fecha_ini, fecha_fin,
      esta_activo, presupuesto, anunciante_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING 
      id, titulo, contenido, imagen_url, enlace_destino,
      ubicacion, fecha_ini, fecha_fin, esta_activo,
      presupuesto, clicks, impresiones, anunciante_id,
      created_at, updated_at
  `,

  // Registrar click (opcional, para estadísticas)
  registrarClick: `
    UPDATE anuncios
    SET clicks = clicks + 1,
        updated_at = now()
    WHERE id = $1
    RETURNING id, clicks;
  `,
};
