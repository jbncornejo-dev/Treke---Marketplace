import type { ApiResponse } from '../../types/core';
import type { PerfilFull, RegisterInput, LoginInput, UpdatePerfilInput, UpdateFotoInput, UpdateEmailInput, Usuario } from '../../types/usuario';
import { get, post, put, patch } from '../../lib/http';


export const UsuariosAPI = {
register: (input: RegisterInput) => post<ApiResponse>(`/usuarios/register`, input),
login: (input: LoginInput) => post<ApiResponse>(`/auth/login`, input),
getPerfil:(id: number) => get<ApiResponse<{ data: PerfilFull }>>(`/usuarios/${id}/perfil`),
updatePerfil: (id: number, body: UpdatePerfilInput) => put<ApiResponse<{ data: any }>>(`/usuarios/${id}/perfil`, body),
updateFoto: (id: number, body: UpdateFotoInput) => patch<ApiResponse<{ data: any }>>(`/usuarios/${id}/foto`, body),
updateEmail: (id: number, body: UpdateEmailInput) => patch<ApiResponse<{ data: any }>>(`/usuarios/${id}/email`, body),


// Admin
list: (params?: { q?: string; rol?: number; estado?: string; page?: number; pageSize?: number; }) => {
const usp = new URLSearchParams();
for (const [k,v] of Object.entries(params || {})) if (v !== undefined && v !== null && v !== '') usp.set(k, String(v));
return get<ApiResponse<{ data: Usuario[] }>>(`/admin/usuarios${usp.toString() ? `?${usp}` : ''}`);
},
cambiarRol: (id: number, nuevoRolId: number) => patch<ApiResponse<{ data: any }>>(`/admin/usuarios/${id}/rol`, { nuevoRolId }),
suspender: (id: number) => patch<ApiResponse<{ data: any }>>(`/admin/usuarios/${id}/suspender`),
};