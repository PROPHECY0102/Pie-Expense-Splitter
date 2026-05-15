// Simulated password handling. Pie stores everything in localStorage, so
// password verification here is purely local theatre — it mimics the shape of
// real auth without providing any real security. A real backend would hash
// passwords with bcrypt/argon2 and verify server-side.

const SALT = 'pie:v1'

export function hashPassword(password: string): string {
  return btoa(unescape(encodeURIComponent(`${SALT}:${password}`)))
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  if (!passwordHash) return false
  return hashPassword(password) === passwordHash
}
