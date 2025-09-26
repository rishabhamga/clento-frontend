"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Pause, Play, BarChart3, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { makeAuthenticatedRequest } from "../../../lib/axios-utils"
import { Campaign } from "../../../types/campaign"
import { toast } from "sonner"

interface ICampaign extends Campaign {
    list_data: {
        total: number;
        name: string;
    },
    senderData: {
        name: string;
        profile_picture_url?: string;
        status: string;
        provider: string;
    }
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case "active":
            return <Badge className="bg-success text-black glow-green">Active</Badge>
        case "draft":
            return <Badge variant="secondary">Draft</Badge>
        case "completed":
            return <Badge className="bg-blue-500 text-white">Completed</Badge>
        case "paused":
            return <Badge className="bg-warning text-black">Paused</Badge>
        default:
            return <Badge variant="outline">{status}</Badge>
    }
}

export default function CampaignsPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<ICampaign[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string[]>([]);
    const { getToken } = useAuth();

    const handleDeleteCampaign = async (campaignId: string) => {
        const token = await getToken()
        setIsDeleting(prev => [...prev, campaignId]);
        if (!token) {
            throw new Error('Authentication required');
        }
        try{
            await makeAuthenticatedRequest('POST', `/campaigns/delete`, { campaignId }, token);
            toast.success("Campaign deleted successfully");
            setCampaigns(prev => prev.filter(campaign => campaign.id !== campaignId));
        }catch(error){
            toast.error("Failed to delete campaign");
            console.error(error);
        } finally {
            setIsDeleting(prev => prev.filter(id => id !== campaignId));
        }
    }
    const handleEditCampaign = async (campaignId: string) => {
        router.push(`/campaigns/edit/${campaignId}`);
    }

    useEffect(() => {
        const fetchCampaigns = async () => {
            setIsLoading(true)
            const token = await getToken();
            if (!token) {
                throw new Error('Authentication required');
            }
            try {
                const res = await makeAuthenticatedRequest('GET', '/campaigns', {}, token);
                setCampaigns(res?.campaigns);
            } catch (error) {
                toast.error("Failed to fetch campaigns")
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchCampaigns();
    }, [])
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Campaigns</h1>
                    <p className="text-muted-foreground">
                        Manage and monitor your outreach campaigns
                    </p>
                </div>
                <Button className="bg-gradient-purple hover-glow-purple" onClick={() => router.push("/campaigns/create-campaign")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Campaign
                </Button>
            </div>

            {/* Campaigns Table */}
            <Card className="bg-card border-border/50">
                <CardHeader>
                    <CardTitle className="text-card-foreground">All Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        // Loading State
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Loading campaigns...</span>
                            </div>
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="flex items-center space-x-4">
                                        <Skeleton className="h-4 w-[200px]" />
                                        <Skeleton className="h-4 w-[80px]" />
                                        <Skeleton className="h-4 w-[120px]" />
                                        <Skeleton className="h-4 w-[100px]" />
                                        <Skeleton className="h-4 w-[60px]" />
                                        <Skeleton className="h-4 w-[80px]" />
                                        <Skeleton className="h-4 w-[120px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !campaigns || campaigns.length === 0 ? (
                        // No Campaigns State
                        <div className="text-center py-12">
                            <div className="text-muted-foreground mb-4">
                                Oops no campaigns found, create one
                            </div>
                            <Button
                                className="bg-gradient-purple hover-glow-purple"
                                onClick={() => router.push("/campaigns/create-campaign")}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Campaign
                            </Button>
                        </div>
                    ) : (
                        // Campaigns Table
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Campaign Name</TableHead>
                                    <TableHead>Sender Account</TableHead>
                                    <TableHead>Prospect List</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map((campaign) => (
                                    <TableRow key={campaign.id} className="hover:bg-background/50">
                                        <TableCell>
                                            <div>
                                                <div className="font-medium text-foreground">
                                                    {campaign.name}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Created {new Date(campaign.created_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </TableCell>
                                        {/* <TableCell>{getStatusBadge(campaign.status)}</TableCell> */}
                                        <TableCell>
                                            <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2 w-fit min-w-[160px]">
                                                {campaign.senderData?.profile_picture_url ? (
                                                    <img
                                                        src={campaign.senderData.profile_picture_url}
                                                        alt={campaign.senderData.name || "Sender"}
                                                        className="w-8 h-8 rounded-full object-cover border border-border"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-semibold text-muted-foreground">
                                                        {campaign.senderData?.name
                                                            ? campaign.senderData.name
                                                                .split(" ")
                                                                .map((n: string) => n[0])
                                                                .join("")
                                                                .toUpperCase()
                                                            : "?"}
                                                    </div>
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {campaign.senderData?.name || "Unknown"}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {campaign.senderData?.provider || "No provider"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{campaign?.list_data?.name}: {campaign?.list_data?.total} Leads</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Button className="cursor-pointer" size="sm" variant="outline" onClick={() => handleEditCampaign(campaign.id)}>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                {/* <Button size="sm" variant="outline">
                                                    <BarChart3 className="w-4 h-4" />
                                                </Button> */}
                                                <Button size="sm" variant="outline" className="text-error hover:text-error" onClick={() => handleDeleteCampaign(campaign.id)} disabled={isDeleting.includes(campaign.id)}>
                                                    {isDeleting.includes(campaign.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
