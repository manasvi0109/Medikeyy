"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { getHealthMetricsByDateRange, getAggregatedHealthMetrics } from "@/app/actions/health-metrics"

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
  const [aggregation, setAggregation] = useState<"none" | "hour" | "day" | "week" | "month">("none")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)

      // Calculate date range based on selected time range
      const endDate = new Date()
      const startDate = new Date()

      switch (timeRange) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24)
          setAggregation("hour")
          break
        case "7d":
          startDate.setDate(startDate.getDate() - 7)
          setAggregation("day")
          break
        case "30d":
          startDate.setDate(startDate.getDate() - 30)
          setAggregation("day")
          break
        case "90d":
          startDate.setDate(startDate.getDate() - 90)
          setAggregation("week")
          break
        case "1y":
          startDate.setFullYear(startDate.getFullYear() - 1)
          setAggregation("month")
          break
      }

      try {
        let result

        if (aggregation === "none") {
          result = await getHealthMetricsByDateRange(userId, metricType, startDate.toISOString(), endDate.toISOString())
        } else {
          result = await getAggregatedHealthMetrics(
            userId,
            metricType,
            aggregation,
            startDate.toISOString(),
            endDate.toISOString(),
          )
        }

        if (result.success) {
          setData(result.data)
        } else {
          console.error("Failed to fetch health metrics:", result.error)
        }
      } catch (error) {
        console.error("Error fetching health metrics:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, metricType, timeRange, aggregation])

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
                <XAxis dataKey={aggregation === "none" ? "recorded_at" : "time_period"} tickFormatter={formatDate} />
                <YAxis domain={normalRange ? [normalRange.min * 0.9, normalRange.max * 1.1] : ["auto", "auto"]} />
                <Tooltip
                  formatter={(value: any) => [`${value} ${unit}`, title]}
                  labelFormatter={(label) => `Date: ${formatTooltipDate(label)}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={aggregation === "none" ? "value" : "avg_value"}
                  name={aggregation === "none" ? title : `Average ${title}`}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: "#fff" }}
                />
                {aggregation !== "none" && (
                  <>
                    <Line
                      type="monotone"
                      dataKey="max_value"
                      name={`Max ${title}`}
                      stroke={color}
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      opacity={0.7}
                    />
                    <Line
                      type="monotone"
                      dataKey="min_value"
                      name={`Min ${title}`}
                      stroke={color}
                      strokeWidth={1}
                      strokeDasharray="5 5"
                      dot={false}
                      opacity={0.7}
                    />
                  </>
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
