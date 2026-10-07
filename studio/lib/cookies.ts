/**
 * Cookie management utilities for studio application (Cookies & CORS Only)
 */

export function getParentCookieDomain(): string | null {
  if (typeof window === 'undefined') return null
  const hostname = window.location.hostname
  if (!hostname || hostname === 'localhost' || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    return null
  }
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`
  }
  return null
}

export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const nameEQ = encodeURIComponent(name) + '='
  const ca = document.cookie.split(';')
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length, c.length))
      } catch {
        return c.substring(nameEQ.length, c.length)
      }
    }
  }
  return null
}

export function setCookie(
  name: string,
  value: string,
  days: number = 30,
  path: string = '/',
  sameSite: 'Lax' | 'Strict' | 'None' = 'Lax'
): void {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  const encodedValue = encodeURIComponent(value)
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = isHttps ? '; Secure' : ''
  const parentDomain = getParentCookieDomain()

  // Only set with parentDomain if available so cookies are shared and cleanly cleared cross-subdomain
  if (parentDomain) {
    document.cookie = `${encodeURIComponent(name)}=${encodedValue}; domain=${parentDomain}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}${secureFlag}`
  } else {
    document.cookie = `${encodeURIComponent(name)}=${encodedValue}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}${secureFlag}`
  }
}

export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return

  const rawName = name.trim()
  const encodedName = encodeURIComponent(rawName)
  const paths = [path, '', '/']
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const hostParts = hostname ? hostname.split('.') : []
  const parentDomain = hostParts.length > 1 ? `.${hostParts.slice(-2).join('.')}` : ''
  const rawParentDomain = hostParts.length > 1 ? hostParts.slice(-2).join('.') : ''
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const secureFlag = isHttps ? '; Secure' : ''

  const domainVariants = [
    '',
    hostname,
    `.${hostname}`,
    parentDomain,
    rawParentDomain,
  ].filter((v, i, a) => v && a.indexOf(v) === i)

  // Expire cookies across all possible domain & path permutations
  for (const p of paths) {
    const pathAttr = p ? `; path=${p}` : ''
    // Host-only deletions
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict${secureFlag}`
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
    document.cookie = `${rawName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`

    // Domain variations
    for (const d of domainVariants) {
      if (d) {
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict${secureFlag}`
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
        document.cookie = `${rawName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`
      }
    }
  }
}

/**
 * Sweep and erase all cookies found on document.cookie
 */
export function clearAllCookies(): void {
  if (typeof document === 'undefined') return
  try {
    const rawCookies = document.cookie.split(';')
    for (let i = 0; i < rawCookies.length; i++) {
      const cookie = rawCookies[i].trim()
      if (!cookie) continue
      const eqIdx = cookie.indexOf('=')
      const name = eqIdx > -1 ? cookie.substring(0, eqIdx).trim() : cookie
      if (name) {
        deleteCookie(name, '/')
        deleteCookie(name, '')
      }
    }
  } catch (e) {
    console.error('Error sweeping cookies in studio:', e)
  }
}

// ================= AUTH COOKIE HELPERS =================

export function getAuthToken(): string | null {
  return getCookie('tg_token')
}

export function setAuthToken(token: string): void {
  // 15 minutes (15 / 1440 days)
  setCookie('tg_token', token, 15 / 1440, '/')
}

export function removeAuthToken(): void {
  deleteCookie('tg_token', '/')
  deleteCookie('token', '/')
  deleteCookie('auth_token', '/')
}

export function getRefreshToken(): string | null {
  return getCookie('tg_refresh_token')
}

export function setRefreshToken(token: string): void {
  // 15 days
  setCookie('tg_refresh_token', token, 15, '/')
}

export function removeRefreshToken(): void {
  deleteCookie('tg_refresh_token', '/')
  deleteCookie('refreshToken', '/')
}

/**
 * Standard JWT Decoder (SSR, Edge, and Browser safe)
 */
export function decodeJwtPayload<T = any>(token: string | null | undefined): T | null {
  if (!token || typeof token !== 'string') return null
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    if (typeof atob === 'function') {
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload) as T
    } else if (typeof Buffer !== 'undefined') {
      return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as T
    }
    return null
  } catch {
    return null
  }
}

export function getAuthRole(): string | null {
  // 1. Primary Source of Truth: Decode directly from Access Token
  const token = getAuthToken()
  if (token) {
    const payload = decodeJwtPayload(token)
    if (payload?.role) return payload.role
  }

  // 2. Secondary Source of Truth: Decode directly from Refresh Token
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken)
    if (payload?.role) return payload.role
  }

  return null
}

export function setAuthRole(role?: string): void {
  // Role is encoded inside JWT tokens. We ensure legacy role cookies are deleted.
  deleteCookie('tg_user_role', '/')
}

export function removeAuthRole(): void {
  deleteCookie('tg_user_role', '/')
}

export function getAuthUser<T = any>(): T | null {
  // Decode identity claims directly from Access Token
  const token = getAuthToken()
  if (token) {
    const payload = decodeJwtPayload(token)
    if (payload && payload.id) {
      return {
        id: payload.id,
        name: payload.name || 'Member',
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        role: payload.role || 'STUDIO',
        status: payload.status || 'ACTIVE',
        studioId: payload.studioId || undefined,
      } as unknown as T
    }
  }

  // Secondary Source of Truth: decode from Refresh Token
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    const payload = decodeJwtPayload(refreshToken)
    if (payload && payload.id) {
      return {
        id: payload.id,
        name: 'Member',
        role: payload.role || 'STUDIO',
        status: 'ACTIVE',
      } as unknown as T
    }
  }

  return null
}

export function setAuthUser(user: any): void {
  // User credentials and identity are fully managed via HTTP cookies and JWT tokens.
  // Legacy tg_user cookie is cleaned up.
  deleteCookie('tg_user', '/')
}

export function removeAuthUser(): void {
  deleteCookie('tg_user', '/')
}

export function clearUnnecessaryDataOnLogin(): void {
  clearAllCookies()
}

export function clearAllAuth(): void {
  removeAuthToken()
  removeRefreshToken()
  removeAuthUser()
  removeAuthRole()
  clearAllCookies()
}

// ================= STORAGE COOKIE HELPERS =================

export function getStorageCookie(key: string, defaultValue: string = ''): string {
  const cookieVal = getCookie(key)
  return cookieVal !== null ? cookieVal : defaultValue
}

export function setStorageCookie(key: string, value: string): void {
  setCookie(key, value, 30, '/')
}

export function removeStorageCookie(key: string): void {
  deleteCookie(key, '/')
}

