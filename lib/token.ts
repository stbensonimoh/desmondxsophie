import crypto from 'crypto'

const ALG = 'sha256'

type TokenPayload = {
  gid: string // guest id
  code: string // 4-char code
  exp: number // epoch seconds
}

function b64url(buf: Buffer | string) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function fromB64url(s: string) {
  s = s.replace(/-/g, '+').replace(/_/g, '/')
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0
  return Buffer.from(s + '='.repeat(pad), 'base64')
}

export function signInviteToken(payload: Omit<TokenPayload, 'exp'>, ttlSeconds = 60 * 60 * 24) {
  const secret = process.env.INVITE_TOKEN_SECRET
  if (!secret) throw new Error('INVITE_TOKEN_SECRET not set')
  const body: TokenPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }
  const json = JSON.stringify(body)
  const data = b64url(json)
  const sig = crypto.createHmac(ALG, secret).update(data).digest()
  return `${data}.${b64url(sig)}`
}

export function verifyInviteToken(token: string): TokenPayload | null {
  try {
    const [data, sigB64] = token.split('.')
    if (!data || !sigB64) return null
    const secret = process.env.INVITE_TOKEN_SECRET!
    const expected = crypto.createHmac(ALG, secret).update(data).digest()
    const given = fromB64url(sigB64)
    if (!crypto.timingSafeEqual(expected, given)) return null
    const payload = JSON.parse(fromB64url(data).toString('utf8')) as TokenPayload
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
