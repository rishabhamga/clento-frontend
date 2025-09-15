'use client'

import Link from 'next/link'
// import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo and branding */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-purple bg-clip-text text-transparent mb-2">
            Clento Clay
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            AI-powered LinkedIn and Email Outreach Automation
          </p>
        </div>

        {/* Sign-in placeholder */}
        <div className="shadow-xl border border-border bg-card w-full rounded-2xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Sign In</h2>
            <p className="text-muted-foreground mb-6">Authentication is disabled in development mode</p>
            <div className="space-y-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="bg-gradient-purple hover:hover-gradient-purple text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl hover-glow-purple transition-all duration-200 transform hover:-translate-y-0.5 w-full"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <Link 
            href="/sign-up" 
            className="text-primary font-semibold hover:text-primary/80 hover:underline transition-all duration-200"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  )
}
