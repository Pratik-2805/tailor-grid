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
  const val = getCookie('tg_user')
  if (val) {
    try {
      return JSON.parse(val) as T
    } catch {
      return null
    }
  }
  if (typeof window !== 'undefined') {
    const legacy = localStorage.getItem('tg_user')
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as T
        setAuthUser(parsed)
        localStorage.removeItem('tg_user')
        return parsed
      } catch {
        localStorage.removeItem('tg_user')
      }
    }
  }
  return null
}

export function setAuthUser(user: any): void {
  if (!user) {
    removeAuthUser()
    return
  }
  try {
    setCookie('tg_user', JSON.stringify(user), 30, '/')
  } catch (err) {
    console.error('Error saving user cookie:', err)
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('tg_user')
  }
}

export function removeAuthUser(): void {
  deleteCookie('tg_user', '/')
  if (typeof window !== 'undefined') {
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
    localStorage.removeItem('tg_user_role')
    localStorage.removeItem('tg_screen')
    sessionStorage.removeItem('tg_pending_google')
  }
}

// ================= GENERIC STORAGE COOKIE HELPERS =================

export function getStorageCookie(key: string, defaultValue: string = ''): string {
  const val = getCookie(key)
  if (val !== null) return val
  if (typeof window !== 'undefined') {
    const legacy = localStorage.getItem(key)
    if (legacy !== null) {
      setStorageCookie(key, legacy)
      localStorage.removeItem(key)
      return legacy
    }
  }
  return defaultValue
}

export function setStorageCookie(key: string, value: string, days: number = 30): void {
  setCookie(key, value, days, '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}

export function removeStorageCookie(key: string): void {
  deleteCookie(key, '/')
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key)
  }
}
