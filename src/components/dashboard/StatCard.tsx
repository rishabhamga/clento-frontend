'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon: LucideIcon;
    gradient?: boolean;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, gradient = false }: StatCardProps) {
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${gradient ? 'text-white' : 'text-card-foreground'}`}>{title}</CardTitle>
                <Icon className={`h-4 w-4 ${gradient ? 'text-white/80' : 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${gradient ? 'text-white' : 'text-card-foreground'}`}>{value}</div>
                {change && <p className={`text-xs ${gradient ? 'text-white/80' : getChangeColor()}`}>{change}</p>}
            </CardContent>
        </Card>
    );
}
