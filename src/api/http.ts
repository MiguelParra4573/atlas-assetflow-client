// Cliente HTTP base. Todo el consumo del backend pasa por aquí (prefijo /api).
// En Fase 4 se añade el header Authorization con el JWT.
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${path}`)
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T)
}
