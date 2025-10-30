// Nigerian phone validation and normalization
// Accepts: "08031234567" or "+2348031234567"
// Stores:   "+2348031234567"
export function normalizeNgPhone(input: string): string | null {
  const raw = input.replace(/\s+/g, '')
  if (/^\+234[1-9]\d{9}$/.test(raw)) return raw // already E.164
  if (/^0[1-9]\d{9}$/.test(raw)) return `+234${raw.slice(1)}`
  return null
}
