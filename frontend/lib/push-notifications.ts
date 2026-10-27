import { API_ROUTES, getApiUrl } from './api-routes'

/**
 * Convert standard base64 URL-safe VAPID key to Uint8Array required by PushManager
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Check whether Web Push Notifications are supported by the current browser environment.
 */
export function isPushSupported(): boolean {
  if (typeof window === 'undefined') return false
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

/**
 * Return current Notification permission state.
 */
export function getNotificationPermissionState(): NotificationPermission {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  return Notification.permission
}

/**
 * Ensure Service Worker is registered.
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })
    await navigator.serviceWorker.ready
    return registration
  } catch (err) {
    console.error('Customer service worker registration failed:', err)
    return null
  }
}

/**
 * Fetch the VAPID Public Key from the Raffu Backend.
 */
export async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch(getApiUrl(API_ROUTES.PUSH.VAPID_KEY))
    if (!res.ok) return null
    const data = await res.json()
    return data.publicKey || null
  } catch (err) {
    console.error('Failed to fetch VAPID public key:', err)
    return null
  }
}

/**
 * Request permission and subscribe current device to push notifications.
 */
export async function subscribeToPush(options: {
  userId?: string | null
}): Promise<{ success: boolean; message: string; subscription?: PushSubscription }> {
  if (!isPushSupported()) {
    return {
      success: false,
      message: 'Push notifications are not supported by this browser.',
    }
  }

  // 1. Request user permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return {
      success: false,
      message:
        permission === 'denied'
          ? 'Notifications are blocked in your browser settings. Please allow notifications for this site to receive order updates.'
          : 'Notification permission dismissed.',
    }
  }

  // 2. Fetch VAPID key
  const publicKey = await fetchVapidPublicKey()
  if (!publicKey) {
    return {
      success: false,
      message: 'Server push notification keys are not configured.',
    }
  }

  // 3. Register service worker and subscribe
  const registration = await registerServiceWorker()
  if (!registration) {
    return {
      success: false,
      message: 'Failed to initialize background service worker.',
    }
  }

  try {
    const applicationServerKey = urlBase64ToUint8Array(publicKey)
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      })
    }

    // 4. Send subscription object to Raffu Backend
    const subJSON = subscription.toJSON()
    const response = await fetch(getApiUrl(API_ROUTES.PUSH.SUBSCRIBE), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: subJSON,
        userId: options.userId || null,
        userAgent: navigator.userAgent,
      }),
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(errData.message || 'Failed to save subscription on server')
    }

    return {
      success: true,
      message: 'Live order push alerts enabled successfully!',
      subscription,
    }
  } catch (err: any) {
    console.error('Push subscription error:', err)
    return {
      success: false,
      message: err.message || 'Error subscribing to push notifications.',
    }
  }
}

/**
 * Trigger a test push notification to verify the end-to-end connection.
 */
export async function sendTestPush(userId?: string | null): Promise<boolean> {
  try {
    const res = await fetch(getApiUrl(API_ROUTES.PUSH.TEST), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })
    return res.ok
  } catch (err) {
    console.error('Test push error:', err)
    return false
  }
}

/**
 * Unsubscribe current device from push notifications.
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported()) return false

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      const endpoint = subscription.endpoint
      await subscription.unsubscribe()

      // Notify backend
      await fetch(getApiUrl(API_ROUTES.PUSH.UNSUBSCRIBE), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      })
    }
    return true
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return false
  }
}
