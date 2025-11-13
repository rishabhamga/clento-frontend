"use client"

import { ClerkProvider as ClerkProviderComponent } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import { useTheme } from 'next-themes'

interface ClerkProviderProps {
    children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
    const { theme } = useTheme();
    return (
        <ClerkProviderComponent
            appearance={{
                theme: theme === 'dark' ? dark : undefined,
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
