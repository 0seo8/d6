'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const navigation = [
  { name: '대시보드', href: '/admin', icon: '🏠' },
  { name: '차트 표시곡', href: '/admin/chart-songs', icon: '🎵' },
  { name: 'YouTube 관리', href: '/admin/youtube', icon: '📺' },
  { name: '메인 배너', href: '/admin/banners', icon: '🖼️' },
  { name: '스트리밍 플랫폼', href: '/admin/platforms', icon: '🎧' },
  { name: '컴백 일정', href: '/admin/comebacks', icon: '📅' },
  { name: '라디오 프로그램', href: '/admin/radio', icon: '📻' },
  { name: '가이드 관리', href: '/admin/guides', icon: '📖' },
  { name: '크롤러 설정', href: '/admin/crawler', icon: '🤖' },
  { name: '시스템 로그', href: '/admin/logs', icon: '📋' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto p-4">
      <div className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}