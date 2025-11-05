export type EstadoUsuario = 'pendiente_verificacion' | 'activo' | 'inactivo' | 'suspendido';


export interface PaginacionQuery {
page?: number;
pageSize?: number;
}


export interface ApiResponse<T = any> {
ok: boolean;
data?: T;
message?: string;
error?: string;
[k: string]: any;
}