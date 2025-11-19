'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { Eye, Play, Pause, Plus, Megaphone } from 'lucide-react';
import { Campaign, CampaignStatus } from '../../types/campaign';
import { CheckNever } from '../../lib/axios-utils';
import { Separator } from '@radix-ui/react-separator';

const getStatusBadge = (status: CampaignStatus) => {
    switch (status) {
        case CampaignStatus.IN_PROGRESS:
            return <Badge className="bg-success text-black glow-green">In Progress</Badge>;
        case CampaignStatus.DRAFT:
            return <Badge variant="secondary">Draft</Badge>;
        case CampaignStatus.COMPLETED:
            return <Badge className="bg-blue-500 text-white">Completed</Badge>;
        case CampaignStatus.FAILED:
            return <Badge className="bg-red-500 text-white">Failed</Badge>;
        case CampaignStatus.PAUSED:
            return <Badge className="bg-warning text-black">Paused</Badge>;
        case CampaignStatus.SCHEDULED:
            return <Badge className="bg-blue-500 text-white">Scheduled</Badge>;
        default:
            CheckNever(status);
    }
};

export interface CampaignWithSenderAccount extends Campaign {
    sender_account_detail: {
        name: string;
        profile_picture_url?: string;
        status: string;
        provider: string;
    };
}

const CampaignSkeleton = () => (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
        <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 w-fit min-w-[160px] mb-2">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </div>
            <Skeleton className="h-3 w-20" />
        </div>
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
        </div>
    </div>
);

export function RecentCampaigns({ recentCampaigns, loading }: { recentCampaigns: CampaignWithSenderAccount[]; loading: boolean }) {
    const handleCreateCampaign = () => {
        // Navigate to create campaign page
        window.location.href = '/campaigns/create-campaign';
    };

    const handleViewAll = () => {
        // Navigate to campaigns page
        window.location.href = '/campaigns';
    };

    return (
        <Card className="bg-card border-border/50 h-120 overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="text-card-foreground">Recent Campaigns</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest campaigns from your accounts</p>
                </div>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" onClick={handleViewAll}>
                    <Eye className="w-4 h-4 mr-2" />
                    View All
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <CampaignSkeleton key={index} />
                        ))}
                    </div>
                ) : recentCampaigns.length === 0 ? (
                    <EmptyState
                        icon={<Megaphone className="w-12 h-12 text-muted-foreground" />}
                        title="No campaigns yet"
                        description="Start your first outreach campaign to connect with potential leads and grow your business."
                        action={{
                            label: 'Create Campaign',
                            onClick: handleCreateCampaign,
                        }}
                        className="border-0 shadow-none bg-transparent"
                    />
                ) : (
                    <div className="space-y-4">
                        {recentCampaigns.map(campaign => (
                            <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-medium text-foreground">{campaign.name}</h4>
                                        {getStatusBadge(campaign.status)}
                                    </div>
                                    <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 w-fit min-w-[160px]">
                                        {campaign.sender_account_detail?.profile_picture_url ? (
                                            <img src={campaign.sender_account_detail.profile_picture_url} alt={campaign.sender_account_detail.name || 'Sender'} className="w-8 h-8 rounded-full object-cover border border-border" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                {campaign.sender_account_detail?.name
                                                    ? campaign.sender_account_detail.name
                                                          .split(' ')
                                                          .map((n: string) => n[0])
                                                          .join('')
                                                          .toUpperCase()
                                                    : '?'}
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm text-foreground">{campaign.sender_account_detail?.name || 'Unknown'}</span>
                                            <span className="text-xs text-muted-foreground">{campaign.sender_account_detail?.provider || 'No provider'}</span>
                                        </div>
                                    </div>
                                    <Separator className="my-2 bg-border/50" />
                                    <div className="text-xs text-muted-foreground mb-2">Created {new Date(campaign.created_at).toLocaleDateString()}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" onClick={handleViewAll}>
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                    {campaign.status === CampaignStatus.IN_PROGRESS ? (
                                        <Button size="sm" variant="outline">
                                            <Pause className="w-4 h-4" />
                                        </Button>
                                    ) : campaign.status === CampaignStatus.PAUSED ? (
                                        <Button size="sm" className="bg-gradient-purple hover-glow-purple">
                                            <Play className="w-4 h-4" />
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
