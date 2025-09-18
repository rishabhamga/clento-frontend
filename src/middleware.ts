import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isOnboardingRoute = createRouteMatcher([
  '/dashboard/organizations/new',
  '/dashboard/organizations/profile',
])

export default clerkMiddleware(async (auth, req) => {
  const sessionAuth = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return
  }

  // Require authentication for all routes
  if (!sessionAuth.userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // Organizations-only mode: ensure user has an organization
  if (sessionAuth.userId && !isOnboardingRoute(req)) {
    // If user doesn't have an organization, redirect to create one
    if (!sessionAuth.orgId) {
      return NextResponse.redirect(new URL('/dashboard/organizations/new', req.url))
    }
  }

  return
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
