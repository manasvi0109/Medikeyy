"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type HealthMetric = {
  id?: number
  user_id: string
  metric_type: string
  value: number
  unit: string
  device_type?: string
  recorded_at: string
}

export async function getHealthMetrics(userId: string, metricType: string, limit = 100) {
  try {
    const metrics = await executeQuery(
      "SELECT * FROM health_metrics WHERE user_id = $1 AND metric_type = $2 ORDER BY recorded_at DESC LIMIT $3",
      [userId, metricType, limit],
    )
    return { success: true, data: metrics }
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return { success: false, error: "Failed to fetch health metrics" }
  }
}

export async function getLatestHealthMetric(userId: string, metricType: string) {
  try {
    const metrics = await executeQuery(
      "SELECT * FROM health_metrics WHERE user_id = $1 AND metric_type = $2 ORDER BY recorded_at DESC LIMIT 1",
      [userId, metricType],
    )
    return { success: true, data: metrics[0] || null }
  } catch (error) {
    console.error("Error fetching latest health metric:", error)
    return { success: false, error: "Failed to fetch latest health metric" }
  }
}

export async function addHealthMetric(metric: HealthMetric) {
  try {
    const result = await executeQuery(
      `INSERT INTO health_metrics 
       (user_id, metric_type, value, unit, device_type, recorded_at) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [metric.user_id, metric.metric_type, metric.value, metric.unit, metric.device_type || null, metric.recorded_at],
    )

    revalidatePath("/smartwatch")
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error adding health metric:", error)
    return { success: false, error: "Failed to add health metric" }
  }
}

export async function addBatchHealthMetrics(metrics: HealthMetric[]) {
  try {
    // Using a transaction for batch insert
    const placeholders = metrics
      .map((_, i) => {
        const base = i * 6
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`
      })
      .join(", ")

    const values = metrics.flatMap((m) => [
      m.user_id,
      m.metric_type,
      m.value,
      m.unit,
      m.device_type || null,
      m.recorded_at,
    ])

    await executeQuery(
      `INSERT INTO health_metrics 
       (user_id, metric_type, value, unit, device_type, recorded_at) 
       VALUES ${placeholders}`,
      values,
    )

    revalidatePath("/smartwatch")
    return { success: true }
  } catch (error) {
    console.error("Error adding batch health metrics:", error)
    return { success: false, error: "Failed to add batch health metrics" }
  }
}

export async function getHealthMetricsByDateRange(
  userId: string,
  metricType: string,
  startDate: string,
  endDate: string,
) {
  try {
    const metrics = await executeQuery(
      `SELECT * FROM health_metrics 
       WHERE user_id = $1 
       AND metric_type = $2 
       AND recorded_at BETWEEN $3 AND $4 
       ORDER BY recorded_at`,
      [userId, metricType, startDate, endDate],
    )
    return { success: true, data: metrics }
  } catch (error) {
    console.error("Error fetching health metrics by date range:", error)
    return { success: false, error: "Failed to fetch health metrics by date range" }
  }
}

export async function getAggregatedHealthMetrics(
  userId: string,
  metricType: string,
  interval: "hour" | "day" | "week" | "month",
  startDate: string,
  endDate: string,
) {
  try {
    let timeFormat
    switch (interval) {
      case "hour":
        timeFormat = "YYYY-MM-DD HH24:00:00"
        break
      case "day":
        timeFormat = "YYYY-MM-DD"
        break
      case "week":
        timeFormat = "YYYY-WW"
        break
      case "month":
        timeFormat = "YYYY-MM"
        break
    }

    const metrics = await executeQuery(
      `SELECT 
        TO_CHAR(recorded_at, $1) as time_period,
        AVG(value) as avg_value,
        MAX(value) as max_value,
        MIN(value) as min_value,
        COUNT(*) as count
       FROM health_metrics 
       WHERE user_id = $2 
       AND metric_type = $3 
       AND recorded_at BETWEEN $4 AND $5
       GROUP BY time_period
       ORDER BY time_period`,
      [timeFormat, userId, metricType, startDate, endDate],
    )

    return { success: true, data: metrics }
  } catch (error) {
    console.error("Error fetching aggregated health metrics:", error)
    return { success: false, error: "Failed to fetch aggregated health metrics" }
  }
}
