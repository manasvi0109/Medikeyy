"use server"

import { executeQuery } from "@/lib/db"
import { revalidatePath } from "next/cache"

export type FamilyMember = {
  id?: number
  user_id: string
  patient_id?: string
  name: string
  relationship: string
  dob?: string
  gender?: string
  blood_type?: string
  allergies?: string
  conditions?: string
}

export async function getFamilyMembers(userId: string) {
  try {
    const members = await executeQuery(
      "SELECT * FROM family_members WHERE user_id = $1 OR patient_id = $1 ORDER BY name",
      [userId],
    )
    return { success: true, data: members }
  } catch (error) {
    console.error("Error fetching family members:", error)
    return { success: false, error: "Failed to fetch family members" }
  }
}

export async function addFamilyMember(member: FamilyMember) {
  try {
    // Get patient_id if available
    let patientId = member.patient_id
    if (!patientId) {
      const userResult = await executeQuery("SELECT patient_id FROM users WHERE username = $1", [member.user_id])
      if (userResult.length > 0) {
        patientId = userResult[0].patient_id
      }
    }

    const result = await executeQuery(
      `INSERT INTO family_members 
       (user_id, patient_id, name, relationship, dob, gender, blood_type, allergies, conditions) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING id`,
      [
        member.user_id,
        patientId || null,
        member.name,
        member.relationship,
        member.dob || null,
        member.gender || null,
        member.blood_type || null,
        member.allergies || null,
        member.conditions || null,
      ],
    )

    revalidatePath("/family")
    return { success: true, id: result[0].id }
  } catch (error) {
    console.error("Error adding family member:", error)
    return { success: false, error: "Failed to add family member" }
  }
}

export async function updateFamilyMember(id: number, member: Partial<FamilyMember>) {
  try {
    // Build dynamic update query based on provided fields
    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    Object.entries(member).forEach(([key, value]) => {
      if (key !== "id" && key !== "user_id") {
        updates.push(`${key} = $${paramIndex}`)
        values.push(value)
        paramIndex++
      }
    })

    values.push(id) // Add id as the last parameter

    await executeQuery(
      `UPDATE family_members SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex}`,
      values,
    )

    revalidatePath("/family")
    return { success: true }
  } catch (error) {
    console.error("Error updating family member:", error)
    return { success: false, error: "Failed to update family member" }
  }
}

export async function deleteFamilyMember(id: number) {
  try {
    await executeQuery("DELETE FROM family_members WHERE id = $1", [id])
    revalidatePath("/family")
    return { success: true }
  } catch (error) {
    console.error("Error deleting family member:", error)
    return { success: false, error: "Failed to delete family member" }
  }
}
