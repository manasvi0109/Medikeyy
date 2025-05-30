"use server"

import { executeQuery } from "@/lib/db"

export async function saveSmartWatchData(
  patientId: string,
  deviceName: string,
  metrics: Array<{
    type: string
    value: number
    unit: string
    timestamp: string
  }>,
) {
  try {
    // Get user ID
    const userResult = await executeQuery("SELECT id FROM users WHERE patient_id = $1", [patientId])

    if (userResult.length === 0) {
      return { success: false, error: "User not found" }
    }

    const userId = userResult[0].id

    // Insert smartwatch data
    for (const metric of metrics) {
      await executeQuery(
        `INSERT INTO smartwatch_data (user_id, patient_id, device_name, metric_type, value, unit, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, patientId, deviceName, metric.type, metric.value, metric.unit, metric.timestamp],
      )

      // Also insert into health_metrics for compatibility
      await executeQuery(
        `INSERT INTO health_metrics (user_id, patient_id, metric_type, value, unit, device_type, recorded_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, patientId, metric.type, metric.value, metric.unit, deviceName, metric.timestamp],
      )
    }

    return { success: true }
  } catch (error) {
    console.error("Error saving smartwatch data:", error)
    return { success: false, error: "Failed to save smartwatch data" }
  }
}

export async function getSmartWatchData(patientId: string, limit = 100) {
  try {
    const result = await executeQuery(
      `SELECT device_name, metric_type, value, unit, recorded_at, synced_at
       FROM smartwatch_data 
       WHERE patient_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT $2`,
      [patientId, limit],
    )

    return { success: true, data: result }
  } catch (error) {
    console.error("Error fetching smartwatch data:", error)
    return { success: false, error: "Failed to fetch smartwatch data" }
  }
}

export async function simulateSmartWatchSync(patientId: string) {
  try {
    // Generate realistic health metrics
    const now = new Date()
    const metrics = []

    // Heart rate (60-100 bpm normal range)
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000) // Every hour for 24 hours
      metrics.push({
        type: "heart_rate",
        value: Math.floor(Math.random() * 40) + 60, // 60-100 bpm
        unit: "bpm",
        timestamp: timestamp.toISOString(),
      })
    }

    // Blood oxygen (95-100% normal range)
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)
      metrics.push({
        type: "blood_oxygen",
        value: Math.floor(Math.random() * 5) + 96, // 96-100%
        unit: "%",
        timestamp: timestamp.toISOString(),
      })
    }

    // Steps (daily count)
    for (let i = 0; i < 7; i++) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000) // Daily for 7 days
      metrics.push({
        type: "steps",
        value: Math.floor(Math.random() * 5000) + 5000, // 5000-10000 steps
        unit: "steps",
        timestamp: timestamp.toISOString(),
      })
    }

    // Sleep hours (6-9 hours normal range)
    for (let i = 0; i < 7; i++) {
      const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      metrics.push({
        type: "sleep_hours",
        value: Math.random() * 3 + 6, // 6-9 hours
        unit: "hours",
        timestamp: timestamp.toISOString(),
      })
    }

    const result = await saveSmartWatchData(patientId, "Apple Watch Series 9", metrics)
    return result
  } catch (error) {
    console.error("Error simulating smartwatch sync:", error)
    return { success: false, error: "Failed to simulate smartwatch sync" }
  }
}
