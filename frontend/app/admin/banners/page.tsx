'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'

interface MainBanner {
  id: string
  title: string
  type: string
  content: any
  start_date?: string
  end_date?: string
  is_default: boolean
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export default function BannersPage() {
  const [banners, setBanners] = useState<MainBanner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('main_banners')
        .select('*')
        .order('priority', { ascending: true })

      if (error) throw error
      setBanners(data || [])
    } catch (error) {
      console.error('Error fetching banners:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('main_banners')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchBanners()
    } catch (error) {
      console.error('Error toggling banner status:', error)
    }
  }

  const toggleDefault = async (id: string, currentStatus: boolean) => {
    try {
      // 기본 배너는 하나만 있어야 하므로, 새로운 기본 배너를 설정하면 기존 것들을 모두 해제
      if (!currentStatus) {
        await supabase
          .from('main_banners')
          .update({ is_default: false })
          .neq('id', id)
      }

      const { error } = await supabase
        .from('main_banners')
        .update({ is_default: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchBanners()
    } catch (error) {
      console.error('Error toggling default banner:', error)
    }
  }

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '설정 없음'
    return new Date(dateString).toLocaleDateString('ko-KR')
  }

  const isActive = (banner: MainBanner) => {
    if (!banner.is_active) return false
    
    const now = new Date()
    const startDate = banner.start_date ? new Date(banner.start_date) : null
    const endDate = banner.end_date ? new Date(banner.end_date) : null

    if (startDate && now < startDate) return false
    if (endDate && now > endDate) return false
    
    return true
  }

  const getStatusBadge = (banner: MainBanner) => {
    if (banner.is_default) {
      return <Badge variant="default" className="bg-green-600">기본 배너</Badge>
    }
    
    if (!banner.is_active) {
      return <Badge variant="secondary">비활성</Badge>
    }

    const now = new Date()
    const startDate = banner.start_date ? new Date(banner.start_date) : null
    const endDate = banner.end_date ? new Date(banner.end_date) : null

    if (startDate && now < startDate) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-700">예약됨</Badge>
    }
    
    if (endDate && now > endDate) {
      return <Badge variant="outline" className="border-red-500 text-red-700">만료됨</Badge>
    }
    
    return <Badge variant="default">활성</Badge>
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">메인 배너 관리</h1>
        <div className="text-center py-8">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">메인 배너 관리</h1>
          <p className="text-gray-600">메인페이지 상단에 표시되는 배너를 관리합니다</p>
        </div>
        <Button>새 배너 추가</Button>
      </div>

      {/* 현재 활성 배너 표시 */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">
            📍 현재 활성 배너
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const activeBanner = banners
              .filter(b => isActive(b))
              .sort((a, b) => b.priority - a.priority)[0]
            
            if (!activeBanner) {
              return <p className="text-blue-700">현재 활성화된 배너가 없습니다.</p>
            }

            return (
              <div className="flex items-center gap-4">
                {activeBanner.type === 'youtube' && activeBanner.content.video_id && (
                  <img
                    src={getYouTubeThumbnail(activeBanner.content.video_id)}
                    alt={activeBanner.title}
                    className="w-24 h-16 object-cover rounded"
                  />
                )}
                <div>
                  <p className="font-medium text-blue-800">{activeBanner.title}</p>
                  <p className="text-sm text-blue-600">
                    우선순위: {activeBanner.priority} | 
                    {activeBanner.is_default ? ' 기본 배너' : ` 일정: ${formatDate(activeBanner.start_date)} ~ ${formatDate(activeBanner.end_date)}`}
                  </p>
                </div>
              </div>
            )
          })()}
        </CardContent>
      </Card>

      {/* 모든 배너 목록 */}
      <div className="grid gap-4">
        {banners.map((banner) => (
          <Card key={banner.id} className={isActive(banner) ? 'border-blue-200' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg flex items-start gap-3">
                  {banner.type === 'youtube' && banner.content.video_id && (
                    <img
                      src={getYouTubeThumbnail(banner.content.video_id)}
                      alt={banner.title}
                      className="w-24 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src = `https://img.youtube.com/vi/${banner.content.video_id}/hqdefault.jpg`
                      }}
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      {banner.title}
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                        우선순위 {banner.priority}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 font-normal mt-1">
                      타입: {banner.type}
                      {banner.type === 'youtube' && banner.content.video_id && (
                        <>  | Video ID: {banner.content.video_id}</>
                      )}
                    </div>
                  </div>
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(banner)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">시작일</p>
                    <p className="text-gray-600">{formatDate(banner.start_date)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">종료일</p>
                    <p className="text-gray-600">{formatDate(banner.end_date)}</p>
                  </div>
                </div>

                {banner.content && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">배너 설정</p>
                    <div className="bg-gray-50 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap">
                        {JSON.stringify(banner.content, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-gray-500">
                    업데이트: {new Date(banner.updated_at).toLocaleString('ko-KR')}
                  </div>
                  <div className="flex gap-2">
                    {!banner.is_default && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDefault(banner.id, banner.is_default)}
                      >
                        기본으로 설정
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(banner.id, banner.is_active)}
                    >
                      {banner.is_active ? "비활성화" : "활성화"}
                    </Button>
                    <Button variant="outline" size="sm">
                      수정
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {banners.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">등록된 배너가 없습니다.</p>
            <Button className="mt-4">첫 번째 배너 추가하기</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}