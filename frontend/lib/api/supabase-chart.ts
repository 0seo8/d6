import { supabase } from "@/lib/supabase/client";
import { ChartData } from "@/lib/types";

export interface CrawlerLog {
  id: string;
  platform: string;
  status: string;
  execution_time: number | null;
  songs_found: number | null;
  error_message: string | null;
  error_type: string | null;
  github_run_id: string | null;
  created_at: string;
  metadata: unknown | null;
}

export interface CronJobStatus {
  job_name: string;
  schedule: string;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
  run_count: number;
  success_count: number;
  failure_count: number;
  metadata: unknown | null;
}

/**
 * Fetch latest chart data from Supabase
 */
export async function fetchSupabaseChartData(): Promise<ChartData | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return null;
    }

    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'latest_chart_data')
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching chart data from Supabase:', error);
      return null;
    }

    if (!data?.value) {
      console.warn('No chart data found in Supabase');
      return null;
    }

    const chartData = data.value as ChartData;
    
    // Validate data structure
    if (!chartData.collectedAtKST || !chartData.artist) {
      console.warn('Invalid chart data structure from Supabase');
      return null;
    }

    console.log('Successfully fetched chart data from Supabase:', {
      collectedAtKST: chartData.collectedAtKST,
      platforms: Object.keys(chartData).filter(key => 
        Array.isArray((chartData as any)[key])
      )
    });

    return chartData;
  } catch (error) {
    console.error('Error in fetchSupabaseChartData:', error);
    return null;
  }
}

/**
 * Get crawler execution logs
 */
export async function getCrawlerLogs(limit = 50): Promise<CrawlerLog[]> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return [];
    }

    const { data, error } = await supabase
      .from('crawler_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching crawler logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCrawlerLogs:', error);
    return [];
  }
}

/**
 * Get cron job status
 */
export async function getCronJobStatus(): Promise<CronJobStatus | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return null;
    }

    const { data, error } = await supabase
      .from('cron_jobs')
      .select('*')
      .eq('job_name', 'chart_crawler_hourly')
      .single();

    if (error) {
      console.error('Error fetching cron job status:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getCronJobStatus:', error);
    return null;
  }
}

/**
 * Manually trigger chart crawler
 */
export async function triggerCrawlerManually(): Promise<{ success: boolean; message: string }> {
  try {
    if (!supabase) {
      return { success: false, message: 'Supabase client not available' };
    }

    const { data, error } = await supabase.rpc('trigger_chart_crawler_now');

    if (error) {
      console.error('Error triggering crawler:', error);
      return { success: false, message: error.message };
    }

    return { 
      success: true, 
      message: data?.message || 'Chart crawler triggered successfully' 
    };
  } catch (error) {
    console.error('Error in triggerCrawlerManually:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get next scheduled crawler run time in KST
 */
export async function getNextCrawlerRun(): Promise<string | null> {
  try {
    if (!supabase) {
      console.warn('Supabase client not available');
      return null;
    }

    const { data, error } = await supabase.rpc('get_next_crawler_run_kst');

    if (error) {
      console.error('Error getting next crawler run:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getNextCrawlerRun:', error);
    return null;
  }
}

/**
 * Check if Supabase-based crawling is available and working
 */
export async function checkSupabaseCrawlerHealth(): Promise<{
  available: boolean;
  lastRun: string | null;
  nextRun: string | null;
  recentErrors: number;
  message: string;
}> {
  try {
    if (!supabase) {
      return {
        available: false,
        lastRun: null,
        nextRun: null,
        recentErrors: 0,
        message: 'Supabase client not available'
      };
    }

    // Check cron job status
    const cronStatus = await getCronJobStatus();
    
    // Check recent crawler logs for errors
    const recentLogs = await getCrawlerLogs(20);
    const recentErrors = recentLogs.filter(log => 
      log.status === 'failed' && 
      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length;

    const nextRun = await getNextCrawlerRun();

    return {
      available: !!cronStatus && cronStatus.enabled,
      lastRun: cronStatus?.last_run || null,
      nextRun,
      recentErrors,
      message: cronStatus?.enabled 
        ? 'Supabase crawler is active and scheduled'
        : 'Supabase crawler is not properly configured'
    };
  } catch (error) {
    console.error('Error checking Supabase crawler health:', error);
    return {
      available: false,
      lastRun: null,
      nextRun: null,
      recentErrors: 0,
      message: 'Error checking crawler health'
    };
  }
}