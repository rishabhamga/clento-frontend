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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Filter, Download, Plus, ExternalLink, MoreHorizontal } from "lucide-react"

const leads = [
  {
    id: 1,
    name: "Murty Nadiminti",
    company: "Hexaware Technologies",
    location: "London Area, United Kingdom", 
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/murty-nadiminti",
    avatar: "/avatars/murty.jpg"
  },
  {
    id: 2,
    name: "Ashwani Koul",
    company: "CtrlS Datacenters Ltd",
    location: "Greater Delhi Area",
    status: "pending", 
    linkedinUrl: "https://linkedin.com/in/ashwani-koul",
    avatar: "/avatars/ashwani.jpg"
  },
  {
    id: 3,
    name: "Karthick Raj (KR)",
    company: "hiringday.ai",
    location: "India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/karthick-raj",
    avatar: "/avatars/karthick.jpg"
  },
  {
    id: 4,
    name: "Ayush Singla",
    company: "Mettl",
    location: "South Delhi, Delhi, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/ayush-singla", 
    avatar: "/avatars/ayush.jpg"
  },
  {
    id: 5,
    name: "Munish Mittal",
    company: "ThinkNEXT Technologies",
    location: "Chandigarh, Chandigarh, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/munish-mittal",
    avatar: "/avatars/munish.jpg"
  },
  {
    id: 6,
    name: "Mira JALA",
    company: "JALA Tech",
    location: "Jakarta, Indonesia",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/mira-jala",
    avatar: "/avatars/mira.jpg"
  },
  {
    id: 7,
    name: "Sanket Ladda",
    company: "Accenture in India", 
    location: "Pune, Maharashtra, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/sanket-ladda",
    avatar: "/avatars/sanket.jpg"
  },
  {
    id: 8,
    name: "Manish Gulati",
    company: "ChicMic Studios",
    location: "Sahibzada Ajit Singh Nagar, Punjab, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/manish-gulati",
    avatar: "/avatars/manish.jpg"
  },
  {
    id: 9,
    name: "Rohit K. Sharma",
    company: "Ginger Webs",
    location: "North Delhi, Delhi, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/rohit-sharma",
    avatar: "/avatars/rohit.jpg"
  },
  {
    id: 10,
    name: "Shabbir Rangwala",
    company: "Functional Assessment's Team, Mercer Mettl",
    location: "Bengaluru, Karnataka, India",
    status: "pending",
    linkedinUrl: "https://linkedin.com/in/shabbir-rangwala",
    avatar: "/avatars/shabbir.jpg"
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">pending</Badge>
    case "contacted":
      return <Badge className="bg-primary text-primary-foreground">contacted</Badge>
    case "replied":
      return <Badge className="bg-success text-black">replied</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function LeadsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leads</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="bg-background">
            <Download className="w-4 h-4 mr-2" />
            Export Leads
          </Button>
          <Button className="bg-success hover:bg-success/90 text-black">
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search leads..."
            className="pl-10 bg-background"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-background">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            <SelectItem value="campaign1">Campaign 1</SelectItem>
            <SelectItem value="campaign2">Campaign 2</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Sender Account" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            <SelectItem value="account1">Account 1</SelectItem>
            <SelectItem value="account2">Account 2</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[140px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="replied">Replied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Leads Table */}
      <div className="bg-card rounded-lg border border-border/50">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead className="text-muted-foreground">Lead</TableHead>
              <TableHead className="text-muted-foreground">Company</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground">Status</TableHead>
              <TableHead className="text-muted-foreground">LinkedIn</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((lead) => (
              <TableRow key={lead.id} className="border-border/50 hover:bg-background/50">
                <TableCell>
                  <Checkbox />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={lead.avatar} alt={lead.name} />
                      <AvatarFallback className="bg-gradient-purple text-white text-xs">
                        {lead.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-medium text-foreground">{lead.name}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-foreground">{lead.company}</div>
                </TableCell>
                <TableCell>
                  <div className="text-foreground">{lead.location}</div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(lead.status)}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing 1 to 10 of 4835 leads
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Items per page</span>
          <Select defaultValue="10">
            <SelectTrigger className="w-16 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">Page 1 of 484</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled>
              ‹‹
            </Button>
            <Button variant="outline" size="sm" disabled>
              ‹
            </Button>
            <Button variant="outline" size="sm">
              ›
            </Button>
            <Button variant="outline" size="sm">
              ››
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
