import { createClient } from '@supabase/supabase-js'
import { useAuth, useSession } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

// Client-side Supabase client with Clerk integration (matches official docs)
export function createClerkSupabaseClient() {
  const { session } = useSession()

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return session?.getToken() ?? null
      },
    },
  )
}

// Server-side Supabase client (matches official docs)
export async function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken()
      },
    },
  )
}

// Hook for using Supabase in React components
export function useSupabase() {
  return createClerkSupabaseClient()
}