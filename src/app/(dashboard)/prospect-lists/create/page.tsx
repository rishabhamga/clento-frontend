"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUploadCsv, usePublishLeadList } from "@/hooks/useLeadLists"
import { CsvPreviewResponse } from "@/types/lead-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, FileSpreadsheet, Eye } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useConnectedAccounts } from "../../../../hooks/useConnectedAccounts"

export default function CreateLeadListPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        connectedAccountId: "",
        csvFile: null as File | null,
    })
    const [csvPreview, setCsvPreview] = useState<CsvPreviewResponse | null>(null)
    const [csvValidationError, setCsvValidationError] = useState<string>("")
    const [showPreview, setShowPreview] = useState(false)

    // State for connected accounts
    const { data: connectedAccounts, isLoading: loadingAccounts } = useConnectedAccounts('linkedin');

    // API hooks
    const uploadCsvMutation = useUploadCsv()
    const publishMutation = usePublishLeadList()

    const handleDownloadSampleCsv = () => {
        const csvContent = `first_name,last_name,email,linkedin_url,company,title,phone
John,Doe,john.doe@example.com,https://linkedin.com/in/johndoe,Acme Corp,Software Engineer,+1234567890
Jane,Smith,jane.smith@example.com,https://linkedin.com/in/janesmith,Tech Solutions,Product Manager,+1234567891
Mike,Johnson,mike.johnson@example.com,https://linkedin.com/in/mikejohnson,Innovation Inc,Data Scientist,+1234567892`

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', 'sample-leads.csv')
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Filter out any accounts with missing required fields
    const validConnectedAccounts = connectedAccounts?.data?.filter(account =>
        account &&
        account.id &&
        account.display_name &&
        typeof account.display_name === 'string' &&
        account.display_name.trim().length > 0
    ) || []

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Clear previous validation errors and preview
        setCsvValidationError("")
        setCsvPreview(null)
        setShowPreview(false)

        // Validate file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            setCsvValidationError("Please upload a CSV file")
            return
        }

        // Read and validate CSV content
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const csvText = e.target?.result as string
                const lines = csvText.split('\n')
                const headers = lines[0]?.split(',').map(h => h.trim().toLowerCase())

                // Check if CSV has required LinkedIn URL field
                const hasLinkedInField = headers?.some(header =>
                    header === 'linkedinurl' || header === 'linkedin_url' || header === 'linkedin'
                )

                if (!hasLinkedInField) {
                    setCsvValidationError("CSV must contain a 'linkedin_url' or 'linkedinUrl' field. Please download the sample CSV for the correct format.")
                    return
                }

                // If validation passes, store the file
                setFormData(prev => ({ ...prev, csvFile: file }))
            } catch (error) {
                console.error('Error reading CSV:', error)
                setCsvValidationError("Error reading CSV file. Please ensure it's a valid CSV format.")
            }
        }

        reader.readAsText(file)
    }

    const handlePreview = async () => {
        if (!formData.csvFile || !formData.connectedAccountId) return

        try {
            const result = await uploadCsvMutation.mutateAsync({
                file: formData.csvFile,
                account_id: formData.connectedAccountId
            })
            setCsvPreview(result)
            setShowPreview(true)
        } catch (error) {
            console.error('Error uploading CSV:', error)
            setCsvValidationError("Error uploading CSV file. Please try again.")
        }
    }


    const handlePublish = async () => {
        if (!formData.csvFile || !csvPreview) return

        try {
            // Convert file to base64 string for API
            const csvData = await new Promise<string>((resolve) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.readAsText(formData.csvFile!)
            })

            await publishMutation.mutateAsync({
                name: formData.name,
                description: formData.description,
                connected_account_id: formData.connectedAccountId,
                csv_data: csvData
            })

            router.push("/prospect-lists")
        } catch (error) {
            console.error('Error publishing lead list:', error)
        }
    }

    const renderMainForm = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Create Lead List</h2>
                <p className="text-muted-foreground">Import leads from your CSV file</p>
            </div>

            <div className="grid gap-6">
                <div className="space-y-2">
                    <Label htmlFor="name">List Name</Label>
                    <Input
                        id="name"
                        placeholder="Enter list name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                        id="description"
                        placeholder="Enter description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="account">LinkedIn Account</Label>
                    <Select
                        value={formData.connectedAccountId}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, connectedAccountId: value }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select LinkedIn account" />
                        </SelectTrigger>
                        <SelectContent>
                            {loadingAccounts ? (
                                <SelectItem value="loading" disabled>Loading accounts...</SelectItem>
                            ) : validConnectedAccounts.length === 0 ? (
                                <SelectItem value="no-accounts" disabled>
                                    {connectedAccounts?.data?.length && connectedAccounts.data.length > 0 ? 'No valid LinkedIn accounts found' : 'No LinkedIn accounts connected'}
                                </SelectItem>
                            ) : (
                                validConnectedAccounts.map((account) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarImage src={account.profile_picture_url} alt={account.display_name || 'Account'} />
                                                <AvatarFallback className="text-xs">
                                                    {account.display_name ? account.display_name.split(' ').map((n: string) => n[0]).join('') : 'AC'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{account.display_name || 'Unknown Account'}</span>
                                            <Badge variant="secondary" className="text-xs">Premium</Badge>
                                        </div>
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>CSV File (Max 10MB)</Label>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleDownloadSampleCsv}
                            className="text-purple-600 border-purple-200 hover:bg-purple-50"
                        >
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Download Sample CSV
                        </Button>
                    </div>

                    {csvValidationError && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {csvValidationError}
                            </AlertDescription>
                        </Alert>
                    )}

                    <Card className="border-2 border-dashed border-border/50 bg-background/50">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            {!formData.csvFile ? (
                                <>
                                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-medium">Choose File</p>
                                        <p className="text-sm text-muted-foreground">no file selected</p>
                                    </div>
                                    <Button className="mt-4" onClick={() => document.getElementById('csv-upload')?.click()}>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose File
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center space-y-2">
                                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-lg font-medium">{formData.csvFile.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {(formData.csvFile.size / 1024).toFixed(2)} KB
                                    </p>
                                    <div className="flex gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => document.getElementById('csv-upload')?.click()}
                                        >
                                            Choose Different File
                                        </Button>
                                        <Button
                                            onClick={handlePreview}
                                            disabled={!formData.connectedAccountId || uploadCsvMutation.isPending}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            {uploadCsvMutation.isPending ? "Processing..." : "Preview"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                            {/* Hidden file input - always present in DOM */}
                            <input
                                id="csv-upload"
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>CSV File Requirements</strong>
                    <br />
                    <span className="text-red-500">• Required:</span> Your CSV must contain a column named &quot;linkedin_url&quot; or &quot;linkedinUrl&quot; with LinkedIn profile URLs
                    <br />
                    <span className="text-green-500">• Optional:</span> You may also add columns with email IDs, phone numbers, names, company, title, etc.
                    <br />
                    <span className="text-blue-500">• Tip:</span> Download the sample CSV above to see the correct format
                </AlertDescription>
            </Alert>

            <div className="flex justify-between">
                <Button variant="outline" onClick={() => router.push("/prospect-lists")}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Lists
                </Button>
                <Button
                    onClick={handlePublish}
                    disabled={!formData.name || !formData.connectedAccountId || !formData.csvFile || !csvPreview?.found || publishMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                    {publishMutation.isPending ? "Publishing..." : "Publish List"}
                </Button>
            </div>
        </div>
    )

    const renderPreview = () => {
        if (!showPreview || !csvPreview) return null

        return (
            <div className="space-y-6 mt-8">
                <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">Lead List Preview</h3>
                    <p className="text-muted-foreground">Review your lead list before publishing</p>
                </div>

                {csvPreview?.found > 0 ? (
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>CSV processed successfully!</strong>
                            <br />
                            ✅ Found {csvPreview.found} LinkedIn profiles
                            <br />
                            📊 Total rows: {csvPreview.total}
                            <br />
                            ❌ Not found: {csvPreview.notFound}
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            No LinkedIn profiles found. Please check your CSV format.
                        </AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Lead List Preview</span>
                            <Badge variant="outline">{csvPreview?.found || 0} Found Profiles</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Headline</TableHead>
                                    <TableHead>Premium</TableHead>
                                    <TableHead>Followers</TableHead>
                                    <TableHead>Connections</TableHead>
                                    <TableHead>Websites</TableHead>
                                    <TableHead>Profile Picture</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {csvPreview?.data?.slice(0, 5).map((lead, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{lead.name || 'N/A'}</TableCell>
                                        <TableCell>{lead.headline || 'N/A'}</TableCell>
                                        <TableCell>
                                            {lead.isPremium ? (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                                    Premium
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">Free</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>{lead.followerCount?.toLocaleString() || 'N/A'}</TableCell>
                                        <TableCell>{lead.connectionCount?.toLocaleString() || 'N/A'}</TableCell>
                                        <TableCell>
                                            {lead.websites && lead.websites.length > 0 ? (
                                                <div className="space-y-1">
                                                    {lead.websites.slice(0, 2).map((website, idx) => (
                                                        <a
                                                            key={idx}
                                                            href={website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline text-sm block"
                                                        >
                                                            {website}
                                                        </a>
                                                    ))}
                                                    {lead.websites.length > 2 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{lead.websites.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            ) : 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {lead.profilePictureUrl ? (
                                                <Avatar className="w-8 h-8">
                                                    <AvatarImage src={lead.profilePictureUrl} alt={lead.name || 'Profile'} />
                                                    <AvatarFallback>
                                                        {lead.name ? lead.name.split(' ').map(n => n[0]).join('') : 'P'}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : 'N/A'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <CardContent className="p-6">
                    {renderMainForm()}
                    {renderPreview()}
                </CardContent>
            </Card>
        </div>
    )
}