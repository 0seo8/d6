'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'

interface ChartSong {
  id: string
  song_title: string
  search_keywords: string[]
  display_order: number
  rotation_enabled: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function ChartSongsPage() {
  const [songs, setSongs] = useState<ChartSong[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChartSongs()
  }, [])

  const fetchChartSongs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('main_chart_display_songs')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setSongs(data || [])
    } catch (error) {
      console.error('Error fetching chart songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('main_chart_display_songs')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchChartSongs() // 새로고침
    } catch (error) {
      console.error('Error toggling song status:', error)
    }
  }

  const toggleRotation = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('main_chart_display_songs')
        .update({ rotation_enabled: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchChartSongs() // 새로고침
    } catch (error) {
      console.error('Error toggling rotation:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">메인 차트 표시곡 관리</h1>
        <div className="text-center py-8">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">메인 차트 표시곡 관리</h1>
          <p className="text-gray-600">메인페이지 실시간 차트에 표시될 곡을 관리합니다</p>
        </div>
        <Button>새 곡 추가</Button>
      </div>

      {/* 현재 설정된 곡들 */}
      <div className="grid gap-4">
        {songs.map((song, index) => (
          <Card key={song.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-normal">
                    #{song.display_order}
                  </span>
                  {song.song_title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={song.is_active ? "default" : "secondary"}>
                    {song.is_active ? "활성" : "비활성"}
                  </Badge>
                  <Badge variant={song.rotation_enabled ? "outline" : "secondary"}>
                    {song.rotation_enabled ? "로테이션 ON" : "로테이션 OFF"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">검색 키워드</p>
                  <div className="flex flex-wrap gap-1">
                    {song.search_keywords.map((keyword, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="text-sm text-gray-500">
                    업데이트: {new Date(song.updated_at).toLocaleString('ko-KR')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRotation(song.id, song.rotation_enabled)}
                    >
                      {song.rotation_enabled ? "로테이션 OFF" : "로테이션 ON"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(song.id, song.is_active)}
                    >
                      {song.is_active ? "비활성화" : "활성화"}
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

      {songs.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">등록된 차트 표시곡이 없습니다.</p>
            <Button className="mt-4">첫 번째 곡 추가하기</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}