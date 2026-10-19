/**
 * Centralized API Routes Configuration for Raffu Frontend
 * Eliminates all hardcoded API route string literals across the application.
 */

export const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')

export const API_ROUTES = {
  AUTH: {
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    OAUTH_EXCHANGE: '/auth/oauth/exchange',
    SEND_OTP: '/auth/send-otp',
    SEND_EMAIL_OTP: '/auth/send-email-otp',
    VERIFY_EMAIL_OTP: '/auth/verify-email-otp',
    VERIFY_PHONE_OTP: '/auth/verify-phone-otp',
    VERIFY_OTP: '/auth/verify-otp',
    LINK_PHONE: '/auth/link-phone',
    GOOGLE: '/auth/google',
    CHECK_EMAIL: (email: string, role: string = 'STUDIO') =>
      `/auth/check-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`,
    CHECK_PHONE: (phone: string, role: string = 'CUSTOMER') =>
      `/auth/check-phone?phone=${encodeURIComponent(phone)}&role=${encodeURIComponent(role)}`,
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    UPDATE_PROFILE: '/auth/update-profile',
    ME: '/auth/me',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${encodeURIComponent(id)}`,
    STUDIO_STATS: (storeId?: string | null) =>
      storeId ? `/orders/studio/stats?storeId=${encodeURIComponent(storeId)}` : '/orders/studio/stats',
    BY_STORE: (storeId?: string | null) =>
      storeId ? `/orders?storeId=${encodeURIComponent(storeId)}` : '/orders',
    BY_FILTER: (params: string) =>
      params ? `/orders?${params}` : '/orders',
    SEND_OTP_EMAIL: (cleanId: string) => `/orders/${cleanId}/send-otp-email`,
    DISPATCH_START: '/orders/dispatch/start',
    DISPATCH_STATUS: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/dispatch/status`,
    DISPATCH_RETRY: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/dispatch/retry`,
    DISPATCH_CANCEL: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/dispatch/cancel`,
    DISPATCH_SCHEDULE: (orderId: string) => `/orders/${encodeURIComponent(orderId)}/dispatch/schedule`,
  },
  STORES: (search?: string) =>
    search ? `/stores?search=${encodeURIComponent(search)}` : '/stores',
  SERVICES: '/services',
  TAILORS: {
    NEARBY: (queryParams: string) => `/tailors/nearby?${queryParams}`,
  },
  NEWSLETTER: {
    SUBSCRIBE: '/newsletter/subscribe',
  },
} as const

export function getApiUrl(endpointOrPath: string): string {
  const cleanPath = endpointOrPath.startsWith('/') ? endpointOrPath : `/${endpointOrPath}`
  return API_BASE ? `${API_BASE}${cleanPath}` : cleanPath
}
