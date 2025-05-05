"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { FileText, QrCode, Download, Share2, Maximize2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import QRCode from "react-qr-code"

export default function EmergencyPage() {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false)
  const [isFullScreenQR, setIsFullScreenQR] = useState(false)
  const [emergencyInfo, setEmergencyInfo] = useState({
    bloodType: "",
    allergies: "",
    conditions: "",
    medications: "",
    contactName: "",
    contactPhone: "",
    contactRelationship: "",
  })
  const qrCodeRef = useRef(null)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEmergencyInfo({ ...emergencyInfo, [id]: value })
  }

  const handleSelectChange = (id: string, value: string) => {
    setEmergencyInfo({ ...emergencyInfo, [id]: value })
  }

  const handleSaveEmergencyInfo = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem("medikey_emergency_info", JSON.stringify(emergencyInfo))

    toast({
      title: "Emergency Information Saved",
      description: "Your emergency information has been updated successfully.",
    })

    setIsUpdateDialogOpen(false)
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById("emergency-qr-code")
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "medikey-emergency-qr.png"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({
          title: "QR Code Downloaded",
          description: "Your emergency QR code has been downloaded successfully.",
        })
      }
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShareQR = async () => {
    const emergencyUrl =
      "https://medikey-health-dashboard.vercel.app/emergency-access?id=manasvi&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"

    if (navigator.share) {
      try {
        await navigator.share({
          title: "MediKey Emergency Access",
          text: "Scan this QR code for emergency medical information",
          url: emergencyUrl,
        })

        toast({
          title: "QR Code Shared",
          description: "Your emergency QR code has been shared successfully.",
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(emergencyUrl)

      toast({
        title: "Link Copied",
        description: "Emergency access link copied to clipboard.",
      })
    }
  }

  const toggleFullScreenQR = () => {
    setIsFullScreenQR(!isFullScreenQR)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Emergency Information</h1>
          <p className="text-muted-foreground">Critical health information for emergency situations</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-red-500 text-white hover:bg-red-600">
          Emergency
        </Button>
      </div>

      <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <QrCode className="h-5 w-5" />
          <p className="text-sm font-medium">Important Information</p>
        </div>
        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">
          Share the QR code only with emergency healthcare providers.
        </p>
      </div>

      <div className="bg-accent/20 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Emergency Information</h2>
          <Button variant="outline" size="sm" className="bg-red-500/10 text-red-500 border-red-500/30">
            Always Accessible
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">BLOOD TYPE</h3>
            <p className="font-medium">{emergencyInfo.bloodType || "Not specified"}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">ALLERGIES</h3>
            <p className="font-medium">{emergencyInfo.allergies || "None recorded"}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">CHRONIC CONDITIONS</h3>
            <p className="font-medium">{emergencyInfo.conditions || "None recorded"}</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">EMERGENCY CONTACT</h3>
            <p className="font-medium">{emergencyInfo.contactName || "Not specified"}</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Update Emergency Info
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Update Emergency Information</DialogTitle>
                <DialogDescription>This information will be accessible in emergency situations.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  <Select onValueChange={(value) => handleSelectChange("bloodType", value)}>
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="a-pos">A+</SelectItem>
                      <SelectItem value="a-neg">A-</SelectItem>
                      <SelectItem value="b-pos">B+</SelectItem>
                      <SelectItem value="b-neg">B-</SelectItem>
                      <SelectItem value="ab-pos">AB+</SelectItem>
                      <SelectItem value="ab-neg">AB-</SelectItem>
                      <SelectItem value="o-pos">O+</SelectItem>
                      <SelectItem value="o-neg">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any allergies, separated by commas"
                    value={emergencyInfo.allergies}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conditions">Chronic Conditions</Label>
                  <Textarea
                    id="conditions"
                    placeholder="List any chronic conditions, separated by commas"
                    value={emergencyInfo.conditions}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="List current medications with dosages"
                    value={emergencyInfo.medications}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactName">Emergency Contact Name</Label>
                  <Input
                    id="contactName"
                    placeholder="Full name of emergency contact"
                    value={emergencyInfo.contactName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Emergency Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    placeholder="Phone number"
                    value={emergencyInfo.contactPhone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="contactRelationship">Relationship</Label>
                  <Input
                    id="contactRelationship"
                    placeholder="e.g., Spouse, Parent, Child"
                    value={emergencyInfo.contactRelationship}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEmergencyInfo} className="bg-red-500 hover:bg-red-600">
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" className="gap-2 bg-red-500 hover:bg-red-600 text-white">
                <QrCode className="h-4 w-4" />
                Show Emergency QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className={isFullScreenQR ? "sm:max-w-[90vw] h-[90vh] flex flex-col" : "sm:max-w-[400px]"}>
              <DialogHeader>
                <DialogTitle>Emergency QR Code</DialogTitle>
                <DialogDescription>Scan this code to access emergency information.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-4 flex-grow">
                <div
                  className={`bg-white p-4 rounded-lg mb-4 ${isFullScreenQR ? "w-[80%] max-w-[500px]" : "w-48 h-48"}`}
                >
                  <QRCode
                    id="emergency-qr-code"
                    value="https://medikey-health-dashboard.vercel.app/emergency-access?id=manasvi&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
                    size={isFullScreenQR ? 500 : 256}
                    ref={qrCodeRef}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  This QR code provides access to your critical medical information in case of emergency.
                </p>
                <p className="text-xs text-center text-red-500 mt-2">QR code expires in 24 hours.</p>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleDownloadQR}>
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={handleShareQR}>
                    <Share2 className="h-3 w-3" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1" onClick={toggleFullScreenQR}>
                    <Maximize2 className="h-3 w-3" />
                    {isFullScreenQR ? "Reduce" : "Enlarge"}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsQRDialogOpen(false)}>
                  Close
                </Button>
                <Button className="bg-red-500 hover:bg-red-600">View Full Screen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-accent/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Critical Medical Info</h2>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 className="text-sm text-muted-foreground uppercase mb-1">PERSONAL INFORMATION</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Full Name:</p>
                  <p>Manasvi</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date of Birth:</p>
                  <p>2003-09-01</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Gender:</p>
                  <p>Female</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Blood Type:</p>
                  <p className="text-red-500">Not specified</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm text-muted-foreground uppercase mb-1">MEDICAL INFORMATION</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Allergies:</p>
                  <p>None</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Chronic Conditions:</p>
                  <p>None</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Emergency Contact:</p>
                  <p className="text-red-500">Not provided</p>
                </div>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="mt-6 w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
            onClick={() => setIsUpdateDialogOpen(true)}
          >
            <FileText className="h-4 w-4" />
            Update Emergency Information
          </Button>
        </div>

        <div className="bg-accent/20 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Emergency QR Code</h2>

          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-white p-4 rounded-lg mb-4 relative group">
              <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <div className="bg-red-500/80 text-white px-3 py-1 rounded-full text-sm">Scan in emergency</div>
              </div>
              <QRCode
                value="https://medikey-health-dashboard.vercel.app/emergency-access?id=manasvi&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
                size={192}
              />
            </div>

            <p className="text-sm text-center mb-2">Scan this QR code to access medical data in emergencies.</p>

            <div className="flex items-center justify-center text-xs text-red-500 mb-4">
              <QrCode className="h-3 w-3 mr-1" />
              QR code expires in 24 hours.
            </div>

            <div className="flex gap-2">
              <Button className="gap-2 bg-red-500 hover:bg-red-600 text-white" onClick={() => setIsQRDialogOpen(true)}>
                <QrCode className="h-4 w-4" />
                View Full Screen
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleDownloadQR}>
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
