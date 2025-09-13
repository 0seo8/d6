"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Zap
} from "lucide-react";

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionable?: {
    label: string;
    action: () => void;
  };
}

interface CrawlerAlertsProps {
  health: {
    available: boolean;
    recentErrors: number;
  } | null;
  cronStatus: {
    run_count: number;
    success_count: number;
    failure_count: number;
  } | null;
}

export function CrawlerAlerts({ health, cronStatus }: CrawlerAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Generate alerts based on system status
  useEffect(() => {
    const newAlerts: Alert[] = [];
    const now = new Date();

    // System down alert
    if (health && !health.available) {
      newAlerts.push({
        id: 'system-down',
        type: 'error',
        title: '시스템 비활성',
        message: '크롤러 시스템이 현재 작동하지 않습니다. 즉시 확인이 필요합니다.',
        timestamp: now,
        read: false,
        actionable: {
          label: '시스템 재시작',
          action: () => console.log('Restart system')
        }
      });
    }

    // High error rate alert
    if (health && health.recentErrors > 10) {
      newAlerts.push({
        id: 'high-errors',
        type: 'warning',
        title: '높은 에러율 감지',
        message: `최근 24시간 동안 ${health.recentErrors}건의 에러가 발생했습니다.`,
        timestamp: now,
        read: false,
        actionable: {
          label: '로그 확인',
          action: () => document.getElementById('logs-tab')?.click()
        }
      });
    }

    // Low success rate alert
    if (cronStatus && cronStatus.run_count > 0) {
      const successRate = (cronStatus.success_count / cronStatus.run_count) * 100;
      if (successRate < 80) {
        newAlerts.push({
          id: 'low-success',
          type: 'warning',
          title: '낮은 성공률',
          message: `현재 성공률이 ${Math.round(successRate)}%입니다. 목표치 80% 미달.`,
          timestamp: now,
          read: false
        });
      }
    }

    // Free tier usage alerts
    const apiUsage = 60; // Example percentage
    if (apiUsage > 80) {
      newAlerts.push({
        id: 'api-usage',
        type: 'info',
        title: 'API 사용량 경고',
        message: `무료 API 한도의 ${apiUsage}%를 사용했습니다.`,
        timestamp: now,
        read: false,
        actionable: {
          label: '사용량 관리',
          action: () => document.getElementById('settings-tab')?.click()
        }
      });
    }

    // Success alert (if everything is good)
    if (health?.available && health.recentErrors === 0 && 
        cronStatus && cronStatus.run_count > 0 && 
        (cronStatus.success_count / cronStatus.run_count) >= 0.95) {
      newAlerts.push({
        id: 'all-good',
        type: 'success',
        title: '시스템 정상',
        message: '모든 시스템이 정상적으로 작동 중입니다.',
        timestamp: now,
        read: false
      });
    }

    setAlerts(newAlerts);
    setUnreadCount(newAlerts.filter(a => !a.read).length);

    // Send browser notification for critical alerts
    if (notificationsEnabled && newAlerts.some(a => a.type === 'error')) {
      sendBrowserNotification(
        '⚠️ 크롤러 시스템 경고',
        '중요한 알림이 있습니다. 확인해주세요.'
      );
    }
  }, [health, cronStatus, notificationsEnabled]);

  const sendBrowserNotification = async (title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        vibrate: [200, 100, 200]
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        sendBrowserNotification('알림 활성화', '크롤러 시스템 알림이 활성화되었습니다.');
      }
    }
  };

  const markAsRead = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, read: true } : alert
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
    setUnreadCount(0);
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    }
  };

  const getAlertBgColor = (type: Alert['type']) => {
    switch (type) {
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200';
    }
  };

  return (
    <>
      {/* Alert Bell Button */}
      <div className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8">
        <Button
          onClick={() => setShowAlerts(!showAlerts)}
          className="relative rounded-full p-3 shadow-lg bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow"
          variant="outline"
        >
          {notificationsEnabled ? (
            <Bell className="w-6 h-6" />
          ) : (
            <BellOff className="w-6 h-6" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {/* Alert Panel */}
      {showAlerts && (
        <div className="fixed bottom-20 right-6 z-40 w-96 max-w-[calc(100vw-3rem)] md:bottom-24 md:right-8">
          <Card className="shadow-2xl border-0">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                시스템 알림
              </h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    onClick={markAllAsRead}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  >
                    모두 읽음
                  </Button>
                )}
                <Button
                  onClick={() => setShowAlerts(false)}
                  variant="ghost"
                  size="sm"
                  className="p-1"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <CardContent className="p-0 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">알림이 없습니다</p>
                </div>
              ) : (
                <div className="divide-y">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                        !alert.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                      }`}
                      onClick={() => markAsRead(alert.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-medium text-sm">{alert.title}</h4>
                            {!alert.read && (
                              <Badge className="bg-blue-500 text-white text-xs px-1 py-0">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {alert.message}
                          </p>
                          {alert.actionable && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                alert.actionable!.action();
                                setShowAlerts(false);
                              }}
                              variant="link"
                              size="sm"
                              className="mt-2 p-0 h-auto text-blue-600"
                            >
                              {alert.actionable.label} →
                            </Button>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            {alert.timestamp.toLocaleTimeString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            {/* Notification Settings */}
            <div className="p-3 border-t bg-gray-50 dark:bg-gray-800">
              <Button
                onClick={notificationsEnabled ? 
                  () => setNotificationsEnabled(false) : 
                  requestNotificationPermission
                }
                variant="outline"
                size="sm"
                className="w-full text-xs flex items-center gap-2"
              >
                {notificationsEnabled ? (
                  <>
                    <BellOff className="w-3 h-3" />
                    브라우저 알림 끄기
                  </>
                ) : (
                  <>
                    <Bell className="w-3 h-3" />
                    브라우저 알림 켜기
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Inline Alert Banner (for critical alerts) */}
      {alerts.some(a => a.type === 'error' && !a.read) && (
        <div className="fixed top-0 left-0 right-0 z-50 p-2 bg-red-500 text-white">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">
                {alerts.find(a => a.type === 'error')?.message}
              </span>
            </div>
            <Button
              onClick={() => {
                const errorAlert = alerts.find(a => a.type === 'error');
                if (errorAlert) markAsRead(errorAlert.id);
              }}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-red-600 p-1"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}