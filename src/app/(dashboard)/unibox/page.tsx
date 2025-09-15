"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal } from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "Raghul Vishnu P V",
    title: "Aspiring Associate Business...",
    time: "1:36 PM",
    avatar: "/avatars/raghul.jpg"
  },
  {
    id: 2,
    name: "Pratush Tyagi",
    title: "Goyal Brothers Prakashan",
    time: "1:32 PM",
    avatar: "/avatars/pratush.jpg"
  },
  {
    id: 3,
    name: "Udit Vishnoi",
    title: "Founder & Principal Architect @...",
    time: "",
    avatar: "/avatars/udit.jpg"
  },
  {
    id: 4,
    name: "Uday Akkaraju",
    title: "CEO at BOND.AI",
    time: "Sep 11",
    avatar: "/avatars/uday.jpg"
  },
  {
    id: 5,
    name: "Victoria Maddux",
    title: "Vice President of Sales",
    time: "Sep 11",
    avatar: "/avatars/victoria.jpg"
  },
  {
    id: 6,
    name: "Rishabh Amga",
    title: "Software Developer @Observe.AI |...",
    time: "Sep 11",
    avatar: "/avatars/rishabh.jpg"
  },
]

export default function UniboxPage() {
  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Left Sidebar - Conversations */}
      <div className="w-80 border-r border-border bg-card">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Messaging</h2>
          
          {/* Account Selector */}
          <Select defaultValue="udit">
            <SelectTrigger className="w-full bg-background mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/avatars/udit.jpg" alt="Udit" />
                  <AvatarFallback className="bg-gradient-purple text-white text-xs">U</AvatarFallback>
                </Avatar>
                <SelectValue placeholder="Select account" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="udit">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src="/avatars/udit.jpg" alt="Udit" />
                    <AvatarFallback className="bg-gradient-purple text-white text-xs">U</AvatarFallback>
                  </Avatar>
                  <span>Udit (Premium)</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search messages"
                className="pl-10 bg-background"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-20 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Conversations List */}
        <div className="overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="p-4 border-b border-border hover:bg-background/50 cursor-pointer transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={conversation.avatar} alt={conversation.name} />
                  <AvatarFallback className="bg-gradient-purple text-white text-sm">
                    {conversation.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation.name}
                    </h3>
                    {conversation.time && (
                      <span className="text-xs text-muted-foreground">
                        {conversation.time}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.title}
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content - Chat Area */}
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            Select a chat to start messaging
          </h3>
          <p className="text-muted-foreground">
            Choose a conversation from the sidebar to view messages
          </p>
        </div>
      </div>
    </div>
  )
}
