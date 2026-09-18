/**
 * @file Next.js middleware
 * @description Next.js middleware that runs on every request to keep sessions fresh.
 */
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Main middleware function.
 *
 * @param {NextRequest} request - The incoming Next.js request.
 * @returns {Promise<Response>} The middleware response.
 */
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Skip static files and images
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
