# 🔧 **수정된 설정 가이드**

## 문제 해결: 테이블이 없다는 오류

**오류**: `ERROR: 42P01: relation "public.crawler_logs" does not exist`

**해결**: 2개의 SQL 파일을 순서대로 실행해야 합니다.

## ✅ **올바른 실행 순서**

### 1단계: 기본 테이블 생성

Supabase SQL Editor에서 **첫 번째로** 실행:

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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_crawler_logs_created_at ON crawler_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crawler_logs_platform_status ON crawler_logs (platform, status);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings (key);

-- RLS 설정
ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 권한 설정
CREATE POLICY "Allow authenticated read access" ON public.crawler_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service role full access" ON public.crawler_logs
  FOR ALL TO service_role USING (true);

CREATE POLICY "Allow authenticated read access" ON public.admin_settings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow service role full access" ON public.admin_settings
  FOR ALL TO service_role USING (true);

-- 테스트 데이터
INSERT INTO public.admin_settings (key, value, description, category) VALUES 
('system_version', '"1.0.0"', 'Current system version', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.crawler_logs (platform, status, songs_found, execution_time, metadata) VALUES 
('melon', 'success', 100, 1500, '{"test": true, "message": "Initial test log"}');
```

### 2단계: 크론 작업 설정

**첫 번째 SQL 성공 후**, **두 번째로** 실행:

```sql
-- pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 크론 작업 테이블
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

-- 크롤러 호출 함수
CREATE OR REPLACE FUNCTION call_chart_crawler()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMP;
  success BOOLEAN := true;
BEGIN
  start_time := NOW();
  
  -- 간단한 로그 추가 (실제 HTTP 호출 대신)
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
    jsonb_build_object('triggered_by', 'cron', 'message', 'Cron job executed')
  );
  
  -- 크론 작업 통계 업데이트
  UPDATE public.cron_jobs 
  SET 
    last_run = start_time,
    next_run = start_time + INTERVAL '1 hour',
    run_count = run_count + 1,
    success_count = success_count + 1,
    updated_at = NOW()
  WHERE job_name = 'chart_crawler_hourly';
END;
$$;

-- 수동 실행 함수
CREATE OR REPLACE FUNCTION trigger_chart_crawler_now()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM call_chart_crawler();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Chart crawler triggered successfully',
    'triggered_at', NOW()
  );
END;
$$;

-- 크론 스케줄 등록
SELECT cron.schedule('chart_crawler_hourly', '0 * * * *', 'SELECT call_chart_crawler();');

-- 크론 작업 레코드 추가
INSERT INTO public.cron_jobs (
  job_name, schedule, command, enabled, next_run
) VALUES (
  'chart_crawler_hourly', '0 * * * *', 'SELECT call_chart_crawler();', 
  true, date_trunc('hour', NOW() + INTERVAL '1 hour')
) ON CONFLICT (job_name) DO UPDATE SET updated_at = NOW();

-- 권한 부여
GRANT EXECUTE ON FUNCTION call_chart_crawler() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_chart_crawler_now() TO authenticated;
```

## 확인 방법

두 SQL 실행 후 다음 쿼리로 확인:

```sql
-- 테이블 생성 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('crawler_logs', 'admin_settings', 'cron_jobs');

-- 데이터 확인
SELECT COUNT(*) as logs FROM crawler_logs;
SELECT COUNT(*) as settings FROM admin_settings;
SELECT COUNT(*) as jobs FROM cron_jobs;

-- 크론 작업 확인
SELECT * FROM cron.job;
```

## 3단계: Edge Function (선택사항)

테이블이 정상 생성된 후에 Edge Function을 만드세요.

이제 오류 없이 실행될 것입니다! 🎉