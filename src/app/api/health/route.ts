import { NextResponse } from 'next/server';

/**
 * API Health Check Endpoint
 * GET /api/health
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    services: {
      database: 'pending', // Will be implemented in Phase 2
      llm: 'pending',      // Will be implemented in Phase 3
    },
  });
}
