import { CustomLoader } from '@/components/custom-loader'

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
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
