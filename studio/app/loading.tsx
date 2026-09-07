import { CustomLoader } from '@/components/custom-loader'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 min-h-screen flex items-center justify-center bg-[#FAF8F5] p-6">
      <CustomLoader
        size="lg"
        variant="atelier"
        text="Accessing Master Workshop"
        steps={[
          'Accessing Master Workshop',
          'Syncing active alteration queue',
          'Connecting to Partner Network',
        ]}
        subtext="Preparing your tailor workbench controls and live telemetry"
      />
    </div>
  )
}
