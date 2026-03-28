import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';
import { FailureService } from '@/lib/services/failureService';

export function withErrorHandler(handler: (...args: any[]) => any) {
  return async (request: Request, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error: any) {
      log.error(`[API Error] Unhandled Exception on ${request.url}`, error);
      
      // Async failure logging
      FailureService.raiseFailure({
        tenant_id: 'unknown-api-err', // Can extract from headers if necessary
        category: 'system',
        source: 'api',
        severity: 'critical',
        message: `API Exception: ${error?.message || 'Unknown error'}`,
        metadata: {
            url: request.url,
            method: request.method,
        }
      }).catch(e => log.error("Failed to log failure", e));

      // Scrub stack traces
      return NextResponse.json({ 
        error: "Internal Server Error", 
        message: process.env.NODE_ENV === 'development' ? error.message : "An unexpected error occurred"
      }, { status: 500 });
    }
  };
}
