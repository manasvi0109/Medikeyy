"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Plus, Search } from "lucide-react"
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

export default function RecordsPage() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

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
                  <Input id="title" placeholder="E.g., Annual Blood Test Results" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Add details about this record" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="record-type">
                      Record Type <span className="text-red-500">*</span>
                    </Label>
                    <Select>
                      <SelectTrigger id="record-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab-report">Lab Report</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="diagnostic">Diagnostic</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="record-date">
                      Record Date <span className="text-red-500">*</span>
                    </Label>
                    <Input id="record-date" type="date" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="provider-name">
                      Provider Name <span className="text-red-500">*</span>
                    </Label>
                    <Input id="provider-name" placeholder="E.g., Dr. Smith, City Hospital" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="provider-type">Provider Type</Label>
                    <Input id="provider-type" placeholder="E.g., Hospital, Clinic, Laboratory" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tags">Tags (Press Enter to add)</Label>
                  <Input id="tags" placeholder="E.g., diabetes, cardiology" />
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
                  Reset Form
                </Button>
                <Button onClick={() => setIsUploadDialogOpen(false)} className="bg-teal-500 hover:bg-teal-600">
                  Upload Record
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search records..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="lab-reports">Lab Reports</SelectItem>
            <SelectItem value="prescriptions">Prescriptions</SelectItem>
            <SelectItem value="diagnostics">Diagnostics</SelectItem>
            <SelectItem value="summaries">Summaries</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all-records">
        <TabsList className="mb-6">
          <TabsTrigger value="all-records">All Records</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="lab-reports">Lab Reports</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="summaries">Summaries</TabsTrigger>
        </TabsList>

        <TabsContent value="all-records" className="bg-accent/20 p-8 rounded-lg min-h-[400px]">
          <div className="flex flex-col items-center justify-center text-center">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No records found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="bg-accent/20 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No prescription records found</p>
          </div>
        </TabsContent>

        <TabsContent value="lab-reports">
          <div className="bg-accent/20 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No lab report records found</p>
          </div>
        </TabsContent>

        <TabsContent value="diagnostics">
          <div className="bg-accent/20 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No diagnostic records found</p>
          </div>
        </TabsContent>

        <TabsContent value="summaries">
          <div className="bg-accent/20 p-8 rounded-lg min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">No summary records found</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
