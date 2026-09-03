import { type User, type FittingBooking, type StoreOption, type GarmentCategory, PARTNER_STORES, getClosestStoreForLocation } from '../components/data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const STUDIO_BASE_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ||
  (process.env.NEXT_PUBLIC_STUDIO_PORT ? `http://localhost:${process.env.NEXT_PUBLIC_STUDIO_PORT}` : 'http://localhost:3001')

export function getStudioUrl(path: string = '', token?: string | null): string {
  const base = STUDIO_BASE_URL.replace(/\/$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const url = `${base}${cleanPath}`
  if (token) {
    const separator = url.includes('?') ? '&' : '?'
    return `${url}${separator}token=${encodeURIComponent(token)}`
  }
  return url
}

// Send OTP to phone number
export async function sendOtp(phone: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
  try {
    const res = await fetch(`${API_BASE}/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to send OTP code')
    }
    return await res.json()
  } catch (err: any) {
    console.warn('Backend send-otp fallback:', err.message)
    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      demoCode: '4829',
    }
  }
}

// Verify OTP and sign in / register
export async function verifyOtp(params: {
  phone: string
  otp: string
  name?: string
  email?: string
  userId?: string
  role?: 'CUSTOMER' | 'STUDIO'
}): Promise<{ token: string; user: User; hasPhone: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Invalid verification code')
    }

    const data = await res.json()
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', data.token)
      if (data.user) {
        localStorage.setItem('tg_user', JSON.stringify(data.user))
      }
    }
    return data
  } catch (err: any) {
    throw err
  }
}

// Link phone number to existing authenticated user
export async function linkPhone(params: {
  phone: string
  otp?: string
  userId?: string
}): Promise<{ success: boolean; user: User; token: string; hasPhone: boolean }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
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
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', data.token)
    }
    if (data.user && typeof window !== 'undefined') {
      localStorage.setItem('tg_user', JSON.stringify(data.user))
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
}): Promise<{ token: string; user: User; needsPhone?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Google authentication failed')
    }

    const data = await res.json()
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', data.token)
      if (data.user) {
        localStorage.setItem('tg_user', JSON.stringify(data.user))
      }
    }
    return data
  } catch (err: any) {
    throw err
  }
}

export async function signUpUser(data: {
  name: string
  email?: string
  phone?: string
  address?: string
  postcode?: string
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
  storeName?: string
  storeArea?: string
  machines?: string
}): Promise<{ token: string; user: User; needsPhone?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Sign up failed')
    }

    const result = await res.json()
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', result.token)
      if (result.user) {
        localStorage.setItem('tg_user', JSON.stringify(result.user))
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
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Login failed')
    }

    const result = await res.json()
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', result.token)
      if (result.user) {
        localStorage.setItem('tg_user', JSON.stringify(result.user))
      }
    }
    return result
  } catch (err: any) {
    throw err
  }
}

export async function updateUserProfile(updates: Partial<User>): Promise<{ success: boolean; user: User; token?: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
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
  if (typeof window !== 'undefined') {
    try {
      if (data.token) {
        localStorage.setItem('tg_token', data.token)
      }
      if (data.user) {
        localStorage.setItem('tg_user', JSON.stringify(data.user))
      }
    } catch (storageErr) {
      console.warn('LocalStorage quota notice:', storageErr)
    }
  }
  return data
}

export async function getCurrentUser(): Promise<User | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
  if (!token) return null

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      if (data.user) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('tg_user', JSON.stringify(data.user))
        }
        return data.user
      }
    } else if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('tg_token')
        localStorage.removeItem('tg_user')
        localStorage.removeItem('tg_user_role')
      }
      return null
    }
  } catch (err) {
    // API offline fallback to local cache
  }

  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tg_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch { }
    }
  }

  return null
}

export async function fetchOrders(query?: string): Promise<FittingBooking[]> {
  try {
    const url = query ? `${API_BASE}/orders?contact=${encodeURIComponent(query)}` : `${API_BASE}/orders`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.orders || []
  } catch (err) {
    return []
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

export async function fetchOrderById(id: string): Promise<FittingBooking | null> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}`)
    if (!res.ok) return null
    const data = await res.json()
    return data.order || null
  } catch (err) {
    return null
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

export async function createOrder(orderData: any): Promise<{ success: boolean; order?: FittingBooking; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Failed to place order')
    }

    return await res.json()
  } catch (err: any) {
    console.error('Create order error:', err)
    throw err
  }
}

export async function fetchStores(search?: string): Promise<StoreOption[]> {
  try {
    const url = search ? `${API_BASE}/stores?search=${encodeURIComponent(search)}` : `${API_BASE}/stores`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch stores')
    const data = await res.json()
    if (Array.isArray(data.stores) && data.stores.length > 0) {
      const fetched: StoreOption[] = data.stores
      const seen = new Set<string>()
      const combined: StoreOption[] = []

      for (const s of fetched) {
        const key = (s.name || s.id).toLowerCase().trim()
        if (!seen.has(key)) {
          seen.add(key)
          combined.push(s)
        }
      }

      for (const defStore of PARTNER_STORES) {
        const key = (defStore.name || defStore.id).toLowerCase().trim()
        if (!seen.has(key)) {
          seen.add(key)
          combined.push(defStore)
        }
      }
      return combined
    }
    return PARTNER_STORES
  } catch (err) {
    console.warn('Failed to fetch stores, falling back to local list:', err)
    return PARTNER_STORES
  }
}

export async function fetchServices(): Promise<GarmentCategory[]> {
  try {
    const res = await fetch(`${API_BASE}/services`)
    if (!res.ok) throw new Error('Failed to fetch services')
    const data = await res.json()
    if (Array.isArray(data.services) && data.services.length > 0) {
      return data.services
    }
  } catch (err) {
    console.warn('Failed to fetch services from Prisma API:', err)
  }
  return []
}
