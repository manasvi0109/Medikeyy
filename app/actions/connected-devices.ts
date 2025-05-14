"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { randomUUID } from "crypto"

export type ConnectedDevice = {
  id?: number
  user_id: string
  device_name: string
  device_type: string
  device_id?: string
  connection_key?: string
  last_sync?: string
}

export async function getConnectedDevices(userId: string) {
  try {
    const devices = await executeQuery("SELECT * FROM connected_devices WHERE user_id = $1", [userId])
    return { success: true, data: devices }
  } catch (error) {
    console.error("Error fetching connected devices:", error)
    return { success: false, error: "Failed to fetch connected devices" }
  }
}

export async function addConnectedDevice(device: ConnectedDevice) {
  try {
    // Generate a unique connection key if not provided
    const connectionKey = device.connection_key || randomUUID()

    const result = await executeQuery(
      `INSERT INTO connected_devices 
       (user_id, device_name, device_type, device_id, connection_key) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, connection_key`,
      [device.user_id, device.device_name, device.device_type, device.device_id || null, connectionKey],
    )

    revalidatePath("/smartwatch")
    return {
      success: true,
      id: result[0].id,
      connection_key: result[0].connection_key,
    }
  } catch (error) {
    console.error("Error adding connected device:", error)
    return { success: false, error: "Failed to add connected device" }
  }
}

export async function updateDeviceLastSync(id: number) {
  try {
    await executeQuery(
      "UPDATE connected_devices SET last_sync = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [id],
    )

    revalidatePath("/smartwatch")
    return { success: true }
  } catch (error) {
    console.error("Error updating device last sync:", error)
    return { success: false, error: "Failed to update device last sync" }
  }
}

export async function deleteConnectedDevice(id: number) {
  try {
    await executeQuery("DELETE FROM connected_devices WHERE id = $1", [id])
    revalidatePath("/smartwatch")
    return { success: true }
  } catch (error) {
    console.error("Error deleting connected device:", error)
    return { success: false, error: "Failed to delete connected device" }
  }
}

export async function validateDeviceConnection(connectionKey: string) {
  try {
    const result = await executeQuery("SELECT * FROM connected_devices WHERE connection_key = $1", [connectionKey])

    if (result.length === 0) {
      return { success: false, error: "Invalid connection key" }
    }

    return { success: true, device: result[0] }
  } catch (error) {
    console.error("Error validating device connection:", error)
    return { success: false, error: "Failed to validate device connection" }
  }
}
