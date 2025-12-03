// apps/api/src/modules/gamificacion/gamificacion.service.ts

import { withTx } from "../../config/database/database";
import { GamificacionSQL } from "./gamificacion.sql";

// =========================
// 1) RESUMEN USUARIO
// =========================

export async function resumenUsuario(usuarioId: number) {
  return withTx(async (client) => {
    // Progreso actual (si existe)
    const progRes = await client.query(GamificacionSQL.getProgresoUsuario, [
      usuarioId,
    ]);
    const progreso = progRes.rows[0] ?? null;

    // Nivel base (mínimo requerido)
    const baseNivelRes = await client.query(GamificacionSQL.getNivelBase);
    const nivelBase = baseNivelRes.rows[0] ?? null;

    // Totales históricos
    const totalesRes = await client.query(GamificacionSQL.getTotalesHistorial, [
      usuarioId,
    ]);
    const totales = totalesRes.rows[0] ?? { puntos_totales: 0 };

    const ult30Res = await client.query(
      GamificacionSQL.getTotalesHistorialUltimos30d,
      [usuarioId]
    );
    const ult30 = ult30Res.rows[0] ?? { puntos_ultimos_30d: 0 };

    // Caso: usuario aún no tiene fila en progreso_usuario
    if (!progreso) {
      let siguienteNivel = null;
      let puntosParaSiguiente: number | null = null;

      if (nivelBase) {
        const nextRes = await client.query(
          GamificacionSQL.getNextLevelByPuntos,
          [0]
        );
        siguienteNivel = nextRes.rows[0] ?? null;
        if (siguienteNivel) {
          puntosParaSiguiente = Number(siguienteNivel.puntos_requeridos);
        }
      }

      return {
        puntos_acumulados: 0,
        nivel_actual: nivelBase
          ? {
              id: nivelBase.id,
              nombre: nivelBase.nombre_nivel,
              multiplicador_bono: Number(nivelBase.multiplicador_bono),
              puntos_requeridos: Number(nivelBase.puntos_requeridos),
              descripcion: nivelBase.descripcion,
              icono: nivelBase.icono,
              color: nivelBase.color,
            }
          : null,
        siguiente_nivel: siguienteNivel
          ? {
              id: siguienteNivel.id,
              nombre: siguienteNivel.nombre_nivel,
              puntos_requeridos: Number(siguienteNivel.puntos_requeridos),
              descripcion: siguienteNivel.descripcion,
              icono: siguienteNivel.icono,
              color: siguienteNivel.color,
            }
          : null,
        puntos_totales_historial: Number(totales.puntos_totales ?? 0),
        puntos_ultimos_30d: Number(ult30.puntos_ultimos_30d ?? 0),
        puntos_para_siguiente: puntosParaSiguiente,
      };
    }

    // Caso: usuario con progreso
    const puntosActuales = Number(progreso.puntos_acumulados);

    const nextRes = await client.query(
      GamificacionSQL.getNextLevelByPuntos,
      [puntosActuales]
    );
    const siguienteNivel = nextRes.rows[0] ?? null;

    const puntosParaSiguiente = siguienteNivel
      ? Math.max(
          0,
          Number(siguienteNivel.puntos_requeridos) - puntosActuales
        )
      : 0;

    return {
      puntos_acumulados: puntosActuales,
      nivel_actual: {
        id: progreso.nivel_id,
        nombre: progreso.nombre_nivel,
        multiplicador_bono: Number(progreso.multiplicador_bono),
        puntos_requeridos: Number(progreso.puntos_requeridos),
        // Si luego quieres descripción/icono/color aquí,
        // se pueden agregar al SELECT de getProgresoUsuario
        descripcion: null,
        icono: null,
        color: null,
      },
      siguiente_nivel: siguienteNivel
        ? {
            id: siguienteNivel.id,
            nombre: siguienteNivel.nombre_nivel,
            puntos_requeridos: Number(siguienteNivel.puntos_requeridos),
            descripcion: siguienteNivel.descripcion,
            icono: siguienteNivel.icono,
            color: siguienteNivel.color,
          }
        : null,
      puntos_totales_historial: Number(totales.puntos_totales ?? 0),
      puntos_ultimos_30d: Number(ult30.puntos_ultimos_30d ?? 0),
      puntos_para_siguiente: puntosParaSiguiente,
    };
  });
}

// =========================
// 2) HISTORIAL USUARIO
// =========================

export async function historialUsuario(
  usuarioId: number,
  opts: { page: number; pageSize: number }
) {
  return withTx(async (client) => {
    const page = opts.page || 1;
    const pageSize = opts.pageSize || 20;
    const limit = pageSize;
    const offset = (page - 1) * pageSize;

    const itemsRes = await client.query(GamificacionSQL.historialUsuario, [
      usuarioId,
      limit,
      offset,
    ]);
    const totalRes = await client.query(GamificacionSQL.historialTotal, [
      usuarioId,
    ]);

    return {
      items: itemsRes.rows,
      total: totalRes.rows[0]?.total ?? 0,
      page,
      pageSize,
    };
  });
}

// =========================
// 3) LOGROS (ACCIONES POR USUARIO)
// =========================

export async function logrosUsuario(usuarioId: number) {
  return withTx(async (client) => {
    const res = await client.query(GamificacionSQL.logrosUsuario, [usuarioId]);
    return res.rows;
  });
}

// =========================
// 4) LISTADOS GLOBALES (Niveles / Acciones)
// =========================

export async function listarNiveles() {
  return withTx(async (client) => {
    const result = await client.query(GamificacionSQL.listNiveles);
    return result.rows;
  });
}

export async function listarAcciones() {
  return withTx(async (client) => {
    const result = await client.query(GamificacionSQL.listAcciones);
    return result.rows;
  });
}

// =========================
// 5) LOGIN DIARIO / RECOMPENSA DIARIA
// (usa tu función SQL fn_gam_registrar_login)
// =========================

export async function registrarLoginDiario(usuarioId: number) {
  return withTx(async (client) => {
    await client.query(`SELECT fn_gam_registrar_login($1)`, [usuarioId]);
  });
}
