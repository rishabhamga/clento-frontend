'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MoreHorizontal, Linkedin, Mail, MessageSquare, Send, Instagram, Phone, Plus, Settings, Trash2, Loader2 } from 'lucide-react';
import { useConnectedAccounts } from '@/hooks/useConnectedAccounts';

export default function AccountsPage() {
    const [manageDialogOpen, setManageDialogOpen] = useState(false);

    // Get connected LinkedIn accounts
    const { data: connectedAccountsData, isLoading } = useConnectedAccounts('linkedin');
    const connectedAccounts = connectedAccountsData?.data || [];
    const linkedInAccounts = connectedAccounts;

    const accounts = [
        {
            id: 1,
            name: 'LinkedIn',
            icon: Linkedin,
            status: linkedInAccounts.length > 0 ? 'Connected' : 'Disconnected',
            statusColor: linkedInAccounts.length > 0 ? 'success' : 'error',
            seatsUsed: linkedInAccounts.length,
            seatsTotal: 7,
            iconColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            id: 2,
            name: 'Email',
            icon: Mail,
            status: 'Disconnected',
            statusColor: 'error',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: 'text-gray-600',
            bgColor: 'bg-gray-50',
            badge: 'Beta',
        },
        {
            id: 3,
            name: 'Whatsapp',
            icon: MessageSquare,
            status: 'Coming soon',
            statusColor: 'warning',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            id: 4,
            name: 'Telegram',
            icon: Send,
            status: 'Coming soon',
            statusColor: 'warning',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: 'text-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            id: 5,
            name: 'Instagram',
            icon: Instagram,
            status: 'Coming soon',
            statusColor: 'warning',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: 'text-pink-600',
            bgColor: 'bg-pink-50',
        },
        {
            id: 6,
            name: 'Imessage',
            icon: Phone,
            status: 'Coming soon',
            statusColor: 'warning',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: 'text-gray-600',
            bgColor: 'bg-gray-50',
        },
        {
            id: 7,
            name: 'X',
            icon: () => <div className="w-6 h-6 bg-black text-white rounded flex items-center justify-center text-sm font-bold">X</div>,
            status: 'Coming soon',
            statusColor: 'warning',
            seatsUsed: 0,
            seatsTotal: 0,
            iconColor: '',
            bgColor: 'bg-gray-50',
        },
    ];

    const getStatusBadge = (status: string, statusColor: string) => {
        switch (statusColor) {
            case 'success':
                return <Badge className="bg-success text-black glow-green">{status}</Badge>;
            case 'error':
                return <Badge className="bg-error text-white">{status}</Badge>;
            case 'warning':
                return <Badge className="bg-warning text-black">{status}</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleManageClick = (provider: string) => {
        if (provider === 'linkedin') {
            // Navigate to LinkedIn accounts page
            window.location.href = '/accounts/linkedin';
        } else {
            setManageDialogOpen(true);
        }
    };

    const handleConnectLinkedIn = async () => {
        // This will redirect to Unipile hosted auth
        try {
            // Use ngrok URL for webhooks so Unipile can reach our server
            const baseUrl = 'https://623751821a25.ngrok-free.app';

            const response = await fetch('/api/accounts/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    provider: 'linkedin',
                    success_redirect_url: `${baseUrl}/accounts?connected=true`,
                    failure_redirect_url: `${baseUrl}/accounts?error=connection_failed`,
                    notify_url: `${baseUrl}/api/accounts/webhook`,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Connection response:', data);
                // Redirect to Unipile hosted auth - handle different response formats
                const redirectUrl = data.data?.url || data.data?.connection_url || data.connection_url;
                if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    console.error('No redirect URL in response:', data);
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to create connection link:', errorData);
            }
        } catch (error) {
            console.error('Error connecting LinkedIn account:', error);
        }
    };

    const handleDisconnectAccount = async (accountId: string) => {
        try {
            const response = await fetch(`/api/accounts/${accountId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Refresh the page or update state
                window.location.reload();
            }
        } catch (error) {
            console.error('Error disconnecting account:', error);
        }
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Accounts</h1>
                    <p className="text-sm text-muted-foreground">Manage your connected accounts and integrations</p>
                </div>
            </div>

            {/* Accounts Table */}
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-card-foreground">All Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>App</TableHead>
                                <TableHead>Connection Status</TableHead>
                                <TableHead>Seat Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map(account => {
                                const IconComponent = account.icon;
                                const isLinkedIn = account.name === 'LinkedIn';

                                return (
                                    <TableRow key={account.id} className="hover:bg-background/50">
                                        {/* App Column */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`p-1 rounded-md ${account.bgColor || 'bg-muted'}`}>{account.id === 7 ? <IconComponent /> : <IconComponent className={`w-3.5 h-3.5 ${account.iconColor}`} />}</div>
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
                                            {isLinkedIn ? (
                                                isLoading ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                                        <span className="text-xs text-muted-foreground">Loading...</span>
                                                    </div>
                                                ) : linkedInAccounts.length > 0 ? (
                                                    <Badge className="bg-success text-black glow-green">Connected</Badge>
                                                ) : (
                                                    <Badge className="bg-error text-white">Disconnected</Badge>
                                                )
                                            ) : (
                                                getStatusBadge(account.status, account.statusColor)
                                            )}
                                        </TableCell>

                                        {/* Seat Status Column */}
                                        <TableCell>
                                            {isLinkedIn && isLoading ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                                                    <span className="text-xs text-muted-foreground">Loading...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs text-foreground">{account.seatsTotal > 0 ? `${account.seatsUsed}/${account.seatsTotal} used` : '0/0 used'}</span>
                                                    {account.seatsTotal > 0 && (
                                                        <Button variant="ghost" size="sm" className="h-5 px-1.5 text-xs">
                                                            Get more
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </TableCell>

                                        {/* Actions Column */}
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {isLinkedIn ? (
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Settings className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleManageClick(account.name.toLowerCase())}>
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

            {/* Manage LinkedIn Accounts Dialog */}
            <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Manage LinkedIn Accounts</DialogTitle>
                        <DialogDescription>View and manage your connected LinkedIn accounts</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        {/* Connected Accounts List */}
                        {isLoading ? (
                            <div className="text-center py-7">
                                <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto"></div>
                                <p className="text-muted-foreground mt-1.5">Loading accounts...</p>
                            </div>
                        ) : linkedInAccounts.length > 0 ? (
                            <div className="space-y-2.5">
                                <h4 className="font-medium">Connected Accounts ({linkedInAccounts.length})</h4>
                                {linkedInAccounts.map(account => (
                                    <div key={account.id} className="flex items-center justify-between p-2.5 border rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center">
                                                <Linkedin className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{account.display_name}</p>
                                                <p className="text-xs text-muted-foreground">{account.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-success border-success">
                                                Active
                                            </Badge>
                                            <Button variant="ghost" size="sm" onClick={() => handleDisconnectAccount(account.id)} className="text-red-600 hover:text-red-700">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-7">
                                <Linkedin className="w-11 h-11 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">No LinkedIn accounts connected</p>
                            </div>
                        )}

                        {/* Connect New Account Button */}
                        <div className="pt-3 border-t">
                            <Button onClick={handleConnectLinkedIn} className="w-full bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple">
                                <Plus className="w-3.5 h-3.5 mr-1.5" />
                                Connect LinkedIn Account
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
