// apps/api/src/modules/creditos/creditos.sql.ts
export const CreditosSQL = {
  paquetesActivos: `
    SELECT id, nombre_paq, descripcion, cant_creditos, precio
    FROM paquetes_creditos
    WHERE esta_activo = true
    ORDER BY precio ASC;
  `,

  paquetePorId: `
    SELECT id, nombre_paq, descripcion, cant_creditos, precio
    FROM paquetes_creditos
    WHERE id = $1 AND esta_activo = true;
  `,

  // crea billetera si no existe
  billeteraPorUsuario: `
    SELECT id, saldo_disponible, saldo_retenido
    FROM billetera
    WHERE usuario_id = $1;
  `,

  crearBilletera: `
    INSERT INTO billetera (usuario_id, saldo_disponible, saldo_retenido)
    VALUES ($1, 0, 0)
    RETURNING id, saldo_disponible, saldo_retenido;
  `,

  // tipos de movimiento
  tipoMovimientoPorCodigo: `
    SELECT id
    FROM tipos_movimiento
    WHERE codigo = $1;
  `,

  crearTipoMovimiento: `
    INSERT INTO tipos_movimiento (codigo, descripcion, es_debito, es_activo)
    VALUES ($1, $2, false, true)
    RETURNING id;
  `,

  crearCompraCreditos: `
  INSERT INTO compras_creditos(
      usuario_id,
      paquete_id,
      id_transaccion,
      estado_pago
  )
  VALUES ($1, $2, $3, $4)
  RETURNING id
`,

  crearMovimiento: `
    INSERT INTO movimientos (
      monto,
      saldo_anterior,
      saldo_posterior,
      descripcion,
      referencia_id,
      tipo_referencia,
      billetera_user_id,
      tipo_mov_id
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8);
  `,

  actualizarSaldoBilletera: `
    UPDATE billetera
    SET saldo_disponible = saldo_disponible + $1,
        updated_at = now()
    WHERE id = $2
    RETURNING saldo_disponible;
  `,
};
