// apps/web/src/api/creditos.ts
import { api } from "./client";

export type PaqueteCreditos = {
  id: number;
  nombre_paq: string;
  descripcion: string;
  cant_creditos: number;
  precio: string;
};

export type Billetera = {
  id: number;
  saldo_disponible: number;
  saldo_retenido: number;
};

export async function getPaquetesCreditos(): Promise<PaqueteCreditos[]> {
  const r = await api.get<{ ok: boolean; data: PaqueteCreditos[] }>(
    "/api/creditos/paquetes"
  );
  return (r as any).data ?? (r as any);
}

export async function getSaldoBilletera(): Promise<Billetera> {
  // backend ahora obtiene el usuario desde el JWT (authMiddleware)
  const r = await api.get<{ ok: boolean; data: Billetera }>(
    "/api/creditos/saldo"
  );
  return (r as any).data ?? (r as any);
}

export async function comprarPaquete(paqueteId: number) {
  // solo enviamos el paquete, el usuario viene del token
  const r = await api.post<{ ok: boolean; data: any }>(
    "/api/creditos/comprar",
    { paquete_id: paqueteId }
  );
  return (r as any).data ?? (r as any);
}
