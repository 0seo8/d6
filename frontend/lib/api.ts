import { ChartData, VoteItem, MVStats, ChartSong } from "./types";
import { fetchSupabaseChartData } from "./api/supabase-chart";

// Use Next.js rewrites to avoid CORS issues
const DATA_BASE_URL = "/data";

export async function fetchChartData(): Promise<ChartData> {
  try {
    // Try Supabase first for more reliable, precisely timed data
    const supabaseData = await fetchSupabaseChartData();
    if (supabaseData) {
      console.log("Using Supabase chart data:", {
        collectedAt: supabaseData.collectedAtKST,
        platforms: Object.keys(supabaseData).filter((key) =>
          Array.isArray((supabaseData as any)[key])
        ),
      });
      return supabaseData;
    }

    // Fallback to JSON files (GitHub Actions method)
    console.log("Falling back to JSON file data source");
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const response = await fetch(
      `${DATA_BASE_URL}/latest.json?v=${timestamp}&r=${randomId}`,
      {
        cache: "no-store",
        next: { revalidate: 0 },
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
          "If-Modified-Since": "Thu, 01 Jan 1970 00:00:00 GMT",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chart data");
    }

    const rawData = await response.json();

    console.log("fetchChartData Debug:", {
      status: response.status,
      url: `${DATA_BASE_URL}/latest.json?t=${timestamp}`,
      hasData: !!rawData,
      collectedAt: rawData?.collectedAtKST,
      melonTop100Length: rawData?.melon_top100?.length || 0,
      platforms: Object.keys(rawData || {}).filter((key) =>
        Array.isArray(rawData[key])
      ),
    });

    // Transform the data to match our types
    const transformSongs = (songs: unknown[]): ChartSong[] => {
      return songs.map((song) => {
        const s = song as Record<string, unknown>;
        return {
          rank: s.rank as number,
          title: s.title as string,
          artist: s.artist as string,
          change: (s.change as number) || 0,
          album: (s.album as string) || "Band Aid", // Default album if not provided
          albumArt: (s.albumArt as string) || "",
          timestamp: rawData.collectedAtKST,
        };
      });
    };

    return {
      collectedAtKST: rawData.collectedAtKST,
      artist: rawData.artist,
      tracks: rawData.tracks || [],
      melon_top100: transformSongs(rawData.melon_top100 || []),
      melon_hot100: transformSongs(rawData.melon_hot100 || []),
      melon_daily: transformSongs(rawData.melon_daily || []),
      melon_weekly: transformSongs(rawData.melon_weekly || []),
      melon_monthly: transformSongs(rawData.melon_monthly || []),
      genie: transformSongs(rawData.genie || []),
      bugs: transformSongs(rawData.bugs || []),
      vibe: transformSongs(rawData.vibe || []),
      flo: transformSongs(rawData.flo || []),
      last_updated: rawData.collectedAtKST,
    };
  } catch (error) {
    console.error("Error fetching chart data:", error);
    // Return mock data for development
    return {
      collectedAtKST: new Date().toISOString(),
      artist: "DAY6",
      tracks: [],
      melon_top100: [],
      melon_hot100: [],
      melon_daily: [],
      melon_weekly: [],
      melon_monthly: [],
      genie: [],
      bugs: [],
      vibe: [],
      flo: [],
    };
  }
}

export async function fetchSummaryData(): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(`${DATA_BASE_URL}/summary.json`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch summary data");
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching summary data:", error);
    return {};
  }
}

// Mock data for votes (would come from API/database in production)
export async function fetchVotes(): Promise<VoteItem[]> {
  return [
    {
      id: "1",
      title: "MMA 2025 - Best Band Performance",
      category: "award",
      deadline: new Date("2025-09-15"),
      difficulty: "hard",
      link: "https://www.melon.com/mma/vote",
      platform: "Melon",
    },
    {
      id: "2",
      title: "DAY6 엠카운트다운 사전투표",
      category: "music_show",
      deadline: new Date("2025-08-15"),
      difficulty: "easy",
      link: "https://x.com/day6official/status/1926128894127513619",
      platform: "X (Twitter)",
    },
    {
      id: "3",
      title: "Billboard Fan Army",
      category: "global",
      deadline: new Date("2025-08-20"),
      difficulty: "medium",
      link: "https://www.billboard.com/fan-army",
      platform: "Billboard",
    },
  ];
}

// Fetch MV stats from YouTube crawler data
export async function fetchMVStats(): Promise<MVStats[]> {
  try {
    const response = await fetch(`${DATA_BASE_URL}/youtube_stats.json`, {
      cache: "no-cache",
    });

    if (response.ok) {
      const youtubeStats = await response.json();

      if (Array.isArray(youtubeStats) && youtubeStats.length > 0) {
        return youtubeStats.map((stat) => ({
          title: stat.title || "Unknown",
          views: stat.views || 0,
          likes: stat.likes || 0,
          viewsDelta24h: stat.viewsDelta24h || 0,
          likesDelta24h: stat.likesDelta24h || 0,
          link: stat.link || "#",
        }));
      }
    }

    // Fallback to summary data
    const summaryData = await fetchSummaryData();
    const youtubeStats = summaryData?.youtubeStats as
      | {
          views: number;
          likes: number;
          dailyViews: number;
          dailyLikes: number;
        }
      | undefined;

    if (youtubeStats) {
      return [
        {
          title: "Melt Down",
          views: Math.floor(youtubeStats.views * 0.4),
          likes: Math.floor(youtubeStats.likes * 0.4),
          viewsDelta24h: Math.floor(youtubeStats.dailyViews * 0.4),
          likesDelta24h: Math.floor(youtubeStats.dailyLikes * 0.4),
          link: "https://youtu.be/uFqJDgIaNNg",
        },
        {
          title: "HAPPY",
          views: Math.floor(youtubeStats.views * 0.35),
          likes: Math.floor(youtubeStats.likes * 0.35),
          viewsDelta24h: Math.floor(youtubeStats.dailyViews * 0.35),
          likesDelta24h: Math.floor(youtubeStats.dailyLikes * 0.35),
          link: "https://youtu.be/ooxqwAc1dIg",
        },
        {
          title: "예뻤어",
          views: Math.floor(youtubeStats.views * 0.25),
          likes: Math.floor(youtubeStats.likes * 0.25),
          viewsDelta24h: Math.floor(youtubeStats.dailyViews * 0.25),
          likesDelta24h: Math.floor(youtubeStats.dailyLikes * 0.25),
          link: "https://youtu.be/_4-LWtJ2CAg",
        },
      ];
    }
  } catch (error) {
    console.error("Error fetching MV stats:", error);
  }

  // Final fallback to mock data
  return [
    {
      title: "Melt Down",
      views: 5234567,
      likes: 234567,
      viewsDelta24h: 123456,
      likesDelta24h: 12345,
      link: "https://youtu.be/uFqJDgIaNNg",
    },
    {
      title: "HAPPY",
      views: 8234567,
      likes: 334567,
      viewsDelta24h: 223456,
      likesDelta24h: 22345,
      link: "https://youtu.be/ooxqwAc1dIg",
    },
    {
      title: "예뻤어",
      views: 15234567,
      likes: 654321,
      viewsDelta24h: 89012,
      likesDelta24h: 5432,
      link: "https://youtu.be/_4-LWtJ2CAg",
    },
  ];
}

// Fetch comeback data for the comeback page
export async function fetchComebackData(): Promise<{
  chartRank: { platform: string; rank: number | null; target: number }[];
  youtubeStats: { views: number; target: number };
  streamingScore: { current: number; target: number };
}> {
  try {
    // Try to get real data from crawlers
    const [chartResponse, youtubeResponse] = await Promise.all([
      fetch(`${DATA_BASE_URL}/latest.json`, { cache: "no-cache" }).catch(
        () => null
      ),
      fetch(`${DATA_BASE_URL}/youtube_stats.json`, { cache: "no-cache" }).catch(
        () => null
      ),
    ]);

    // Process chart data
    let chartRanks = [
      { platform: "melon_top100", rank: null as number | null, target: 10 },
      { platform: "genie", rank: null as number | null, target: 10 },
      { platform: "bugs", rank: null as number | null, target: 10 },
    ];

    if (chartResponse?.ok) {
      try {
        const chartData = await chartResponse.json();
        // Find DAY6 "Maybe Tomorrow" in each platform
        chartRanks = chartRanks.map((item) => {
          const platformSongs = chartData[item.platform] || [];
          const day6Song = platformSongs.find(
            (song: { artist?: string; title?: string; rank?: number }) =>
              song.artist?.includes("DAY6") &&
              song.title?.includes("Maybe Tomorrow")
          );
          return {
            ...item,
            rank: day6Song?.rank || null,
          };
        });
      } catch (jsonError) {
        console.warn("Invalid JSON in chart data:", jsonError);
        // Keep default chartRanks with null values
      }
    }

    // Process YouTube data
    const youtubeStats = { views: 0, target: 3000000 };
    if (youtubeResponse?.ok) {
      try {
        const youtubeData = await youtubeResponse.json();
        const maybeTomorrowStats = Array.isArray(youtubeData)
          ? youtubeData.find((video) => video.title?.includes("Maybe Tomorrow"))
          : null;

        if (maybeTomorrowStats) {
          youtubeStats.views = maybeTomorrowStats.views || 0;
        }
      } catch (jsonError) {
        console.warn("Invalid JSON in YouTube data:", jsonError);
        // Keep default youtubeStats with 0 views
      }
    }

    // Calculate streaming participation score based on available data
    const streamingScore = {
      current: Math.floor(Math.random() * 85) + 60, // Mock calculation for now
      target: 100,
    };

    return {
      chartRank: chartRanks,
      youtubeStats,
      streamingScore,
    };
  } catch (error) {
    console.error("Error fetching comeback data:", error);

    // Return mock data on error
    return {
      chartRank: [
        { platform: "melon_top100", rank: null, target: 10 },
        { platform: "genie", rank: null, target: 10 },
        { platform: "bugs", rank: null, target: 10 },
      ],
      youtubeStats: { views: 0, target: 3000000 },
      streamingScore: { current: 75, target: 100 },
    };
  }
}
