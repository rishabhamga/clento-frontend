'use client';

import { useAuth } from '@clerk/nextjs';
import { Loader2, Plus, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { makeAuthenticatedRequest } from '../../../../lib/axios-utils';

export interface Webhook {
    id: string;
    organization_id: string;
    name: string;
    url: string;
    success_rate: number;
    created_at: string;
}

const WebhooksPageContent = () => {
    const [addModal, setAddModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);

    const { getToken } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            const token = await getToken();
            if (!token) {
                toast.error('Login Please');
                return;
            }
            try {
                const res = await makeAuthenticatedRequest('GET', '/integrations/webhooks', {}, token);
                console.log(res?.webhooks);
                setWebhooks(res?.webhooks);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    return (
        <div className="space-y-4 w-full max-w-full">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Webhooks</h1>
                    <p className="text-sm text-muted-foreground">Manage your Webhooks here</p>
                </div>
                <div className="pt-3">
                    <Button onClick={() => setAddModal(true)} className="bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />
                        Add Webhook
                    </Button>
            </div>
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
                                <TableHead>Name</TableHead>
                                <TableHead className="text-center">Url</TableHead>
                                <TableHead className="text-center">Success Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell className="py-10"> </TableCell>
                                    <TableCell className="py-10">
                                        <div className="flex items-center gap-1.5 justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                            <span className="text-sm text-muted-foreground font-medium">Loading webhooks...</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-10"> </TableCell>
                                </TableRow>
                            ) : webhooks.length === 0 ? (
                                <TableRow>
                                    <TableCell className="py-10"> </TableCell>
                                    <TableCell className="py-10">
                                        <div className="flex items-center gap-1.5 text-center justify-center">
                                            <span className="text-sm text-muted-foreground font-medium">No Webhooks Found</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center py-10"> </TableCell>
                                </TableRow>
                            ) : (
                                webhooks.map(w => (
                                    <TableRow key={w.id}>
                                        <TableCell className="text-sm font-medium text-muted-foreground">{w.name}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{w.url}</TableCell>
                                        <TableCell className="text-center text-muted-foreground">{w.success_rate}%</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
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
            const res = await makeAuthenticatedRequest('POST', '/integrations/webhooks', reqBody, token);
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

    const handleCreateWebhooks = async () => {
        try {
            const token = await getToken();
            if (!token) {
                toast.error('Login Not Detected');
                return;
            }
            const reqBody = {
                command: 'CREATE',
                name: formData.name,
                webhookUrl: formData.webhookUrl,
            };
            const res = await makeAuthenticatedRequest('POST', '/integrations/webhooks', reqBody, token);
            onOpenChange(false);
        } catch (err) {
            console.log(err);
        }
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
                    <Button type="button" className="bg-gradient-purple hover-glow-purple" onClick={handleCreateWebhooks} disabled={!tested}>
                        Create Webhook
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
