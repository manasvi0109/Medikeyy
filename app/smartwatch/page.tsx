"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Activity, Clock, Thermometer, Footprints, Watch, Copy, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { format } from "date-fns"

export default function SmartwatchPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("all")

  const handleCopyUrl = (url) => {
    navigator.clipboard.writeText(url)
    toast({
      title: "URL copied to clipboard",
      description: "You can now paste this URL in your smartwatch app",
    })
  }

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "h:mm:ss a")
    } catch (e) {
      return "Unknown"
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Smartwatch Integration</h1>
          <p className="text-muted-foreground">Connect your smartwatch to monitor real-time health metrics</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Live Health Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Real-time health metrics from your connected smartwatch</p>

            <Tabs defaultValue="all" onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Metrics</TabsTrigger>
                <TabsTrigger value="cardiac">Cardiac</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(activeTab === "all" || activeTab === "cardiac") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-5 w-5 text-rose-500" />
                      <h3 className="font-medium">Heart Rate</h3>
                      <div className="ml-auto">→</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 9:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">
                      72 <span className="text-sm font-normal">bpm</span>{" "}
                      <span className="text-xs bg-accent px-2 py-0.5 rounded ml-2">normal</span>
                    </div>
                    <Progress value={40} className="h-2 bg-blue-200" />
                  </div>
                )}

                {(activeTab === "all" || activeTab === "cardiac") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-rose-500" />
                      <h3 className="font-medium">Blood Pressure</h3>
                      <div className="ml-auto text-rose-500">↓</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 9:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">
                      120/80 <span className="text-xs bg-accent px-2 py-0.5 rounded ml-2">normal</span>
                    </div>
                    <Progress value={60} className="h-2 bg-blue-200" />
                  </div>
                )}

                {(activeTab === "all" || activeTab === "cardiac") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-5 w-5 text-blue-500" />
                      <h3 className="font-medium">Blood Oxygen</h3>
                      <div className="ml-auto">→</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 9:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">
                      98 <span className="text-sm font-normal">%</span>{" "}
                      <span className="text-xs bg-accent px-2 py-0.5 rounded ml-2">normal</span>
                    </div>
                    <Progress value={98} className="h-2 bg-blue-200" />
                  </div>
                )}

                {(activeTab === "all" || activeTab === "activity") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Footprints className="h-5 w-5 text-green-500" />
                      <h3 className="font-medium">Steps</h3>
                      <div className="ml-auto text-green-500">↑</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 9:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">
                      6542 <span className="text-xs bg-accent px-2 py-0.5 rounded ml-2">normal</span>
                    </div>
                    <Progress value={65} className="h-2 bg-blue-200" />
                  </div>
                )}

                {(activeTab === "all" || activeTab === "activity") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      <h3 className="font-medium">Sleep</h3>
                      <div className="ml-auto text-green-500">↑</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 1:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">7h</div>
                    <Progress value={70} className="h-2 bg-blue-200" />
                  </div>
                )}

                {(activeTab === "all" || activeTab === "activity") && (
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Thermometer className="h-5 w-5 text-amber-500" />
                      <h3 className="font-medium">Temperature</h3>
                      <div className="ml-auto">→</div>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">Last updated: 9:42:01 am</div>
                    <div className="text-3xl font-semibold text-green-500 mb-1">
                      98.6 <span className="text-sm font-normal">°F</span>{" "}
                      <span className="text-xs bg-accent px-2 py-0.5 rounded ml-2">normal</span>
                    </div>
                    <Progress value={50} className="h-2 bg-blue-200" />
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Watch className="h-5 w-5 text-blue-500" />
              SmartWatch Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Connect your smartwatch to monitor real-time health metrics</p>

            <Tabs defaultValue="connected-devices">
              <TabsList className="mb-6">
                <TabsTrigger value="connected-devices">Connected Devices</TabsTrigger>
                <TabsTrigger value="connect-new">Connect New Device</TabsTrigger>
              </TabsList>

              <TabsContent value="connected-devices">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                      <Watch className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-1">Apple Watch</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">Connect your Apple Watch device</p>
                    <div className="bg-blue-950 text-blue-200 p-3 rounded text-xs font-mono mb-2 overflow-x-auto">
                      http://localhost:5000/api/smartwatch?userId=28&deviceType=apple_watch
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        handleCopyUrl("http://localhost:5000/api/smartwatch?userId=28&deviceType=apple_watch")
                      }
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy URL
                    </Button>
                  </div>

                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                      <Watch className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-1">Fitbit</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">Connect your Fitbit device</p>
                    <div className="bg-blue-950 text-blue-200 p-3 rounded text-xs font-mono mb-2 overflow-x-auto">
                      http://localhost:5000/api/smartwatch?userId=28&deviceType=fitbit
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyUrl("http://localhost:5000/api/smartwatch?userId=28&deviceType=fitbit")}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy URL
                    </Button>
                  </div>

                  <div className="bg-accent/30 p-4 rounded-lg">
                    <div className="flex items-center justify-center mb-4">
                      <Watch className="h-10 w-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-center mb-1">Samsung Galaxy Watch</h3>
                    <p className="text-sm text-center text-muted-foreground mb-4">
                      Connect your Samsung Galaxy Watch device
                    </p>
                    <div className="bg-blue-950 text-blue-200 p-3 rounded text-xs font-mono mb-2 overflow-x-auto">
                      http://localhost:5000/api/smartwatch?userId=28&deviceType=samsung
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyUrl("http://localhost:5000/api/smartwatch?userId=28&deviceType=samsung")}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Copy URL
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="connect-new">
                <div className="bg-accent/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">How to connect your smartwatch</h3>
                  <ol className="list-decimal list-inside space-y-2 mb-6">
                    <li>Install the MediKey companion app on your smartwatch</li>
                    <li>Open the app and select "Connect to MediKey"</li>
                    <li>Enter the URL provided above or scan the QR code</li>
                    <li>Authorize the connection on your smartwatch</li>
                    <li>Your health data will now sync automatically</li>
                  </ol>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Connect New Device
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Device</DialogTitle>
                        <DialogDescription>
                          Enter the details of your smartwatch to connect it to MediKey.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="device-name" className="text-right">
                            Device Name
                          </Label>
                          <Input id="device-name" placeholder="My Apple Watch" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="device-type" className="text-right">
                            Device Type
                          </Label>
                          <Select defaultValue="apple_watch">
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="Select device type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apple_watch">Apple Watch</SelectItem>
                              <SelectItem value="fitbit">Fitbit</SelectItem>
                              <SelectItem value="samsung">Samsung Galaxy Watch</SelectItem>
                              <SelectItem value="garmin">Garmin</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="submit">Connect Device</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Health Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Ask questions about your health records or get information about medical terms
          </p>

          <div className="flex gap-2">
            <Input placeholder="Ask a question about your health..." className="flex-1" />
            <Button>Ask</Button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Example questions: "What does my last blood test show?", "What are normal cholesterol levels?"
          </p>

          <div className="mt-6 text-center">
            <Button variant="link" className="text-blue-500">
              Go to AI Assistant for full conversation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
