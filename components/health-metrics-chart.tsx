"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import {
  generateHeartRateData,
  generateBloodOxygenData,
  generateStepsData,
  generateSleepData,
  generateTemperatureData,
  generateWeightData,
  generateBloodPressureData,
} from "@/lib/data-generator"

type HealthMetricsChartProps = {
  userId: string
  metricType: string
  title: string
  unit: string
  color?: string
  normalRange?: { min: number; max: number }
}

export default function HealthMetricsChart({
  userId,
  metricType,
  title,
  unit,
  color = "#3b82f6",
  normalRange,
}: HealthMetricsChartProps) {
  const [timeRange, setTimeRange] = useState("7d")
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      // Generate appropriate data based on metric type
      let generatedData: any[] = []

      switch (metricType) {
        case "heart_rate":
          generatedData = generateHeartRateData(50)
          break
        case "blood_oxygen":
          generatedData = generateBloodOxygenData(50)
          break
        case "steps":
          generatedData = generateStepsData(30)
          break
        case "sleep":
          generatedData = generateSleepData(30)
          break
        case "temperature":
          generatedData = generateTemperatureData(50)
          break
        case "weight":
          generatedData = generateWeightData(90)
          break
        case "blood_pressure":
          generatedData = generateBloodPressureData(50)
          break
        default:
          generatedData = generateHeartRateData(50)
      }

      // Filter data based on selected time range
      const filteredData = filterDataByTimeRange(generatedData, timeRange)
      setData(filteredData)
      setIsLoading(false)
    }

    fetchData()
  }, [metricType, timeRange])

  // Filter data based on time range
  const filterDataByTimeRange = (data: any[], range: string) => {
    const now = new Date()
    const filtered = data.filter((item) => {
      const itemDate = new Date(item.recorded_at)
      const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

      switch (range) {
        case "24h":
          return diffDays < 1
        case "7d":
          return diffDays < 7
        case "30d":
          return diffDays < 30
        case "90d":
          return diffDays < 90
        case "1y":
          return diffDays < 365
        default:
          return true
      }
    })

    return filtered
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (timeRange === "24h") {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
    return date.toLocaleDateString([], { month: "short", day: "numeric" })
  }

  const formatTooltipDate = (dateStr: string) => {
    const date = new Date(dateStr)
    if (timeRange === "24h") {
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    }
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Extract value from data for blood pressure
  const getDataValue = (item: any) => {
    if (metricType === "blood_pressure" && typeof item.value === "string") {
      // Extract systolic value from "120/80" format
      return Number.parseInt(item.value.split("/")[0])
    }
    return item.value
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No data available for the selected time range
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="recorded_at" tickFormatter={formatDate} />
                <YAxis domain={normalRange ? [normalRange.min * 0.9, normalRange.max * 1.1] : ["auto", "auto"]} />
                <Tooltip
                  formatter={(value: any) => [`${value} ${unit}`, title]}
                  labelFormatter={(label) => `Date: ${formatTooltipDate(label)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={(item) => getDataValue(item)}
                  name={title}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "#fff" }}
                />
                {metricType === "blood_pressure" && (
                  <Line
                    type="monotone"
                    dataKey={(item) => {
                      if (typeof item.value === "string") {
                        return Number.parseInt(item.value.split("/")[1]) // Diastolic
                      }
                      return null
                    }}
                    name="Diastolic"
                    stroke={color}
                    strokeWidth={2}
                    strokeOpacity={0.6}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "#fff" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {normalRange && (
          <div className="mt-4 text-sm text-muted-foreground">
            Normal range: {normalRange.min} - {normalRange.max} {unit}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
