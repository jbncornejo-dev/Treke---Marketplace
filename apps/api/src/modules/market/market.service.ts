import { withTx } from "../../config/database/database";
import { MarketSQL } from "./market.sql";

export type MarketListParams = {
  q?: string | null;
  categoria_id?: number | null;
  min_cred?: number | null;
  max_cred?: number | null;
  estado_id?: number | null;
  lat?: number | null;
  lng?: number | null;
  radio_km?: number | null;
  sort?: "recent" | "price_asc" | "price_desc" | "near";
  limit?: number;
  offset?: number;
};

export async function list(params: MarketListParams) {
  const {
    q=null, categoria_id=null, min_cred=null, max_cred=null, estado_id=null,
    lat=null, lng=null, radio_km=null, sort="recent", limit=12, offset=0
  } = params;

  return withTx(async (client) => {
    const [itemsQ, countQ] = await Promise.all([
      client.query(MarketSQL.list, [q, categoria_id, min_cred, max_cred, estado_id, lat, lng, radio_km, sort, limit, offset]),
      client.query(MarketSQL.listCount, [q, categoria_id, min_cred, max_cred, estado_id]),
    ]);
    const total = countQ.rows[0]?.total ?? 0;
    return { items: itemsQ.rows, page: { total, limit, offset, has_more: offset + limit < total } };
  });
}

export async function detail(id: number, viewerUserId?: number | null) {
  return withTx(async (client) => {
    const base = await client.query(MarketSQL.detail, [id]);
    if (!base.rowCount) throw new Error("Publicación no encontrada");

    const fotos  = await client.query(MarketSQL.detailFotos, [id]);
    const propsC = await client.query(MarketSQL.detailPropuestasCount, [id]);

    let is_fav = false;
    if (viewerUserId) {
      const fav = await client.query(MarketSQL.favCheck, [viewerUserId, id]);
      is_fav = (fav.rowCount ?? 0) > 0;
    }

    return { ...base.rows[0], fotos: fotos.rows, total_propuestas: propsC.rows[0]?.total_propuestas ?? 0, is_fav };
  });
}

export async function favAdd(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favAdd, [userId, pubId]);
    return { ok: r.rowCount ?? 0 > 0 };
  });
}

export async function favRemove(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favRemove, [userId, pubId]);
    return { ok: r.rowCount ?? 0 > 0 };
  });
}

// catálogos
export async function categorias() {
  return withTx(async (client) => (await client.query(MarketSQL.cats)).rows);
}
export async function estadosPublicacion() {
  return withTx(async (client) => (await client.query(MarketSQL.estados)).rows);
}

// ================================
// NUEVOS TIPOS Y SERVICIOS
// ================================

export type CreatePublicationInput = {
  titulo: string;
  descripcion: string;
  valor_creditos: number;
  ubicacion_texto: string;
  latitud?: number | null;
  longitud?: number | null;
  peso_aprox_kg?: number | null;
  categoria_id: number;
  usuario_id: number;
  estado_id?: number | null;
  /**
   * ids de factores_ecologicos marcados en el formulario
   * (CO2, energía, agua, residuos). Se usan para reportes
   * y UI, pero el cálculo de impacto sigue dependiendo de
   * categoria + peso + equivalencias_categoria.
   */
  factor_ids?: number[];
  /**
   * Si el usuario marca "ninguna", ignoramos factor_ids
   * y tratamos la publicación como sin impacto.
   */
  sin_impacto?: boolean;
  /**
   * URLs de las imágenes (por ahora como strings;
   * luego las puedes integrar con tu flujo de upload).
   */
  fotos?: string[];
};

export async function factoresEcologicos() {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.factores);
    return r.rows;
  });
}

export async function createPublication(input: CreatePublicationInput) {
  return withTx(async (client) => {
    const {
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      latitud = null,
      longitud = null,
      peso_aprox_kg = 0,
      categoria_id,
      usuario_id,
      estado_id,
      factor_ids = [],
      sin_impacto = false,
      fotos = [],
    } = input;

    if (!titulo || !descripcion || !ubicacion_texto) {
      throw new Error("titulo, descripcion y ubicacion_texto son requeridos");
    }
    if (!categoria_id) throw new Error("categoria_id requerido");
    if (!usuario_id) throw new Error("usuario_id requerido");

    // Estado por defecto "disponible" si no viene estado_id
    let finalEstadoId = estado_id ?? null;
    if (!finalEstadoId) {
      const rEstado = await client.query(MarketSQL.estadoPorNombre, ["disponible"]);
      if (!rEstado.rows[0]) {
        throw new Error("No se encontró estado_publicacion 'disponible'");
      }
      finalEstadoId = rEstado.rows[0].id as number;
    }

    // Crear publicación
    const pubRes = await client.query(MarketSQL.createPublication, [
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      latitud,
      longitud,
      peso_aprox_kg,
      usuario_id,
      categoria_id,
      finalEstadoId,
    ]);
    const pubId: number = pubRes.rows[0].id;

    // Insertar fotos (primera es principal)
    for (let i = 0; i < fotos.length; i++) {
      const url = fotos[i];
      if (!url) continue;
      await client.query(MarketSQL.insertFoto, [pubId, url, i, i === 0]);
    }

    // NOTA: aquí podrías usar factor_ids y sin_impacto para actualizar
    // campos agregados o para lógica de reportes. No creamos nuevas tablas,
    // solo dejamos registrados los ids que vinieron en el input si quieres
    // usarlos para logs/metadata más adelante.

    return { id: pubId };
  });
}
