"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { getLatestHealthMetric } from "@/app/actions/health-metrics"

type HealthMetricsSummaryProps = {
  userId: string
  metricType: string
  title: string
  icon: React.ReactNode
  unit: string
  normalRange?: { min: number; max: number }
  colorScheme?: "green" | "blue" | "red" | "yellow" | "purple"
}

export default function HealthMetricsSummary({
  userId,
  metricType,
  title,
  icon,
  unit,
  normalRange,
  colorScheme = "blue",
}: HealthMetricsSummaryProps) {
  const [metric, setMetric] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<"normal" | "high" | "low" | "unknown">("unknown")

  const colorMap = {
    green: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-500",
      progress: "bg-green-200",
    },
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-500",
      progress: "bg-blue-200",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-500",
      progress: "bg-red-200",
    },
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-500",
      progress: "bg-yellow-200",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-500",
      progress: "bg-purple-200",
    },
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!userId || !metricType) {
        setError("Missing user ID or metric type")
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const result = await getLatestHealthMetric(userId, metricType)

        if (!result) {
          setError("No response from server")
          return
        }

        if (!result.success) {
          setError(result.error || "Failed to fetch data")
          return
        }

        if (result.data) {
          setMetric(result.data)

          // Determine status based on normal range
          if (normalRange && result.data.value !== undefined) {
            const value = Number.parseFloat(result.data.value.toString())
            if (!isNaN(value)) {
              if (value < normalRange.min) {
                setStatus("low")
              } else if (value > normalRange.max) {
                setStatus("high")
              } else {
                setStatus("normal")
              }
            }
          }
        } else {
          // No data available, but not an error
          setMetric(null)
        }
      } catch (error) {
        console.error("Error fetching health metric:", error)
        setError("Failed to load health metric")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [userId, metricType, normalRange])

  // Calculate progress value for the progress bar
  const getProgressValue = () => {
    if (!metric || !normalRange || !metric.value) return 50

    const value = Number.parseFloat(metric.value.toString())
    if (isNaN(value)) return 50

    const range = normalRange.max - normalRange.min
    const normalized = ((value - normalRange.min) / range) * 100

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, normalized))
  }

  // Format the recorded_at date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Unknown"
    try {
      const date = new Date(dateStr)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    } catch {
      return "Invalid date"
    }
  }

  // Get status indicator
  const getStatusIndicator = () => {
    switch (status) {
      case "normal":
        return "→"
      case "high":
        return "↑"
      case "low":
        return "↓"
      default:
        return "→"
    }
  }

  // Get status color
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "text-green-500"
      case "high":
        return "text-red-500"
      case "low":
        return "text-amber-500"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="bg-accent/30 p-4 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1 rounded-full ${colorMap[colorScheme].bg}`}>{icon}</div>
        <h3 className="font-medium">{title}</h3>
        <div className={`ml-auto ${getStatusColor()}`}>{getStatusIndicator()}</div>
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-accent/50 rounded w-1/3 mb-2"></div>
          <div className="h-8 bg-accent/50 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-accent/50 rounded"></div>
        </div>
      ) : error ? (
        <div className="text-sm text-red-500">Error: {error}</div>
      ) : metric ? (
        <>
          <div className="text-xs text-muted-foreground mb-1">Last updated: {formatDate(metric.recorded_at)}</div>
          <div className="text-3xl font-semibold text-green-500 mb-1">
            {metric.value ? Number.parseFloat(metric.value.toString()).toFixed(1) : "0.0"}{" "}
            <span className="text-sm font-normal">{unit}</span>{" "}
            {status !== "unknown" && (
              <span
                className={`text-xs bg-accent px-2 py-0.5 rounded ml-2 ${
                  status === "normal" ? "text-green-500" : status === "high" ? "text-red-500" : "text-amber-500"
                }`}
              >
                {status}
              </span>
            )}
          </div>
          <Progress value={getProgressValue()} className={`h-2 ${colorMap[colorScheme].progress}`} />
        </>
      ) : (
        <div className="text-sm text-muted-foreground">
          No data available
          <div className="text-xs mt-1">Connect your smartwatch to start tracking</div>
        </div>
      )}
    </div>
  )
}
