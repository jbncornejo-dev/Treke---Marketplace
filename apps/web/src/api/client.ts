// apps/web/src/api/client.ts
import axios from "axios";
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

const API_BASE = "" as const; // rutas relativas: /api/...

const instance: AxiosInstance = axios.create({
  baseURL: API_BASE,
});

// 🔐 Interceptor para agregar el Bearer token automáticamente
instance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("treke_token");
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Manejo de errores similar a tu antiguo request()
instance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const msg =
      data?.error ||
      data?.message ||
      (status ? `HTTP ${status}` : error.message);
    return Promise.reject(new Error(msg));
  }
);

export interface ApiClient {
  get<T = any>(path: string, config?: AxiosRequestConfig): Promise<T>;
  post<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
  put<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
  patch<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T>;
  del<T = any>(path: string, config?: AxiosRequestConfig): Promise<T>;
}

export const api: ApiClient = {
  get<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get<T>(path, config) as unknown as Promise<T>;
  },
  post<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return instance.post<T>(path, data, config) as unknown as Promise<T>;
  },
  put<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return instance.put<T>(path, data, config) as unknown as Promise<T>;
  },
  patch<T = any>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return instance.patch<T>(path, data, config) as unknown as Promise<T>;
  },
  del<T = any>(path: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete<T>(path, config) as unknown as Promise<T>;
  },
};
