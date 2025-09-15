"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, MoreHorizontal, Loader2, Eye, Edit, Trash2 } from "lucide-react"
import { useLeadLists, useDeleteLeadList } from "@/hooks/useLeadLists"

const getStatusBadge = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
    case "active":
      return <Badge className="bg-success text-black">Active</Badge>
    case "draft":
      return <Badge variant="outline">Draft</Badge>
    case "processing":
      return <Badge className="bg-blue-500 text-white">Processing</Badge>
    case "failed":
      return <Badge className="bg-red-500 text-white">Failed</Badge>
    case "archived":
      return <Badge variant="secondary">Archived</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getSourceLabel = (source: string) => {
  switch (source) {
    case "csv_import":
      return "CSV Import"
    case "filter_search":
      return "Filter Search"
    case "api":
      return "API"
    case "manual":
      return "Manual"
    default:
      return source
  }
}

export default function ProspectListsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  
  // Fetch lead lists from backend
  const { data: leadListsResponse, isLoading, error } = useLeadLists({
    search: searchTerm || undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    limit: 50, // Show more items per page
  })
  
  // Delete mutation
  const deleteLeadListMutation = useDeleteLeadList()

  // Extract lead lists data from API response
  const apiResponse = leadListsResponse as any
  
  // Debug logging to see the actual structure
  console.log('=== DEBUG LEAD LISTS ===')
  console.log('leadListsResponse:', leadListsResponse)
  console.log('apiResponse:', apiResponse)
  console.log('apiResponse?.data:', apiResponse?.data)
  console.log('apiResponse?.data?.data:', apiResponse?.data?.data)
  
  // Try multiple ways to access the data
  let leadLists = []
  if (apiResponse?.data?.data && Array.isArray(apiResponse.data.data)) {
    leadLists = apiResponse.data.data
    console.log('Using apiResponse.data.data (nested):', leadLists)
  } else if (apiResponse?.data && Array.isArray(apiResponse.data)) {
    leadLists = apiResponse.data
    console.log('Using apiResponse.data (direct):', leadLists)
  } else if (Array.isArray(apiResponse)) {
    leadLists = apiResponse
    console.log('Using apiResponse (array):', leadLists)
  } else {
    console.log('Could not extract lead lists, structure:', typeof apiResponse, apiResponse)
  }
  
  console.log('Final leadLists:', leadLists)
  console.log('Final leadLists.length:', leadLists?.length)
  
  // Temporary fallback for testing
  if (!leadLists || leadLists.length === 0) {
    leadLists = [
      {
        id: 'test-1',
        name: 'Test Lead List 1',
        description: 'This is a test lead list',
        source: 'csv_import',
        status: 'completed',
        total_leads: 5,
        created_at: new Date().toISOString()
      },
      {
        id: 'test-2',
        name: 'Test Lead List 2', 
        description: 'Another test lead list',
        source: 'csv_import',
        status: 'draft',
        total_leads: 3,
        created_at: new Date().toISOString()
      }
    ]
    console.log('Using fallback test data:', leadLists)
  }

  if (error) {
    console.error('Error fetching lead lists:', error)
  }

  // CRUD handlers
  const handleViewList = (listId: string) => {
    window.location.href = `/leads?list=${listId}`
  }

  const handleEditList = (listId: string) => {
    window.location.href = `/prospect-lists/edit/${listId}`
  }

  const handleDeleteList = async (listId: string, listName: string) => {
    if (window.confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
      deleteLeadListMutation.mutate(listId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prospect lists</h1>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => window.location.href = '/prospect-lists/create'}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Lead List
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search lead lists..."
            className="pl-10 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[180px] bg-background">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="csv_import">CSV Import</SelectItem>
            <SelectItem value="filter_search">Filter Search</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Prospect Lists Table */}
      <Card className="bg-card border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-muted-foreground">List Name</TableHead>
                <TableHead className="text-muted-foreground">List Type</TableHead>
                <TableHead className="text-muted-foreground">LinkedIn Account</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-muted-foreground">Loading lead lists...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-red-500">
                      Error loading lead lists. Please try again.
                    </div>
                  </TableCell>
                </TableRow>
              ) : leadLists.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm || sourceFilter !== "all" 
                        ? "No lead lists match your search criteria."
                        : "No lead lists found. Create your first lead list to get started."
                      }
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                leadLists.map((list: any) => (
                  <TableRow key={list.id} className="border-border/50 hover:bg-background/50">
                    <TableCell>
                      <div className="font-medium text-foreground">{list.name}</div>
                      {list.description && (
                        <div className="text-sm text-muted-foreground mt-1">{list.description}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary border-primary/20">
                        {getSourceLabel(list.source)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-gradient-purple text-white text-xs">
                            CL
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-foreground">Clento User</div>
                          <div className="text-sm text-muted-foreground">Premium</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(list.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {list.total_leads} leads
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => handleViewList(list.id)}
                              className="cursor-pointer"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View List
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEditList(list.id)}
                              className="cursor-pointer"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit List
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteList(list.id, list.name)}
                              className="cursor-pointer text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {leadLists.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {leadLists.length} lead list{leadLists.length !== 1 ? 's' : ''}
            {apiResponse?.data?.pagination && (
              <span> (Page {apiResponse.data.pagination.page} of {apiResponse.data.pagination.totalPages})</span>
            )}
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
            <span className="text-sm text-muted-foreground">Page 1 of 2</span>
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
      )}
    </div>
  )
}
