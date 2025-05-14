"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search, Loader2, AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  getMedicalRecords,
  addMedicalRecord,
  getMedicalRecordsByType,
  type MedicalRecord,
} from "../actions/medical-records"
import { useAuth } from "@/components/auth-provider"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RecordsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all-records")
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()
  const { user } = useAuth()

  const [newRecord, setNewRecord] = useState({
    title: "",
    record_type: "",
    record_date: new Date().toISOString().split("T")[0],
    provider: "",
    description: "",
  })

  // Load records from database
  useEffect(() => {
    async function loadRecords() {
      if (!user?.name) return

      setIsLoading(true)
      setError(null)

      try {
        let result
        if (activeTab === "all-records") {
          result = await getMedicalRecords(user.name)
        } else {
          result = await getMedicalRecordsByType(user.name, activeTab.replace("-", "_"))
        }

        if (result.success) {
          setUploadedFiles(result.data)
        } else {
          setError(result.error || "Failed to load records")
        }
      } catch (err) {
        setError("An error occurred while loading records")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadRecords()
  }, [user, activeTab])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewRecord({ ...newRecord, [id]: value })
  }

  const handleSelectChange = (id: string, value: string) => {
    setNewRecord({ ...newRecord, [id]: value })
  }

  // Function to handle file upload
  const handleUploadRecord = async () => {
    if (!user?.name) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload records",
        variant: "destructive",
      })
      return
    }

    if (!newRecord.title || !newRecord.record_type || !newRecord.record_date) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, you would upload the file to storage and get a URL
      // For now, we'll just use the file name
      const fileUrl = selectedFile ? URL.createObjectURL(selectedFile) : undefined

      const result = await addMedicalRecord({
        user_id: user.name,
        title: newRecord.title,
        record_type: newRecord.record_type,
        record_date: newRecord.record_date,
        provider: newRecord.provider,
        description: newRecord.description,
        file_url: fileUrl,
        file_name: selectedFile?.name,
        file_size: selectedFile?.size,
      })

      if (result.success) {
        toast({
          title: "Record uploaded",
          description: "Your medical record has been saved successfully",
        })

        // Refresh the records
        const updatedRecords = await getMedicalRecords(user.name)
        if (updatedRecords.success) {
          setUploadedFiles(updatedRecords.data)
        }

        // Reset form
        setNewRecord({
          title: "",
          record_type: "",
          record_date: new Date().toISOString().split("T")[0],
          provider: "",
          description: "",
        })
        setSelectedFile(null)
        setIsUploadDialogOpen(false)
      } else {
        toast({
          title: "Upload failed",
          description: result.error || "Failed to upload record",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading your record",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter records based on search query
  const filteredRecords = uploadedFiles.filter(
    (file) =>
      file.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.description && file.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">View and manage all your medical documents in one place</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full bg-teal-500 text-white hover:bg-teal-600">
            Records
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-teal-500 hover:bg-teal-600">
                <Plus className="h-4 w-4" />
                Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
                <DialogDescription>Add a new medical record to your health portfolio.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="E.g., Annual Blood Test Results"
                    value={newRecord.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add details about this record"
                    rows={3}
                    value={newRecord.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="record_type">
                      Record Type <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={newRecord.record_type}
                      onValueChange={(value) => handleSelectChange("record_type", value)}
                    >
                      <SelectTrigger id="record_type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab_report">Lab Report</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="record_date">
                      Record Date <span className="text-red-500">*</span>
                    </Label>
                    <Input id="record_date" type="date" value={newRecord.record_date} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">
                    Provider Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="provider"
                    placeholder="E.g., Dr. Smith, City Hospital"
                    value={newRecord.provider}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="file-upload">
                    Upload File <span className="text-red-500">*</span>
                  </Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                    <FileText className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-center mb-2">
                      {selectedFile ? selectedFile.name : "Drag and drop your file here, or"}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById("file-input")?.click()}
                    >
                      Browse files
                    </Button>
                    <input
                      id="file-input"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.csv,.txt"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Supported formats: PDF, JPEG, PNG, DOC, DOCX, XLS, XLSX, CSV, TXT
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUploadRecord} className="bg-teal-500 hover:bg-teal-600" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Record"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lab_reports">Lab Reports</SelectItem>
            <SelectItem value="prescriptions">Prescriptions</SelectItem>
            <SelectItem value="diagnostics">Diagnostics</SelectItem>
            <SelectItem value="summaries">Summaries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all-records" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all-records">All Records</TabsTrigger>
          <TabsTrigger value="prescription">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab_report">Lab Reports</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostics</TabsTrigger>
          <TabsTrigger value="summary">Summaries</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="bg-accent/20 p-8 rounded-lg min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-teal-500 mb-4" />
              <p className="text-muted-foreground">Loading records...</p>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords.map((file) => (
                <div key={file.id} className="bg-background rounded-lg border p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-5 w-5 text-teal-500" />
                    <h3 className="font-medium truncate">{file.title}</h3>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Type: {file.record_type.replace("_", " ")}</p>
                    <p>Date: {new Date(file.record_date).toLocaleDateString()}</p>
                    <p>Provider: {file.provider}</p>
                    {file.file_name && <p>File: {file.file_name}</p>}
                    {file.file_size && <p>Size: {Math.round(file.file_size / 1024)} KB</p>}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" className="text-teal-500 border-teal-500">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No records found</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Upload your first medical record to get started."}
              </p>
              {!searchQuery && (
                <Button className="gap-2 bg-teal-500 hover:bg-teal-600" onClick={() => setIsUploadDialogOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Upload Your First Record
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
