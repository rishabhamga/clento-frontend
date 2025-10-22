"use client"

import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Download, Plus, ExternalLink, MoreHorizontal, AlertCircle, Users, RefreshCw, Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useLeadList } from "../../../hooks/useLeadLists"
import { EmptyState } from "../../../components/ui/empty-state"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

function LeadsPageContent() {
    const [searchTerm, setSearchTerm] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const listId = useSearchParams().get("list");

    if(!listId){
        return <EmptyState title="No list selected" description="Please select a list to view leads" />
    }

    const { data: leadList, isLoading, error } = useLeadList(listId);

    // For now, we'll use the hardcoded leads array since we don't have individual lead data from the API yet
    // In the future, this should be replaced with actual lead data from the API
    const leadsData = leadList?.csvData.data; // This will be replaced with actual lead data from leadList

    // Show loading state while fetching lead list data
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-muted-foreground font-medium">Loading lead list...</span>
                    </div>
                </div>
            </div>
        )
    }

    if(!leadsData || leadsData.length === 0){
        return(
            <EmptyState
                title="No leads found"
                description="This lead list doesn't contain any valid leads. Check the import process or try importing a new file."
            />
        )
    }

    // Helper function to get column count
    const getColumnCount = () => {
        if (leadList && 'csvData' in leadList && leadList.csvData?.headers) {
            return leadList.csvData.headers.length + 2 // +2 for checkbox and actions columns
        }
        return 7 // fallback
    }

    // Filter leads based on search and filters
    const filteredLeads = leadsData.filter((lead: any) => {
        if (!searchTerm) return true

        const searchLower = searchTerm.toLowerCase()

        // Search across all fields in the lead data
        const matchesSearch = Object.values(lead).some((value: any) => {
            if (typeof value === 'string') {
                return value.toLowerCase().includes(searchLower)
            }
            return false
        })

        return matchesSearch
    })

    // Pagination calculations
    const totalLeads = filteredLeads.length
    const totalPages = Math.ceil(totalLeads / pageSize)
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex)

    // Reset to first page when search changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value)
        setCurrentPage(1)
    }

    // Handle page size change
    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value))
        setCurrentPage(1)
    }

    // Handle page navigation
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            const startPage = Math.max(1, currentPage - 2)
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i)
            }
        }

        return pages
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Leads
                        {leadList && (
                            <span className="text-lg font-normal text-muted-foreground ml-2">
                                from "{leadList.leadList.name}"
                            </span>
                        )}
                    </h1>
                    {leadList && (
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Total: {leadList.leadList.total_leads}</span>
                            <span>•</span>
                            <span>Valid: {leadList.csvData.validRows}</span>
                            <span>•</span>
                            <span>Errors: {leadList.csvData.errors.length}</span>
                            <span>•</span>
                            <span>Success Rate: {leadList.leadList.stats?.success_rate ? `${(leadList.leadList.stats.success_rate * 100).toFixed(1)}%` : 'N/A'}</span>
                            <span>•</span>
                            <Badge variant={leadList.leadList.status === 'completed' ? 'default' : 'secondary'}>
                                {leadList.leadList.status}
                            </Badge>
                        </div>
                    )}
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

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                        placeholder="Search leads..."
                        className="pl-10 bg-background"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>
            </div>

            {/* Leads Table */}
            <div className="bg-card rounded-lg border border-border/50">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50">
                            <TableHead className="w-12">
                                <Checkbox />
                            </TableHead>
                            {leadList.csvData.headers.map((header: string, index: number) => (
                                <TableHead key={index} className="text-muted-foreground capitalize">
                                    {header.replace(/_/g, ' ')}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={getColumnCount()} className="text-center py-12">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                                        <span className="text-muted-foreground font-medium">Loading leads...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : error ? (
                            <TableRow>
                                <TableCell colSpan={getColumnCount()} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center gap-2 text-red-500">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-medium">Oops! Something went wrong</span>
                                        </div>
                                        <p className="text-muted-foreground text-sm max-w-md text-center">
                                            {error instanceof Error ? error.message : 'Failed to load leads. Please try again.'}
                                        </p>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.location.reload()}
                                                className="gap-2"
                                            >
                                                <RefreshCw className="w-4 h-4" />
                                                Try Again
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={getColumnCount()} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <Users className="w-12 h-12 text-muted-foreground/50" />
                                        <div className="text-center">
                                            <h3 className="text-lg font-semibold text-foreground mb-2">
                                                {searchTerm
                                                    ? "No leads found"
                                                    : "No leads yet"
                                                }
                                            </h3>
                                            <p className="text-muted-foreground text-sm max-w-md">
                                                {searchTerm
                                                    ? "No leads match your search criteria. Try adjusting your search terms."
                                                    : "Import leads from a CSV file or add them manually to get started with your outreach campaigns."
                                                }
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => window.location.href = '/prospect-lists/create'}
                                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Import Leads
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Add Lead
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedLeads.map((lead: any, index: number) => (
                                <TableRow key={index} className="border-border/50 hover:bg-background/50">
                                    <TableCell>
                                        <Checkbox />
                                    </TableCell>
                                    {leadList.csvData.headers.map((header: string, headerIndex: number) => (
                                        <TableCell key={headerIndex}>
                                            {(() => {
                                                const value = lead[header]

                                                // Special handling for email
                                                if (header.includes('email') && value) {
                                                    return (
                                                        <a
                                                            href={`mailto:${value}`}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {value}
                                                        </a>
                                                    )
                                                }

                                                // Special handling for LinkedIn URLs
                                                if (header.includes('linkedin') && value) {
                                                    return (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={value} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                    )
                                                }

                                                // Special handling for phone numbers
                                                if (header.includes('phone') && value) {
                                                    return (
                                                        <a
                                                            href={`tel:${value}`}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            {value}
                                                        </a>
                                                    )
                                                }

                                                // Special handling for URLs
                                                if (header.includes('url') && value && !header.includes('linkedin')) {
                                                    return (
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={value} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </a>
                                                        </Button>
                                                    )
                                                }

                                                // Default display for all fields including names
                                                return (
                                                    <div className="text-foreground">
                                                        {value || '-'}
                                                    </div>
                                                )
                                            })()}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {!isLoading && !error && filteredLeads.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalLeads)} of {totalLeads} leads
                        {leadList && (
                            <span> from "{leadList.leadList.name}"</span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Rows per page</span>
                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="w-16 h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            {getPageNumbers().map((page) => (
                                <Button
                                    key={page}
                                    variant={currentPage === page ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => handlePageChange(page)}
                                    className="w-8 h-8 p-0 bg-gradient-purple"
                                >
                                    {page}
                                </Button>
                            ))}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function LeadsPage() {
    return (
        <Suspense fallback={
            <div className="space-y-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-muted-foreground font-medium">Loading leads...</span>
                    </div>
                </div>
            </div>
        }>
            <LeadsPageContent />
        </Suspense>
    )
}
