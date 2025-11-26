export const CreditosSQL = {
  // Listar paquetes disponibles
  listPaquetes: `
    SELECT id, nombre_paq, descripcion, cant_creditos, precio 
    FROM paquetes_creditos 
    WHERE esta_activo = TRUE 
    ORDER BY precio ASC
  `,

  // Listar planes disponibles
  listPlanes: `
    SELECT id, nombre, descripcion, precio, duracion_dias, creditos_incluidos, beneficios 
    FROM planes 
    WHERE esta_activo = TRUE 
    ORDER BY precio ASC
  `,

  // Obtener suscripción actual del usuario
  getSuscripcionActiva: `
    SELECT s.*, p.nombre as nombre_plan 
    FROM suscripcion_user s
    JOIN planes p ON p.id = s.plan_id
    WHERE s.usuario_id = $1 
      AND s.estado = 'activa' 
      AND s.fecha_fin > NOW()
    ORDER BY s.fecha_fin DESC
    LIMIT 1
  `,

  // Crear registro de compra de PAQUETE
  crearCompraPaquete: `
    INSERT INTO compras_creditos (id_transaccion, estado_pago, usuario_id, paquete_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `,

  // Crear registro de compra de PLAN
  crearCompraPlan: `
    INSERT INTO compras_planes (id_transaccion, estado_pago, usuario_id, plan_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `
};