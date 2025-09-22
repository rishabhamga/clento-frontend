"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUploadCsv, usePublishLeadList } from "@/hooks/useLeadLists"
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
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Linkedin, Search, Database, FileSpreadsheet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useConnectedAccounts } from "../../../../hooks/useConnectedAccounts"

type Step = "select-method" | "configure" | "upload" | "preview" | "publish"
type ImportMethod = "linkedin-search" | "sales-navigator" | "b2b-data" | "csv-import"

export default function CreateLeadListPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("select-method")
  const [selectedMethod, setSelectedMethod] = useState<ImportMethod | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    connectedAccountId: "",
    csvFile: null as File | null,
    linkedinSearchUrl: "",
    salesNavigatorUrl: ""
  })
  const [csvPreview, setCsvPreview] = useState<{
    validation: {
      isValid: boolean;
      hasLinkedInColumn: boolean;
      linkedInColumnName?: string;
      emailColumns: string[];
      phoneColumns: string[];
      errors: string[];
      warnings: string[];
    };
    preview: {
      headers: string[];
      data: Record<string, any>[];
      totalRows: number;
      showingRows: number;
    };
    mapping: Record<string, string>;
  } | null>(null)
  const [csvValidationError, setCsvValidationError] = useState<string>("")

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

  const handleMethodSelect = (method: ImportMethod) => {
    setSelectedMethod(method)
    if (method === "csv-import") {
      setCurrentStep("configure")
    } else {
      // For other methods, we'll implement them later
      setCurrentStep("configure")
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Clear previous validation errors
    setCsvValidationError("")

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

        // If validation passes, proceed with upload
        setFormData(prev => ({ ...prev, csvFile: file }))

        const result = await uploadCsvMutation.mutateAsync(file)
        setCsvPreview(result)
        setCurrentStep("preview")
      } catch (error) {
        console.error('Error reading CSV:', error)
        setCsvValidationError("Error reading CSV file. Please ensure it's a valid CSV format.")
      }
    }

    reader.readAsText(file)
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
        csv_data: csvData,
        mapping: csvPreview.mapping
      })

      router.push("/prospect-lists")
    } catch (error) {
      console.error('Error publishing lead list:', error)
    }
  }

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Lead List</h2>
        <p className="text-muted-foreground">Choose how you&apos;d like to import your leads</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LinkedIn Search URL */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
          onClick={() => handleMethodSelect("linkedin-search")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Linkedin className="w-6 h-6 text-blue-600" />
              </div>
              LinkedIn Search URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Import leads from a LinkedIn search results URL
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Select LinkedIn Search
            </Button>
          </CardContent>
        </Card>

        {/* Sales Navigator URL */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
          onClick={() => handleMethodSelect("sales-navigator")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              Sales Navigator URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Import leads from Sales Navigator search results
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              Select Sales Navigator
            </Button>
          </CardContent>
        </Card>

        {/* B2B Data Search */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
          onClick={() => handleMethodSelect("b2b-data")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              B2B Data Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Search from our in-house database of B2B contacts
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-300 rounded w-2/3 mb-1"></div>
                    <div className="h-2 bg-gray-300 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
              Select B2B Data
            </Button>
          </CardContent>
        </Card>

        {/* Import from CSV */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-300"
          onClick={() => handleMethodSelect("csv-import")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
              </div>
              Import from CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Upload your own CSV file with lead data
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm text-gray-600">
                <div className="grid grid-cols-4 gap-2 mb-2 text-xs font-medium">
                  <div>Name</div>
                  <div>Title</div>
                  <div>Company</div>
                  <div>LinkedIn</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>John Doe</div>
                  <div>CEO</div>
                  <div>Tech Corp</div>
                  <div>linkedin.com/in/johndoe</div>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>Jane Smith</div>
                  <div>CTO</div>
                  <div>Startup Inc</div>
                  <div>linkedin.com/in/janesmith</div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
              Select CSV Import
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={() => router.push("/prospect-lists")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Lists
        </Button>
      </div>
    </div>
  )

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Configure Lead List</h2>
        <p className="text-muted-foreground">Enter the details for your new lead list</p>
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

        {selectedMethod === "csv-import" && (
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
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => document.getElementById('csv-upload')?.click()}
                    >
                      Choose Different File
                    </Button>
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
        )}
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
        <Button variant="outline" onClick={() => setCurrentStep("select-method")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={() => setCurrentStep("preview")}
          disabled={!formData.name || !formData.connectedAccountId || (selectedMethod === "csv-import" && !formData.csvFile)}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Next: Preview
        </Button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Lead List Preview</h2>
        <p className="text-muted-foreground">Review your lead list before publishing</p>
      </div>

      {csvPreview?.validation.isValid ? (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>CSV processed successfully!</strong>
            <br />
            ✅ Found LinkedIn URLs in your CSV
            <br />
            📊 Processed {csvPreview.preview.totalRows} total rows
            <br />
            📧 {csvPreview.validation.emailColumns.length} emails 📞 {csvPreview.validation.phoneColumns.length} phones
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            CSV validation failed. Please check your file format.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Lead List Preview</span>
            <Badge variant="outline">{csvPreview?.preview.totalRows || 0} Total Leads</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {csvPreview?.preview.data.slice(0, 5).map((lead, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{lead.name || 'N/A'}</TableCell>
                  <TableCell>{lead.title || 'N/A'}</TableCell>
                  <TableCell>{lead.company || 'N/A'}</TableCell>
                  <TableCell>
                    {lead.linkedin_url ? (
                      <a
                        href={lead.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        LinkedIn Profile
                      </a>
                    ) : 'N/A'}
                  </TableCell>
                  <TableCell>{lead.email || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentStep("configure")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={handlePublish}
          disabled={!csvPreview?.validation.isValid || publishMutation.isPending}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {publishMutation.isPending ? "Publishing..." : "Publish List"}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          {["select-method", "configure", "preview"].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep === step ? "bg-purple-600 text-white" :
                  ["select-method", "configure", "preview"].indexOf(currentStep) > index ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}
              `}>
                {["select-method", "configure", "preview"].indexOf(currentStep) > index ? "✓" : index + 1}
              </div>
              {index < 2 && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${["select-method", "configure", "preview"].indexOf(currentStep) > index ? "bg-green-500" : "bg-muted"}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {currentStep === "select-method" && renderMethodSelection()}
          {currentStep === "configure" && renderConfigureStep()}
          {currentStep === "preview" && renderPreviewStep()}
        </CardContent>
      </Card>
    </div>
  )
}