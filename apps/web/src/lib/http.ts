const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';


async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
const res = await fetch(`${BASE_URL}${path}`, {
headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
...options,
});
const data = await res.json();
if (!res.ok || data?.ok === false) {
throw new Error(data?.error || data?.message || `HTTP ${res.status}`);
}
return data as T;
}


export const get = <T>(path: string) => http<T>(path);
export const post = <T>(path: string, body?: any) => http<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(path: string, body?: any) => http<T>(path, { method: 'PUT', body: JSON.stringify(body) });
export const patch= <T>(path: string, body?: any) => http<T>(path, { method: 'PATCH',body: JSON.stringify(body) });