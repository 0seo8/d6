import { 
  sendNotification, 
  sendBatchNotifications,
  KNOCK_WORKFLOWS,
  identifyUser 
} from "./client";
import { CrawlerLog, CronJobStatus } from "@/lib/api/supabase-chart";

// Alert thresholds
const THRESHOLDS = {
  ERROR_RATE_WARNING: 0.2,  // 20% error rate
  ERROR_RATE_CRITICAL: 0.5, // 50% error rate
  SUCCESS_RATE_LOW: 0.8,     // 80% success rate
  API_USAGE_WARNING: 0.8,   // 80% of limit
  API_USAGE_CRITICAL: 0.95, // 95% of limit
  CONSECUTIVE_FAILURES: 3,   // 3 failures in a row
};

// Check crawler health and send alerts
export async function checkCrawlerHealthAndNotify(
  logs: CrawlerLog[],
  cronStatus: CronJobStatus | null,
  userId: string
) {
  const alerts: Array<{
    workflow: string;
    data: any;
  }> = [];

  // Check system status
  if (!cronStatus?.enabled) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.SYSTEM_DOWN,
      data: {
        title: "🔴 크롤러 시스템 비활성",
        message: "크롤러 시스템이 현재 작동하지 않습니다. 즉시 확인이 필요합니다.",
        severity: "critical",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler",
        actionLabel: "시스템 확인하기",
      },
    });
  }

  // Check error rate
  if (cronStatus && cronStatus.run_count > 0) {
    const errorRate = cronStatus.failure_count / cronStatus.run_count;
    
    if (errorRate >= THRESHOLDS.ERROR_RATE_CRITICAL) {
      alerts.push({
        workflow: KNOCK_WORKFLOWS.HIGH_ERROR_RATE,
        data: {
          title: "🚨 높은 에러율 감지",
          message: `에러율이 ${Math.round(errorRate * 100)}%에 도달했습니다. (임계값: 50%)`,
          severity: "error",
          errorCount: cronStatus.failure_count,
          timestamp: new Date().toISOString(),
          actionUrl: "/admin/crawler?tab=logs",
          actionLabel: "로그 확인하기",
        },
      });
    } else if (errorRate >= THRESHOLDS.ERROR_RATE_WARNING) {
      alerts.push({
        workflow: KNOCK_WORKFLOWS.HIGH_ERROR_RATE,
        data: {
          title: "⚠️ 에러율 경고",
          message: `에러율이 ${Math.round(errorRate * 100)}%입니다. (경고 임계값: 20%)`,
          severity: "warning",
          errorCount: cronStatus.failure_count,
          timestamp: new Date().toISOString(),
          actionUrl: "/admin/crawler?tab=logs",
          actionLabel: "로그 확인하기",
        },
      });
    }
  }

  // Check success rate
  if (cronStatus && cronStatus.run_count > 0) {
    const successRate = cronStatus.success_count / cronStatus.run_count;
    
    if (successRate < THRESHOLDS.SUCCESS_RATE_LOW) {
      alerts.push({
        workflow: KNOCK_WORKFLOWS.LOW_SUCCESS_RATE,
        data: {
          title: "📉 낮은 성공률",
          message: `성공률이 ${Math.round(successRate * 100)}%로 떨어졌습니다. (목표: 80%)`,
          severity: "warning",
          successRate: Math.round(successRate * 100),
          timestamp: new Date().toISOString(),
          actionUrl: "/admin/crawler?tab=charts",
          actionLabel: "통계 확인하기",
        },
      });
    }
  }

  // Check consecutive failures
  const recentLogs = logs.slice(0, THRESHOLDS.CONSECUTIVE_FAILURES);
  const consecutiveFailures = recentLogs.filter(log => log.status === "failed");
  
  if (consecutiveFailures.length >= THRESHOLDS.CONSECUTIVE_FAILURES) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.CRAWLER_STUCK,
      data: {
        title: "🔄 연속 실패 감지",
        message: `크롤러가 ${consecutiveFailures.length}회 연속 실패했습니다.`,
        severity: "error",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler",
        actionLabel: "즉시 확인하기",
      },
    });
  }

  // Check platform-specific issues
  const platformStats = logs.reduce((acc, log) => {
    if (!acc[log.platform]) {
      acc[log.platform] = { success: 0, failed: 0 };
    }
    if (log.status === "success") {
      acc[log.platform].success++;
    } else {
      acc[log.platform].failed++;
    }
    return acc;
  }, {} as Record<string, { success: number; failed: number }>);

  Object.entries(platformStats).forEach(([platform, stats]) => {
    const total = stats.success + stats.failed;
    if (total > 0) {
      const failureRate = stats.failed / total;
      
      if (failureRate > 0.5) {
        alerts.push({
          workflow: KNOCK_WORKFLOWS.PLATFORM_DOWN,
          data: {
            title: `🔴 ${platform.toUpperCase()} 플랫폼 문제`,
            message: `${platform} 플랫폼의 실패율이 ${Math.round(failureRate * 100)}%입니다.`,
            severity: "error",
            platform,
            timestamp: new Date().toISOString(),
            actionUrl: `/admin/crawler?platform=${platform}`,
            actionLabel: "플랫폼 상태 확인",
          },
        });
      }
    }
  });

  // Send all alerts
  for (const alert of alerts) {
    await sendNotification({
      workflow: alert.workflow,
      recipient: userId,
      data: alert.data,
    });
  }

  return alerts;
}

// Check API usage and send alerts
export async function checkAPIUsageAndNotify(
  usage: {
    edgeFunctions: { used: number; limit: number };
    database: { used: number; limit: number };
    apiRequests: { used: number; limit: number };
  },
  userId: string
) {
  const alerts: Array<{
    workflow: string;
    data: any;
  }> = [];

  // Check Edge Functions usage
  const edgeFunctionUsage = usage.edgeFunctions.used / usage.edgeFunctions.limit;
  if (edgeFunctionUsage >= THRESHOLDS.API_USAGE_CRITICAL) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.API_LIMIT_CRITICAL,
      data: {
        title: "🚨 Edge Function 한도 임박",
        message: `Edge Function 사용량이 ${Math.round(edgeFunctionUsage * 100)}%에 도달했습니다!`,
        severity: "critical",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler?tab=settings",
        actionLabel: "사용량 관리",
      },
    });
  } else if (edgeFunctionUsage >= THRESHOLDS.API_USAGE_WARNING) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.API_LIMIT_WARNING,
      data: {
        title: "⚠️ Edge Function 사용량 경고",
        message: `Edge Function 사용량이 ${Math.round(edgeFunctionUsage * 100)}%입니다.`,
        severity: "warning",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler?tab=settings",
        actionLabel: "사용량 확인",
      },
    });
  }

  // Check API requests usage
  const apiUsage = usage.apiRequests.used / usage.apiRequests.limit;
  if (apiUsage >= THRESHOLDS.API_USAGE_CRITICAL) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.API_LIMIT_CRITICAL,
      data: {
        title: "🚨 API 요청 한도 임박",
        message: `API 요청 사용량이 ${Math.round(apiUsage * 100)}%에 도달했습니다!`,
        severity: "critical",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler?tab=settings",
        actionLabel: "사용량 관리",
      },
    });
  } else if (apiUsage >= THRESHOLDS.API_USAGE_WARNING) {
    alerts.push({
      workflow: KNOCK_WORKFLOWS.API_LIMIT_WARNING,
      data: {
        title: "⚠️ API 요청 사용량 경고",
        message: `API 요청 사용량이 ${Math.round(apiUsage * 100)}%입니다.`,
        severity: "warning",
        timestamp: new Date().toISOString(),
        actionUrl: "/admin/crawler?tab=settings",
        actionLabel: "사용량 확인",
      },
    });
  }

  // Send all alerts
  for (const alert of alerts) {
    await sendNotification({
      workflow: alert.workflow,
      recipient: userId,
      data: alert.data,
    });
  }

  return alerts;
}

// Send success notification
export async function sendCrawlerSuccessNotification(
  platform: string,
  songsFound: number,
  executionTime: number,
  userId: string
) {
  return sendNotification({
    workflow: KNOCK_WORKFLOWS.CRAWLER_SUCCESS,
    recipient: userId,
    data: {
      title: "✅ 크롤링 성공",
      message: `${platform} 플랫폼에서 ${songsFound}곡을 ${executionTime}ms 만에 수집했습니다.`,
      severity: "info",
      platform,
      timestamp: new Date().toISOString(),
    },
  });
}

// Send failure notification
export async function sendCrawlerFailureNotification(
  platform: string,
  error: string,
  userId: string
) {
  return sendNotification({
    workflow: KNOCK_WORKFLOWS.CRAWLER_FAILED,
    recipient: userId,
    data: {
      title: "❌ 크롤링 실패",
      message: `${platform} 플랫폼 크롤링 실패: ${error}`,
      severity: "error",
      platform,
      timestamp: new Date().toISOString(),
      actionUrl: "/admin/crawler?tab=logs",
      actionLabel: "에러 확인",
    },
  });
}

// Setup user for notifications
export async function setupCrawlerNotifications(
  userId: string,
  email: string,
  name?: string
) {
  return identifyUser(userId, {
    email,
    name,
    preferences: {
      email: true,
      push: true,
      inApp: true,
      slack: false,
    },
  });
}