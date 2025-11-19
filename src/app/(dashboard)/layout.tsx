import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Force dynamic rendering for ALL dashboard routes
// This prevents static generation during build which would fail without Clerk keys
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function AuthenticatedDashboardLayout({ children }: DashboardLayoutProps) {
    // Authentication is handled by middleware
    // No client-side auth checks needed here
    return <DashboardLayout>{children}</DashboardLayout>;
}
