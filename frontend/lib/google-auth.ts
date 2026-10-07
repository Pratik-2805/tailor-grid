import { toast } from 'react-toastify'
import { type User } from '../components/data'
import { getAuthRole, getAuthToken, setAuthRole, setAuthToken, setAuthUser, setRefreshToken } from './cookies'
import { getStudioUrl, loginWithGoogle } from './api'

export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '927264064365-eki90ht1ko6aba8n0pnoiq6bvhql0l9m.apps.googleusercontent.com'

export function triggerStudioGoogleAuth(options?: {
  onSuccess?: (user: User) => void
  onError?: (err: any) => void
  onLoading?: (loading: boolean) => void
}) {
  const role = getAuthRole()
  const token = getAuthToken()
  if (role === 'STUDIO' && token) {
    window.location.href = getStudioUrl('/', token)
    return
  }

  options?.onLoading?.(true)

  if (typeof window === 'undefined' || !(window as any).google?.accounts?.oauth2) {
    options?.onLoading?.(false)
    if (typeof window !== 'undefined' && !document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      document.head.appendChild(s)
    }
    toast.info('Google sign-in service is initializing. Please try again in a moment.', { position: 'top-center' })
    return
  }

  try {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'email profile openid',
      callback: async (tokenResponse: any) => {
        if (tokenResponse?.error) {
          options?.onLoading?.(false)
          if (tokenResponse.error === 'popup_closed' || tokenResponse.error === 'access_denied') {
            toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
          } else {
            toast.error(`Google sign-in error: ${tokenResponse.error}`, { position: 'top-center' })
          }
          options?.onError?.(tokenResponse.error)
          return
        }

        if (!tokenResponse?.access_token) {
          options?.onLoading?.(false)
          toast.warning('Google sign-in was cancelled.', { position: 'top-center' })
          return
        }

        try {
          const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          const profile = await profileRes.json()

          const result = await loginWithGoogle({
            accessToken: tokenResponse.access_token,
            role: 'STUDIO',
            profile: {
              name: profile.name || 'Studio Partner',
              contact: profile.email,
              email: profile.email,
              avatar: profile.picture,
              method: 'google',
              role: 'STUDIO',
            },
          })

          options?.onLoading?.(false)

          if (result?.user) {
            if (result.refreshToken) setRefreshToken(result.refreshToken)
            if (result.token) setAuthToken(result.token)
            setAuthRole('STUDIO')
            setAuthUser(result.user)

            toast.success(`Welcome to Darzi Studio, ${result.user.name || 'Studio Partner'}! Redirecting...`, {
              position: 'top-center',
            })

            options?.onSuccess?.(result.user)

            const targetParam = result.refreshToken || result.authCode || result.token
            if (targetParam) {
              window.location.href = getStudioUrl('/auth/callback', targetParam)
            } else {
              window.location.href = getStudioUrl('/')
            }
          }
        } catch (err: any) {
          options?.onLoading?.(false)
          const msg = err.message || 'Google sign-in failed.'
          toast.error(msg, { position: 'top-center' })
          options?.onError?.(err)
        }
      },
      error_callback: (err: any) => {
        options?.onLoading?.(false)
        toast.error('Google sign-in popup was blocked by your browser. Please allow popups for this site.', {
          position: 'top-center',
        })
        options?.onError?.(err)
      },
    })

    tokenClient.requestAccessToken()
  } catch (err: any) {
    options?.onLoading?.(false)
    toast.error(err.message || 'Google sign-in initialization failed.', { position: 'top-center' })
    options?.onError?.(err)
  }
}
