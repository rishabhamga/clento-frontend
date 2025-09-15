"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Play, Pause } from "lucide-react"

const campaigns = [
  {
    id: 1,
    name: "People Similar V1 - 13 September",
    status: "active",
    account: "Ankur Parchani • People Similar V1",
    date: "13 September",
    sent: 18,
    accepted: 1,
    replied: 0,
  },
  {
    id: 2,
    name: "People Similar V2 - 13 September",
    status: "active",
    account: "Ankur Parchani • People Similar V2",
    date: "13 September",
    sent: 15,
    accepted: 2,
    replied: 1,
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
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function RecentCampaigns() {
  return (
    <Card className="bg-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-card-foreground">Recent Campaigns</CardTitle>
          <p className="text-sm text-muted-foreground">Latest campaigns from your accounts</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
          <Eye className="w-4 h-4 mr-2" />
          View All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50 hover:bg-background/80 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-foreground">{campaign.name}</h4>
                  {getStatusBadge(campaign.status)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>{campaign.account}</span>
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  Created {campaign.date}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">📤</span>
                    <span className="font-medium">{campaign.sent}</span>
                    <span className="text-muted-foreground">sent</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">🤝</span>
                    <span className="font-medium">{campaign.accepted}</span>
                    <span className="text-muted-foreground">accepted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">💬</span>
                    <span className="font-medium">{campaign.replied}</span>
                    <span className="text-muted-foreground">replied</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4" />
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
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
