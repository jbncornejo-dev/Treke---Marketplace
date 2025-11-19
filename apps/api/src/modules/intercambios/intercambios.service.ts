// apps/api/src/modules/intercambios/intercambios.service.ts
import { withTx } from "../../config/database/database";
import { IntercambiosSQL } from "./intercambios.sql";
import type { PoolClient } from "pg";

async function getTipoMovimientoId(client: PoolClient, codigo: string): Promise<number> {
  const r = await client.query("SELECT id FROM tipos_movimiento WHERE codigo = $1", [codigo]);
  if (!r.rowCount) {
    throw new Error(`Tipo de movimiento ${codigo} no está configurado`);
  }
  return Number(r.rows[0].id);
}

// RF-18: iniciar propuesta
export async function iniciarPropuesta(params: {
  publicacionId: number;
  demandanteId: number;
  mensaje?: string;
  monto_ofertado?: number; // 👈 nuevo
}) {
  return withTx(async (client) => {
    const pubQ = await client.query(IntercambiosSQL.getPublicacionParaPropuesta, [params.publicacionId]);
    if (!pubQ.rowCount) throw new Error("Publicación no encontrada");
    const pub = pubQ.rows[0];

    if (pub.vendedor_id === params.demandanteId) {
      throw new Error("No puedes iniciar un intercambio con tu propia publicación");
    }
    if (pub.estado_nombre !== "disponible") {
      throw new Error("La publicación no está disponible para intercambio");
    }

    const mensaje = params.mensaje?.trim() || null;
    const montoOfertado = params.monto_ofertado && params.monto_ofertado > 0
      ? params.monto_ofertado
      : pub.valor_creditos; // por defecto el valor de la publicación

    const propQ = await client.query(IntercambiosSQL.crearPropuesta, [
      mensaje,
      params.publicacionId,
      params.demandanteId,
      montoOfertado,
      params.demandanteId, // primer actor: el demandante
    ]);
    const propuesta = propQ.rows[0];

    // bitácora
    await client.query(IntercambiosSQL.insertarBitacora, [
      "PROPUESTA_CREADA",
      propuesta.estado,
      propuesta.id,
      null,
      params.demandanteId,
      pub.vendedor_id,
      params.publicacionId,
      montoOfertado,
      "Propuesta creada por el comprador",
      null,
    ]);

    return propuesta;
  });
}

// RF-19, RF-20: aceptar propuesta + retención de créditos

export async function aceptarPropuesta(params: { propuestaId: number; actorId: number }) {
  const { propuestaId, actorId } = params;   // 👈 desestructuramos

  return withTx(async (client) => {
    // AQUÍ ya pasas el integer correcto en $1
    const pQ = await client.query(IntercambiosSQL.getPropuestaParaAceptar, [
      propuestaId,      // 👈 NO mandes params completo
    ]);

    if (!pQ.rowCount) throw new Error("Propuesta no encontrada");
    const row = pQ.rows[0];


    const compradorId  = row.demandante_id;
    const vendedorId   = row.vendedor_id;
    const billeteraId  = row.billetera_id;
    const saldoDisp    = Number(row.saldo_disponible);
    const saldoRet     = Number(row.saldo_retenido);
    const monto        = Number(row.monto_ofertado || row.valor_creditos);

    if (actorId !== vendedorId) {
      throw new Error("Solo el dueño de la publicación puede aceptar la propuesta");
    }

    // 2) Verificar saldo suficiente (RF-19)
    if (saldoDisp < monto) {
      throw new Error("El comprador no tiene créditos suficientes para este intercambio");
    }

    // 3) Debitar saldo_disponible y mover a saldo_retenido
    const nuevoDisp = saldoDisp - monto;
    const nuevoRet  = saldoRet + monto;

    await client.query(IntercambiosSQL.actualizarBilletera, [
      billeteraId,
      nuevoDisp,
      nuevoRet,
    ]);

    // 4) Crear intercambio
    const iQ = await client.query(IntercambiosSQL.crearIntercambio, [
      monto,
      propuestaId,
      compradorId,
      vendedorId,
    ]);
    const intercambio = iQ.rows[0];

    // 5) Crear registro de retención
    await client.query(IntercambiosSQL.crearRetencion, [
      monto,
      billeteraId,
      intercambio.id,
    ]);

    // 6) Marcar propuesta como aceptada
    await client.query(IntercambiosSQL.marcarPropuestaAceptada, [propuestaId]);

    // 7) Movimiento de RETENCIÓN_INTERCAMBIO
    const tipoRetQ = await client.query(IntercambiosSQL.getTipoMovByCodigo, [
      "RETENCION_INTERCAMBIO",
    ]);
    if (!tipoRetQ.rowCount) {
      throw new Error("Tipo de movimiento RETENCION_INTERCAMBIO no está configurado");
    }
    const tipoRetId = tipoRetQ.rows[0].id;

    await client.query(IntercambiosSQL.insertarMovimiento, [
      monto,
      saldoDisp,
      nuevoDisp,
      "Retención de créditos por intercambio",
      intercambio.id,
      "RETENCION_INTERCAMBIO",
      billeteraId,
      tipoRetId,
    ]);

    // 8) Bitácora
    await client.query(IntercambiosSQL.insertarBitacora, [
      "PROPUESTA_ACEPTADA",
      "activo",
      propuestaId,
      intercambio.id,
      compradorId,
      vendedorId,
      row.publicacion_id,
      monto,
      "Se aceptó la propuesta y se retuvieron créditos del comprador",
      JSON.stringify({ actorId }),
    ]);

    return intercambio;
  });
}
// RF-21, RF-22: confirmación de ambas partes y liberación

interface ConfirmarIntercambioParams {
  intercambioId: number;
  actorId: number;
}

export async function confirmarIntercambio({
  intercambioId,
  actorId,
}: ConfirmarIntercambioParams) {
  return withTx(async (client) => {
    const q = await client.query(
      `
      SELECT
        i.*,
        p.publicacion_id,
        p.demandante_id AS comprador_id,
        pub.usuario_id  AS vendedor_id,
        rc.id           AS retencion_id,
        rc.monto_reservado,
        rc.billetera_demandante,
        bc.saldo_disponible AS saldo_disp_comp,
        bc.saldo_retenido   AS saldo_ret_comp,
        bv.id               AS billetera_vend_id,
        bv.saldo_disponible AS saldo_disp_vend
      FROM intercambios i
      JOIN propuesta p            ON p.id = i.propuesta_aceptada_id
      JOIN publicaciones pub      ON pub.id = p.publicacion_id
      JOIN retencion_creditos rc  ON rc.intercambio_id = i.id
      JOIN billetera bc           ON bc.id = rc.billetera_demandante
      JOIN billetera bv           ON bv.usuario_id = i.vendedor_id
      WHERE i.id = $1
      FOR UPDATE;
    `,
      [intercambioId] // 👈 aquí ya es un number, no el objeto
    );

    if (!q.rowCount) throw new Error("Intercambio no encontrado");
    const row = q.rows[0];

    if (row.estado !== "activo") {
      throw new Error("El intercambio ya no está activo");
    }

    const compradorId = row.comprador_id as number;
    const vendedorId  = row.vendedor_id as number;

    let confirmComprador = row.confirm_comprador as boolean;
    let confirmVendedor  = row.confirm_vendedor as boolean;

    if (actorId === compradorId) confirmComprador = true;
    else if (actorId === vendedorId) confirmVendedor = true;
    else throw new Error("Solo las partes del intercambio pueden confirmar");

    // Actualizar flags
    await client.query(
      `
      UPDATE intercambios
      SET confirm_comprador = $2,
          confirm_vendedor  = $3,
          updated_at        = now()
      WHERE id = $1
    `,
      [intercambioId, confirmComprador, confirmVendedor]
    );

    // Después de UPDATE intercambios ... completado
await client.query(
  `
  UPDATE publicaciones
  SET estado_id = (
        SELECT id FROM estado_publicacion
        WHERE nombre = 'intercambiado'
        LIMIT 1
      ),
      es_visible = FALSE,
      updated_at = now()
  WHERE id = $1
  `,
  [row.publicacion_id]
);


    // Bitácora de confirmación
    await client.query(IntercambiosSQL.insertarBitacora, [
      actorId === compradorId ? "CONFIRMACION_COMPRADOR" : "CONFIRMACION_VENDEDOR",
      row.estado,
      row.propuesta_aceptada_id,
      intercambioId,
      compradorId,
      vendedorId,
      row.publicacion_id,
      row.monto_credito,
      null,
      JSON.stringify({ actorId }),
    ]);

    // Si aún falta la otra parte, no liberamos créditos
    if (!confirmComprador || !confirmVendedor) {
      return { status: "pendiente" };
    }

    // === Ambos confirmaron: liberar retención ===
    const monto         = Number(row.monto_reservado);
    const rcId          = row.retencion_id as number;
    const saldoDispComp = Number(row.saldo_disp_comp);
    const saldoRetComp  = Number(row.saldo_ret_comp);
    const saldoDispVend = Number(row.saldo_disp_vend);

    // 1) Billetera comprador: baja retenido
    await client.query(
      `
      UPDATE billetera
      SET saldo_retenido = $2,
          updated_at     = now()
      WHERE id = $1
    `,
      [row.billetera_demandante, saldoRetComp - monto]
    );

    // 2) Billetera vendedor: sube disponible
    await client.query(
      `
      UPDATE billetera
      SET saldo_disponible = $2,
          updated_at       = now()
      WHERE id = $1
    `,
      [row.billetera_vend_id, saldoDispVend + monto]
    );

    // 3) Actualizar retención
    await client.query(
      `
      UPDATE retencion_creditos
      SET estado          = 'aplicada',
          fecha_liberacion = now(),
          updated_at       = now()
      WHERE id = $1
    `,
      [rcId]
    );

    // 4) Cambiar estado del intercambio
    await client.query(
      `
      UPDATE intercambios
      SET estado           = 'completado',
          fecha_completado = now()
      WHERE id = $1
    `,
      [intercambioId]
    );

    // 5) Movimiento para vendedor: INTERCAMBIO (crédito)
    const tipoInterQ = await client.query(IntercambiosSQL.getTipoMovByCodigo, [
      "INTERCAMBIO",
    ]);
    const tipoInterId = tipoInterQ.rows[0].id as number;

    await client.query(IntercambiosSQL.insertarMovimiento, [
      monto,
      saldoDispVend,
      saldoDispVend + monto,
      "Créditos recibidos por intercambio completado",
      intercambioId,
      "INTERCAMBIO",
      row.billetera_vend_id,
      tipoInterId,
    ]);

    // 6) Movimiento para comprador: LIBERACION_RETENCION_INTERCAMBIO (solo histórico)
    const tipoLibQ = await client.query(IntercambiosSQL.getTipoMovByCodigo, [
      "LIBERACION_RETENCION_INTERCAMBIO",
    ]);
    const tipoLibId = tipoLibQ.rows[0].id as number;

    await client.query(IntercambiosSQL.insertarMovimiento, [
      monto,
      saldoDispComp, // saldo disponible no cambia
      saldoDispComp,
      "Se aplicó la retención de créditos a favor del vendedor",
      intercambioId,
      "LIBERACION_RETENCION_INTERCAMBIO",
      row.billetera_demandante,
      tipoLibId,
    ]);

    // 7) Bitácora final
    await client.query(IntercambiosSQL.insertarBitacora, [
      "INTERCAMBIO_COMPLETADO",
      "completado",
      row.propuesta_aceptada_id,
      intercambioId,
      compradorId,
      vendedorId,
      row.publicacion_id,
      monto,
      "Ambas partes confirmaron, créditos liberados al vendedor",
      null,
    ]);

    return { status: "completado" };
  });
}


// RF-23: cancelación / disputa → devolver créditos
interface CancelarIntercambioParams {
  intercambioId: number;
  actorId: number;
  motivo?: string | null;
}

export async function cancelarIntercambio({
  intercambioId,
  actorId,
  motivo,
}: CancelarIntercambioParams) {
  return withTx(async (client) => {
    const q = await client.query(
      `
      SELECT
        i.*,
        p.publicacion_id,
        p.demandante_id AS comprador_id,
        pub.usuario_id  AS vendedor_id,
        rc.id           AS retencion_id,
        rc.monto_reservado,
        rc.billetera_demandante,
        b.saldo_disponible,
        b.saldo_retenido
      FROM intercambios i
      JOIN propuesta p            ON p.id = i.propuesta_aceptada_id
      JOIN publicaciones pub      ON pub.id = p.publicacion_id
      JOIN retencion_creditos rc  ON rc.intercambio_id = i.id
      JOIN billetera b            ON b.id = rc.billetera_demandante
      WHERE i.id = $1
      FOR UPDATE;
    `,
      [intercambioId]
    );

    if (!q.rowCount) throw new Error("Intercambio no encontrado");
    const row = q.rows[0];

    if (row.estado !== "activo") {
      throw new Error("El intercambio ya no está activo");
    }

    const compradorId = row.comprador_id as number;
    const vendedorId  = row.vendedor_id as number;

    // Solo comprador, vendedor o admin (si luego añades rol admin)
    if (actorId !== compradorId && actorId !== vendedorId) {
      throw new Error("No tienes permisos para cancelar este intercambio");
    }

    const monto     = Number(row.monto_reservado);
    const saldoDisp = Number(row.saldo_disponible);
    const saldoRet  = Number(row.saldo_retenido);

    // 1) Devolver créditos al comprador (retenido -> disponible)
    await client.query(
      `
      UPDATE billetera
      SET saldo_disponible = $2,
          saldo_retenido   = $3,
          updated_at       = now()
      WHERE id = $1
    `,
      [row.billetera_demandante, saldoDisp + monto, saldoRet - monto]
    );

    // 2) Actualizar retención
    await client.query(
      `
      UPDATE retencion_creditos
      SET estado          = 'liberada',
          fecha_liberacion = now(),
          updated_at       = now()
      WHERE id = $1
    `,
      [row.retencion_id]
    );

    // 3) Cambiar estado del intercambio
    await client.query(
      `
      UPDATE intercambios
      SET estado           = 'cancelado',
          fecha_completado = now()
      WHERE id = $1
    `,
      [intercambioId]
    );

    // 4) Movimiento de DEVOLUCION_RETENCION_INTERCAMBIO
    const tipoDevQ = await client.query(IntercambiosSQL.getTipoMovByCodigo, [
      "DEVOLUCION_RETENCION_INTERCAMBIO",
    ]);
    const tipoDevId = tipoDevQ.rows[0].id as number;

    await client.query(IntercambiosSQL.insertarMovimiento, [
      monto,
      saldoDisp,
      saldoDisp + monto,
      "Devolución de créditos retenidos por cancelación de intercambio",
      intercambioId,
      "DEVOLUCION_RETENCION_INTERCAMBIO",
      row.billetera_demandante,
      tipoDevId,
    ]);

    // 5) Bitácora
    await client.query(IntercambiosSQL.insertarBitacora, [
      "INTERCAMBIO_CANCELADO",
      "cancelado",
      row.propuesta_aceptada_id,
      intercambioId,
      compradorId,
      vendedorId,
      row.publicacion_id,
      monto,
      motivo || "Intercambio cancelado",
      JSON.stringify({ actorId }),
    ]);
  });
}



// RF-24: resumen para la página de perfil
export async function resumenUsuario(usuarioId: number, opts?: { page?: number; pageSize?: number }) {
  const page     = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const offset   = (page - 1) * pageSize;

  return withTx(async (client) => {
    const [propuestasQ, intercambiosQ] = await Promise.all([
      client.query(IntercambiosSQL.listarResumenUsuario,    [usuarioId, pageSize, offset]),
      client.query(IntercambiosSQL.listarIntercambiosUsuario, [usuarioId, pageSize, offset]),
    ]);

    return {
      propuestas:  propuestasQ.rows,
      intercambios: intercambiosQ.rows,
      page: { page, pageSize },
    };
  });
}


export async function rechazarPropuesta(params: { propuestaId: number; actorId: number; motivo?: string }) {
  return withTx(async (client) => {
    const propQ = await client.query(IntercambiosSQL.getPropuestaParaAccion, [params.propuestaId]);
    if (!propQ.rowCount) throw new Error("Propuesta no encontrada");
    const p = propQ.rows[0];

    const vendedorId = p.vendedor_id;

    if (p.estado !== "pendiente") {
      throw new Error("La propuesta ya fue procesada");
    }
    if (params.actorId !== p.demandante_id && params.actorId !== vendedorId) {
      throw new Error("No estás involucrado en esta propuesta");
    }
    if (p.ultimo_actor_id === params.actorId) {
      throw new Error("No puedes rechazar tu propia última oferta");
    }

    const updQ = await client.query(IntercambiosSQL.rechazarPropuesta, [p.id]);
    const propuesta = updQ.rows[0];

    await client.query(IntercambiosSQL.insertarBitacora, [
      "PROPUESTA_RECHAZADA",
      propuesta.estado,
      propuesta.id,
      null,
      p.demandante_id,
      vendedorId,
      p.publicacion_id,
      propuesta.monto_ofertado,
      params.motivo || `Propuesta rechazada por usuario ${params.actorId}`,
      null,
    ]);

    return propuesta;
  });
}

export async function contraofertarPropuesta(params: {
  propuestaId: number;
  actorId: number;
  monto_ofertado: number;
  mensaje?: string;
}) {
  return withTx(async (client) => {
    const propQ = await client.query(IntercambiosSQL.getPropuestaParaAccion, [params.propuestaId]);
    if (!propQ.rowCount) throw new Error("Propuesta no encontrada");
    const p = propQ.rows[0];
    const vendedorId = p.vendedor_id;

    if (p.estado !== "pendiente") {
      throw new Error("La propuesta no está pendiente");
    }
    if (params.actorId !== p.demandante_id && params.actorId !== vendedorId) {
      throw new Error("No estás involucrado en esta propuesta");
    }
    if (p.ultimo_actor_id === params.actorId) {
      throw new Error("No puedes contraofertar sobre tu propia última oferta");
    }
    if (!params.monto_ofertado || params.monto_ofertado <= 0) {
      throw new Error("Monto de contraoferta inválido");
    }

    const mensaje = params.mensaje?.trim() || p.mensaje;

    const updQ = await client.query(IntercambiosSQL.actualizarContraoferta, [
      p.id,
      params.monto_ofertado,
      mensaje,
      params.actorId,
    ]);
    const propuesta = updQ.rows[0];

    // mensaje de chat opcional
    if (params.mensaje && params.mensaje.trim()) {
      await client.query(IntercambiosSQL.crearMensajePropuesta, [
        params.mensaje,
        p.id,
        params.actorId,
        params.actorId === p.demandante_id ? vendedorId : p.demandante_id,
      ]);
    }

    await client.query(IntercambiosSQL.insertarBitacora, [
      "PROPUESTA_CONTRAOFERTA",
      propuesta.estado,
      propuesta.id,
      null,
      p.demandante_id,
      vendedorId,
      p.publicacion_id,
      propuesta.monto_ofertado,
      `Contraoferta a ${propuesta.monto_ofertado} créditos`,
      null,
    ]);

    return propuesta;
  });
}
