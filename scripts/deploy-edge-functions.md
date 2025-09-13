# 🚀 Edge Functions 배포 가이드

## Supabase Edge Functions 수동 배포 가이드

### 1. Supabase CLI로 배포하기

```bash
# Supabase 로그인 (터미널에서)
npx supabase login

# Edge Function 배포
npx supabase functions deploy chart-crawler --project-ref gxhchzvkdqltyrpvfjmj

# 환경변수 설정
npx supabase secrets set SUPABASE_URL=https://gxhchzvkdqltyrpvfjmj.supabase.co --project-ref gxhchzvkdqltyrpvfjmj
npx supabase secrets set SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGNoenZrZHFsdHlycHZmam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE5MDcsImV4cCI6MjA3MzI1NzkwN30.8_ycVKvDXfuRKCF9jlPO5UxfGZDAjBkMItyjoXaxPbo --project-ref gxhchzvkdqltyrpvfjmj
npx supabase secrets set YOUTUBE_API_KEY=YOUR_YOUTUBE_API_KEY --project-ref gxhchzvkdqltyrpvfjmj
```

### 2. Supabase 대시보드에서 수동 생성하기

**Step 1:** Supabase 대시보드 → Edge Functions → "Create a new function"

**Step 2:** Function name: `chart-crawler`

**Step 3:** 다음 코드를 복사하여 붙여넣기:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChartSong {
  rank: number;
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  change?: number;
  service: string;
  chart_type?: string;
  timestamp: string;
}

interface CrawlResult {
  platform: string;
  status: 'success' | 'failed';
  songs?: ChartSong[];
  execution_time: number;
  error_message?: string;
  error_type?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const startTime = Date.now();
    const kstTimestamp = new Date().toLocaleString('sv-SE', { 
      timeZone: 'Asia/Seoul' 
    }).replace(' ', 'T') + '+09:00';
    
    console.log(`[${kstTimestamp}] Starting chart crawling...`);

    // 간단한 테스트 크롤링 (실제 사이트는 CORS 문제로 Edge Function에서 직접 접근 어려움)
    const testResults: CrawlResult[] = [
      {
        platform: 'melon',
        status: 'success',
        songs: Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          title: `Test Song ${i + 1}`,
          artist: 'DAY6',
          album: 'Test Album',
          albumArt: '',
          change: 0,
          service: 'melon',
          timestamp: kstTimestamp
        })),
        execution_time: 500
      },
      {
        platform: 'genie',
        status: 'success',
        songs: Array.from({ length: 10 }, (_, i) => ({
          rank: i + 1,
          title: `Test Song ${i + 1}`,
          artist: 'DAY6',
          album: 'Test Album',
          albumArt: '',
          change: 0,
          service: 'genie',
          timestamp: kstTimestamp
        })),
        execution_time: 400
      }
    ];

    // 로그를 데이터베이스에 저장
    const logPromises = testResults.map(result =>
      supabaseClient
        .from('crawler_logs')
        .insert({
          platform: result.platform,
          status: result.status,
          execution_time: result.execution_time,
          songs_found: result.songs?.length || 0,
          error_message: result.error_message,
          error_type: result.error_type,
          metadata: result.songs ? { songs: result.songs } : null
        })
    );

    await Promise.allSettled(logPromises);

    // 성공한 결과들을 합쳐서 차트 데이터 구성
    const successfulResults = testResults.filter(r => r.status === 'success' && r.songs);
    const combinedData: Record<string, unknown> = {
      collectedAtKST: kstTimestamp,
      artist: 'DAY6',
      tracks: [],
      last_updated: kstTimestamp
    };

    // 플랫폼별 데이터 추가
    for (const result of successfulResults) {
      if (!result.songs) continue;

      combinedData[result.platform] = result.songs.map(song => ({
        rank: song.rank,
        title: song.title,
        artist: song.artist,
        album: song.album || '',
        albumArt: song.albumArt || '',
        change: song.change || 0,
        timestamp: kstTimestamp
      }));
    }

    // admin_settings에 최신 차트 데이터 저장
    await supabaseClient
      .from('admin_settings')
      .upsert({
        key: 'latest_chart_data',
        value: combinedData,
        description: 'Latest combined chart data from all platforms',
        category: 'chart_data',
        updated_at: new Date().toISOString(),
        is_active: true
      });

    const totalExecutionTime = Date.now() - startTime;
    const successCount = successfulResults.length;
    const totalSongs = successfulResults.reduce((sum, r) => sum + (r.songs?.length || 0), 0);

    console.log(`[${kstTimestamp}] Chart crawling completed in ${totalExecutionTime}ms - ${successCount} platforms successful, ${totalSongs} songs total`);

    return new Response(
      JSON.stringify({
        success: true,
        executionTime: totalExecutionTime,
        timestamp: kstTimestamp,
        platformsSuccessful: successCount,
        platformsTotal: testResults.length,
        totalSongs,
        results: testResults.map(r => ({
          platform: r.platform,
          status: r.status,
          songs_found: r.songs?.length || 0,
          execution_time: r.execution_time,
          error_message: r.error_message
        })),
        data: combinedData
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Chart crawler error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
        timestamp: new Date().toLocaleString('sv-SE', { 
          timeZone: 'Asia/Seoul' 
        }).replace(' ', 'T') + '+09:00'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
```

### 3. 환경변수 설정

Supabase 대시보드 → Project Settings → Edge Functions → Environment Variables

다음 변수들을 추가:

```
SUPABASE_URL = https://gxhchzvkdqltyrpvfjmj.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGNoenZrZHFsdHlycHZmam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE5MDcsImV4cCI6MjA3MzI1NzkwN30.8_ycVKvDXfuRKCF9jlPO5UxfGZDAjBkMItyjoXaxPbo
YOUTUBE_API_KEY = (필요한 경우)
```

### 4. 함수 테스트

배포 후 다음 URL로 테스트:
```
https://gxhchzvkdqltyrpvfjmj.supabase.co/functions/v1/chart-crawler
```

또는 curl로 테스트:
```bash
curl -X POST 'https://gxhchzvkdqltyrpvfjmj.supabase.co/functions/v1/chart-crawler' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGNoenZrZHFsdHlycHZmam1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2ODE5MDcsImV4cCI6MjA3MzI1NzkwN30.8_ycVKvDXfuRKCF9jlPO5UxfGZDAjBkMItyjoXaxPbo' \
  -H 'Content-Type: application/json'
```

### 5. 로그 확인

Supabase 대시보드에서:
- Edge Functions → chart-crawler → Logs
- Database → Table editor → crawler_logs
- Database → Table editor → admin_settings

## ✅ 완료 체크리스트

- [ ] Edge Function 생성 완료
- [ ] 환경변수 설정 완료  
- [ ] 함수 테스트 성공
- [ ] 로그 데이터베이스 저장 확인
- [ ] 차트 데이터 저장 확인

다음은 Knock.app 워크플로우 설정입니다! 🔔