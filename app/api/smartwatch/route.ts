import { type NextRequest, NextResponse } from "next/server"
import { validateDeviceConnection } from "@/app/actions/connected-devices"
import { addHealthMetric } from "@/app/actions/health-metrics"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { connectionKey, metrics } = data

    // Validate the connection key
    const validation = await validateDeviceConnection(connectionKey)
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid connection key" }, { status: 401 })
    }

    // Process the metrics
    const device = validation.device
    const userId = device.user_id

    // Add each metric to the database
    for (const metric of metrics) {
      await addHealthMetric({
        user_id: userId,
        metric_type: metric.type,
        value: metric.value,
        unit: metric.unit,
        device_type: device.device_type,
        recorded_at: metric.timestamp || new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing smartwatch data:", error)
    return NextResponse.json({ error: "Failed to process smartwatch data" }, { status: 500 })
  }
}
