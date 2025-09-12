'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'

interface YouTubeVideo {
  id: string
  video_id: string
  title: string
  description?: string
  usage_type: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

const USAGE_TYPE_LABELS = {
  stats_display: '메인페이지 통계',
  banner: '메인 배너',
  mv_streaming: 'MV 스트리밍',
  crawler: '크롤러 수집'
}

export default function YouTubePage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchYouTubeVideos()
  }, [])

  const fetchYouTubeVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('*')
        .order('usage_type', { ascending: true })
        .order('display_order', { ascending: true })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching YouTube videos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('youtube_videos')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchYouTubeVideos()
    } catch (error) {
      console.error('Error toggling video status:', error)
    }
  }

  const getYouTubeThumbnail = (videoId: string) => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
  }

  const getYouTubeUrl = (videoId: string) => {
    return `https://www.youtube.com/watch?v=${videoId}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">YouTube 비디오 관리</h1>
        <div className="text-center py-8">로딩 중...</div>
      </div>
    )
  }

  // 용도별로 그룹화
  const groupedVideos = videos.reduce((acc, video) => {
    const type = video.usage_type
    if (!acc[type]) acc[type] = []
    acc[type].push(video)
    return acc
  }, {} as Record<string, YouTubeVideo[]>)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">YouTube 비디오 관리</h1>
          <p className="text-gray-600">메인페이지, 배너, 크롤링에 사용되는 YouTube 비디오를 관리합니다</p>
        </div>
        <Button>새 비디오 추가</Button>
      </div>

      {/* 용도별 비디오 목록 */}
      {Object.entries(groupedVideos).map(([usageType, typeVideos]) => (
        <div key={usageType} className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Badge variant="outline">
              {USAGE_TYPE_LABELS[usageType as keyof typeof USAGE_TYPE_LABELS] || usageType}
            </Badge>
            <span className="text-sm text-gray-500">({typeVideos.length}개)</span>
          </h2>

          <div className="grid gap-4">
            {typeVideos.map((video) => (
              <Card key={video.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-start gap-3">
                      <img
                        src={getYouTubeThumbnail(video.video_id)}
                        alt={video.title}
                        className="w-24 h-16 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`
                        }}
                      />
                      <div>
                        <div>{video.title}</div>
                        <div className="text-sm text-gray-500 font-normal mt-1">
                          Video ID: {video.video_id}
                        </div>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={video.is_active ? "default" : "secondary"}>
                        {video.is_active ? "활성" : "비활성"}
                      </Badge>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                        #{video.display_order}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {video.description && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">설명</p>
                        <p className="text-sm text-gray-600">{video.description}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-sm text-gray-500 space-y-1">
                        <div>업데이트: {new Date(video.updated_at).toLocaleString('ko-KR')}</div>
                        <a
                          href={getYouTubeUrl(video.video_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          YouTube에서 보기 ↗
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(video.id, video.is_active)}
                        >
                          {video.is_active ? "비활성화" : "활성화"}
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
        </div>
      ))}

      {videos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">등록된 YouTube 비디오가 없습니다.</p>
            <Button className="mt-4">첫 번째 비디오 추가하기</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}