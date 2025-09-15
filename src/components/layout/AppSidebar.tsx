"use client"

import { 
  BarChart3, 
  Users, 
  Target, 
  Mail, 
  Settings, 
  HelpCircle, 
  BookOpen,
  CreditCard,
  Home,
  Zap
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"
import Link from "next/link"

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Campaigns",
    url: "/campaigns",
    icon: Target,
  },
  {
    title: "Leads",
    url: "/leads",
    icon: Users,
  },
  {
    title: "Prospect lists",
    url: "/prospect-lists",
    icon: Mail,
  },
  {
    title: "Unibox",
    url: "/unibox",
    icon: Mail,
  },
  {
    title: "Accounts",
    url: "/accounts",
    icon: Zap,
  },
  {
    title: "Integrations",
    url: "/integrations",
    icon: BarChart3,
  },
]

const bottomItems = [
  {
    title: "Subscriptions",
    url: "/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Support",
    url: "/support",
    icon: HelpCircle,
  },
  {
    title: "Tutorial Guide",
    url: "/tutorial",
    icon: BookOpen,
  },
  {
    title: "Affiliate Program",
    url: "/affiliate",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-purple rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-sidebar-foreground">Clento Clay</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="hover-glow-purple hover:bg-sidebar-accent data-[active=true]:bg-gradient-purple data-[active=true]:text-white"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className="hover-glow-purple hover:bg-sidebar-accent"
                  >
                    <Link href={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  )
}
