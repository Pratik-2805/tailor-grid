import type { ReactNode } from 'react'
import { StudioWorkbenchLayout } from '@/components/studio-workbench-layout'

export default function WorkbenchRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return <StudioWorkbenchLayout>{children}</StudioWorkbenchLayout>
}
