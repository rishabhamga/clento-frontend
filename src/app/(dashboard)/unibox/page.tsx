"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@clerk/nextjs"
import { Loader2, Search, MoreHorizontal, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { makeAuthenticatedRequest } from "../../../lib/axios-utils"

interface Accounts {
    id: string,
    name: string,
    email: string,
    profile_picture_url: string,
    status: string
}

interface InboxResponse {
    name: string | null,
    folder: ("INBOX" | "INBOX_LINKEDIN_CLASSIC" | "INBOX_LINKEDIN_RECRUITER" | "INBOX_LINKEDIN_SALES_NAVIGATOR" | "INBOX_LINKEDIN_ORGANIZATION")[] | undefined,
    unread_count: number,
    timestamp: string | null,
    account_id: string,
    attendee_provider_id: string | null,
    attendee_profile: {
        name: string,
        profile_picture_url: string | null
    } | null
}
interface Pagination {
    limit: number,
    cursor: string,
    hasMore: boolean,
    nextCursor: string
}

export default function UniboxPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [accounts, setAccounts] = useState<Accounts[]>([]);
    const [inbox, setInbox] = useState<InboxResponse[]>([]);
    const [pagination, setPagination] = useState<Pagination>();
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const { getToken } = useAuth();

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                toast.error('Log In to See the Unibox');
                return
            }
            try {
                const res = await makeAuthenticatedRequest('GET', '/inbox', {}, token)
                setAccounts(res?.accounts || []);
                setInbox(res?.inbox || []);
                setPagination(res?.pagination);

                // Set the first account as selected by default
                if (res?.accounts && res.accounts.length > 0) {
                    setSelectedAccount(res.accounts[0].id);
                }
            } catch (error) {
                console.log(error);
                toast.error('Failed to load inbox data');
            } finally {
                setLoading(false);
            }
        }
        getData();
    }, [])

    // Helper functions
    const getSelectedAccount = () => {
        return accounts.find(account => account.id === selectedAccount);
    }

    const getFilteredInbox = () => {
        let filtered = inbox;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.attendee_profile?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by status
        if (filterStatus === "unread") {
            filtered = filtered.filter(item => item.unread_count > 0);
        } else if (filterStatus === "read") {
            filtered = filtered.filter(item => item.unread_count === 0);
        }

        return filtered;
    }

    const formatTimestamp = (timestamp: string | null) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return "Just now";
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else if (diffInHours < 168) { // 7 days
            return `${Math.floor(diffInHours / 24)}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    const getFolderDisplayName = (folder: string) => {
        switch (folder) {
            case "INBOX": return "Inbox";
            case "INBOX_LINKEDIN_CLASSIC": return "LinkedIn Classic";
            case "INBOX_LINKEDIN_RECRUITER": return "LinkedIn Recruiter";
            case "INBOX_LINKEDIN_SALES_NAVIGATOR": return "Sales Navigator";
            case "INBOX_LINKEDIN_ORGANIZATION": return "LinkedIn Organization";
            default: return folder;
        }
    }

    // Show loading state while fetching data
    if (loading) {
        return (
            <div className="h-[calc(100vh-8rem)] flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        Loading Unibox
                    </h3>
                    <p className="text-muted-foreground">
                        Fetching your messages and conversations...
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex">
            {/* Left Sidebar - Conversations */}
            <div className="w-96 border-r border-border bg-card">
                {/* Header */}
                <div className="p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Messaging</h2>

                    {/* Account Selector */}
                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                        <SelectTrigger className="w-full bg-background mb-4">
                            <div className="flex items-center gap-2">
                                {getSelectedAccount() && (
                                    <>
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage
                                                src={getSelectedAccount()?.profile_picture_url}
                                                alt={getSelectedAccount()?.name}
                                            />
                                            <AvatarFallback className="bg-gradient-purple text-white text-xs">
                                                {getSelectedAccount()?.name?.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <SelectValue placeholder="Select account" />
                                    </>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                    <div className="flex items-center justify-between w-full">
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="truncate font-medium">{account.name}</span>
                                            <span className="text-xs text-muted-foreground truncate" title={account.email}>
                                                {account.email.length > 20 ? `${account.email.substring(0, 20)}...` : account.email}
                                            </span>
                                        </div>
                                        <Badge
                                            variant={account.status === 'connected' ? 'default' : 'secondary'}
                                            className="ml-2 flex-shrink-0"
                                        >
                                            {account.status}
                                        </Badge>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Search and Filter */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search messages"
                                className="pl-10 bg-background"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
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
                    {getFilteredInbox().length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">
                                {searchTerm ? "No conversations found" : "No conversations yet"}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {searchTerm
                                    ? "Try adjusting your search terms"
                                    : "Your conversations will appear here when you receive messages"
                                }
                            </p>
                        </div>
                    ) : (
                        getFilteredInbox().map((conversation, index) => (
                            <div
                                key={`${conversation.account_id}-${conversation.attendee_provider_id}-${conversation.timestamp}-${index}`}
                                className="p-4 border-b border-border hover:bg-background/50 cursor-pointer transition-colors group"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage
                                            src={conversation.attendee_profile?.profile_picture_url || undefined}
                                            alt={conversation.attendee_profile?.name || "Unknown"}
                                        />
                                        <AvatarFallback className="bg-gradient-purple text-white text-sm">
                                            {conversation.attendee_profile?.name?.charAt(0).toUpperCase() || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-medium text-foreground truncate">
                                                {conversation.attendee_profile?.name || conversation.name || "Unknown Contact"}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {conversation.unread_count > 0 && (
                                                    <Badge variant="default" className="bg-purple-600 text-white text-xs">
                                                        {conversation.unread_count}
                                                    </Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTimestamp(conversation.timestamp)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                            {conversation.folder && conversation.folder.length > 0 && (
                                                <Badge variant="outline" className="text-xs">
                                                    {getFolderDisplayName(conversation.folder[0])}
                                                </Badge>
                                            )}
                                            <span className="text-sm text-muted-foreground truncate">
                                                {conversation.unread_count > 0 ? `${conversation.unread_count} unread message${conversation.unread_count > 1 ? 's' : ''}` : 'No unread messages'}
                                            </span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
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
