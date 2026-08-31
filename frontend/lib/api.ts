import { type User, type FittingBooking, type StoreOption, PARTNER_STORES, getClosestStoreForLocation } from '../components/data'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export async function loginWithGoogle(params: {
  idToken?: string
  accessToken?: string
  profile?: Partial<User>
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
}): Promise<{ token: string; user: User }> {
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
    if (params.profile) {
      const fallbackUser: User = {
        name: params.profile.name || 'Google User',
        contact: params.profile.contact || 'google.user@example.com',
        avatar: params.profile.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=google',
        address: params.profile.address || '18 Kensington Church St',
        postcode: params.profile.postcode || 'W8 4EP',
        method: 'google',
        role: params.role || 'CUSTOMER',
      }
      const token = 'mock_token_' + Date.now()
      if (typeof window !== 'undefined') {
        localStorage.setItem('tg_token', token)
        localStorage.setItem('tg_user', JSON.stringify(fallbackUser))
      }
      return { token, user: fallbackUser }
    }
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
}): Promise<{ token: string; user: User }> {
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
  } catch (err) {
    const fallbackUser: User = {
      name: data.name || (data.role === 'STUDIO' ? data.storeName || 'Partner Atelier' : 'Darzi User'),
      contact: data.email || data.phone || 'user@example.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name || 'user')}`,
      address: data.address || '18 Kensington Church St',
      postcode: data.postcode || 'W8 4EP',
      method: data.email ? 'email' : 'mobile',
      role: data.role || 'CUSTOMER',
      studioId: data.role === 'STUDIO' ? 'kensington-atelier' : undefined,
      studioName: data.storeName || (data.role === 'STUDIO' ? 'Kensington Bespoke Atelier' : undefined),
    }
    const token = 'mock_token_' + Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_token', token)
      localStorage.setItem('tg_user', JSON.stringify(fallbackUser))
    }
    return { token, user: fallbackUser }
  }
}

export async function loginUser(data: {
  email?: string
  phone?: string
  role?: 'CUSTOMER' | 'STUDIO' | 'ADMIN'
}): Promise<{ token: string; user: User }> {
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
  } catch (err) {
    const fallbackUser: User = {
      name: data.role === 'STUDIO' ? 'Master Tailor Marco' : 'Darzi Member',
      contact: data.email || data.phone || 'partner@Darzi.com',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.email || 'partner')}`,
      address: '18 Kensington Church St',
      postcode: 'W8 4EP',
      method: data.email ? 'email' : 'mobile',
      role: data.role || 'CUSTOMER',
      studioId: data.role === 'STUDIO' ? 'atelier-soho' : undefined,
      studioName: data.role === 'STUDIO' ? 'Atelier SoHo Tailors' : undefined,
    }
    const token = 'mock_token_' + Date.now()
    if (typeof window !== 'undefined') {
      localStorage.setItem('tg_token', token)
      localStorage.setItem('tg_user', JSON.stringify(fallbackUser))
    }
    return { token, user: fallbackUser }
  }
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
    }
  } catch (err) {
    // API failed or offline
  }

  // Fallback to local stored user
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tg_user')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {}
    }
  }

  return null
}

export async function fetchOrders(email?: string): Promise<FittingBooking[]> {
  try {
    const url = email ? `${API_BASE}/orders?email=${encodeURIComponent(email)}` : `${API_BASE}/orders`
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    return data.orders || []
  } catch (err) {
    return []
  }
}

export async function fetchStudioOrders(storeId?: string): Promise<FittingBooking[]> {
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

export async function fetchStudioStats(storeId?: string): Promise<any> {
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
    const closestStore = getClosestStoreForLocation(orderData.city || orderData.postcode || orderData.customerAddress)
    const newOrder: FittingBooking = {
      id: `TG-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: orderData.customerName || 'Customer',
      customerEmail: orderData.customerEmail || 'customer@example.com',
      customerPhone: orderData.customerPhone || '+44 7700 900000',
      postcode: orderData.postcode || closestStore.postcode,
      garmentId: orderData.garmentId || 'trousers',
      garmentName: orderData.garmentName || 'Trousers & Jeans',
      serviceId: orderData.serviceId || 'trouser-hem',
      serviceName: orderData.serviceName || 'Standard Hemming',
      storeId: orderData.storeId || closestStore.id,
      storeName: orderData.storeName || closestStore.name,
      storeAddress: (orderData.storeAddress || closestStore.address) + (closestStore.area ? `, ${closestStore.area}` : ''),
      date: orderData.date || new Date().toISOString().split('T')[0],
      timeSlot: orderData.timeSlot || '14:00 - 15:00',
      garmentBrand: orderData.garmentBrand || '',
      fitNotes: orderData.fitNotes || '',
      status: 'Allocated',
      price: orderData.price || 25,
      otp: Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
    }
    return { success: true, order: newOrder }
  }
}

export async function fetchStores(search?: string): Promise<StoreOption[]> {
  try {
    const url = search ? `${API_BASE}/stores?search=${encodeURIComponent(search)}` : `${API_BASE}/stores`
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch stores')
    const data = await res.json()
    if (Array.isArray(data.stores) && data.stores.length > 0) {
      // Merge with default stores so verified ones are always present
      const fetched: StoreOption[] = data.stores
      const combined = [...fetched]
      for (const defStore of PARTNER_STORES) {
        if (!combined.some((s) => s.id === defStore.id || s.name.toLowerCase() === defStore.name.toLowerCase())) {
          combined.push(defStore)
        }
      }
      return combined
    }
    return PARTNER_STORES
  } catch (err) {
    console.warn('Using fallback partner stores:', err)
    return PARTNER_STORES
  }
}

