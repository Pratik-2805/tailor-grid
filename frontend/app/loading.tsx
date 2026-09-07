import { CustomLoader } from '@/components/custom-loader'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
      <CustomLoader
        size="lg"
        variant="atelier"
        text="Loading Master Tailor experience"
        steps={[
          'Loading Master Tailor experience',
          'Preparing bespoke alterations',
          'Connecting to Savile Row network',
        ]}
        subtext="Please wait a moment while we set up your workshop"
      />
    </div>
  )
}
