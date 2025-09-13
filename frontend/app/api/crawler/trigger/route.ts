import { NextResponse } from 'next/server';
import { triggerCrawlerManually } from '@/lib/api/supabase-chart';

export async function POST(request: Request) {
  try {
    // Optional: Add authentication here
    const authHeader = request.headers.get('Authorization');
    
    // Simple token authentication (replace with your actual auth logic)
    const validToken = process.env.CRAWLER_API_TOKEN;
    if (validToken && authHeader !== `Bearer ${validToken}`) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token'
        },
        { 
          status: 401,
          headers: {
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Trigger the crawler
    const result = await triggerCrawlerManually();
    
    // Return response in mobile-friendly format
    const response = {
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
      nextScheduledRun: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Next hour
    };

    return NextResponse.json(response, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Crawler trigger API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to trigger crawler',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}