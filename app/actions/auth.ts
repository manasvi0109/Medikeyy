"use server"

import { executeQuery } from "@/lib/db"
import { generatePatientId } from "@/lib/patient-id"
import bcrypt from "bcryptjs"

export type User = {
  id: number
  username: string
  full_name: string
  email: string
  patient_id: string
  created_at: string
}

export async function createUser(userData: {
  username: string
  fullName: string
  email: string
  password: string
}) {
  try {
    // Check if username or email already exists
    const existingUser = await executeQuery("SELECT id FROM users WHERE username = $1 OR email = $2", [
      userData.username,
      userData.email,
    ])

    if (existingUser.length > 0) {
      return { success: false, error: "Username or email already exists" }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12)

    // Generate unique patient ID
    const patientId = generatePatientId(userData.username)

    // Insert user into database
    const result = await executeQuery(
      `INSERT INTO users (username, full_name, email, password_hash, patient_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, full_name, email, patient_id, created_at`,
      [userData.username, userData.fullName, userData.email, passwordHash, patientId],
    )

    // Create user profile
    await executeQuery(
      `INSERT INTO user_profiles (user_id, patient_id) 
       VALUES ($1, $2)`,
      [result[0].id, patientId],
    )

    return {
      success: true,
      user: {
        id: result[0].id,
        username: result[0].username,
        full_name: result[0].full_name,
        email: result[0].email,
        patient_id: result[0].patient_id,
      },
    }
  } catch (error) {
    console.error("Error creating user:", error)
    return { success: false, error: "Failed to create user" }
  }
}

export async function authenticateUser(username: string, password: string) {
  try {
    const result = await executeQuery(
      "SELECT id, username, full_name, email, password_hash, patient_id FROM users WHERE username = $1",
      [username],
    )

    if (result.length === 0) {
      return { success: false, error: "Invalid username or password" }
    }

    const user = result[0]
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      return { success: false, error: "Invalid username or password" }
    }

    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        patient_id: user.patient_id,
      },
    }
  } catch (error) {
    console.error("Error authenticating user:", error)
    return { success: false, error: "Authentication failed" }
  }
}

export async function getUserProfile(patientId: string) {
  try {
    const result = await executeQuery(
      `SELECT u.*, p.date_of_birth, p.gender, p.blood_type, p.height_cm, p.weight_kg,
              p.emergency_contact_name, p.emergency_contact_phone, p.allergies, p.medical_conditions
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.patient_id = $1`,
      [patientId],
    )

    if (result.length === 0) {
      return { success: false, error: "User not found" }
    }

    return { success: true, user: result[0] }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

export async function updateUserProfile(patientId: string, profileData: any) {
  try {
    // Update user_profiles table
    await executeQuery(
      `UPDATE user_profiles SET 
       date_of_birth = $1, gender = $2, blood_type = $3, height_cm = $4, weight_kg = $5,
       emergency_contact_name = $6, emergency_contact_phone = $7, allergies = $8, 
       medical_conditions = $9, updated_at = CURRENT_TIMESTAMP
       WHERE patient_id = $10`,
      [
        profileData.dateOfBirth || null,
        profileData.gender || null,
        profileData.bloodType || null,
        profileData.heightCm || null,
        profileData.weightKg || null,
        profileData.emergencyContactName || null,
        profileData.emergencyContactPhone || null,
        profileData.allergies || null,
        profileData.medicalConditions || null,
        patientId,
      ],
    )

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: "Failed to update user profile" }
  }
}
