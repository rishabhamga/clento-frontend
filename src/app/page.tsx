"use client"

import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { StatCard } from "@/components/dashboard/StatCard"
import { AnalyticsChart } from "@/components/dashboard/AnalyticsChart" 
import { RecentCampaigns } from "@/components/dashboard/RecentCampaigns"
import { 
  TrendingUp, 
  Send, 
  CheckCircle, 
  MessageCircle, 
  Mail 
} from "lucide-react"

export default function HomePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your campaigns.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Success Rate"
            value="28.2%"
            change="Acceptance rate"
            changeType="neutral"
            icon={TrendingUp}
            gradient={true}
          />
          <StatCard
            title="Requests Sent"
            value="607"
            change="Total requests sent"
            changeType="neutral"
            icon={Send}
          />
          <StatCard
            title="Accepted"
            value="171"
            change="Total connections accepted"
            changeType="neutral"
            icon={CheckCircle}
          />
          <StatCard
            title="Replied"
            value="39"
            change="Total replies received"
            changeType="neutral"
            icon={MessageCircle}
          />
          <StatCard
            title="Email Sent"
            value="0"
            change="Total emails sent"
            changeType="neutral"
            icon={Mail}
          />
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsChart />
          <RecentCampaigns />
        </div>
      </div>
    </DashboardLayout>
  )
}
