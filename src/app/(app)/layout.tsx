import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {children}
      <BottomNav />
    </div>
  )
}
