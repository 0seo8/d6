-- Enable pg_cron extension for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create cron_jobs table to track scheduled jobs
CREATE TABLE IF NOT EXISTS public.cron_jobs (
  id SERIAL PRIMARY KEY,
  job_name VARCHAR(255) NOT NULL UNIQUE,
  schedule VARCHAR(100) NOT NULL,
  command TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  run_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  metadata JSONB
);

-- Create function to call our chart crawler Edge Function
CREATE OR REPLACE FUNCTION call_chart_crawler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  success BOOLEAN := false;
BEGIN
  start_time := NOW();
  
  BEGIN
    -- Call the Edge Function using HTTP request  
    SELECT net.http_post(
      url := 'https://gxhchzvkdqltyrpvfjmj.supabase.co/functions/v1/chart-crawler',
      headers := jsonb_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGNoenZrZHFsdHlycHZmam1qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzY4MTkwNywiZXhwIjoyMDczMjU3OTA3fQ.example_service_key',
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    ) INTO result;
    
    success := true;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.crawler_logs (
      platform,
      status,
      error_message,
      error_type,
      created_at
    ) VALUES (
      'system',
      'failed',
      SQLERRM,
      SQLSTATE,
      NOW()
    );
    
    success := false;
  END;
  
  end_time := NOW();
  
  -- Update cron job statistics
  UPDATE public.cron_jobs 
  SET 
    last_run = start_time,
    next_run = start_time + INTERVAL '1 hour',
    run_count = run_count + 1,
    success_count = CASE WHEN success THEN success_count + 1 ELSE success_count END,
    failure_count = CASE WHEN NOT success THEN failure_count + 1 ELSE failure_count END,
    updated_at = NOW(),
    metadata = jsonb_build_object(
      'last_execution_time_ms', EXTRACT(EPOCH FROM (end_time - start_time)) * 1000,
      'last_result', result,
      'last_success', success
    )
  WHERE job_name = 'chart_crawler_hourly';
  
END;
$$;

-- Schedule the chart crawler to run every hour at the top of the hour
-- This will run at exactly :00 minutes every hour in KST (UTC+9)
SELECT cron.schedule(
  'chart_crawler_hourly',
  '0 * * * *',  -- Every hour at minute 0
  'SELECT call_chart_crawler();'
);

-- Insert the cron job record
INSERT INTO public.cron_jobs (
  job_name,
  schedule,
  command,
  enabled,
  next_run,
  metadata
) VALUES (
  'chart_crawler_hourly',
  '0 * * * *',
  'SELECT call_chart_crawler();',
  true,
  date_trunc('hour', NOW() + INTERVAL '1 hour'),
  jsonb_build_object(
    'description', 'Hourly chart data crawling from Korean music platforms',
    'timezone', 'Asia/Seoul',
    'created_by', 'migration'
  )
) ON CONFLICT (job_name) DO UPDATE SET
  schedule = EXCLUDED.schedule,
  command = EXCLUDED.command,
  updated_at = NOW();

-- Create function to get next scheduled run time in KST
CREATE OR REPLACE FUNCTION get_next_crawler_run_kst()
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT next_run AT TIME ZONE 'Asia/Seoul'
    FROM public.cron_jobs 
    WHERE job_name = 'chart_crawler_hourly' 
    AND enabled = true
  );
END;
$$;

-- Create function to manually trigger chart crawler
CREATE OR REPLACE FUNCTION trigger_chart_crawler_now()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- Call the crawler function
  PERFORM call_chart_crawler();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Chart crawler triggered successfully',
    'triggered_at', NOW(),
    'next_scheduled_run', get_next_crawler_run_kst()
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION call_chart_crawler() TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_crawler_run_kst() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_chart_crawler_now() TO authenticated;
GRANT SELECT ON public.cron_jobs TO authenticated;
GRANT SELECT, INSERT ON public.crawler_logs TO authenticated;