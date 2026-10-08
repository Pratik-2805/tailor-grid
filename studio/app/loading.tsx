import { NormalLoader } from '@/components/normal-loader'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
      <NormalLoader />
    </div>
  )
}
