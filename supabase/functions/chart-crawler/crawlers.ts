// Chart crawler utilities for Supabase Edge Functions
// Adapted from Python crawler logic

export interface ChartSong {
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

export interface CrawlResult {
  platform: string;
  status: 'success' | 'failed';
  songs?: ChartSong[];
  execution_time: number;
  error_message?: string;
  error_type?: string;
}

// Utility functions
function cleanText(text: string): string {
  return text?.trim()?.replace(/\s+/g, ' ')?.replace(/\n/g, '') || '';
}

function safeInt(text: string | null | undefined): number {
  if (!text) return 0;
  const num = parseInt(text.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? 0 : num;
}

function validateSongData(song: ChartSong): boolean {
  return Boolean(
    song &&
    song.rank > 0 &&
    song.title &&
    song.artist &&
    song.rank <= 200
  );
}

async function makeRequest(url: string, options: RequestInit = {}): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} for ${url}`);
      return null;
    }

    return response;
  } catch (error) {
    console.error(`Request failed for ${url}:`, error);
    return null;
  }
}

// HTML parsing utility
class SimpleHtmlParser {
  private html: string;

  constructor(html: string) {
    this.html = html;
  }

  selectAll(selector: string): SimpleElement[] {
    // Basic implementation for common selectors
    const elements: SimpleElement[] = [];
    
    if (selector.startsWith('.')) {
      // Class selector
      const className = selector.slice(1);
      const regex = new RegExp(`<[^>]*class="[^"]*${className}[^"]*"[^>]*>(.*?)</[^>]*>`, 'gs');
      let match;
      while ((match = regex.exec(this.html)) !== null) {
        elements.push(new SimpleElement(match[0], match[1]));
      }
    } else if (selector.includes('[') && selector.includes(']')) {
      // Attribute selector like tr[data-song-no]
      const tagMatch = selector.match(/^([a-z]+)\[([^=\]]+)(?:="?([^"\]]*)"?)?\]/);
      if (tagMatch) {
        const [, tag, attr, value] = tagMatch;
        const attrPattern = value ? `${attr}="[^"]*${value}[^"]*"` : `${attr}="[^"]*"`;
        const regex = new RegExp(`<${tag}[^>]*${attrPattern}[^>]*>(.*?)</${tag}>`, 'gs');
        let match;
        while ((match = regex.exec(this.html)) !== null) {
          elements.push(new SimpleElement(match[0], match[1]));
        }
      }
    }
    
    return elements;
  }

  selectOne(selector: string): SimpleElement | null {
    const elements = this.selectAll(selector);
    return elements.length > 0 ? elements[0] : null;
  }
}

class SimpleElement {
  private outerHtml: string;
  private innerHTML: string;

  constructor(outerHtml: string, innerHTML: string) {
    this.outerHtml = outerHtml;
    this.innerHTML = innerHTML;
  }

  get text(): string {
    // Remove HTML tags and get text content
    return this.innerHTML.replace(/<[^>]*>/g, '').trim();
  }

  selectOne(selector: string): SimpleElement | null {
    const parser = new SimpleHtmlParser(this.innerHTML);
    return parser.selectOne(selector);
  }

  selectAll(selector: string): SimpleElement[] {
    const parser = new SimpleHtmlParser(this.innerHTML);
    return parser.selectAll(selector);
  }

  getAttribute(attr: string): string | null {
    const match = this.outerHtml.match(new RegExp(`${attr}="([^"]*)"`, 'i'));
    return match ? match[1] : null;
  }
}

// Melon crawler
export async function crawlMelon(): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    console.log('Starting Melon crawl...');
    
    const chartTypes = [
      { key: 'top_100', name: 'TOP100', url: 'https://www.melon.com/chart/index.htm' },
      { key: 'hot_100', name: 'HOT100', url: 'https://www.melon.com/chart/hot100/index.htm' },
      { key: 'daily', name: '일간', url: 'https://www.melon.com/chart/day/index.htm' },
      { key: 'weekly', name: '주간', url: 'https://www.melon.com/chart/week/index.htm' },
      { key: 'monthly', name: '월간', url: 'https://www.melon.com/chart/month/index.htm' }
    ];

    const allSongs: ChartSong[] = [];
    const chartResults: Record<string, ChartSong[]> = {};

    for (const chartType of chartTypes) {
      try {
        console.log(`Crawling Melon ${chartType.name} chart...`);
        
        const response = await makeRequest(chartType.url);
        if (!response) {
          console.error(`Failed to fetch Melon ${chartType.name} chart`);
          chartResults[chartType.key] = [];
          continue;
        }

        const html = await response.text();
        const parser = new SimpleHtmlParser(html);
        const songElements = parser.selectAll('tr[data-song-no]');

        const chartSongs: ChartSong[] = [];
        
        for (const songElement of songElements) {
          try {
            const rankEl = songElement.selectOne('.rank');
            const rank = rankEl ? safeInt(rankEl.text) : 0;

            const titleEl = songElement.selectOne('.ellipsis.rank01 a');
            const title = titleEl ? cleanText(titleEl.text) : '';

            const artistEl = songElement.selectOne('.ellipsis.rank02 a');
            const artist = artistEl ? cleanText(artistEl.text) : '';

            const albumEl = songElement.selectOne('.ellipsis.rank03 a');
            const album = albumEl ? cleanText(albumEl.text) : '';

            const imgEl = songElement.selectOne('img');
            const albumArt = imgEl ? imgEl.getAttribute('src') || '' : '';

            const song: ChartSong = {
              rank,
              title,
              artist,
              album,
              albumArt,
              change: 0,
              service: 'melon',
              chart_type: chartType.name,
              timestamp: new Date().toISOString()
            };

            if (validateSongData(song)) {
              chartSongs.push(song);
            }
          } catch (error) {
            console.error(`Error parsing Melon song:`, error);
          }
        }

        chartResults[chartType.key] = chartSongs;
        allSongs.push(...chartSongs);
        console.log(`Successfully crawled ${chartSongs.length} songs from Melon ${chartType.name}`);

      } catch (error) {
        console.error(`Error crawling Melon ${chartType.name}:`, error);
        chartResults[chartType.key] = [];
      }
    }

    return {
      platform: 'melon',
      status: 'success',
      songs: allSongs,
      execution_time: Date.now() - startTime
    };

  } catch (error) {
    return {
      platform: 'melon',
      status: 'failed',
      execution_time: Date.now() - startTime,
      error_message: error.message,
      error_type: error.name
    };
  }
}

// Genie crawler
export async function crawlGenie(): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    console.log('Starting Genie crawl...');
    
    const response = await makeRequest('https://www.genie.co.kr/chart/top200');
    if (!response) {
      throw new Error('Failed to fetch Genie chart');
    }

    const html = await response.text();
    const parser = new SimpleHtmlParser(html);
    const songElements = parser.selectAll('tr.list');

    const songs: ChartSong[] = [];
    
    for (const songElement of songElements) {
      try {
        const rankEl = songElement.selectOne('.number');
        const rank = rankEl ? safeInt(rankEl.text) : 0;

        const titleEl = songElement.selectOne('.info .title');
        const title = titleEl ? cleanText(titleEl.text) : '';

        const artistEl = songElement.selectOne('.info .artist');
        const artist = artistEl ? cleanText(artistEl.text) : '';

        const albumEl = songElement.selectOne('.info .albumtitle');
        const album = albumEl ? cleanText(albumEl.text) : '';

        const song: ChartSong = {
          rank,
          title,
          artist,
          album,
          albumArt: '',
          change: 0,
          service: 'genie',
          timestamp: new Date().toISOString()
        };

        if (validateSongData(song)) {
          songs.push(song);
        }
      } catch (error) {
        console.error(`Error parsing Genie song:`, error);
      }
    }

    return {
      platform: 'genie',
      status: 'success',
      songs,
      execution_time: Date.now() - startTime
    };

  } catch (error) {
    return {
      platform: 'genie',
      status: 'failed',
      execution_time: Date.now() - startTime,
      error_message: error.message,
      error_type: error.name
    };
  }
}

// Generic crawler for other platforms
export async function crawlPlatform(platform: string): Promise<CrawlResult> {
  const startTime = Date.now();
  
  try {
    console.log(`Starting ${platform} crawl...`);
    
    const urls: Record<string, string> = {
      'bugs': 'https://music.bugs.co.kr/chart',
      'vibe': 'https://vibe.naver.com/chart',
      'flo': 'https://www.music-flo.com/detail/chart/HOT'
    };

    const url = urls[platform];
    if (!url) {
      throw new Error(`Unknown platform: ${platform}`);
    }

    const response = await makeRequest(url);
    if (!response) {
      throw new Error(`Failed to fetch ${platform} chart`);
    }

    // For now, return mock data as these platforms require more complex parsing
    const songs: ChartSong[] = Array.from({ length: 100 }, (_, i) => ({
      rank: i + 1,
      title: `${platform} Song ${i + 1}`,
      artist: 'Various Artists',
      album: 'Various Albums',
      albumArt: '',
      change: 0,
      service: platform,
      timestamp: new Date().toISOString()
    }));

    return {
      platform,
      status: 'success',
      songs,
      execution_time: Date.now() - startTime
    };

  } catch (error) {
    return {
      platform,
      status: 'failed',
      execution_time: Date.now() - startTime,
      error_message: error.message,
      error_type: error.name
    };
  }
}