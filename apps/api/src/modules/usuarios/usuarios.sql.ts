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

  activar:    `UPDATE usuario SET estado='activo', updated_at=now() WHERE id=$1 RETURNING id, email, estado;`,
  
  eliminar:    `UPDATE usuario SET deleted_at=now(), updated_at=now() WHERE id=$1 RETURNING id, email, deleted_at;`,

  hardDeleteUsuario: `DELETE FROM usuario WHERE id=$1 RETURNING id;`,

   panelUsuarioBase: `
    SELECT
      u.id, u.email, u.estado, u.rol_id, r.nombre AS rol_nombre,
      u.ultimo_login, u.created_at,
      p.full_name, p.acerca_de, p.foto,
      b.id AS billetera_id, b.saldo_disponible, b.saldo_retenido
    FROM usuario u
    LEFT JOIN rol r            ON r.id = u.rol_id
    LEFT JOIN perfil_usuario p ON p.usuario_id = u.id
    LEFT JOIN billetera b      ON b.usuario_id = u.id
    WHERE u.id = $1
  `,

  // ---- Métricas rápidas
  panelMetricas: `
    SELECT
      (SELECT COUNT(*) FROM publicaciones pub WHERE pub.usuario_id=$1 AND pub.deleted_at IS NULL) AS publicaciones_activas,
      (SELECT COUNT(*) FROM intercambios i WHERE i.comprador_id=$1 OR i.vendedor_id=$1)         AS intercambios_totales,
      (SELECT COALESCE(SUM(creditos_obtenidos),0) FROM compras_creditos cc WHERE cc.usuario_id=$1) AS total_creditos_comprados
  `,

  // ---- Impacto (si existe)
  panelImpacto: `
    SELECT *
    FROM impacto_usuario
    WHERE usuario_id = $1
  `,

  // ---- Publicaciones con foto principal (paginado)
  panelPublicaciones: `
    SELECT
      pub.id, pub.titulo, pub.descripcion, pub.valor_creditos,
      pub.created_at,
      c.nombre  AS categoria,
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
    WHERE pub.usuario_id = $1 AND pub.deleted_at IS NULL
    ORDER BY pub.created_at DESC
    LIMIT $2 OFFSET $3
  `,

  // ---- Movimientos de billetera (paginado)
  panelMovimientos: `
    SELECT
      m.id, m.fecha_movimiento, m.monto, m.saldo_anterior, m.saldo_posterior,
      m.descripcion, m.tipo_referencia, m.referencia_id,
      tm.codigo AS tipo_codigo, tm.descripcion AS tipo_descripcion, tm.es_debito
    FROM movimientos m
    JOIN tipos_movimiento tm ON tm.id = m.tipo_mov_id
    WHERE m.billetera_user_id = $1
    ORDER BY m.fecha_movimiento DESC, m.id DESC
    LIMIT $2 OFFSET $3
  `,
};

