/**
 * Cookie management utilities for client-side web application
 */

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
  let cookieString = `${encodeURIComponent(name)}=${encodedValue}; path=${path}; max-age=${maxAge}; SameSite=${sameSite}`
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && sameSite === 'None') {
    cookieString += '; Secure'
  }
  document.cookie = cookieString
}

export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return

  const rawName = name.trim()
  const encodedName = encodeURIComponent(rawName)
  const paths = [path, '', '/']
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  const hostParts = hostname ? hostname.split('.') : []
  const domainVariants = [
    '',
    hostname,
    `.${hostname}`,
    hostParts.length > 1 ? `.${hostParts.slice(-2).join('.')}` : '',
  ].filter((v, i, a) => a.indexOf(v) === i)

  // Expire cookies across all possible domain & path permutations
  for (const p of paths) {
    const pathAttr = p ? `; path=${p}` : ''
    // Host-only deletions
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
    document.cookie = `${encodedName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
    document.cookie = `${rawName}=${pathAttr}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`

    // Domain variations
    for (const d of domainVariants) {
      if (d) {
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
        document.cookie = `${encodedName}=${pathAttr}; domain=${d}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`
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
    console.error('Error sweeping cookies:', e)
  }
}

// ================= AUTH COOKIE HELPERS =================

export function getAuthToken(): string | null {
  let token = getCookie('tg_token')
  if (!token && typeof window !== 'undefined') {
    // Migration fallback from legacy localStorage if exists
    const legacy = localStorage.getItem('tg_token')
    if (legacy) {
      setAuthToken(legacy)
      localStorage.removeItem('tg_token')
      return legacy
    }
  }
  return token
}

export function setAuthToken(token: string): void {
  setCookie('tg_token', token, 30, '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_token')
  }
}

export function removeAuthToken(): void {
  deleteCookie('tg_token', '/')
  deleteCookie('token', '/')
  deleteCookie('auth_token', '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_token')
    localStorage.removeItem('token')
  }
}

export function getAuthRole(): string | null {
  let role = getCookie('tg_user_role')
  if (!role && typeof window !== 'undefined') {
    const legacy = localStorage.getItem('tg_user_role')
    if (legacy) {
      setAuthRole(legacy)
      localStorage.removeItem('tg_user_role')
      return legacy
    }
  }
  return role
}

export function setAuthRole(role: string): void {
  setCookie('tg_user_role', role, 30, '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_user_role')
  }
}

export function removeAuthRole(): void {
  deleteCookie('tg_user_role', '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_user_role')
  }
}

export function getAuthUser<T = any>(): T | null {
  if (typeof window !== 'undefined') {
    const fullUser = localStorage.getItem('tg_user_data') || localStorage.getItem('tg_user')
    if (fullUser) {
      try {
        return JSON.parse(fullUser) as T
      } catch { }
    }
  }
  return null
}

export function setAuthUser(user: any): void {
  if (!user) {
    removeAuthUser()
    return
  }

  // Store full user object ONLY in localStorage (never in cookies to avoid HTTP 431)
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('tg_user_data', JSON.stringify(user))
    } catch (err) {
      console.error('Error saving user to localStorage:', err)
    }
  }

  // Ensure any legacy tg_user cookie is wiped
  deleteCookie('tg_user', '/')
}

export function removeAuthUser(): void {
  deleteCookie('tg_user', '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_user_data')
    localStorage.removeItem('tg_user')
  }
}

export function clearUnnecessaryDataOnLogin(): void {
  // 1. Wipe all existing cookies
  clearAllCookies()

  // 2. Clear all previous user, session, and cached order data from localStorage
  if (typeof window !== 'undefined') {
    try {
      const keysToPreserve = new Set<string>([
        // Preserved non-sensitive global UI preferences if needed
      ])

      const allKeys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && !keysToPreserve.has(key)) {
          allKeys.push(key)
        }
      }

      allKeys.forEach((key) => {
        try {
          localStorage.removeItem(key)
        } catch { }
      })

      // Wipe sessionStorage completely
      sessionStorage.clear()
    } catch (e) {
      console.warn('Error clearing localStorage on login:', e)
    }
  }
}

export function clearAllAuth(): void {
  clearUnnecessaryDataOnLogin()
  removeAuthToken()
  removeAuthUser()
  removeAuthRole()
  clearAllCookies()
}

// ================= LOCAL STORAGE HELPERS (REPLACES STORAGE COOKIES) =================
// Non-auth UI states (filters, city, preferences) belong in localStorage, NOT cookies!

export function getStorageCookie(key: string, defaultValue: string = ''): string {
  if (typeof window === 'undefined') return defaultValue
  try {
    const val = localStorage.getItem(key)
    if (val !== null) return val

    // Clean up legacy cookie if found and migrate to localStorage
    const legacyCookie = getCookie(key)
    if (legacyCookie !== null) {
      localStorage.setItem(key, legacyCookie)
      deleteCookie(key, '/')
      return legacyCookie
    }
  } catch { }
  return defaultValue
}

// Helper to safely prune old tg_order_ cache items when storage gets full
function pruneStaleOrderStorage(): void {
  if (typeof window === 'undefined') return
  try {
    const keys = Object.keys(localStorage)
    const orderKeys = keys.filter((k) => k.startsWith('tg_order_'))
    // Keep at most 3 newest order keys, remove the rest
    if (orderKeys.length > 3) {
      const keysToRemove = orderKeys.slice(0, orderKeys.length - 3)
      for (const k of keysToRemove) {
        localStorage.removeItem(k)
      }
    }
  } catch { }
}

// Strip huge base64 data URLs from cached JSON strings to prevent quota exhaustion
function sanitizePayloadForLocalStorage(value: string): string {
  if (!value || typeof value !== 'string') return value
  if (!value.includes('data:image/') && value.length < 150000) return value

  try {
    const parsed = JSON.parse(value)
    let modified = false

    if (Array.isArray(parsed.images)) {
      parsed.images = parsed.images.map((img: any) => {
        if (typeof img === 'string' && img.startsWith('data:image/') && img.length > 500) {
          modified = true
          return '[cached-image-omitted]'
        }
        return img
      })
    }

    if (typeof parsed.imageUrl === 'string' && parsed.imageUrl.startsWith('data:image/') && parsed.imageUrl.length > 500) {
      parsed.imageUrl = '[cached-image-omitted]'
      modified = true
    }

    if (typeof parsed.intakePhotoUrl === 'string' && parsed.intakePhotoUrl.startsWith('data:image/') && parsed.intakePhotoUrl.length > 500) {
      parsed.intakePhotoUrl = '[cached-image-omitted]'
      modified = true
    }

    return modified ? JSON.stringify(parsed) : value
  } catch {
    return value
  }
}

export function setStorageCookie(key: string, value: string, _days?: number): void {
  if (typeof window === 'undefined') return

  // Automatically keep payload lean if storing order cache
  const cleanValue = (key.startsWith('tg_order_') || key === 'tg_latest_order')
    ? sanitizePayloadForLocalStorage(value)
    : value

  try {
    localStorage.setItem(key, value)
    deleteCookie(key, '/')
  } catch (err: any) {
    // If quota exceeded, clean old temporary/cached orders and retry
    if (err?.name === 'QuotaExceededError' || err?.code === 22 || err?.number === -2147024882) {
      try {
        const keysToPrune: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)
          if (k && (k.startsWith('tg_order_') || k.startsWith('tg_draft_') || k.startsWith('tg_temp_'))) {
            keysToPrune.push(k)
          }
        }
        keysToPrune.forEach((k) => localStorage.removeItem(k))
        localStorage.setItem(key, value)
        deleteCookie(key, '/')
        return
      } catch (retryErr) {
        // Safe degrade: ignore write failure rather than throwing uncaught error
      }
    }
  }
}

export function removeStorageCookie(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
  deleteCookie(key, '/')
}
