'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Linkedin, Plus, MoreHorizontal, Settings, Trash2, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { useAuth } from '@clerk/nextjs';
export default function LinkedInAccountsPage() {
    const [isConnecting, setIsConnecting] = useState(false);
    const { getToken } = useAuth();

    // Get connected LinkedIn accounts
    const { data: connectedAccountsData, isLoading } = useConnectedAccounts('linkedin');
    const connectedAccounts = connectedAccountsData?.data || [];

    const handleConnectLinkedIn = async () => {
        setIsConnecting(true);
        const token = await getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        try {
            // Frontend URL for redirects, Backend URL for webhook
            const frontendUrl = 'https://app.clento.ai'; // Frontend (port 3000)
            const backendUrl = 'https://api-staging.clento.ai'; // Backend (port 3001)

            const response = await fetch('/api/accounts/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: 'linkedin',
                    token,
                    success_redirect_url: `${frontendUrl}/accounts/linkedin?connected=true`,
                    failure_redirect_url: `${frontendUrl}/accounts/linkedin?error=connection_failed`,
                    notify_url: `${backendUrl}/api/accounts/webhook`,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create connection link');
            }

            const data = await response.json();

            // Extract the URL from the response and redirect to Unipile hosted auth
            const redirectUrl = data.data?.url || data.url;
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                throw new Error('No redirect URL received from server');
            }
        } catch (error) {
            console.error('Error connecting LinkedIn:', error);
            alert('Failed to connect LinkedIn account. Please try again.');
        } finally {
            setIsConnecting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'connected':
                return <CheckCircle className="w-3.5 h-3.5 text-green-600" />;
            case 'pending':
                return <Clock className="w-3.5 h-3.5 text-yellow-600" />;
            case 'error':
                return <AlertTriangle className="w-3.5 h-3.5 text-red-600" />;
            default:
                return <AlertTriangle className="w-3.5 h-3.5 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'connected':
                return <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Active</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Pending</Badge>;
            case 'error':
                return <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Error</Badge>;
            default:
                return <Badge variant="outline" className="text-xs">Unknown</Badge>;
        }
    };

    const formatLastSync = (lastSync: string) => {
        if (!lastSync) return 'Never';
        const date = new Date(lastSync);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold">LinkedIn Accounts</h1>
                    <p className="text-sm text-muted-foreground">Manage your connected LinkedIn accounts for outreach campaigns</p>
                </div>
                <Button onClick={handleConnectLinkedIn} disabled={isConnecting} className="bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple text-sm">
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    {isConnecting ? 'Connecting...' : 'Connect LinkedIn Account'}
                </Button>
            </div>

            {/* Stats Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-1.5 text-base">
                        <Linkedin className="w-4 h-4 text-blue-600" />
                        LinkedIn Account Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="text-center">
                            <div className="text-xl font-bold">{connectedAccounts.length}</div>
                            <div className="text-xs text-muted-foreground">Connected Accounts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{connectedAccounts.filter(acc => acc.status === 'connected').length}</div>
                            <div className="text-xs text-muted-foreground">Active</div>
                        </div>
                        <div className="text-center">
                            <div className="text-xl font-bold">{connectedAccounts.filter(acc => acc.status === 'pending').length}</div>
                            <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Accounts Table */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Connected Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-9">
                            <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading accounts...</p>
                        </div>
                    ) : connectedAccounts.length === 0 ? (
                        <div className="text-center py-9">
                            <Linkedin className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                            <h3 className="text-base font-medium mb-1.5">No LinkedIn accounts connected</h3>
                            <p className="text-sm text-muted-foreground mb-3">Connect your LinkedIn account to start creating outreach campaigns</p>
                            <Button onClick={handleConnectLinkedIn} disabled={isConnecting} className="bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple text-sm">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                {isConnecting ? 'Connecting...' : 'Connect Your First Account'}
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-sm">Account</TableHead>
                                    <TableHead className="text-sm">Email</TableHead>
                                    <TableHead className="text-sm">Account Type</TableHead>
                                    <TableHead className="text-sm">Status</TableHead>
                                    <TableHead className="text-sm">Last Sync</TableHead>
                                    <TableHead className="text-right text-sm">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {connectedAccounts.map(account => (
                                    <TableRow key={account.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2.5">
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={account.profile_picture_url} />
                                                    <AvatarFallback className="text-xs">{account.display_name?.charAt(0) || 'L'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-sm">{account.display_name}</div>
                                                    <div className="text-xs text-muted-foreground">{account.metadata?.account_type || 'Personal'}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{account.email}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-yellow-600 border-yellow-200 text-xs">
                                                {account.metadata?.account_type === 'premium' ? 'Premium' : 'Personal'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(account.status)}
                                                {getStatusBadge(account.status)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm">{formatLastSync(account.last_synced_at || '')}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                        <MoreHorizontal className="w-3.5 h-3.5" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem className="text-xs">
                                                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                                                        Settings
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-xs">
                                                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                                                        Sync Profile
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-600 text-xs">
                                                        <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                        Disconnect
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
