// apps/api/src/modules/intercambios/intercambios.service.ts
import { withTx } from "../../config/database/database";
import { IntercambiosSQL } from "./intercambios.sql";

// RF-18: Iniciar propuesta (Sin precio, es fijo)
export async function iniciarPropuesta(params: {
  publicacionId: number;
  demandanteId: number;
  mensaje?: string;
}) {
  return withTx(async (client) => {
    // 1. Validaciones
    const pubQ = await client.query(IntercambiosSQL.getPublicacionBasic, [params.publicacionId]);
    if (!pubQ.rowCount) throw new Error("Publicación no encontrada");
    const pub = pubQ.rows[0];

    if (pub.usuario_id === params.demandanteId) throw new Error("No puedes ofertar en tu propia publicación");
    
    // 2. Insertar (Solo mensaje)
    const res = await client.query(IntercambiosSQL.crearPropuesta, [
      params.mensaje,
      params.publicacionId,
      params.demandanteId
    ]);
    
    return res.rows[0];
  });
}

// RF-19/20: Aceptar (Llama a SP)
export async function aceptarPropuesta(params: { propuestaId: number; actorId: number }) {
  return withTx(async (client) => {
    const pQ = await client.query(IntercambiosSQL.getPropuestaBasic, [params.propuestaId]);
    if (!pQ.rowCount) throw new Error("Propuesta no encontrada");
    const prop = pQ.rows[0];

    if (prop.vendedor_id !== params.actorId) {
      throw new Error("Solo el vendedor puede aceptar la propuesta");
    }

    // El SP en la BD se encarga de leer el precio de la publicación y crear el intercambio
    await client.query(IntercambiosSQL.callAceptarPropuesta, [params.propuestaId, params.actorId]);

    return { ok: true, message: "Propuesta aceptada" };
  });
}

// RF-21/22: Confirmar
export async function confirmarIntercambio(params: { intercambioId: number; actorId: number }) {
  return withTx(async (client) => {
    const iQ = await client.query(IntercambiosSQL.getIntercambioBasic, [params.intercambioId]);
    if (!iQ.rowCount) throw new Error("Intercambio no encontrado");
    const inter = iQ.rows[0];

    let result;
    if (params.actorId === inter.comprador_id) {
      result = await client.query(IntercambiosSQL.confirmarComprador, [params.intercambioId]);
    } else if (params.actorId === inter.vendedor_id) {
      result = await client.query(IntercambiosSQL.confirmarVendedor, [params.intercambioId]);
    } else {
      throw new Error("No eres parte de este intercambio");
    }

    return result.rows[0];
  });
}

// RF-23: Cancelar
export async function cancelarIntercambio(params: { intercambioId: number; actorId: number; motivo?: string }) {
  return withTx(async (client) => {
    const iQ = await client.query(IntercambiosSQL.getIntercambioBasic, [params.intercambioId]);
    if (!iQ.rowCount) throw new Error("Intercambio no encontrado");
    const inter = iQ.rows[0];

    if (params.actorId !== inter.comprador_id && params.actorId !== inter.vendedor_id) {
      throw new Error("No autorizado");
    }

    // El trigger en la BD debe manejar la devolución de créditos si el estado cambia a 'cancelado'
    const res = await client.query(IntercambiosSQL.cancelarIntercambio, [params.intercambioId]);
    
    return res.rows[0];
  });
}

export async function resumenUsuario(usuarioId: number, opts?: { page?: number; pageSize?: number }) {
  const page = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  return withTx(async (client) => {
    const [prop, inter] = await Promise.all([
      client.query(IntercambiosSQL.listarResumenUsuario, [usuarioId, pageSize, offset]),
      client.query(IntercambiosSQL.listarIntercambiosUsuario, [usuarioId, pageSize, offset]),
    ]);
    return { propuestas: prop.rows, intercambios: inter.rows, page: { page, pageSize } };
  });
}

export async function rechazarPropuesta(params: { propuestaId: number; actorId: number; motivo?: string }) {
  return withTx(async (client) => {
    const pQ = await client.query(IntercambiosSQL.getPropuestaBasic, [params.propuestaId]);
    if (!pQ.rowCount) throw new Error("No existe");
    const p = pQ.rows[0];

    if (params.actorId !== p.demandante_id && params.actorId !== p.vendedor_id) {
      throw new Error("No autorizado");
    }

    const res = await client.query(IntercambiosSQL.rechazarPropuesta, [params.propuestaId]);
    return res.rows[0];
  });
}

// --- SERVICIOS DE MENSAJERÍA ---

export async function listarMensajes(propuestaId: number, userId: number) {
  return withTx(async (client) => {
    // Validar acceso (opcional pero recomendado)
    const partQ = await client.query(IntercambiosSQL.getParticipantesPropuesta, [propuestaId]);
    if (!partQ.rowCount) throw new Error("Propuesta no encontrada");
    const { demandante_id, vendedor_id } = partQ.rows[0];

    if (userId !== demandante_id && userId !== vendedor_id) {
        throw new Error("No tienes permiso para ver estos mensajes");
    }

    const res = await client.query(IntercambiosSQL.listarMensajes, [propuestaId]);
    return res.rows;
  });
}

export async function enviarMensaje(propuestaId: number, remitenteId: number, contenido: string) {
  return withTx(async (client) => {
    // 1. Identificar destinatario
    const partQ = await client.query(IntercambiosSQL.getParticipantesPropuesta, [propuestaId]);
    if (!partQ.rowCount) throw new Error("Propuesta no encontrada");
    const { demandante_id, vendedor_id } = partQ.rows[0];

    let destinatarioId: number;
    if (remitenteId === demandante_id) destinatarioId = vendedor_id;
    else if (remitenteId === vendedor_id) destinatarioId = demandante_id;
    else throw new Error("No participas en esta propuesta");

    // 2. Insertar
    const res = await client.query(IntercambiosSQL.crearMensaje, [
      propuestaId, remitenteId, destinatarioId, contenido
    ]);
    return res.rows[0];
  });
}