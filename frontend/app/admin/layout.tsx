import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TODO: 실제 인증 로직 구현
  // const isAuthenticated = await checkAdminAuth()
  // if (!isAuthenticated) {
  //   redirect('/admin/login')
  // }

  return (
    <div className="h-screen w-screen bg-gray-50 overflow-hidden">
      <AdminHeader />
      <div className="flex h-[calc(100vh-4rem)]">
        <AdminSidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}