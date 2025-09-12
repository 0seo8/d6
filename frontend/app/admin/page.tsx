import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* 대시보드 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">D6 Admin Dashboard</h1>
          <p className="text-gray-600">DAY6 음원총공 관리 시스템</p>
        </div>
        <Badge variant="outline" className="text-green-600">
          시스템 정상 운영
        </Badge>
      </div>

      {/* 주요 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">차트 표시곡</CardTitle>
            <span className="text-2xl">🎵</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              메인페이지 차트에 표시되는 곡 수
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">YouTube 비디오</CardTitle>
            <span className="text-2xl">📺</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              관리 중인 YouTube 비디오
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">스트리밍 플랫폼</CardTitle>
            <span className="text-2xl">🎧</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              연결된 스트리밍 플랫폼
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">마지막 크롤링</CardTitle>
            <span className="text-2xl">🕐</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12분 전</div>
            <p className="text-xs text-muted-foreground">
              차트 데이터 최종 업데이트
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 관리 메뉴 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>주요 관리 메뉴</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              🎵 메인 차트 표시곡 관리
            </Button>
            <Button className="w-full justify-start" variant="outline">
              📺 YouTube 비디오 관리
            </Button>
            <Button className="w-full justify-start" variant="outline">
              🎧 스트리밍 플랫폼 관리
            </Button>
            <Button className="w-full justify-start" variant="outline">
              🖼️ 메인 배너 관리
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>메인 배너 업데이트</span>
                <span className="text-gray-500">5분 전</span>
              </div>
              <div className="flex items-center justify-between">
                <span>차트 표시곡 수정</span>
                <span className="text-gray-500">1시간 전</span>
              </div>
              <div className="flex items-center justify-between">
                <span>YouTube 비디오 추가</span>
                <span className="text-gray-500">3시간 전</span>
              </div>
              <div className="flex items-center justify-between">
                <span>크롤러 설정 변경</span>
                <span className="text-gray-500">1일 전</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}