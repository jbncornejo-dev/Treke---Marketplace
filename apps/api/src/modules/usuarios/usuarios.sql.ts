export const SQL = {
  // --- Registro ---
  existeEmail: `SELECT 1 FROM usuario WHERE email = $1 AND deleted_at IS NULL LIMIT 1;`,

  crearUsuario: `
    INSERT INTO usuario (email, password, rol_id, estado, created_at, updated_at)
    VALUES ($1, $2, $3, 'activo', now(), now())
    RETURNING id, email, rol_id, estado, created_at;
  `,

  crearPerfil: `
    INSERT INTO perfil_usuario (full_name, usuario_id)
    VALUES ($1, $2)
    RETURNING id, full_name, foto;
  `,

  crearBilletera: `
    INSERT INTO billetera (usuario_id, saldo_disponible, saldo_retenido)
    VALUES ($1, 0, 0)
    RETURNING id, saldo_disponible, saldo_retenido;
  `,

  // idempotente, no migra nada
  asegurarTipoMovimiento: `
    INSERT INTO tipos_movimiento (codigo, descripcion, es_debito, es_activo)
    SELECT 'BONO_BIENVENIDA', 'Créditos de bienvenida por registro', false, true
    WHERE NOT EXISTS (SELECT 1 FROM tipos_movimiento WHERE codigo='BONO_BIENVENIDA');
  `,

  aplicarBonoBienvenida: `
    WITH b AS (
      SELECT id, saldo_disponible FROM billetera WHERE usuario_id = $1 FOR UPDATE
    ), upd AS (
      UPDATE billetera
      SET saldo_disponible = b.saldo_disponible + 5,
          updated_at = now()
      FROM b
      WHERE billetera.id = b.id
      RETURNING billetera.id AS billetera_id, (b.saldo_disponible) AS saldo_anterior, (b.saldo_disponible + 5) AS saldo_posterior
    )
    INSERT INTO movimientos (monto, saldo_anterior, saldo_posterior, descripcion, referencia_id, tipo_referencia, billetera_user_id, tipo_mov_id)
    SELECT 5, upd.saldo_anterior, upd.saldo_posterior, 'Bono bienvenida', NULL, 'registro', upd.billetera_id,
           (SELECT id FROM tipos_movimiento WHERE codigo='BONO_BIENVENIDA')
    FROM upd;
  `,

  // --- Login mínimo (pruebas) ---
  loginPlano: `SELECT id, email, rol_id, estado FROM usuario WHERE email=$1 AND password=$2 AND deleted_at IS NULL;`,

  // --- Perfil ---
  getPerfilFull: `
    SELECT u.id, u.email, u.rol_id, u.estado, u.created_at,
           p.full_name, p.acerca_de, p.foto, p.telefono, p.fecha_nacimiento,
           COALESCE(b.saldo_disponible,0) AS saldo_disponible,
           COALESCE(b.saldo_retenido,0)   AS saldo_retenido,
           COALESCE(r.calificacion_prom,0) AS calificacion_prom,
           COALESCE(r.total_resenias,0)    AS total_resenias,
           (
             SELECT COUNT(*) FROM intercambios i
             WHERE (i.comprador_id = u.id OR i.vendedor_id = u.id)
               AND i.estado = 'completado'
           ) AS total_intercambios
    FROM usuario u
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    LEFT JOIN billetera b ON b.usuario_id = u.id
    LEFT JOIN reputacion_user r ON r.usuario_id = u.id
    WHERE u.id = $1;
  `,

  updatePerfil: `
    UPDATE perfil_usuario
    SET full_name = COALESCE($2, full_name),
        acerca_de = COALESCE($3, acerca_de),
        telefono = COALESCE($4, telefono),
        fecha_nacimiento = COALESCE($5, fecha_nacimiento),
        updated_at = now()
    WHERE usuario_id = $1
    RETURNING id, full_name, acerca_de, telefono, fecha_nacimiento, foto;
  `,

  updateFoto: `
    UPDATE perfil_usuario SET foto = $2, updated_at = now() WHERE usuario_id = $1
    RETURNING id, foto;
  `,

  updateEmail: `
    UPDATE usuario SET email=$2, updated_at=now(), estado='pendiente_verificacion' WHERE id=$1
    RETURNING id, email, estado;
  `,

  // --- Admin base (sin auditoría) ---
  listarUsuariosBase: `
    SELECT u.id, u.email, u.rol_id, u.estado, u.created_at, p.full_name
    FROM usuario u
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    WHERE u.deleted_at IS NULL
  `,
  cambiarRol: `UPDATE usuario SET rol_id=$2, updated_at=now() WHERE id=$1 RETURNING id, email, rol_id;`,
  suspender:   `UPDATE usuario SET estado='suspendido', updated_at=now() WHERE id=$1 RETURNING id, email, estado;`,
};
