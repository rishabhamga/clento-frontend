"use client"

import { ClerkProvider as ClerkProviderComponent } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

interface ClerkProviderProps {
  children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  return (
    <ClerkProviderComponent
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#8b5cf6', // Purple theme to match your app
        },
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700 text-white',
          card: 'bg-background border-border',
          headerTitle: 'text-foreground',
          headerSubtitle: 'text-muted-foreground',
          socialButtonsBlockButton: 'border-border bg-background hover:bg-muted',
          socialButtonsBlockButtonText: 'text-foreground',
          formFieldInput: 'bg-background border-border text-foreground',
          footerActionLink: 'text-purple-600 hover:text-purple-700',
        },
      }}
      // Organization-only configuration
      afterSignInUrl="/"
      afterSignUpUrl="/"
      afterSignOutUrl="/sign-in"
    >
      {children}
    </ClerkProviderComponent>
  )
}
