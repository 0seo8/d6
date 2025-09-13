"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getCrawlerLogs,
  getCronJobStatus,
  triggerCrawlerManually,
  getNextCrawlerRun,
  checkSupabaseCrawlerHealth,
  CrawlerLog,
  CronJobStatus
} from "@/lib/api/supabase-chart";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Play,
  RefreshCw,
  Server,
  TrendingUp,
  XCircle,
  Zap,
  AlertTriangle,
  Timer,
  Database,
  Cloud
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { KnockNotifications } from "@/components/admin/knock-notifications";
import { 
  checkCrawlerHealthAndNotify, 
  checkAPIUsageAndNotify,
  setupCrawlerNotifications 
} from "@/lib/knock/crawler-alerts";

export default function CrawlerAdminPage() {
  const [crawlerLogs, setCrawlerLogs] = useState<CrawlerLog[]>([]);
  const [cronStatus, setCronStatus] = useState<CronJobStatus | null>(null);
  const [nextRun, setNextRun] = useState<string | null>(null);
  const [health, setHealth] = useState<{
    available: boolean;
    lastRun: string | null;
    nextRun: string | null;
    recentErrors: number;
    message: string;
  } | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerMessage, setTriggerMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countDown, setCountDown] = useState(30);
  const [notificationsSetup, setNotificationsSetup] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [logs, status, next, healthCheck] = await Promise.all([
        getCrawlerLogs(50),
        getCronJobStatus(),
        getNextCrawlerRun(),
        checkSupabaseCrawlerHealth()
      ]);

      setCrawlerLogs(logs);
      setCronStatus(status);
      setNextRun(next);
      setHealth(healthCheck);

      // Setup notifications if not already done
      if (!notificationsSetup) {
        try {
          await setupCrawlerNotifications(
            "admin-user", // In real app, use actual user ID
            "admin@day6stream.com", // In real app, use actual email
            "관리자"
          );
          setNotificationsSetup(true);
        } catch (error) {
          console.error("Failed to setup notifications:", error);
        }
      }

      // Check for health issues and send notifications
      if (logs.length > 0 && healthCheck) {
        await checkCrawlerHealthAndNotify(logs, status, "admin-user");
        
        // Check API usage
        const usage = {
          edgeFunctions: { used: 720, limit: 500000 },
          database: { used: 72, limit: 500 },
          apiRequests: { used: 30000, limit: 50000 }
        };
        await checkAPIUsageAndNotify(usage, "admin-user");
      }
    } catch (error) {
      console.error("Error loading crawler admin data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTriggerCrawler = async () => {
    setIsTriggering(true);
    setTriggerMessage("");
    
    try {
      const result = await triggerCrawlerManually();
      setTriggerMessage(result.message);
      
      if (result.success) {
        // Visual feedback
        setTimeout(() => {
          loadData();
          setTriggerMessage("");
        }, 2000);
      }
    } catch (error) {
      setTriggerMessage("크롤러 실행 실패");
    } finally {
      setIsTriggering(false);
    }
  };

  useEffect(() => {
    loadData();
    
    if (autoRefresh) {
      const interval = setInterval(() => {
        loadData();
        setCountDown(30);
      }, 30000);
      
      const countdownInterval = setInterval(() => {
        setCountDown(prev => prev > 0 ? prev - 1 : 30);
      }, 1000);
      
      return () => {
        clearInterval(interval);
        clearInterval(countdownInterval);
      };
    }
  }, [loadData, autoRefresh]);

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "없음";
    const date = new Date(timeString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "방금 전";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    
    return date.toLocaleString("ko-KR", {
      timeZone: "Asia/Seoul",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 text-white flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            성공
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500 text-white flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            실패
          </Badge>
        );
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  // Calculate statistics for charts
  const platformStats = crawlerLogs.reduce((acc, log) => {
    if (!acc[log.platform]) {
      acc[log.platform] = { success: 0, failed: 0, total: 0 };
    }
    acc[log.platform].total++;
    if (log.status === 'success') {
      acc[log.platform].success++;
    } else {
      acc[log.platform].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number; total: number }>);

  const pieData = Object.entries(platformStats).map(([platform, stats]) => ({
    name: platform.toUpperCase(),
    value: stats.success,
    total: stats.total,
    successRate: Math.round((stats.success / stats.total) * 100)
  }));

  const COLORS = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444'];

  // Timeline data for last 24 hours
  const timelineData = crawlerLogs
    .slice(0, 24)
    .reverse()
    .map(log => ({
      time: new Date(log.created_at).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      songs: log.songs_found || 0,
      executionTime: log.execution_time || 0,
      platform: log.platform
    }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-300">데이터 로딩 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                차트 크롤러 관리
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                실시간 차트 데이터 수집 시스템 모니터링
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 flex items-center gap-2">
                <Timer className="w-3 h-3" />
                {autoRefresh ? `${countDown}초 후 새로고침` : '자동 새로고침 꺼짐'}
              </Badge>
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                size="sm"
              >
                {autoRefresh ? '자동 새로고침 끄기' : '자동 새로고침 켜기'}
              </Button>
              
              {/* Knock Notifications */}
              <KnockNotifications 
                userId="admin-user"
                userToken="admin-token"
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">시스템 상태</p>
                  <p className="text-2xl font-bold mt-1">
                    {health?.available ? '정상 작동' : '비활성'}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${health?.available ? 'bg-green-100' : 'bg-red-100'}`}>
                  {health?.available ? (
                    <Activity className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">성공률</p>
                  <p className="text-2xl font-bold mt-1">
                    {cronStatus && cronStatus.run_count > 0
                      ? `${Math.round((cronStatus.success_count / cronStatus.run_count) * 100)}%`
                      : '0%'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-100">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">마지막 실행</p>
                  <p className="text-2xl font-bold mt-1">
                    {formatTime(health?.lastRun)}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-100">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">24시간 에러</p>
                  <p className="text-2xl font-bold mt-1">
                    {health?.recentErrors || 0}건
                  </p>
                </div>
                <div className={`p-3 rounded-full ${health?.recentErrors === 0 ? 'bg-green-100' : 'bg-orange-100'}`}>
                  {health?.recentErrors === 0 ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              개요
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              차트
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Server className="w-4 h-4" />
              로그
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              제어
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Health Status Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    시스템 상태
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">크롤러 엔진</span>
                      <Badge className={health?.available ? "bg-green-500" : "bg-red-500"}>
                        {health?.available ? "활성화" : "비활성화"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">다음 실행</span>
                      <span className="text-sm font-mono">{formatTime(nextRun)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">스케줄</span>
                      <Badge variant="outline">{cronStatus?.schedule || "설정 안 됨"}</Badge>
                    </div>
                    <Progress 
                      value={health?.available ? 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Performance Card */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    성능 지표
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">총 실행 횟수</span>
                      <span className="font-bold">{cronStatus?.run_count || 0}회</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">성공</span>
                      <span className="font-bold text-green-600">{cronStatus?.success_count || 0}회</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <span className="text-sm font-medium">실패</span>
                      <span className="font-bold text-red-600">{cronStatus?.failure_count || 0}회</span>
                    </div>
                    <Progress 
                      value={cronStatus?.run_count ? (cronStatus.success_count / cronStatus.run_count) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Comparison */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cloud className="w-5 h-5" />
                  시스템 비교
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      GitHub Actions (기존)
                    </h3>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        10-50분 지연 발생
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        시간당 1회로 제한
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        GitHub 인프라 의존
                      </li>
                      <li className="flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                        실시간 모니터링 불가
                      </li>
                    </ul>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                      Supabase Edge (신규)
                    </h3>
                    <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        ±30초 정확도
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        유연한 스케줄링
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        전용 인프라
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" />
                        실시간 모니터링
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Platform Success Rate Pie Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>플랫폼별 성공률</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, successRate }) => `${name}: ${successRate}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Execution Timeline */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>실행 타임라인 (24시간)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="songs" 
                        stroke="#8884d8" 
                        name="수집 곡 수"
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="executionTime" 
                        stroke="#82ca9d" 
                        name="실행 시간(ms)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Platform Statistics Table */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>플랫폼별 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">플랫폼</th>
                        <th className="text-left p-3">총 실행</th>
                        <th className="text-left p-3">성공</th>
                        <th className="text-left p-3">실패</th>
                        <th className="text-left p-3">성공률</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(platformStats).map(([platform, stats]) => (
                        <tr key={platform} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-3 capitalize font-medium">{platform}</td>
                          <td className="p-3">{stats.total}</td>
                          <td className="p-3 text-green-600">{stats.success}</td>
                          <td className="p-3 text-red-600">{stats.failed}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Progress 
                                value={(stats.success / stats.total) * 100} 
                                className="h-2 w-20"
                              />
                              <span className="text-sm">
                                {Math.round((stats.success / stats.total) * 100)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>최근 실행 로그</span>
                  <Button 
                    onClick={loadData}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    새로고침
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:bg-gray-800">
                        <th className="text-left p-3 font-medium">시간</th>
                        <th className="text-left p-3 font-medium">플랫폼</th>
                        <th className="text-left p-3 font-medium">상태</th>
                        <th className="text-left p-3 font-medium">수집 곡</th>
                        <th className="text-left p-3 font-medium">실행 시간</th>
                        <th className="text-left p-3 font-medium">에러</th>
                      </tr>
                    </thead>
                    <tbody>
                      {crawlerLogs.length > 0 ? (
                        crawlerLogs.map((log) => (
                          <tr key={log.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="p-3 text-sm">
                              {formatTime(log.created_at)}
                            </td>
                            <td className="p-3 capitalize font-medium">{log.platform}</td>
                            <td className="p-3">{getStatusBadge(log.status)}</td>
                            <td className="p-3">{log.songs_found || 0}곡</td>
                            <td className="p-3">
                              {log.execution_time ? (
                                <Badge variant="outline">{log.execution_time}ms</Badge>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="p-3 text-xs text-red-600 max-w-xs">
                              {log.error_message && (
                                <span className="truncate block" title={log.error_message}>
                                  {log.error_message}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-gray-500">
                            아직 로그가 없습니다
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  수동 제어
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={handleTriggerCrawler} 
                      disabled={isTriggering}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white flex items-center gap-2"
                    >
                      {isTriggering ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          실행 중...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          지금 크롤러 실행
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={loadData}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      데이터 새로고침
                    </Button>
                  </div>
                  
                  {triggerMessage && (
                    <div className={`p-3 rounded-lg flex items-center gap-2 ${
                      triggerMessage.includes('성공') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {triggerMessage.includes('성공') ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      {triggerMessage}
                    </div>
                  )}

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      무료 요금제 사용량
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Edge Function 실행</span>
                        <span className="font-mono">720 / 500,000 (0.14%)</span>
                      </div>
                      <Progress value={0.14} className="h-2" />
                      <div className="flex justify-between">
                        <span>데이터베이스 용량</span>
                        <span className="font-mono">72MB / 500MB (14%)</span>
                      </div>
                      <Progress value={14} className="h-2" />
                      <div className="flex justify-between">
                        <span>API 요청</span>
                        <span className="font-mono">30,000 / 50,000 (60%)</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Settings */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  스케줄 설정
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">현재 스케줄</span>
                      <Badge>{cronStatus?.schedule || '0 * * * *'}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      매시간 정각에 실행됩니다
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="text-sm">
                      30분마다 (월 1,440회)
                    </Button>
                    <Button variant="outline" className="text-sm">
                      2시간마다 (월 360회)
                    </Button>
                    <Button variant="outline" className="text-sm">
                      4시간마다 (월 180회)
                    </Button>
                    <Button variant="outline" className="text-sm">
                      6시간마다 (월 120회)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}