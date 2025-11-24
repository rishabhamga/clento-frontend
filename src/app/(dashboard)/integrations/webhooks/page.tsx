'use client';

import { Database, MoreHorizontal, Plus, Settings, Webhook, Send } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../../../components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';
import { makeAuthenticatedRequest, MakeAxiosRequest } from '../../../../lib/axios-utils';
import { useAuth } from '@clerk/nextjs';

interface WebhookFormData {
    name: string;
    url: string;
}

const WebhooksPageContent = () => {
    const [addModal, setAddModal] = useState<boolean>(false);

    return (
        <div className="space-y-4 w-full max-w-full overflow-hidden">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Webhooks</h1>
                    <p className="text-sm text-muted-foreground">Manage your Webhooks here</p>
                </div>
                <Button className="bg-gradient-purple hover-glow-purple text-sm" onClick={() => setAddModal(true)}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Add Webhook
                </Button>
            </div>
            {/* Accounts Table */}
            <Card className="bg-card border-border/50">
                <CardHeader className="pb-3 justify-between">
                    <CardTitle className="text-sm text-card-foreground">All Webhooks</CardTitle>
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
                        <TableBody></TableBody>
                    </Table>
                </CardContent>
            </Card>
            <CreateModal open={addModal} onOpenChange={setAddModal} />
        </div>
    );
};
export default WebhooksPageContent;

const CreateModal = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
    const [formData, setFormData] = useState<{ name: string; webhookUrl: string }>({
        name: '',
        webhookUrl: '',
    });
    const { getToken } = useAuth();
    const [tested, setTested] = useState<boolean>(false);
    const [webhookResponse, setWebhookResponse] = useState<string>();
    const handleTestConnection = async () => {
        try {
            const token = await getToken();
            if (!token) {
                toast.error('Login Not Detected');
                return;
            }
            const reqBody = {
                command: 'TEST_WEBHOOK',
                webhookUrl: formData.webhookUrl,
            };
            const res = await makeAuthenticatedRequest('POST', '/integrations', reqBody, token);
            setWebhookResponse(res.webhookResponse);
            setTested(true);
        } catch (err) {
            toast.error('Error in webhook');
            console.log(err);
        }
    };
    const checkUrl = (url: string) => {
        const regex = /^https?:\/\/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/[^\s]*)?$/;
        const result = regex.test(url);
        return result;
    };

    useEffect(() => {
        setTested(false);
    }, [formData]);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create Webhook</DialogTitle>
                    <DialogDescription>Configure a new webhook to receive notifications from your integrations.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Webhook Name Field */}
                    <div className="space-y-2">
                        <Label htmlFor="webhook-name">Webhook Name</Label>
                        <Input id="webhook-name" placeholder="Enter webhook name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} />
                    </div>

                    {/* URL Field */}
                    <div className="space-y-2">
                        <Label htmlFor="webhook-url">Webhook URL</Label>
                        <Input id="webhook-url" type="url" placeholder="https://example.com/webhook" value={formData.webhookUrl} onChange={e => setFormData(prev => ({ ...prev, webhookUrl: e.target.value }))} />
                    </div>

                    {/* Request Type Info */}
                    <div className="space-y-2">
                        <Label>Request Type</Label>
                        <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                            <Badge variant="secondary" className="font-mono text-xs">
                                POST
                            </Badge>
                            <span className="text-sm text-muted-foreground">Webhooks will be sent as POST requests to your URL</span>
                        </div>
                    </div>

                    {webhookResponse && (
                        <div className="space-y-2">
                            <Label>Response</Label>
                            <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
                                <span className="text-sm text-muted-foreground whitespace-nowrap">{webhookResponse}</span>
                            </div>
                        </div>
                    )}

                    {/* Test Connection Button */}
                    <div className="pt-2">
                        <Button type="button" variant="outline" className="w-full" onClick={handleTestConnection} disabled={!checkUrl(formData.webhookUrl)}>
                            <Send className="w-3.5 h-3.5 mr-1.5" />
                            Test Connection
                        </Button>
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="button" className="bg-gradient-purple hover-glow-purple" onClick={() => {}} disabled={!tested}>
                        Create Webhook
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
