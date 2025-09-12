'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase/client'

interface StreamingPlatform {
  id: string
  platform_id: string
  name: string
  logo_url?: string
  color?: string
  category: string
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

interface PlatformLink {
  id: string
  platform_id: string
  device_type: string
  link_type: string
  label?: string
  url: string
  id_param_key?: string
  id_separator?: string
  display_order: number
  is_active: boolean
  note?: string
  platform?: StreamingPlatform
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<StreamingPlatform[]>([])
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // 플랫폼 데이터 조회
      const { data: platformsData, error: platformsError } = await supabase
        .from('streaming_platforms')
        .select('*')
        .order('category', { ascending: true })
        .order('display_order', { ascending: true })

      if (platformsError) throw platformsError

      // 플랫폼 링크 데이터 조회
      const { data: linksData, error: linksError } = await supabase
        .from('platform_links')
        .select(`
          *,
          platform:streaming_platforms(name, platform_id)
        `)
        .order('platform_id', { ascending: true })
        .order('device_type', { ascending: true })

      if (linksError) throw linksError

      setPlatforms(platformsData || [])
      setPlatformLinks(linksData || [])
    } catch (error) {
      console.error('Error fetching platforms data:', error)
    } finally {
      setLoading(false)
    }
  }

  const togglePlatformActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('streaming_platforms')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error toggling platform status:', error)
    }
  }

  const toggleLinkActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('platform_links')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      fetchData()
    } catch (error) {
      console.error('Error toggling link status:', error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">스트리밍 플랫폼 관리</h1>
        <div className="text-center py-8">로딩 중...</div>
      </div>
    )
  }

  // 카테고리별로 플랫폼 그룹화
  const groupedPlatforms = platforms.reduce((acc, platform) => {
    const category = platform.category
    if (!acc[category]) acc[category] = []
    acc[category].push(platform)
    return acc
  }, {} as Record<string, StreamingPlatform[]>)

  // 플랫폼별로 링크 그룹화
  const groupedLinks = platformLinks.reduce((acc, link) => {
    const platformId = link.platform_id
    if (!acc[platformId]) acc[platformId] = []
    acc[platformId].push(link)
    return acc
  }, {} as Record<string, PlatformLink[]>)

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">스트리밍 플랫폼 관리</h1>
          <p className="text-gray-600">스트리밍 플랫폼 정보와 딥링크를 관리합니다</p>
        </div>
        <Button>새 플랫폼 추가</Button>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList>
          <TabsTrigger value="platforms">플랫폼 관리</TabsTrigger>
          <TabsTrigger value="links">딥링크 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="space-y-6">
          {/* 플랫폼 목록 */}
          {Object.entries(groupedPlatforms).map(([category, categoryPlatforms]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Badge variant="outline">
                  {category === 'music' ? '음원' : category === 'mv' ? 'MV' : category}
                </Badge>
                <span className="text-sm text-gray-500">({categoryPlatforms.length}개)</span>
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                {categoryPlatforms.map((platform) => (
                  <Card key={platform.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-3">
                          {platform.logo_url && (
                            <img
                              src={platform.logo_url}
                              alt={platform.name}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          {platform.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant={platform.is_active ? "default" : "secondary"}>
                            {platform.is_active ? "활성" : "비활성"}
                          </Badge>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm">
                            #{platform.display_order}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Platform ID</p>
                          <p className="text-sm text-gray-600">{platform.platform_id}</p>
                        </div>

                        {platform.color && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">테마 색상</p>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ 
                                  backgroundColor: platform.color.includes('bg-') 
                                    ? 'var(--mint-primary)' 
                                    : platform.color 
                                }}
                              ></div>
                              <span className="text-sm text-gray-600">{platform.color}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-sm text-gray-500">
                            업데이트: {new Date(platform.updated_at).toLocaleString('ko-KR')}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => togglePlatformActive(platform.id, platform.is_active)}
                            >
                              {platform.is_active ? "비활성화" : "활성화"}
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
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          {/* 딥링크 목록 */}
          {Object.entries(groupedLinks).map(([platformId, links]) => {
            const platform = platforms.find(p => p.id === platformId)
            if (!platform) return null

            return (
              <div key={platformId} className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {platform.logo_url && (
                    <img
                      src={platform.logo_url}
                      alt={platform.name}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  {platform.name}
                  <span className="text-sm text-gray-500">({links.length}개 링크)</span>
                </h2>

                <div className="grid gap-3">
                  {links.map((link) => (
                    <Card key={link.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {link.device_type.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {link.link_type}
                              </Badge>
                              {link.label && (
                                <span className="font-medium">{link.label}</span>
                              )}
                            </div>
                            
                            <div>
                              <p className="text-sm text-gray-600 break-all">
                                {link.url}
                              </p>
                            </div>

                            {link.note && (
                              <div>
                                <p className="text-xs text-gray-500">{link.note}</p>
                              </div>
                            )}

                            {(link.id_param_key || link.id_separator) && (
                              <div className="text-xs text-gray-500">
                                파라미터: {link.id_param_key || 'N/A'} | 
                                구분자: {link.id_separator || 'N/A'}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Badge variant={link.is_active ? "default" : "secondary"}>
                              {link.is_active ? "활성" : "비활성"}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleLinkActive(link.id, link.is_active)}
                            >
                              {link.is_active ? "비활성화" : "활성화"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}

          {platformLinks.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">등록된 플랫폼 링크가 없습니다.</p>
                <Button className="mt-4">첫 번째 링크 추가하기</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}