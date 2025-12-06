'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Filter, Plus, MoreHorizontal, Loader2, Eye, Edit, Trash2, AlertCircle, FileText, RefreshCw, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useLeadLists, useDeleteLeadList } from '@/hooks/useLeadLists';
import { ConnectedAccount, useConnectedAccounts } from '@/hooks/useConnectedAccounts';
import { EmptyState } from '@/components/ui/empty-state';
import { LeadList } from '../../../types/lead-list';

const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'active':
            return <Badge className="bg-success text-white">Active</Badge>;
        case 'draft':
            return <Badge variant="outline">Draft</Badge>;
        case 'processing':
            return <Badge className="bg-blue-500 text-white">Processing</Badge>;
        case 'failed':
            return <Badge className="bg-red-500 text-white">Failed</Badge>;
        case 'archived':
            return <Badge variant="secondary">Archived</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

const getSourceLabel = (source: string) => {
    if (!source) return '';
    return source
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');
};

export default function ProspectListsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Delete confirmation modal state

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [listToDelete, setListToDelete] = useState<{ id: string; name: string } | null>(null);

    // Fetch lead lists from backend
    const {
        data: leadListsResponse,
        isLoading,
        error,
    } = useLeadLists({
        search: searchTerm || undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
        limit: pageSize,
        page: currentPage,
    });

    // Delete mutation
    const deleteLeadListMutation = useDeleteLeadList();

    // Fetch connected accounts
    const { data: accountsData } = useConnectedAccounts('linkedin');

    // Helper function to get account data by ID
    const getAccountById = (accountId: string): ConnectedAccount | undefined => {
        const accounts = accountsData?.accounts || [];
        return accounts.find(account => account.id === accountId);
    };

    // Extract lead lists data from API response
    const apiResponse = leadListsResponse;

    // Try multiple ways to access the data
    let leadLists: LeadList[] = [];
    if (apiResponse?.data) {
        leadLists = apiResponse.data;
    }

    // Pagination calculations
    const totalLeads = apiResponse?.pagination?.total || leadLists.length;
    const totalPages = apiResponse?.pagination?.totalPages || Math.ceil(totalLeads / pageSize);

    // Reset to first page when search or filter changes
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSourceFilterChange = (value: string) => {
        setSourceFilter(value);
        setCurrentPage(1);
    };

    // Handle page size change
    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setCurrentPage(1);
    };

    // Handle page navigation
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            const startPage = Math.max(1, currentPage - 2);
            const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    if (error) {
        console.error('Error fetching lead lists:', error);
    }

    // CRUD handlers
    const handleViewList = (listId: string) => {
        window.location.href = `/leads?list=${listId}`;
    };

    const handleEditList = (listId: string) => {
        window.location.href = `/prospect-lists/edit/${listId}`;
    };

    const handleDeleteList = (listId: string, listName: string) => {
        setListToDelete({ id: listId, name: listName });
        setDeleteModalOpen(true);
    };

    const confirmDelete = () => {
        if (listToDelete) {
            deleteLeadListMutation.mutate(listToDelete.id);
            setDeleteModalOpen(false);
            setListToDelete(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalOpen(false);
        setListToDelete(null);
    };

    return (
        <div className="space-y-4">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-foreground">Prospect lists</h1>
                </div>
                <Button className="bg-gradient-purple hover-glow-purple text-white text-sm" onClick={() => (window.location.href = '/prospect-lists/create')}>
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Create Lead List
                </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                    <Input placeholder="Search lead lists..." className="pl-9 text-sm bg-background" value={searchTerm} onChange={e => handleSearchChange(e.target.value)} />
                </div>
                <Select value={sourceFilter} onValueChange={handleSourceFilterChange}>
                    <SelectTrigger className="w-[160px] bg-background text-sm">
                        <Filter className="w-3.5 h-3.5 mr-1.5" />
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
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                            <span className="text-sm text-muted-foreground font-medium">Loading lead lists...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-red-500">
                                                <AlertCircle className="w-4 h-4" />
                                                <span className="text-sm font-medium">Oops! Something went wrong</span>
                                            </div>
                                            <p className="text-muted-foreground text-xs max-w-md text-center">We couldn't load your lead lists. This might be a temporary issue.</p>
                                            <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-1.5 text-xs">
                                                <RefreshCw className="w-3.5 h-3.5" />
                                                Try Again
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : leadLists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <div className="flex flex-col items-center gap-3">
                                            <FileText className="w-10 h-10 text-muted-foreground/50" />
                                            <div className="text-center">
                                                <h3 className="text-base font-semibold text-foreground mb-1.5">{searchTerm || sourceFilter !== 'all' ? 'No lead lists found' : 'No lead lists yet'}</h3>
                                                <p className="text-muted-foreground text-xs max-w-md">{searchTerm || sourceFilter !== 'all' ? 'No lead lists match your search criteria. Try adjusting your filters or search terms.' : 'Create your first lead list to start organizing and managing your prospects.'}</p>
                                            </div>
                                            <Button onClick={() => (window.location.href = '/prospect-lists/create')} className="bg-gradient-purple hover-glow-purple text-white gap-1.5 text-sm">
                                                <Plus className="w-3.5 h-3.5" />
                                                Create Lead List
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leadLists.map((list: any) => (
                                    <TableRow key={list.id} className="border-border/50 hover:bg-background/50">
                                        <TableCell>
                                            <div className="text-sm font-medium text-foreground">{list.name}</div>
                                            {list.description && <div className="text-xs text-muted-foreground mt-0.5">{list.description}</div>}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-gradient-purple text-white text-xs">
                                                {getSourceLabel(list.source)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {(() => {
                                                const account = getAccountById(list.connected_account_id);
                                                if (account) {
                                                    return (
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="w-7 h-7">
                                                                <AvatarImage src={account.profile_picture_url} alt={account.display_name || 'Account'} />
                                                                <AvatarFallback className="bg-gradient-purple text-white text-xs">
                                                                    {account.display_name
                                                                        ? account.display_name
                                                                              .split(' ')
                                                                              .map((n: string) => n[0])
                                                                              .join('')
                                                                        : 'AC'}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-medium text-foreground">{account.display_name || 'Unknown Account'}</div>
                                                                <div className="text-xs text-muted-foreground">{account.metadata.account_type}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="flex items-center gap-2.5">
                                                            <Avatar className="w-7 h-7">
                                                                <AvatarFallback className="bg-muted text-muted-foreground text-xs">?</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="text-sm font-medium text-muted-foreground">Account not found</div>
                                                                <div className="text-xs text-muted-foreground">ID: {list.connected_account_id}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(list.status)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <div className="text-xs text-muted-foreground">{list.total_leads} leads</div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                                            <MoreHorizontal className="w-3.5 h-3.5" />
                                                            <span className="sr-only">Open menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44">
                                                        <DropdownMenuItem onClick={() => handleViewList(list.id)} className="cursor-pointer text-xs">
                                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                                            View List
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEditList(list.id)} className="cursor-pointer text-xs">
                                                            <Edit className="w-3.5 h-3.5 mr-1.5" />
                                                            Edit List
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
            {!isLoading && !error && leadLists.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                        Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} lead lists
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">Rows per page</span>
                            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                                <SelectTrigger className="w-14 h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5" className="text-xs">5</SelectItem>
                                    <SelectItem value="10" className="text-xs">10</SelectItem>
                                    <SelectItem value="25" className="text-xs">25</SelectItem>
                                    <SelectItem value="50" className="text-xs">50</SelectItem>
                                    <SelectItem value="100" className="text-xs">100</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-0.5">
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="h-7 w-7 p-0">
                                <ChevronsLeft className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="h-7 w-7 p-0">
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </Button>

                            {getPageNumbers().map(page => (
                                <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => handlePageChange(page)} className="w-7 h-7 p-0 text-xs bg-gradient-purple">
                                    {page}
                                </Button>
                            ))}

                            <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="h-7 w-7 p-0">
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="h-7 w-7 p-0">
                                <ChevronsRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Lead List</DialogTitle>
                        <DialogDescription>Are you sure you want to delete "{listToDelete?.name}"? This action cannot be undone and will permanently remove the lead list and all associated data.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelDelete}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={deleteLeadListMutation.isPending}>
                            {deleteLeadListMutation.isPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete List'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
