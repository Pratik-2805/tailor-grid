/**
 * Cookie management utilities for studio application
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
  document.cookie = `${encodeURIComponent(name)}=; path=${path}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
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
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_token')
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
      } catch {}
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

export function clearAllAuth(): void {
  removeAuthToken()
  removeAuthUser()
  removeAuthRole()
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_token')
    localStorage.removeItem('tg_user')
    localStorage.removeItem('tg_user_data')
    localStorage.removeItem('tg_user_role')
    localStorage.removeItem('tg_screen')
    // Clear onboarding local and session data completely
    localStorage.removeItem('tg_pending_google')
    localStorage.removeItem('tg_onboard_step')
    localStorage.removeItem('tg_onboard_form')
    localStorage.removeItem('tg_onboard_email')
    localStorage.removeItem('tg_phone_verified')
    localStorage.removeItem('tg_verified_phone')
    sessionStorage.removeItem('tg_pending_google')
    sessionStorage.removeItem('tg_onboard_step')
    sessionStorage.removeItem('tg_onboard_form')
    sessionStorage.removeItem('tg_phone_verified')
    sessionStorage.removeItem('tg_verified_phone')
  }
}

// ================= LOCAL STORAGE HELPERS (REPLACES STORAGE COOKIES) =================
// Non-auth UI states belong in localStorage, NOT cookies!

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
  } catch {}
  return defaultValue
}

export function setStorageCookie(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
    // Always delete any existing cookie for this key to keep HTTP headers clean
    deleteCookie(key, '/')
  } catch (err) {
    console.warn(`Error setting localStorage for key ${key}:`, err)
  }
}

export function removeStorageCookie(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
  deleteCookie(key, '/')
}
