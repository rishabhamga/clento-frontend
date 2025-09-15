import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Check if Clerk is configured
const hasClerkKeys = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY;

// Simple middleware that allows all routes when Clerk is not configured
export default function middleware() {
  // If Clerk is not configured, allow all routes
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  // For now, allow all routes even with Clerk configured (development mode)
  // TODO: Implement proper Clerk middleware when keys are provided
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
