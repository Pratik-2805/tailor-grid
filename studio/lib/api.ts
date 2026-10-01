import type { User, FittingBooking } from '../components/data'
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getAuthUser,
  setAuthUser,
  removeAuthUser,
  getAuthRole,
  setAuthRole,
  removeAuthRole,
  clearAllAuth,
  clearUnnecessaryDataOnLogin,
} from './cookies'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const CUSTOMER_SITE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ||
  (process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT ? `http://localhost:${process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT}` : 'http://localhost:3000')

export function getCustomerSiteUrl(path: string = ''): string {
  const base = CUSTOMER_SITE_URL.replace(/\/$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${base}${cleanPath}`
}

export async function logoutUser(): Promise<void> {
  try {
    const token = getAuthToken()
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  } catch (err) {
    console.warn('Backend studio logout request notice:', err)
  } finally {
    clearAllAuth()
  }
}

export async function sendOtp(phone: string, forceResend: boolean = false): Promise<{ success: boolean; message: string; phone?: string; cooldown?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, forceResend }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to send verification code')
    }
    return await res.json()
  } catch (err: any) {
    if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('fetch failed'))) {
      throw new Error('Unable to connect to authentication server. Please ensure the backend is running.')
    }
    throw err
  }
}

export async function verifyOtp(params: {
  phone: string
  otp: string
  name?: string
  email?: string
  userId?: string
  role?: 'CUSTOMER' | 'STUDIO'
}): Promise<{
  token?: string
  user?: User
  hasPhone?: boolean
  isNewUser?: boolean
  phone?: string
  message?: string
}> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, role: 'STUDIO' }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Invalid verification code')
    }

    const data = await res.json()
    if (data.token) {
      clearUnnecessaryDataOnLogin()
      setAuthToken(data.token)
      if (data.user) {
        setAuthUser(data.user)
        setAuthRole('STUDIO')
      }
    }
    return data
  } catch (err: any) {
    throw err
  }
}

export async function linkPhone(params: {
  phone: string
  otp?: string
  userId?: string
}): Promise<{ success: boolean; user: User; token: string; hasPhone: boolean }> {
  const token = getAuthToken()
  try {
    const res = await fetch(`${API_BASE}/auth/link-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...params, id: params.userId }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to link mobile number')
    }

    const data = await res.json()
    if (data.token) {
      clearUnnecessaryDataOnLogin()
      setAuthToken(data.token)
    }
    if (data.user) {
      setAuthUser(data.user)
      setAuthRole('STUDIO')
    }
    return data
  } catch (err: any) {
    throw err
  }
}

export async function loginWithGoogle(params: {
  idToken?: string
  accessToken?: string
  profile?: Partial<User>
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  isSignup?: boolean
}): Promise<{ token?: string; user: User; needsPhone?: boolean; isNewUser?: boolean; tempSignupId?: string; expiresIn?: number }> {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, role: 'STUDIO' }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Google authentication failed')
    }

    const data = await res.json()
    if (data.token) {
      clearUnnecessaryDataOnLogin()
      setAuthToken(data.token)
      if (data.user) {
        setAuthUser(data.user)
        setAuthRole('STUDIO')
      }
    }
    return data
  } catch (err: any) {
    throw err
  }
}

export async function checkEmailExists(email: string, role: string = 'STUDIO'): Promise<{ exists: boolean; error?: string; user?: User }> {
  try {
    const res = await fetch(`${API_BASE}/auth/check-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`)
    if (res.ok) {
      return await res.json()
    }
    return { exists: false }
  } catch {
    return { exists: false }
  }
}

export async function signUpUser(data: {
  tempSignupId?: string
  name: string
  email?: string
  phone?: string
  address?: string
  postcode?: string
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  storeName?: string
  storeArea?: string
  machines?: string
  lat?: number
  lng?: number
}): Promise<{ token: string; user: User; needsPhone?: boolean }> {
  try {
    const token = getAuthToken()
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ...data, role: 'STUDIO' }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Sign up failed')
    }

    const result = await res.json()
    if (result.token) {
      clearUnnecessaryDataOnLogin()
      setAuthToken(result.token)
      if (result.user) {
        setAuthUser(result.user)
        setAuthRole('STUDIO')
      }
    }
    return result
  } catch (err: any) {
    throw err
  }
}

export async function loginUser(data: {
  email?: string
  phone?: string
  identifier?: string
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
}): Promise<{ token: string; user: User; needsPhone?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, role: 'STUDIO' }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Login failed')
    }

    const result = await res.json()
    if (result.token) {
      clearUnnecessaryDataOnLogin()
      setAuthToken(result.token)
      if (result.user) {
        setAuthUser(result.user)
        setAuthRole('STUDIO')
      }
    }
    return result
  } catch (err: any) {
    throw err
  }
}

export async function updateUserProfile(updates: Partial<User> & { otp?: string }): Promise<{ success: boolean; user: User; token?: string }> {
  const token = getAuthToken()
  const res = await fetch(`${API_BASE}/auth/update-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(updates),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new Error(errData.error || `Server error (${res.status})`)
  }

  const data = await res.json()
  if (data.token) {
    setAuthToken(data.token)
  }
  if (data.user) {
    setAuthUser(data.user)
    setAuthRole('STUDIO')
  }
  return data
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getAuthToken()
  if (!token) {
    clearAllAuth()
    return null
  }

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        setAuthUser(data.user)
        if (data.user.role === 'STUDIO') {
          setAuthRole('STUDIO')
        }
        return data.user
      }
    }

    // If user is completing registration via Google or mobile, retain pending onboarding session
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload && (payload.type === 'pending_google_signup' || payload.method === 'google') && payload.email) {
        const pendingUser: User = getAuthUser<User>() || {
          id: payload.id || `temp_g_${payload.email}`,
          contact: payload.email,
          email: payload.email,
          name: payload.name || 'Studio Partner',
          role: 'STUDIO',
          method: 'google',
          status: 'INACTIVE',
        }
        return pendingUser
      }
    } catch {}

    // User not found in DB or token expired/invalid -> clear stale session
    clearAllAuth()
    return null
  } catch (err) {
    // Network error (backend unreachable)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload && (payload.type === 'pending_google_signup' || payload.method === 'google') && payload.email) {
        return getAuthUser<User>()
      }
    } catch {}
    clearAllAuth()
    return null
  }
}

export async function fetchStudioOrders(storeId?: string | null): Promise<FittingBooking[]> {
  try {
    const url = storeId ? `${API_BASE}/orders?storeId=${encodeURIComponent(storeId)}` : `${API_BASE}/orders`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.orders || []
  } catch (err) {
    return []
  }
}

export async function fetchStudioStats(storeId?: string | null): Promise<any> {
  try {
    const url = storeId ? `${API_BASE}/orders/studio/stats?storeId=${encodeURIComponent(storeId)}` : `${API_BASE}/orders/studio/stats`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    return data.stats
  } catch (err) {
    return null
  }
}

export async function updateOrder(id: string, updates: Partial<FittingBooking>): Promise<FittingBooking | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.order
  } catch (err) {
    return null
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch (err) {
    return false
  }
}

export interface PendingDispatchRequest {
  orderId: string
  order: any
  distanceMiles: number
  distance: string
  stage: number
  currentRadius: number
  secondsRemaining: number
  payout: number
  customerName: string
  garmentName: string
  serviceName: string
  timeSlot: string
  date: string
}

export async function fetchPendingDispatches(storeId: string): Promise<PendingDispatchRequest[]> {
  try {
    if (!storeId) return []
    const res = await fetch(`${API_BASE}/orders/dispatch/pending?storeId=${encodeURIComponent(storeId)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.pendingRequests || []
  } catch (err) {
    return []
  }
}

export async function respondToDispatch(
  orderId: string,
  tailorId: string,
  action: 'ACCEPT' | 'SKIP'
): Promise<{ success: boolean; message?: string; code?: string; order?: any }> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}/dispatch/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tailorId, action }),
    })
    const data = await res.json()
    return data
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit response' }
  }
}

// ==========================================
// SUPER ADMIN API METHODS
// ==========================================

export async function fetchAdminOverview(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/admin/overview`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch admin overview')
    return await res.json()
  } catch (err) {
    console.error('fetchAdminOverview error:', err)
    return null
  }
}

export async function fetchAdminCustomers(search?: string, status?: string, role: string = 'CUSTOMER'): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (status && status !== 'ALL') params.append('status', status)
    if (role && role !== 'ALL') params.append('role', role)
    const res = await fetch(`${API_BASE}/admin/customers?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch customers')
    const data = await res.json()
    return data.customers || []
  } catch (err) {
    console.error('fetchAdminCustomers error:', err)
    return []
  }
}

export async function createAdminCustomer(data: any): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const resData = await res.json()
    if (!res.ok) return { success: false, error: resData.error || 'Failed to create customer' }
    return { success: true, customer: resData.customer }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateAdminCustomer(id: string, updates: any): Promise<{ success: boolean; customer?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Failed to update customer' }
    return { success: true, customer: data.customer }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteAdminCustomer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/customers/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch (err) {
    return false
  }
}

export async function fetchAdminStudios(search?: string, area?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (area && area !== 'ALL') params.append('area', area)
    const res = await fetch(`${API_BASE}/admin/studios?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch studios')
    const data = await res.json()
    return data.studios || []
  } catch (err) {
    console.error('fetchAdminStudios error:', err)
    return []
  }
}

export async function createAdminStudio(studioData: any): Promise<{ success: boolean; studio?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/studios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studioData),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Failed to create studio' }
    return { success: true, studio: data.studio }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateAdminStudio(id: string, updates: any): Promise<{ success: boolean; studio?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/studios/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Failed to update studio' }
    return { success: true, studio: data.studio }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteAdminStudio(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/studios/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
    return res.ok
  } catch (err) {
    return false
  }
}

export async function fetchAdminOrders(search?: string, status?: string, storeId?: string): Promise<any[]> {
  try {
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    if (status && status !== 'ALL') params.append('status', status)
    if (storeId && storeId !== 'ALL') params.append('storeId', storeId)
    const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) throw new Error('Failed to fetch orders')
    const data = await res.json()
    return data.orders || []
  } catch (err) {
    console.error('fetchAdminOrders error:', err)
    return []
  }
}

export async function updateAdminOrder(id: string, updates: any): Promise<{ success: boolean; order?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error || 'Failed to update order' }
    return { success: true, order: data.order }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function searchAdminGlobal(q: string): Promise<{ customers: any[]; studios: any[]; orders: any[] }> {
  try {
    if (!q || !q.trim()) return { customers: [], studios: [], orders: [] }
    const res = await fetch(`${API_BASE}/admin/search?q=${encodeURIComponent(q.trim())}`, { cache: 'no-store' })
    if (!res.ok) return { customers: [], studios: [], orders: [] }
    const data = await res.json()
    return data.results || { customers: [], studios: [], orders: [] }
  } catch (err) {
    return { customers: [], studios: [], orders: [] }
  }
}

// -------------------------------------------------------------
// SUPER ADMIN AUTH & SESSION HELPERS
// -------------------------------------------------------------
const ADMIN_TOKEN_KEY = 'tg_super_admin_token'
const ADMIN_USER_KEY = 'tg_super_admin_user'

export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || null
  } catch {
    return null
  }
}

export function setAdminToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token)
  } catch {}
}

export function removeAdminToken(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
  } catch {}
}

export function getAdminUser(): any | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAdminUser(user: any): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user))
  } catch {}
}

export function removeAdminUser(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(ADMIN_USER_KEY)
  } catch {}
}

export async function loginSuperAdmin(idOrEmail: string, password: string): Promise<{
  success: boolean
  token?: string
  user?: any
  error?: string
}> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: idOrEmail.trim(), password }),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Authentication failed' }
    }

    setAdminToken(data.token)
    setAdminUser(data.user)
    return { success: true, token: data.token, user: data.user }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error during login' }
  }
}

export async function checkSuperAdminSession(): Promise<any | null> {
  const token = getAdminToken()
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        setAdminUser(data.user)
        return data.user
      }
    }
    // Token is invalid/expired
    removeAdminToken()
    removeAdminUser()
    return null
  } catch {
    // If offline/network glitch, fallback to cached user if token exists
    return getAdminUser()
  }
}

export function logoutSuperAdmin(): void {
  removeAdminToken()
  removeAdminUser()
}



