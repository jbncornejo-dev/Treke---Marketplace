import { withTx } from "../../config/database/database"; // Ajusta tu ruta si es necesario
import { MarketSQL } from "./market.sql";

// 1. ELIMINAMOS lat, lng, radio_km y la opción 'near' del sort
export type MarketListParams = {
  q?: string | null;
  categoria_id?: number | null;
  min_cred?: number | null;
  max_cred?: number | null;
  estado_id?: number | null;
  // lat, lng y radio_km ELIMINADOS
  sort?: "recent" | "price_asc" | "price_desc"; // Eliminado "near"
  limit?: number;
  offset?: number;
};

export async function list(params: MarketListParams, viewerId?: number | null) { // 👈 Agregamos viewerId
  const {
    q=null, categoria_id=null, min_cred=null, max_cred=null, estado_id=null,
    sort="recent", limit=12, offset=0
  } = params;

  return withTx(async (client) => {
    // 2. CORREGIDO: Ahora enviamos 9 parámetros ($1 a $9)
    const [itemsQ, countQ] = await Promise.all([
      client.query(MarketSQL.list, [
        q, 
        categoria_id, 
        min_cred, 
        max_cred, 
        estado_id, 
        sort, 
        limit, 
        offset,
        viewerId ?? null // 👈 Pasamos el ID del usuario (o null si no está logueado)
      ]),
      // Para el count son solo los 5 filtros (esto sigue igual)
      client.query(MarketSQL.listCount, [q, categoria_id, min_cred, max_cred, estado_id]),
    ]);
    
    const total = countQ.rows[0]?.total ?? 0;
    return { items: itemsQ.rows, page: { total, limit, offset, has_more: offset + limit < total } };
  });
}

export async function detail(id: number, viewerUserId?: number | null) {
  return withTx(async (client) => {
    // 1. Obtener datos del producto
    const base = await client.query(MarketSQL.detail, [id]);
    if (!base.rowCount) throw new Error("Publicación no encontrada");
    const product = base.rows[0];

    // 2. Obtener fotos y contador de propuestas (esto ya lo tenías)
    const fotos  = await client.query(MarketSQL.detailFotos, [id]);
    const propsC = await client.query(MarketSQL.detailPropuestasCount, [id]);

    // 3. Verificar favorito (esto ya lo tenías)
    let is_fav = false;
    if (viewerUserId) {
      const fav = await client.query(MarketSQL.favCheck, [viewerUserId, id]);
      is_fav = (fav.rowCount ?? 0) > 0;
    }

    // 👇 4. NUEVO: Obtener reseñas del vendedor
    // Usamos product.usuario_id (que es el vendedor) para buscar sus reseñas
    const reviews = await client.query(MarketSQL.getSellerReviews, [product.usuario_id]);

    return { 
      ...product, 
      fotos: fotos.rows, 
      total_propuestas: propsC.rows[0]?.total_propuestas ?? 0, 
      is_fav,
      // Agregamos las reseñas al objeto de respuesta
      reviews: reviews.rows 
    };
  });
}

export async function favAdd(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favAdd, [userId, pubId]);
    // rowCount puede ser null, forzamos comparación segura
    return { ok: (r.rowCount ?? 0) > 0 };
  });
}

export async function favRemove(userId: number, pubId: number) {
  return withTx(async (client) => {
    const r = await client.query(MarketSQL.favRemove, [userId, pubId]);
    return { ok: (r.rowCount ?? 0) > 0 };
  });
}

// Catálogos
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
  // latitud y longitud ELIMINADOS
  peso_aprox_kg?: number | null;
  categoria_id: number;
  usuario_id: number;
  estado_id?: number | null;
  
  // Opcionales para UI (aunque la lógica SQL de impacto está comentada abajo)
  factor_ids?: number[];
  sin_impacto?: boolean;
  fotos?: string[];
};

export async function createPublication(input: CreatePublicationInput) {
  return withTx(async (client) => {
    const {
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      // latitud, longitud ELIMINADOS
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

    // 3. CORREGIDO: Crear publicación con los 8 parámetros del nuevo SQL
    const pubRes = await client.query(MarketSQL.createPublication, [
      titulo,
      descripcion,
      valor_creditos,
      ubicacion_texto,
      peso_aprox_kg,  // $5 (Antes era latitud)
      usuario_id,     // $6
      categoria_id,   // $7
      finalEstadoId,  // $8
    ]);
    const pubId: number = pubRes.rows[0].id;

    // Insertar fotos
    for (let i = 0; i < fotos.length; i++) {
      const url = fotos[i];
      if (!url) continue;
      await client.query(MarketSQL.insertFoto, [pubId, url, i, i === 0]);
    }

    return { id: pubId };
  });
}