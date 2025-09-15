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
import { Plus, Edit, Pause, Play, BarChart3, Trash2 } from "lucide-react"

const campaigns = [
  {
    id: 1,
    name: "Q1 LinkedIn Outreach",
    status: "active",
    senderAccount: "LinkedIn - Main",
    prospectList: "Tech Executives",
    progress: 75,
    leads: 250,
    sent: 188,
    replies: 23,
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    name: "Product Launch Campaign",
    status: "draft",
    senderAccount: "Email - Sales",
    prospectList: "Product Managers",
    progress: 0,
    leads: 150,
    sent: 0,
    replies: 0,
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    name: "Follow-up Sequence",
    status: "completed",
    senderAccount: "LinkedIn - Personal",
    prospectList: "Previous Contacts",
    progress: 100,
    leads: 80,
    sent: 80,
    replies: 12,
    createdAt: "2024-01-10",
  },
  {
    id: 4,
    name: "Cold Email Outreach",
    status: "active",
    senderAccount: "Email - Marketing",
    prospectList: "Startup Founders",
    progress: 45,
    leads: 300,
    sent: 135,
    replies: 18,
    createdAt: "2024-01-18",
  },
]

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
          <Button className="bg-gradient-purple hover-glow-purple">
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sender Account</TableHead>
                  <TableHead>Prospect List</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Performance</TableHead>
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
                          Created {campaign.createdAt}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-success rounded-full"></div>
                        {campaign.senderAccount}
                      </div>
                    </TableCell>
                    <TableCell>{campaign.prospectList}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{campaign.progress}%</span>
                          <span className="text-muted-foreground">
                            {campaign.sent}/{campaign.leads}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-gradient-purple h-2 rounded-full"
                            style={{ width: `${campaign.progress}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Sent:</span>
                          <span className="text-foreground">{campaign.sent}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Replies:</span>
                          <span className="text-success">{campaign.replies}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {campaign.status === "active" ? (
                          <Button size="sm" variant="outline">
                            <Pause className="w-4 h-4" />
                          </Button>
                        ) : campaign.status === "draft" ? (
                          <Button size="sm" className="bg-gradient-purple hover-glow-purple">
                            <Play className="w-4 h-4" />
                          </Button>
                        ) : null}
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-error hover:text-error">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  )
}
