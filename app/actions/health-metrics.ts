"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type HealthMetric = {
  id?: number
  user_id: string
  patient_id?: string
  metric_type: string
  value: number
  unit: string
  recorded_at: string
  notes?: string
}

export async function getHealthMetrics(userId: string, metricType?: string, limit = 100) {
  try {
    let query = "SELECT * FROM health_metrics WHERE user_id = $1 OR patient_id = $1"
    const params: any[] = [userId]

    if (metricType) {
      query += " AND metric_type = $2"
      params.push(metricType)
    }

    query += " ORDER BY recorded_at DESC LIMIT $" + (params.length + 1)
    params.push(limit)

    const metrics = await executeQuery(query, params)
    return { success: true, data: metrics || [] }
  } catch (error) {
    console.error("Error fetching health metrics:", error)
    return { success: false, error: "Failed to fetch health metrics", data: [] }
  }
}

export async function addHealthMetric(metric: HealthMetric) {
  try {
    // Get patient_id if available
    let patientId = metric.patient_id
    if (!patientId) {
      const userResult = await executeQuery("SELECT patient_id FROM users WHERE username = $1", [metric.user_id])
      if (userResult && userResult.length > 0) {
        patientId = userResult[0].patient_id
      }
    }

    const result = await executeQuery(
      `INSERT INTO health_metrics 
       (user_id, patient_id, metric_type, value, unit, recorded_at, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING id`,
      [
        metric.user_id,
        patientId || null,
        metric.metric_type,
        metric.value,
        metric.unit,
        metric.recorded_at,
        metric.notes || null,
      ],
    )

    revalidatePath("/analytics")
    revalidatePath("/")
    return { success: true, id: result && result[0] ? result[0].id : null }
  } catch (error) {
    console.error("Error adding health metric:", error)
    return { success: false, error: "Failed to add health metric" }
  }
}

export async function getLatestMetrics(userId: string) {
  try {
    const query = `
      WITH RankedMetrics AS (
        SELECT 
          *,
          ROW_NUMBER() OVER (PARTITION BY metric_type ORDER BY recorded_at DESC) as rn
        FROM health_metrics
        WHERE user_id = $1 OR patient_id = $1
      )
      SELECT * FROM RankedMetrics WHERE rn = 1
    `

    const metrics = await executeQuery(query, [userId])
    return { success: true, data: metrics || [] }
  } catch (error) {
    console.error("Error fetching latest metrics:", error)
    return { success: false, error: "Failed to fetch latest metrics", data: [] }
  }
}

export async function getMetricsByDateRange(userId: string, metricType: string, startDate: string, endDate: string) {
  try {
    const metrics = await executeQuery(
      `SELECT * FROM health_metrics 
       WHERE (user_id = $1 OR patient_id = $1) 
       AND metric_type = $2 
       AND recorded_at BETWEEN $3 AND $4 
       ORDER BY recorded_at`,
      [userId, metricType, startDate, endDate],
    )

    return { success: true, data: metrics || [] }
  } catch (error) {
    console.error("Error fetching metrics by date range:", error)
    return { success: false, error: "Failed to fetch metrics by date range", data: [] }
  }
}

export async function getLatestHealthMetric(userId: string, metricType: string) {
  try {
    if (!userId || !metricType) {
      return { success: false, error: "User ID and metric type are required", data: null }
    }

    const metrics = await executeQuery(
      "SELECT * FROM health_metrics WHERE (user_id = $1 OR patient_id = $1) AND metric_type = $2 ORDER BY recorded_at DESC LIMIT 1",
      [userId, metricType],
    )

    // Check if metrics is an array and has data
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return { success: true, data: null }
    }

    return { success: true, data: metrics[0] }
  } catch (error) {
    console.error("Error fetching latest health metric:", error)
    return { success: false, error: "Failed to fetch latest health metric", data: null }
  }
}

export async function addBatchHealthMetrics(metrics: HealthMetric[]) {
  try {
    if (!metrics || metrics.length === 0) {
      return { success: true, message: "No metrics to add" }
    }

    // Using a transaction for batch insert
    const placeholders = metrics
      .map((_, i) => {
        const base = i * 7
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7})`
      })
      .join(", ")

    const values = metrics.flatMap((m) => [
      m.user_id,
      m.patient_id || null,
      m.metric_type,
      m.value,
      m.unit,
      m.recorded_at,
      m.notes || null,
    ])

    await executeQuery(
      `INSERT INTO health_metrics 
       (user_id, patient_id, metric_type, value, unit, recorded_at, notes) 
       VALUES ${placeholders}`,
      values,
    )

    revalidatePath("/analytics")
    revalidatePath("/")
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
       WHERE (user_id = $1 OR patient_id = $1) 
       AND metric_type = $2 
       AND recorded_at BETWEEN $3 AND $4 
       ORDER BY recorded_at`,
      [userId, metricType, startDate, endDate],
    )
    return { success: true, data: metrics || [] }
  } catch (error) {
    console.error("Error fetching health metrics by date range:", error)
    return { success: false, error: "Failed to fetch health metrics by date range", data: [] }
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
       WHERE (user_id = $2 OR patient_id = $2) 
       AND metric_type = $3 
       AND recorded_at BETWEEN $4 AND $5
       GROUP BY time_period
       ORDER BY time_period`,
      [timeFormat, userId, metricType, startDate, endDate],
    )

    return { success: true, data: metrics || [] }
  } catch (error) {
    console.error("Error fetching aggregated health metrics:", error)
    return { success: false, error: "Failed to fetch aggregated health metrics", data: [] }
  }
}

// Helper function to seed sample health metrics for testing
export async function seedSampleHealthMetrics(userId: string) {
  try {
    const now = new Date()
    const sampleMetrics: HealthMetric[] = [
      {
        user_id: userId,
        metric_type: "heart_rate",
        value: 72,
        unit: "bpm",
        recorded_at: now.toISOString(),
        notes: "Resting heart rate",
      },
      {
        user_id: userId,
        metric_type: "blood_oxygen",
        value: 98,
        unit: "%",
        recorded_at: now.toISOString(),
        notes: "Normal SpO2 level",
      },
      {
        user_id: userId,
        metric_type: "steps",
        value: 8500,
        unit: "steps",
        recorded_at: now.toISOString(),
        notes: "Daily step count",
      },
      {
        user_id: userId,
        metric_type: "sleep_hours",
        value: 7.5,
        unit: "hours",
        recorded_at: now.toISOString(),
        notes: "Last night's sleep",
      },
    ]

    const result = await addBatchHealthMetrics(sampleMetrics)
    return result
  } catch (error) {
    console.error("Error seeding sample health metrics:", error)
    return { success: false, error: "Failed to seed sample health metrics" }
  }
}
