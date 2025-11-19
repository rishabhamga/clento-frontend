'use client';

import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { CampaignWithSenderAccount, RecentCampaigns } from '@/components/dashboard/RecentCampaigns';
import { StatCard } from '@/components/dashboard/StatCard';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@clerk/nextjs';
import { CheckCircle, ListChecks, Mail, MessageCircle, Send, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { makeAuthenticatedRequest } from '../lib/axios-utils';

interface IDashboardStats {
    success_rate: number;
    requests_sent: number;
    total_steps: number;
}

export default function HomePage() {
    const { getToken } = useAuth();
    const [recentCampaigns, setRecentCampaigns] = useState<CampaignWithSenderAccount[]>([]);
    const [dashboardStats, setDashboardStats] = useState<IDashboardStats>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                toast.error('Please login to view the dashboard');
                return;
            }
            try {
                const response = await makeAuthenticatedRequest('GET', '/dashboard', {}, token);
                setRecentCampaigns(response?.data?.recentCampaigns);
                setDashboardStats(response?.data?.stats);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">Welcome back! Here&apos;s what&apos;s happening with your campaigns.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <StatCard isLoading={loading} title="Success Rate" value={dashboardStats?.success_rate ? `${dashboardStats.success_rate}%` : '0%'} change="Acceptance rate" changeType="neutral" icon={TrendingUp} gradient={true} />
                    <StatCard isLoading={loading} title="Requests Sent" value={dashboardStats?.requests_sent || 0} change="Total requests sent" changeType="neutral" icon={Send} />
                    <StatCard isLoading={loading} title="Total Steps" value={dashboardStats?.total_steps || 0} change="Total steps" changeType="neutral" icon={ListChecks} />
                </div>

                {/* Charts and Recent Activity */}
                <div className="grid gap-6 lg:grid-cols-2">
                    <AnalyticsChart />
                    <RecentCampaigns recentCampaigns={recentCampaigns} loading={loading} />
                </div>
            </div>
        </DashboardLayout>
    );
}
