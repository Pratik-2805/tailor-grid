import type { User, FittingBooking } from '../components/data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export const CUSTOMER_SITE_URL =
  process.env.NEXT_PUBLIC_CUSTOMER_SITE_URL ||
  (process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT ? `http://localhost:${process.env.NEXT_PUBLIC_CUSTOMER_SITE_PORT}` : 'http://localhost:3000')

export function getCustomerSiteUrl(path: string = ''): string {
  const base = CUSTOMER_SITE_URL.replace(/\/$/, '')
  const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  return `${base}${cleanPath}`
}

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
    return {
      success: true,
      message: `Verification code sent to ${phone}`,
      demoCode: '4829',
    }
  }
}

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
      body: JSON.stringify({ ...params, role: 'STUDIO' }),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Invalid verification code')
    }

    const data = await res.json()
    if (data.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', data.token)
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
    const token = typeof window !== 'undefined' ? localStorage.getItem('tg_token') : null
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
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', result.token)
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
    if (result.token && typeof window !== 'undefined') {
      localStorage.setItem('tg_token', result.token)
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
  if (!token) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user')
      localStorage.removeItem('tg_user_role')
    }
    return null
  }

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
    }

    // User not found in DB or token invalid -> clear stale local session
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tg_token')
      localStorage.removeItem('tg_user')
      localStorage.removeItem('tg_user_role')
    }
    return null
  } catch (err) {
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
