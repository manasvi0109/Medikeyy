"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type Appointment = {
  id?: string
  user_id: string
  patient_id?: string
  title: string
  date: string
  time: string
  provider: string
  location?: string
  type: string
  notes?: string
  duration?: string
  reminder?: string
}

export async function getAppointments(userId: string) {
  try {
    const appointments = await executeQuery(
      "SELECT * FROM appointments WHERE user_id = $1 OR patient_id = $1 ORDER BY date, time",
      [userId],
    )
    return { success: true, data: appointments }
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return { success: false, error: "Failed to fetch appointments" }
  }
}

export async function addAppointment(appointment: Appointment) {
  try {
    // Get patient_id if available
    let patientId = appointment.patient_id
    if (!patientId) {
      const userResult = await executeQuery("SELECT patient_id FROM users WHERE username = $1", [appointment.user_id])
      if (userResult.length > 0) {
        patientId = userResult[0].patient_id
      }
    }

    const result = await executeQuery(
      `INSERT INTO appointments 
       (user_id, patient_id, title, date, time, provider, location, type, notes, duration, reminder) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING id`,
      [
        appointment.user_id,
        patientId || null,
        appointment.title,
        appointment.date,
        appointment.time,
        appointment.provider,
        appointment.location || null,
        appointment.type,
        appointment.notes || null,
        appointment.duration || null,
        appointment.reminder || null,
      ],
    )

    revalidatePath("/appointments")
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error adding appointment:", error)
    return { success: false, error: "Failed to add appointment" }
  }
}

export async function updateAppointment(id: string, appointment: Partial<Appointment>) {
  try {
    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(appointment).forEach(([key, value]) => {
      if (key !== "id" && key !== "user_id") {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    values.push(id) // Add id as the last parameter

    await executeQuery(
      `UPDATE appointments SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
      values,
    )

    revalidatePath("/appointments")
    return { success: true }
  } catch (error) {
    console.error("Error updating appointment:", error)
    return { success: false, error: "Failed to update appointment" }
  }
}

export async function deleteAppointment(id: string) {
  try {
    await executeQuery("DELETE FROM appointments WHERE id = $1", [id])
    revalidatePath("/appointments")
    return { success: true }
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return { success: false, error: "Failed to delete appointment" }
  }
}
