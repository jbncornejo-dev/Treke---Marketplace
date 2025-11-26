import { withTx } from "../../config/database/database";
import { CreditosSQL } from "./creditos.sql";
import { randomUUID } from "crypto"; // Para simular ID de transacción

export async function getCatalogoCreditos(usuarioId: number) {
  return withTx(async (client) => {
    const [paquetes, planes, sub] = await Promise.all([
      client.query(CreditosSQL.listPaquetes),
      client.query(CreditosSQL.listPlanes),
      client.query(CreditosSQL.getSuscripcionActiva, [usuarioId]),
    ]);

    return {
      paquetes: paquetes.rows,
      planes: planes.rows,
      suscripcionActual: sub.rows[0] || null,
    };
  });
}

// Simulación de compra de Paquete
export async function comprarPaquete(usuarioId: number, paqueteId: number) {
  return withTx(async (client) => {
    // 1. Aquí iría la lógica de Stripe/PayPal.
    // Simulamos que el pago fue exitoso generando un ID falso.
    const transaccionId = `txn_pack_${randomUUID().split("-")[0]}`;
    const estadoPago = "completado"; // Simulamos éxito directo

    // 2. Insertamos en la tabla. El TRIGGER de BD se encarga de dar los créditos.
    await client.query(CreditosSQL.crearCompraPaquete, [
      transaccionId,
      estadoPago,
      usuarioId,
      paqueteId,
    ]);

    return { ok: true, message: "Paquete comprado exitosamente" };
  });
}

// Simulación de compra de Plan
export async function comprarPlan(usuarioId: number, planId: number) {
  return withTx(async (client) => {
    // 1. Simulación de pago
    const transaccionId = `txn_plan_${randomUUID().split("-")[0]}`;
    const estadoPago = "completado"; 

    // 2. Insertamos. El TRIGGER 'fn_procesar_compra_plan' activa la suscripción y da créditos.
    await client.query(CreditosSQL.crearCompraPlan, [
      transaccionId,
      estadoPago,
      usuarioId,
      planId,
    ]);

    return { ok: true, message: "Plan suscrito exitosamente" };
  });
}