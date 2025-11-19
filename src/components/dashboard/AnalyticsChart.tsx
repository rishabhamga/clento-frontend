'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { makeAuthenticatedRequest } from '../../lib/axios-utils';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

const data = [
    { name: 'Mon', sent: 45, replies: 12 },
    { name: 'Tue', sent: 52, replies: 18 },
    { name: 'Wed', sent: 38, replies: 8 },
    { name: 'Thu', sent: 61, replies: 22 },
    { name: 'Fri', sent: 55, replies: 15 },
    { name: 'Sat', sent: 28, replies: 6 },
    { name: 'Sun', sent: 33, replies: 9 },
];

interface recentStepsStats {
    date: string;
    total: number;
    connectionsTotal: number;
    connectionsFailed: number;
    connectionsSuccessful: number;

    profileVisitsTotal: number;
    profileVisitsFailed: number;
    profileVisitsSuccessful: number;

    postLikedTotal: number;
    postLikedFailed: number;
    postLikedSuccessful: number;
}

enum ERecentActivity {
    CONNECTIONS = 'CONNECTIONS',
    PROFILE = 'PROFILE',
    POST = 'POST',
}

export const AnalyticsChart = () => {
    const { getToken } = useAuth();
    const [recentActivity, setRecentActivity] = useState<recentStepsStats[]>();
    const [type, setType] = useState<ERecentActivity>(ERecentActivity.CONNECTIONS);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = await getToken();
            if (!token) {
                console.log('no token');
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const res = await makeAuthenticatedRequest('GET', '/dashboard/recent-campaigns', {}, token);
                setRecentActivity(res?.recentActivity);
            } catch (error) {
                console.log(error);
                toast.error('Failed to load campaign activity');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [getToken]);
    return (
        <Card className="bg-card border-border/50 h-120">
            <CardHeader>
                <div className="flex justify-between items-center w-full">
                    <CardTitle className="text-card-foreground">Campaign Activity</CardTitle>
                    {!loading && recentActivity && recentActivity.length > 0 && (
                        <Tabs value={type} onValueChange={value => setType(value as ERecentActivity)}>
                            <TabsList className="grid grid-cols-3">
                                <TabsTrigger value={ERecentActivity.CONNECTIONS}>Connections</TabsTrigger>
                                <TabsTrigger value={ERecentActivity.PROFILE}>Profile Visits</TabsTrigger>
                                <TabsTrigger value={ERecentActivity.POST}>Posts Liked</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <AnalyticsChartSkeleton />
                ) : !recentActivity || recentActivity.length === 0 ? (
                    <EmptyState
                        title="No Activity Data"
                        description="There's no campaign activity data available yet. Start a campaign to see analytics here."
                    />
                ) : (
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={recentActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <Tooltip
                                contentStyle={{
                                    animation: 'ease-in-out',
                                    borderRadius: '20px',
                                }}
                                cursor={false}
                            />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} angle={-90} textAnchor="end" height={80} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            {(() => {
                                switch (type) {
                                    case ERecentActivity.CONNECTIONS:
                                        return (
                                            <>
                                                <Bar dataKey="connectionsTotal" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="connectionsSuccessful" fill="#22C55E" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="connectionsFailed" fill="red" radius={[4, 4, 0, 0]} minPointSize={2} />
                                            </>
                                        );
                                    case ERecentActivity.PROFILE:
                                        return (
                                            <>
                                                <Bar dataKey="profileVisitsTotal" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="profileVisitsSuccessful" fill="#22C55E" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="profileVisitsFailed" fill="red" radius={[4, 4, 0, 0]} minPointSize={2} />
                                            </>
                                        );
                                    case ERecentActivity.POST:
                                        return (
                                            <>
                                                <Bar dataKey="postLikedTotal" fill="url(#purpleGradient)" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="postLikedSuccessful" fill="#22C55E" radius={[4, 4, 0, 0]} minPointSize={2} />
                                                <Bar dataKey="postLikedFailed" fill="red" radius={[4, 4, 0, 0]} minPointSize={2} />
                                            </>
                                        );
                                    default:
                                        return null;
                                }
                            })()}
                            <defs>
                                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#7C3AED" />
                                    <stop offset="100%" stopColor="#9333EA" />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
};
const AnalyticsChartSkeleton = () => {
    const heights = [
        [70, 50, 30],
        [60, 45, 25],
        [80, 60, 40],
        [55, 40, 20],
        [75, 55, 35],
        [65, 50, 30],
        [70, 45, 25],
    ];

    return (
        <div className="w-full h-[350px] flex flex-col">
            <div className="flex-1 flex items-end gap-2 px-4 pb-8">
                {heights.map((barHeights, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex flex-col items-center gap-1 w-full h-full justify-end">
                            <Skeleton className="w-full rounded-t-md" style={{ height: `${barHeights[0]}%` }} />
                            <Skeleton className="w-full rounded-t-md" style={{ height: `${barHeights[1]}%` }} />
                            <Skeleton className="w-full rounded-t-md" style={{ height: `${barHeights[2]}%` }} />
                        </div>
                        <Skeleton className="h-4 w-12 -rotate-90 mt-2" />
                    </div>
                ))}
            </div>
        </div>
    );
};
