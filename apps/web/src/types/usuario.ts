import type { EstadoUsuario } from './core';


export interface Usuario {
id: number;
email: string;
rol_id: number; // 10001 usuario, 10002 emprendedor, 10003 admin
estado: EstadoUsuario;
created_at?: string;
}


export interface PerfilUsuario {
id: number;
full_name: string;
acerca_de?: string | null;
foto?: string | null;
telefono?: string | null;
fecha_nacimiento?: string | null; // ISO
}


export interface Billetera {
saldo_disponible: number;
saldo_retenido: number;
}


export interface Reputacion {
calificacion_prom: number;
total_resenias: number;
}


export interface PerfilFull extends Usuario {
full_name: string;
acerca_de?: string | null;
foto?: string | null;
telefono?: string | null;
fecha_nacimiento?: string | null;
saldo_disponible: number;
saldo_retenido: number;
calificacion_prom: number;
total_resenias: number;
total_intercambios: number;
}

// DTOs
export interface RegisterInput {
email: string;
password: string;
full_name: string;
acepta_terminos: boolean;
rol_id?: number; // opcional
}


export interface LoginInput {
email: string;
password: string;
}


export interface UpdatePerfilInput {
full_name?: string;
acerca_de?: string;
telefono?: string;
fecha_nacimiento?: string; // ISO
}


export interface UpdateFotoInput { foto: string; }
export interface UpdateEmailInput { email: string; }