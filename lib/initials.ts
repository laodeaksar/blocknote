/**
 * Ambil initials dari nama lengkap.
 * Mengambil huruf pertama dari setiap kata, maksimal `max` karakter.
 *
 * @example
 * getInitials("John Doe")        // "JD"
 * getInitials("Alice")           // "A"
 * getInitials("John Michael Doe") // "JD"  (default max=2)
 * getInitials("John Michael Doe", 3) // "JMD"
 */
export function getInitials(name: string, max = 2): string {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((word) => word[0].toUpperCase())
    .join("")
}

/**
 * Ambil initials dari alamat email.
 * Menggunakan bagian sebelum `@`, split berdasarkan `.` atau `_` atau `-`.
 *
 * @example
 * getInitialsFromEmail("john.doe@example.com") // "JD"
 * getInitialsFromEmail("alice@example.com")    // "A"
 */
export function getInitialsFromEmail(email: string, max = 2): string {
  const local = email.split("@")[0] ?? ""
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length === 1) return (parts[0][0] ?? "").toUpperCase()
  return parts
    .slice(0, max)
    .map((p) => (p[0] ?? "").toUpperCase())
    .join("")
}

/**
 * Fallback: ambil initials dari nama atau email, dengan prioritas:
 * 1. Nama lengkap  2. Email  3. "?" jika keduanya kosong
 *
 * @example
 * getDisplayInitials("John Doe", "john@example.com") // "JD"
 * getDisplayInitials("", "john@example.com")         // "J"  (dari email)
 * getDisplayInitials("", "")                         // "?"
 */
export function getDisplayInitials(
  name: string | null | undefined,
  email: string | null | undefined,
  max = 2,
): string {
  if (name?.trim()) return getInitials(name.trim(), max)
  if (email?.trim()) return getInitialsFromEmail(email.trim(), max)
  return "?"
}

/**
 * Warna avatar deterministik berdasarkan string (nama/email/id).
 * Selalu menghasilkan warna yang sama untuk input yang sama.
 * Returns salah satu dari palet warna Tailwind-friendly.
 *
 * @example
 * getAvatarColor("John Doe") // "#f97316" (selalu sama)
 */
const AVATAR_COLORS = [
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#14b8a6", // teal
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#ef4444", // red
  "#06b6d4", // cyan
  "#a855f7", // purple
]

export function getAvatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]!
}
