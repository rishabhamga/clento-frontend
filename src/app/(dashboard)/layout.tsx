"use client"

import { useAuth } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { Loader2 } from "lucide-react"

// Force dynamic rendering for the entire dashboard section
export const dynamic = 'force-dynamic'

interface DashboardLayoutProps {
    children: React.ReactNode
}

export default function AuthenticatedDashboardLayout({ children }: DashboardLayoutProps) {
    const { isLoaded, userId } = useAuth()

    // Show loading state while auth is loading
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    // Redirect to sign-in if not authenticated
    if (!userId) {
        redirect('/sign-in')
    }

    // Render the dashboard for authenticated users
    return <DashboardLayout>{children}</DashboardLayout>
}