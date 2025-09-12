'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 h-16 flex-shrink-0">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            D6 Admin System
          </h1>
          <Badge variant="outline" className="text-green-600 border-green-200">
            온라인
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            관리자: <span className="font-medium">admin@day6.com</span>
          </div>
          <Button variant="outline" size="sm">
            로그아웃
          </Button>
        </div>
      </div>
    </header>
  )
}