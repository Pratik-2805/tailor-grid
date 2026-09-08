'use client'

import { AdminView } from '@/components/admin-view'
import { useApp } from '@/components/app-provider'

export default function AdminPage() {
  const { navigate, user, openAuth } = useApp()

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="py-24 text-center bg-[#FAF8F5] min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="size-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-4">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-[#0F1115]">Admin Access Required</h2>
        <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
          The Operations Admin workspace is restricted. Please sign in with an authorized administrator account to continue.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => openAuth('CUSTOMER')}
            className="rounded-xl bg-[#0F1115] hover:bg-black text-white px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('home')}
            className="rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-5 py-2.5 text-xs font-bold transition-all cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return <AdminView go={navigate} />
}
