"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, Download } from "lucide-react"

const features = [
  "Unlimited campaigns across 7+ channels",
  "LinkedIn Sales Navigator integration", 
  "AI-powered lead quality analyzer",
  "Team collaboration tools",
  "Multi-channel sender management",
  "Priority support",
  "Unified inbox for all conversations",
  "Cloud-based software",
  "CSV import & export leads",
  "Personalized outreach & engagement",
  "LinkedIn Recruiter integration",
  "Smart drip campaign flows"
]

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Management</h1>
          <p className="text-muted-foreground">
            Manage your subscription, billing details, and plan features
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <CreditCard className="w-4 h-4 mr-2" />
          Manage Billing
        </Button>
      </div>

      {/* Subscription Details */}
      <Card className="bg-card border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-xl">Syndie Subscription</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Complete LinkedIn outreach solution for your team
                </p>
              </div>
              <Badge className="bg-warning text-black">trialing</Badge>
            </div>
            <Button variant="outline" size="sm">
              <span className="text-lg">+</span>
              <span className="ml-1">Add More Seats</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Plan Details */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">PLAN DETAILS</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Team Seats</span>
                  <span className="text-sm font-medium">7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Billing Period</span>
                  <span className="text-sm font-medium">Monthly</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Price per Seat</span>
                  <span className="text-sm font-medium">$0.00/month</span>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">BILLING</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Cost</span>
                  <span className="text-sm font-medium">$0.00/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Renews on</span>
                  <span className="text-sm font-medium">September 15, 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method</span>
                  <span className="text-sm font-medium">•••• 9007</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">STATUS</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subscription</span>
                  <Badge className="bg-warning text-black text-xs">trialing</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Days Until Renewal</span>
                  <span className="text-sm font-medium">3 days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">QUICK ACTIONS</h4>
            <div className="flex gap-4">
              <Button variant="outline" className="bg-background">
                <CreditCard className="w-4 h-4 mr-2" />
                Update Payment Method
              </Button>
              <Button variant="outline" className="bg-background">
                <Download className="w-4 h-4 mr-2" />
                Download Latest Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Features */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            Your Syndie Subscription Features
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete LinkedIn outreach solution for your team
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
