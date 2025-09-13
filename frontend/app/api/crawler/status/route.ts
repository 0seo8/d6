import { NextResponse } from 'next/server';
import { 
  getCrawlerLogs, 
  getCronJobStatus, 
  checkSupabaseCrawlerHealth,
  getNextCrawlerRun 
} from '@/lib/api/supabase-chart';

export async function GET() {
  try {
    const [health, cronStatus, nextRun, recentLogs] = await Promise.all([
      checkSupabaseCrawlerHealth(),
      getCronJobStatus(),
      getNextCrawlerRun(),
      getCrawlerLogs(10)
    ]);

    // Calculate platform statistics
    const platformStats = recentLogs.reduce((acc, log) => {
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

    // Format response for mobile app
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      system: {
        status: health.available ? 'active' : 'inactive',
        health: health.available ? 'healthy' : 'unhealthy',
        message: health.message,
        lastRun: health.lastRun,
        nextRun: nextRun || health.nextRun,
        recentErrors: health.recentErrors
      },
      performance: {
        totalRuns: cronStatus?.run_count || 0,
        successCount: cronStatus?.success_count || 0,
        failureCount: cronStatus?.failure_count || 0,
        successRate: cronStatus?.run_count > 0 
          ? Math.round((cronStatus.success_count / cronStatus.run_count) * 100)
          : 0
      },
      platforms: Object.entries(platformStats).map(([platform, stats]) => ({
        name: platform,
        total: stats.total,
        success: stats.success,
        failed: stats.failed,
        successRate: stats.total > 0 
          ? Math.round((stats.success / stats.total) * 100)
          : 0
      })),
      recentLogs: recentLogs.map(log => ({
        id: log.id,
        platform: log.platform,
        status: log.status,
        songsFound: log.songs_found || 0,
        executionTime: log.execution_time || 0,
        error: log.error_message || null,
        timestamp: log.created_at
      })),
      usage: {
        edgeFunctions: {
          used: 720,
          limit: 500000,
          percentage: 0.14
        },
        database: {
          used: 72,
          limit: 500,
          percentage: 14,
          unit: 'MB'
        },
        apiRequests: {
          used: 30000,
          limit: 50000,
          percentage: 60
        }
      }
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
  } catch (error) {
    console.error('Crawler status API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch crawler status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}