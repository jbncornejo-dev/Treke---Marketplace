// apps/api/src/modules/creditos/creditos.service.ts
import { withTx } from "../../config/database/database";
import { CreditosSQL } from "./creditos.sql";

export async function listarPaquetesActivos() {
  return withTx(async (client) => {
    const r = await client.query(CreditosSQL.paquetesActivos);
    return r.rows;
  });
}

export async function obtenerBilletera(usuarioId: number) {
  return withTx(async (client) => {
    if (!usuarioId) {
      throw new Error("usuarioId requerido");
    }

    const r = await client.query(CreditosSQL.billeteraPorUsuario, [usuarioId]);
    if (!r.rows[0]) {
      // si no tiene billetera, la creamos con saldo 0
      const nb = await client.query(CreditosSQL.crearBilletera, [usuarioId]);
      return nb.rows[0];
    }
    return r.rows[0];
  });
}

export async function comprarPaquete(usuarioId: number, paqueteId: number) {
  return withTx(async (client) => {
    if (!usuarioId) throw new Error("usuarioId requerido");
    if (!paqueteId) throw new Error("paqueteId requerido");

    // 1) obtener paquete
    const p = await client.query(CreditosSQL.paquetePorId, [paqueteId]);
    if (!p.rows[0]) throw new Error("Paquete no encontrado o inactivo");
    const paquete = p.rows[0] as {
      id: number;
      nombre_paq: string;
      cant_creditos: number;
      precio: string;
    };

    const precioNum = Number(paquete.precio);
    const creditos = Number((paquete as any).cant_credits ?? paquete.cant_creditos);

    // 2) asegurar billetera
    let billeteraId: number;
    let saldoAnterior = 0;

    const b = await client.query(CreditosSQL.billeteraPorUsuario, [usuarioId]);
    if (!b.rows[0]) {
      const nb = await client.query(CreditosSQL.crearBilletera, [usuarioId]);
      billeteraId = nb.rows[0].id;
      saldoAnterior = 0;
    } else {
      billeteraId = b.rows[0].id;
      saldoAnterior = Number(b.rows[0].saldo_disponible);
    }

    // 3) tipo de movimiento COMPRA_PAQUETE
    const codigoMov = "COMPRA_PAQUETE";
    let tipoMovId: number;
    const tm = await client.query(CreditosSQL.tipoMovimientoPorCodigo, [
      codigoMov,
    ]);
    if (!tm.rows[0]) {
      const ntm = await client.query(CreditosSQL.crearTipoMovimiento, [
        codigoMov,
        "Compra de paquete de créditos",
      ]);
      tipoMovId = ntm.rows[0].id;
    } else {
      tipoMovId = tm.rows[0].id;
    }

    // 4) crear registro de compra
    const idTransaccion = `PKT-${Date.now()}-${usuarioId}`;
    const c = await client.query(CreditosSQL.crearCompraCreditos, [
      usuarioId,
    paquete.id,
    idTransaccion,
    'completado',
    ]);
    const compraId = c.rows[0].id;

    // 5) actualizar billetera
    const upd = await client.query(CreditosSQL.actualizarSaldoBilletera, [
      creditos, // sumamos créditos
      billeteraId,
    ]);
    const saldoPosterior = Number(upd.rows[0].saldo_disponible);

    // 6) registrar movimiento
    await client.query(CreditosSQL.crearMovimiento, [
      creditos,
      saldoAnterior,
      saldoPosterior,
      `Compra de paquete: ${paquete.nombre_paq}`,
      compraId,
      "compras_creditos",
      billeteraId,
      tipoMovId,
    ]);

    return {
      compra_id: compraId,
      billetera_id: billeteraId,
      saldo_anterior: saldoAnterior,
      saldo_posterior: saldoPosterior,
      creditos_agregados: creditos,
    };
  });
}
