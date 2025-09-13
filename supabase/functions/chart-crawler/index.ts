import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crawlMelon, crawlGenie, crawlPlatform, CrawlResult, ChartSong } from "./crawlers.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const kstTimestamp = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T') + '+09:00';
    
    console.log(`[${kstTimestamp}] Starting chart crawling...`);

    // Platform crawling
    const crawlPromises = [
      crawlMelon(),
      crawlGenie(),
      crawlPlatform('bugs'),
      crawlPlatform('vibe'),
      crawlPlatform('flo')
    ];

    const crawlResults = await Promise.allSettled(crawlPromises);
    const processedResults: CrawlResult[] = crawlResults.map((result, index) => {
      const platforms = ['melon', 'genie', 'bugs', 'vibe', 'flo'];
      const platform = platforms[index];
      
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          platform,
          status: 'failed',
          execution_time: Date.now() - startTime,
          error_message: result.reason?.message || 'Unknown error',
          error_type: result.reason?.name || 'Error'
        };
      }
    });

    // Log crawl results to Supabase
    const logPromises = processedResults.map(result =>
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

    // Build combined chart data compatible with frontend
    const successfulResults = processedResults.filter(r => r.status === 'success' && r.songs);
    const combinedData: Record<string, unknown> = {
      collectedAtKST: kstTimestamp,
      artist: 'DAY6',
      tracks: [],
      last_updated: kstTimestamp
    };

    // Group songs by platform and chart type
    for (const result of successfulResults) {
      if (!result.songs) continue;

      if (result.platform === 'melon') {
        // For Melon, separate by chart type
        const groupedSongs: Record<string, ChartSong[]> = {};
        
        result.songs.forEach(song => {
          const chartType = song.chart_type || 'top100';
          if (!groupedSongs[chartType]) {
            groupedSongs[chartType] = [];
          }
          groupedSongs[chartType].push(song);
        });

        // Map chart types to expected keys
        const chartMapping: Record<string, string> = {
          'TOP100': 'melon_top100',
          'HOT100': 'melon_hot100',
          '일간': 'melon_daily',
          '주간': 'melon_weekly',
          '월간': 'melon_monthly'
        };

        Object.entries(groupedSongs).forEach(([chartType, songs]) => {
          const key = chartMapping[chartType] || 'melon_top100';
          combinedData[key] = songs.map(song => ({
            rank: song.rank,
            title: song.title,
            artist: song.artist,
            album: song.album || '',
            albumArt: song.albumArt || '',
            change: song.change || 0,
            timestamp: kstTimestamp
          }));
        });
      } else {
        // For other platforms, use platform name directly
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
    }

    // Store chart data in admin_settings
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
    const successCount = processedResults.filter(r => r.status === 'success').length;
    const totalSongs = processedResults.reduce((sum, r) => sum + (r.songs?.length || 0), 0);

    console.log(`[${kstTimestamp}] Chart crawling completed in ${totalExecutionTime}ms - ${successCount}/${processedResults.length} platforms successful, ${totalSongs} songs total`);

    return new Response(
      JSON.stringify({
        success: true,
        executionTime: totalExecutionTime,
        timestamp: kstTimestamp,
        platformsSuccessful: successCount,
        platformsTotal: processedResults.length,
        totalSongs,
        results: processedResults.map(r => ({
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
        timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).replace(' ', 'T') + '+09:00'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});