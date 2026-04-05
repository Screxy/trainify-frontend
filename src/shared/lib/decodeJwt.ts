export function decodeJwt<T = Record<string, unknown>>(token: string): T {
  const payload = token.split('.')[1]
  return JSON.parse(atob(payload))
}
