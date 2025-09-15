"use client"

interface ClerkProviderProps {
  children: React.ReactNode
}

export function ClerkProvider({ children }: ClerkProviderProps) {
  // For development, just render children without Clerk to avoid build issues
  // TODO: Implement proper Clerk integration when keys are provided
  return <>{children}</>
}
