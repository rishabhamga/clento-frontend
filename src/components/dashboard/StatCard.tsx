'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface StatCardProps {
    title: string;
    value: string | number;
    isLoading: boolean;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    gradient?: boolean;
}

export function StatCard({ title, value, isLoading, change, changeType = 'neutral', icon: Icon, gradient = false }: StatCardProps) {
    const getChangeColor = () => {
        switch (changeType) {
            case 'positive':
                return 'text-success';
            case 'negative':
                return 'text-error';
            default:
                return 'text-muted-foreground';
        }
    };

    return (
        <Card className={`${gradient ? 'bg-gradient-purple glow-purple' : 'bg-card'} border-border/50`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5">
                <CardTitle className={`text-xs font-medium ${gradient ? 'text-white' : 'text-card-foreground'}`}>{title}</CardTitle>
                <Icon className={`h-3.5 w-3.5 ${gradient ? 'text-white/80' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <Skeleton className='h-6 w-20'/>
                ) : (
                    <div className={`text-lg font-bold ${gradient ? 'text-white' : 'text-card-foreground'}`}>{value}</div>
                )}
                {change && <p className={`text-xs ${gradient ? 'text-white/80' : getChangeColor()}`}>{change}</p>}
            </CardContent>
        </Card>
    );
}
