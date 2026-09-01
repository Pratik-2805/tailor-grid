'use client'

import { AdminView } from '@/components/admin-view'
import { useApp } from '@/components/app-provider'

export default function AdminPage() {
  const { navigate } = useApp()
  return <AdminView go={navigate} />
}
