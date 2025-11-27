'use client';

import { Linkedin, Loader2, MoreHorizontal, Settings, Database, Webhook } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../components/ui/dropdown-menu';
import { Button } from '../../../components/ui/button';

const integrations = [
    {
        id: 1,
        name: 'Webhook',
        icon: Webhook,
        status: 1 > 0 ? 'Connected' : 'Disconnected',
        statusColor: 1 > 0 ? 'success' : 'error',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        badge: 'Beta',
    },
    {
        id: 2,
        name: 'ZOHO',
        icon: Database,
        status: 1 > 0 ? 'Connected' : 'Disconnected',
        statusColor: 1 > 0 ? 'success' : 'error',
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-50',
        badge: 'Coming Soon',
    },
];

const IntegrationsPageContent = () => {

    return (
        <div className="space-y-4 w-full max-w-full overflow-hidden">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Integrations</h1>
                    <p className="text-sm text-muted-foreground">Manage your Integrations here</p>
                </div>
            </div>
            {/* Accounts Table */}
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-card-foreground">All Integrations</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App</TableHead>
                                <TableHead>Connection Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {integrations.map(account => {
                                const IconComponent = account.icon;
                                const isComingSoon = account.badge === 'Coming Soon';

                                return (
                                    <TableRow key={account.id} className="hover:bg-background/50">
                                        {/* App Column */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`p-1 rounded-md ${account.bgColor || 'bg-muted'}`}>
                                                    <IconComponent className={`w-3.5 h-3.5 ${account.iconColor}`} />
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-sm font-medium text-foreground">{account.name}</span>
                                                    {account.badge && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {account.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        {/* Connection Status Column */}
                                        <TableCell>
                                            <Badge className="bg-error text-white">Disconnected</Badge>
                                        </TableCell>

                                        {/* Actions Column */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {!isComingSoon ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Settings className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => {window.location.href = '/integrations/webhooks';}}>
                                                                <Settings className="w-3.5 h-3.5 mr-1.5" />
                                                                Manage
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                ) : (
                                                    <Button variant="outline" size="sm" disabled>
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};
export default IntegrationsPageContent;
