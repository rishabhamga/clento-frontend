"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Linkedin,
  Plus,
  MoreHorizontal,
  Settings,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { useConnectedAccounts } from "@/hooks/useConnectedAccounts"
import { useAuth } from "@clerk/nextjs"
export default function LinkedInAccountsPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const { getToken } = useAuth()

  // Get connected LinkedIn accounts
  const { data: connectedAccountsData, isLoading } = useConnectedAccounts('linkedin')
  const connectedAccounts = connectedAccountsData?.data || []

  const handleConnectLinkedIn = async () => {
    setIsConnecting(true)
    const token = await getToken();
    if(!token){
      throw new Error('Authentication required')
    }
    try {
      // Use ngrok URL for webhooks so Unipile can reach our server
      const baseUrl = 'https://0fe4ab0cee34.ngrok-free.app'

      const response = await fetch('/api/accounts/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: 'linkedin',
          token,
          success_redirect_url: `${baseUrl}/accounts/linkedin?connected=true`,
          failure_redirect_url: `${baseUrl}/accounts/linkedin?error=connection_failed`,
          notify_url: `${baseUrl}/api/accounts/webhook`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create connection link')
      }

      const data = await response.json()
      console.log('Connection response:', data)

      // Extract the URL from the response
      const redirectUrl = data.data?.url || data.data?.connection_url || data.connection_url
      if (redirectUrl) {
        window.location.href = redirectUrl
      } else {
        throw new Error('No redirect URL received')
      }
    } catch (error) {
      console.error('Error connecting LinkedIn:', error)
      alert('Failed to connect LinkedIn account. Please try again.')
    } finally {
      setIsConnecting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatLastSync = (lastSync: string) => {
    if (!lastSync) return 'Never'
    const date = new Date(lastSync)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">LinkedIn Accounts</h1>
          <p className="text-muted-foreground">
            Manage your connected LinkedIn accounts for outreach campaigns
          </p>
        </div>
        <Button
          onClick={handleConnectLinkedIn}
          disabled={isConnecting}
          className="bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isConnecting ? 'Connecting...' : 'Connect LinkedIn Account'}
        </Button>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-blue-600" />
            LinkedIn Account Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{connectedAccounts.length}</div>
              <div className="text-sm text-muted-foreground">Connected Accounts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connectedAccounts.filter(acc => acc.status === 'connected').length}
              </div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {connectedAccounts.filter(acc => acc.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
              <p className="text-muted-foreground">Loading accounts...</p>
            </div>
          ) : connectedAccounts.length === 0 ? (
            <div className="text-center py-8">
              <Linkedin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No LinkedIn accounts connected</h3>
              <p className="text-muted-foreground mb-4">
                Connect your LinkedIn account to start creating outreach campaigns
              </p>
              <Button
                onClick={handleConnectLinkedIn}
                disabled={isConnecting}
                className="bg-gradient-purple hover:bg-gradient-purple-dark text-white border-0 hover-glow-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Your First Account'}
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Sync</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connectedAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={account.profile_picture_url} />
                          <AvatarFallback>
                            {account.display_name?.charAt(0) || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{account.display_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {account.metadata?.account_type || 'Personal'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                        {account.metadata?.account_type === 'premium' ? 'Premium' : 'Personal'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(account.status)}
                        {getStatusBadge(account.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatLastSync(account.last_synced_at || '')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sync Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
