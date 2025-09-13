-- 기본 테이블들 생성 (cron_jobs.sql 실행 전에 먼저 실행)

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
CREATE INDEX IF NOT EXISTS idx_crawler_logs_status_created ON crawler_logs (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings (key);
CREATE INDEX IF NOT EXISTS idx_admin_settings_category ON admin_settings (category);
CREATE INDEX IF NOT EXISTS idx_admin_settings_active ON admin_settings (is_active);

-- RLS 설정
ALTER TABLE public.crawler_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자 읽기 권한
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.crawler_logs;
CREATE POLICY "Allow authenticated read access" ON public.crawler_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.admin_settings;
CREATE POLICY "Allow authenticated read access" ON public.admin_settings
  FOR SELECT TO authenticated USING (true);

-- 서비스 역할 모든 권한
DROP POLICY IF EXISTS "Allow service role full access" ON public.crawler_logs;
CREATE POLICY "Allow service role full access" ON public.crawler_logs
  FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Allow service role full access" ON public.admin_settings;
CREATE POLICY "Allow service role full access" ON public.admin_settings
  FOR ALL TO service_role USING (true);

-- 권한 부여
GRANT SELECT ON public.crawler_logs TO authenticated;
GRANT SELECT ON public.admin_settings TO authenticated;
GRANT SELECT, INSERT ON public.crawler_logs TO authenticated;

-- 테스트 데이터 삽입
INSERT INTO public.admin_settings (key, value, description, category) VALUES 
('system_version', '"1.0.0"', 'Current system version', 'system'),
('last_chart_update', 'null', 'Last chart data update timestamp', 'chart_data'),
('maintenance_mode', 'false', 'System maintenance mode flag', 'system')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.crawler_logs (platform, status, songs_found, execution_time, metadata) VALUES 
('melon', 'success', 100, 1500, '{"test": true, "message": "Initial test log"}'),
('genie', 'success', 100, 1200, '{"test": true, "message": "Initial test log"}'),
('bugs', 'success', 100, 1800, '{"test": true, "message": "Initial test log"}');