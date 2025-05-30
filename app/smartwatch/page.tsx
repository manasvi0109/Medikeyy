"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Watch,
  Heart,
  Activity,
  Moon,
  Droplets,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Smartphone,
  Loader2,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { getSmartWatchData, simulateSmartWatchSync } from "@/app/actions/smartwatch"
import { useToast } from "@/hooks/use-toast"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SmartWatchMetric {
  device_name: string
  metric_type: string
  value: number
  unit: string
  recorded_at: string
  synced_at: string
}

export default function SmartWatchPage() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastSync, setLastSync] = useState<Date>(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [metrics, setMetrics] = useState<SmartWatchMetric[]>([])
  const { user } = useAuth()
  const { toast } = useToast()

  // Load smartwatch data
  useEffect(() => {
    async function loadData() {
      if (!user?.patientId) return

      try {
        const result = await getSmartWatchData(user.patientId)
        if (result.success) {
          setMetrics(result.data)
        }
      } catch (error) {
        console.error("Error loading smartwatch data:", error)
      }
    }

    loadData()
  }, [user])

  const handleSync = async () => {
    if (!user?.patientId) return

    setIsLoading(true)
    try {
      const result = await simulateSmartWatchSync(user.patientId)

      if (result.success) {
        // Reload data
        const updatedData = await getSmartWatchData(user.patientId)
        if (updatedData.success) {
          setMetrics(updatedData.data)
        }

        setLastSync(new Date())
        toast({
          title: "Sync completed",
          description: "Your smartwatch data has been synchronized successfully.",
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("Error syncing smartwatch:", error)
      toast({
        title: "Sync failed",
        description: "Failed to sync smartwatch data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Process metrics for charts
  const processMetricsForChart = (metricType: string) => {
    return metrics
      .filter((m) => m.metric_type === metricType)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
      .slice(-24) // Last 24 data points
      .map((m) => ({
        time: new Date(m.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        value: m.value,
        unit: m.unit,
      }))
  }

  const getLatestMetric = (metricType: string) => {
    const filtered = metrics.filter((m) => m.metric_type === metricType)
    return filtered.length > 0 ? filtered[0] : null
  }

  const heartRateData = processMetricsForChart("heart_rate")
  const bloodOxygenData = processMetricsForChart("blood_oxygen")
  const stepsData = processMetricsForChart("steps")
  const sleepData = processMetricsForChart("sleep_hours")

  const latestHeartRate = getLatestMetric("heart_rate")
  const latestBloodOxygen = getLatestMetric("blood_oxygen")
  const latestSteps = getLatestMetric("steps")
  const latestSleep = getLatestMetric("sleep_hours")

  return (
    <div className="analytics-theme min-h-screen">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">SmartWatch Integration</h1>
            <p className="text-muted-foreground">Monitor your health metrics in real-time</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={isConnected ? "default" : "destructive"} className="gap-1">
              {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <Button onClick={handleSync} disabled={isLoading} className="gap-2 bg-yellow-500 hover:bg-yellow-600">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync Now
            </Button>
          </div>
        </div>

        {/* Device Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connected Device</CardTitle>
              <Watch className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Apple Watch Series 9</div>
              <p className="text-xs text-muted-foreground">Battery: 85% • watchOS 10.1</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
              <RefreshCw className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lastSync.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <p className="text-xs text-muted-foreground">{lastSync.toLocaleDateString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Data Points</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.length}</div>
              <p className="text-xs text-muted-foreground">Total metrics collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heart Rate</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestHeartRate ? `${Math.round(latestHeartRate.value)}` : "--"}
                <span className="text-sm font-normal text-muted-foreground ml-1">bpm</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {latestHeartRate ? new Date(latestHeartRate.recorded_at).toLocaleTimeString() : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Oxygen</CardTitle>
              <Droplets className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestBloodOxygen ? `${Math.round(latestBloodOxygen.value)}` : "--"}
                <span className="text-sm font-normal text-muted-foreground ml-1">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {latestBloodOxygen ? new Date(latestBloodOxygen.recorded_at).toLocaleTimeString() : "No data"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Steps Today</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSteps ? Math.round(latestSteps.value).toLocaleString() : "--"}
              </div>
              <p className="text-xs text-muted-foreground">Goal: 10,000 steps</p>
            </CardContent>
          </Card>

          <Card className="bg-white/50 dark:bg-black/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sleep Last Night</CardTitle>
              <Moon className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latestSleep ? `${latestSleep.value.toFixed(1)}` : "--"}
                <span className="text-sm font-normal text-muted-foreground ml-1">hrs</span>
              </div>
              <p className="text-xs text-muted-foreground">Goal: 7-9 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="heart-rate" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
            <TabsTrigger value="blood-oxygen">Blood Oxygen</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="sleep">Sleep</TabsTrigger>
          </TabsList>

          <TabsContent value="heart-rate">
            <Card className="bg-white/50 dark:bg-black/50">
              <CardHeader>
                <CardTitle>Heart Rate Trends</CardTitle>
                <CardDescription>Your heart rate over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={heartRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [`${value} bpm`, "Heart Rate"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="blood-oxygen">
            <Card className="bg-white/50 dark:bg-black/50">
              <CardHeader>
                <CardTitle>Blood Oxygen Levels</CardTitle>
                <CardDescription>Your blood oxygen saturation over the last 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bloodOxygenData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[95, 100]} />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, "Blood Oxygen"]}
                        labelFormatter={(label) => `Time: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white/50 dark:bg-black/50">
              <CardHeader>
                <CardTitle>Daily Activity</CardTitle>
                <CardDescription>Your step count over the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stepsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any) => [`${value.toLocaleString()} steps`, "Steps"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sleep">
            <Card className="bg-white/50 dark:bg-black/50">
              <CardHeader>
                <CardTitle>Sleep Patterns</CardTitle>
                <CardDescription>Your sleep duration over the last 7 nights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sleepData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={[0, 12]} />
                      <Tooltip
                        formatter={(value: any) => [`${value.toFixed(1)} hours`, "Sleep"]}
                        labelFormatter={(label) => `Date: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Device Management */}
        <Card className="mt-8 bg-white/50 dark:bg-black/50">
          <CardHeader>
            <CardTitle>Device Management</CardTitle>
            <CardDescription>Manage your connected health devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Watch className="h-8 w-8 text-yellow-500" />
                  <div>
                    <h3 className="font-medium">Apple Watch Series 9</h3>
                    <p className="text-sm text-muted-foreground">
                      Connected • Last sync: {lastSync.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-500">
                    Disconnect
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg border-dashed">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium text-muted-foreground">Add New Device</h3>
                    <p className="text-sm text-muted-foreground">Connect additional health monitoring devices</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Device
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
