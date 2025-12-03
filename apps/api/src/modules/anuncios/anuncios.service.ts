// apps/api/src/modules/anuncios/anuncios.service.ts
import { withTx } from "../../config/database/database";
import { AnunciosSQL } from "./anuncios.sql";

export type UbicacionAnuncio =
  | "market"
  | "perfil"
  | "creditos"
  | "intercambios"
  | "global";

export async function getActivosByUbicacion(ubicacion: UbicacionAnuncio) {
  return withTx(async (client) => {
    const result = await client.query(AnunciosSQL.listActivosByUbicacion, [
      ubicacion,
    ]);
    return result.rows;
  });
}

export async function adminListAll() {
  return withTx(async (client) => {
    const result = await client.query(AnunciosSQL.adminListAll);
    return result.rows;
  });
}

export interface CrearAnuncioDTO {
  titulo: string;
  contenido: string;
  imagen_url: string;
  enlace_destino?: string | null;
  ubicacion: UbicacionAnuncio;
  fecha_ini: string; // "YYYY-MM-DD"
  fecha_fin: string; // "YYYY-MM-DD"
  esta_activo?: boolean;
  presupuesto?: number | null;
}

export async function adminCrearAnuncio(
  dto: CrearAnuncioDTO,
  anuncianteId: number
) {
  const {
    titulo,
    contenido,
    imagen_url,
    enlace_destino,
    ubicacion,
    fecha_ini,
    fecha_fin,
    esta_activo = true,
    presupuesto = null,
  } = dto;

  return withTx(async (client) => {
    const result = await client.query(AnunciosSQL.crearAnuncio, [
      titulo,
      contenido,
      imagen_url,
      enlace_destino ?? null,
      ubicacion,
      fecha_ini,
      fecha_fin,
      esta_activo,
      presupuesto,
      anuncianteId,
    ]);

    return result.rows[0];
  });
}

export async function registrarClick(id: number) {
  return withTx(async (client) => {
    const result = await client.query(AnunciosSQL.registrarClick, [id]);
    return result.rows[0];
  });
}
