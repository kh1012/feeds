import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const VISITOR_KEY = 'feeds:visitors';

// GET: 현재 방문자 수 조회
export async function GET() {
  try {
    const count = (await redis.get<number>(VISITOR_KEY)) ?? 0;
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to get visitor count:', error);
    return NextResponse.json({ count: 0 });
  }
}

// POST: 방문자 수 증가
export async function POST() {
  try {
    const count = await redis.incr(VISITOR_KEY);
    return NextResponse.json({ count });
  } catch (error) {
    console.error('Failed to increment visitor count:', error);
    return NextResponse.json({ count: 0 });
  }
}
