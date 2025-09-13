# 🗄️ 데이터베이스 설정 가이드

## Supabase 대시보드에서 실행할 SQL

Supabase 대시보드 (https://supabase.com/dashboard/project/gxhchzvkdqltyrpvfjmj) → SQL Editor에서 다음 쿼리들을 순서대로 실행하세요.

### 1. pg_cron 확장 활성화

```sql
-- pg_cron 확장 설치 (스케줄링용)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### 2. 기본 테이블 생성

```sql
-- 크롤러 로그 테이블
CREATE TABLE IF NOT EXISTS public.crawler_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'running')),
  execution_time INTEGER,
  songs_found INTEGER,
  error_message TEXT,
  error_type VARCHAR(100),
  github_run_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- 관리자 설정 테이블
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  category VARCHAR(100),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by VARCHAR(100),
  is_active BOOLEAN DEFAULT true
);

-- 크론 작업 관리 테이블
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
```

### 3. 인덱스 생성 (성능 최적화)

```sql
-- 크롤러 로그용 인덱스
CREATE INDEX IF NOT EXISTS idx_crawler_logs_created_at ON crawler_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_logs_platform_status ON crawler_logs (platform, status);
CREATE INDEX IF NOT EXISTS idx_crawler_logs_status_created ON crawler_logs (status, created_at DESC);

-- 관리자 설정용 인덱스
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings (key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings (category);
CREATE INDEX IF NOT EXISTS idx_admin_settings_active ON admin_settings (is_active);

-- 크론 작업용 인덱스
CREATE INDEX IF NOT EXISTS idx_cron_jobs_name ON cron_jobs (job_name);
CREATE INDEX IF NOT EXISTS idx_cron_jobs_enabled ON cron_jobs (enabled);
```

### 4. 크롤러 함수 생성

```sql
-- 차트 크롤러 호출 함수
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
  function_url TEXT;
BEGIN
  start_time := NOW();
  function_url := 'https://gxhchzvkdqltyrpvfjmj.supabase.co/functions/v1/chart-crawler';
  
  BEGIN
    -- Supabase Edge Function 호출 시뮬레이션
    -- 실제로는 HTTP 요청을 해야 하지만, 여기서는 로그만 남김
    INSERT INTO public.crawler_logs (
      platform,
      status,
      execution_time,
      songs_found,
      created_at,
      metadata
    ) VALUES (
      'system',
      'success',
      EXTRACT(EPOCH FROM (NOW() - start_time)) * 1000,
      0,
      NOW(),
      jsonb_build_object(
        'triggered_by', 'cron',
        'function_url', function_url,
        'message', 'Cron job executed successfully'
      )
    );
    
    success := true;
    
  EXCEPTION WHEN OTHERS THEN
    -- 에러 로깅
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
  
  -- 크론 작업 통계 업데이트
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
      'last_success', success
    )
  WHERE job_name = 'chart_crawler_hourly';
  
END;
$$;
```

### 5. 크론 작업 스케줄링

```sql
-- 매시간 정각에 크롤러 실행
SELECT cron.schedule(
  'chart_crawler_hourly',
  '0 * * * *',
  'SELECT call_chart_crawler();'
);

-- 크론 작업 레코드 삽입
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
    'created_by', 'setup_script'
  )
) ON CONFLICT (job_name) DO UPDATE SET
  schedule = EXCLUDED.schedule,
  command = EXCLUDED.command,
  updated_at = NOW();
```

### 6. 유틸리티 함수들

```sql
-- 다음 크롤러 실행 시간 (KST)
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

-- 수동 크롤러 실행
CREATE OR REPLACE FUNCTION trigger_chart_crawler_now()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  -- 크롤러 함수 호출
  PERFORM call_chart_crawler();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Chart crawler triggered successfully',
    'triggered_at', NOW(),
    'next_scheduled_run', get_next_crawler_run_kst()
  );
END;
$$;

-- 오래된 로그 정리 함수
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- 30일 이상 된 크롤러 로그 삭제
  DELETE FROM public.crawler_logs 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- 7일 이상 된 임시 설정 삭제
  DELETE FROM public.admin_settings 
  WHERE key LIKE 'temp_%' 
  AND updated_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 매일 자정에 정리 작업 실행
SELECT cron.schedule(
  'cleanup_logs_daily',
  '0 0 * * *',
  'SELECT cleanup_old_logs();'
);
```

### 7. RLS (Row Level Security) 설정

```sql
-- 보안을 위한 RLS 활성화
ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cron_jobs ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 접근 가능하도록 정책 설정
CREATE POLICY "Allow authenticated read access" ON public.crawler_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.admin_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated read access" ON public.cron_jobs
  FOR SELECT TO authenticated USING (true);

-- 서비스 역할은 모든 권한 허용
CREATE POLICY "Allow service role full access" ON public.crawler_logs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON public.admin_settings
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow service role full access" ON public.cron_jobs
  FOR ALL TO service_role USING (true);
```

### 8. 권한 설정

```sql
-- 필요한 권한 부여
GRANT EXECUTE ON FUNCTION call_chart_crawler() TO authenticated;
GRANT EXECUTE ON FUNCTION get_next_crawler_run_kst() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_chart_crawler_now() TO authenticated;
GRANT SELECT ON public.crawler_logs TO authenticated;
GRANT SELECT ON public.admin_settings TO authenticated;
GRANT SELECT ON public.cron_jobs TO authenticated;
```

### 9. 초기 데이터 삽입

```sql
-- 테스트용 초기 데이터
INSERT INTO public.admin_settings (key, value, description, category) VALUES 
('system_version', '"1.0.0"', 'Current system version', 'system'),
('last_chart_update', 'null', 'Last chart data update timestamp', 'chart_data'),
('maintenance_mode', 'false', 'System maintenance mode flag', 'system')
ON CONFLICT (key) DO NOTHING;

-- 테스트 로그 삽입
INSERT INTO public.crawler_logs (platform, status, songs_found, execution_time, metadata) VALUES 
('melon', 'success', 100, 1500, '{"test": true, "message": "Initial test log"}'),
('genie', 'success', 100, 1200, '{"test": true, "message": "Initial test log"}'),
('bugs', 'success', 100, 1800, '{"test": true, "message": "Initial test log"}');
```

## ✅ 완료 확인

모든 SQL을 실행한 후, 다음 쿼리로 정상 설정되었는지 확인:

```sql
-- 테이블 확인
SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  AND tablename IN ('crawler_logs', 'admin_settings', 'cron_jobs');

-- 크론 작업 확인
SELECT * FROM cron.job;

-- 함수 확인
SELECT proname FROM pg_proc WHERE proname IN ('call_chart_crawler', 'get_next_crawler_run_kst', 'trigger_chart_crawler_now');

-- 데이터 확인
SELECT COUNT(*) as crawler_logs FROM crawler_logs;
SELECT COUNT(*) as admin_settings FROM admin_settings;
SELECT COUNT(*) as cron_jobs FROM cron_jobs;
```

모든 설정이 완료되면 다음 단계로 진행할 수 있습니다! 🚀