"use server"

  import { executeQuery } from "@/lib/db"
  import { revalidatePath } from "next/cache"

  export type MedicalRecord = {
    id?: number
    user_id: string
    title: string
    record_type: string
    record_date: string
    provider: string
    description?: string
    file_url?: string
    file_name?: string
    file_size?: number
  }

  export async function getMedicalRecords(userId: string) {
    try {
      const records = await executeQuery("SELECT * FROM medical_records WHERE user_id = $1 ORDER BY record_date DESC", [
        userId,
      ])
      return { success: true, data: records }
    } catch (error) {
      console.error("Error fetching medical records:", error)
      return { success: false, error: "Failed to fetch medical records" }
    }
  }

  export async function getMedicalRecordsByType(userId: string, recordType: string) {
    try {
      const records = await executeQuery(
        "SELECT * FROM medical_records WHERE user_id = $1 AND record_type = $2 ORDER BY record_date DESC",
        [userId, recordType],
      )
      return { success: true, data: records }
    } catch (error) {
      console.error("Error fetching medical records by type:", error)
      return { success: false, error: "Failed to fetch medical records" }
    }
  }

  export async function addMedicalRecord(record: MedicalRecord) {
    try {
      const result = await executeQuery(
        `INSERT INTO medical_records 
        (user_id, title, record_type, record_date, provider, description, file_url, file_name, file_size) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING id`,
        [
          record.user_id,
          record.title,
          record.record_type,
          record.record_date,
          record.provider,
          record.description || null,
          record.file_url || null,
          record.file_name || null,
          record.file_size || null,
        ],
      )

      revalidatePath("/records")
      return { success: true, id: result[0].id }
    } catch (error) {
      console.error("Error adding medical record:", error)
      return { success: false, error: "Failed to add medical record" }
    }
  }

  export async function updateMedicalRecord(id: number, record: Partial<MedicalRecord>) {
    try {
      // Build dynamic update query based on provided fields
      const updates: string[] = []
      const values: any[] = []
      let paramIndex = 1

      Object.entries(record).forEach(([key, value]) => {
        if (key !== "id" && key !== "user_id") {
          updates.push(`${key} = $${paramIndex}`)
          values.push(value)
          paramIndex++
        }
      })

      values.push(id) // Add id as the last parameter

      await executeQuery(
        `UPDATE medical_records SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
        values,
      )

      revalidatePath("/records")
      return { success: true }
    } catch (error) {
      console.error("Error updating medical record:", error)
      return { success: false, error: "Failed to update medical record" }
    }
  }

  export async function deleteMedicalRecord(id: number) {
    try {
      await executeQuery("DELETE FROM medical_records WHERE id = $1", [id])
      revalidatePath("/records")
      return { success: true }
    } catch (error) {
      console.error("Error deleting medical record:", error)
      return { success: false, error: "Failed to delete medical record" }
    }
  }
