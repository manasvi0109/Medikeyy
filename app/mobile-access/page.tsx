"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Smartphone, Download, Share2 } from "lucide-react"
import QRCode from "react-qr-code"
import { useToast } from "@/hooks/use-toast"

export default function MobileAccessPage() {
  const [qrValue] = useState(
    "https://medikey-health-dashboard.vercel.app/mobile-login?user=manasvi&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
  )
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  const handleDownloadQR = () => {
    setIsDownloading(true)

    // Create a canvas from the QR code
    const svg = document.getElementById("mobile-qr-code")
    if (!svg) {
      setIsDownloading(false)
      return
    }

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height

      // Draw white background
      if (ctx) {
        ctx.fillStyle = "white"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // Convert to data URL and download
        const dataUrl = canvas.toDataURL("image/png")
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = "medikey-mobile-access.png"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast({
          title: "QR Code Downloaded",
          description: "Your mobile access QR code has been downloaded successfully.",
        })
      }

      setIsDownloading(false)
    }

    img.src = "data:image/svg+xml;base64," + btoa(svgData)
  }

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "MediKey Mobile Access",
          text: "Scan this QR code to access your MediKey account on mobile",
          url: qrValue,
        })

        toast({
          title: "QR Code Shared",
          description: "Your mobile access QR code has been shared successfully.",
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(qrValue)

      toast({
        title: "Link Copied",
        description: "Mobile access link copied to clipboard.",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mobile Access</h1>
          <p className="text-muted-foreground">Scan the QR code to access your health data on your mobile device.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-blue-500 text-white hover:bg-blue-600">
          Mobile access
        </Button>
      </div>

      <div className="bg-accent/20 rounded-lg p-8 flex flex-col items-center">
        <div className="flex items-center justify-center mb-8">
          <Smartphone className="h-8 w-8 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Mobile Access QR Code</h2>
        </div>

        <div className="bg-white p-6 rounded-lg mb-6 relative group">
          <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
            <div className="bg-blue-500/80 text-white px-3 py-1 rounded-full text-sm">Scan me</div>
          </div>
          <QRCode id="mobile-qr-code" value={qrValue} size={256} />
        </div>

        <div className="flex gap-4 mb-8">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={handleDownloadQR}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download QR Code"}
          </Button>
          <Button variant="outline" className="flex items-center gap-2" onClick={handleShareQR}>
            <Share2 className="h-4 w-4" />
            Share QR Code
          </Button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <Smartphone className="h-5 w-5 mr-2 text-blue-500" />
          <p className="text-center">
            Scan this QR code using your mobile phone to instantly access your MediKey dashboard.
          </p>
        </div>

        <div className="max-w-md">
          <h3 className="font-semibold mb-4 text-blue-500">How to access MediKey on your phone:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs mr-2 mt-0.5 flex-shrink-0">
                1
              </span>
              <span>Open your phone's camera app</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs mr-2 mt-0.5 flex-shrink-0">
                2
              </span>
              <span>Point the camera at the QR code above</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs mr-2 mt-0.5 flex-shrink-0">
                3
              </span>
              <span>Tap on the notification that appears</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs mr-2 mt-0.5 flex-shrink-0">
                4
              </span>
              <span>Sign in with your MediKey credentials</span>
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center bg-blue-500 text-white rounded-full w-5 h-5 text-xs mr-2 mt-0.5 flex-shrink-0">
                5
              </span>
              <span>Access your health data on the go</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
