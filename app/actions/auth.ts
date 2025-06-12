"use server"

import { executeQuery, clearAllTables } from "@/lib/db"
import bcrypt from "bcryptjs"

export type User = {
  id: number
  username: string
  full_name: string
  email: string
  patient_id: string
  created_at: string
}

// Generate a truly unique patient ID
function generateUniquePatientId(username: string): string {
  const timestamp = Date.now()
  const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase()
  const userPart = username.substring(0, 4).toUpperCase().padEnd(4, "X")
  return `MK-${userPart}-${timestamp}-${randomPart}`
}

export async function createUser(userData: {
  username: string
  fullName: string
  email: string
  password: string
}) {
  try {
    // Validate input data
    if (!userData.username || !userData.fullName || !userData.email || !userData.password) {
      return { success: false, error: "All fields are required" }
    }

    // Trim and normalize input
    const normalizedData = {
      username: userData.username.trim().toLowerCase(),
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      password: userData.password,
    }

    console.log("Creating user with normalized data:", {
      username: normalizedData.username,
      email: normalizedData.email,
    })

    // Check if username already exists
    const existingUsername = await executeQuery("SELECT id, username FROM users WHERE username = $1", [
      normalizedData.username,
    ])

    if (existingUsername && existingUsername.length > 0) {
      console.log("Username already exists:", normalizedData.username)
      return {
        success: false,
        error: `Username '${normalizedData.username}' is already taken. Please choose a different username.`,
      }
    }

    // Check if email already exists
    const existingEmail = await executeQuery("SELECT id, email FROM users WHERE email = $1", [normalizedData.email])

    if (existingEmail && existingEmail.length > 0) {
      console.log("Email already exists:", normalizedData.email)
      return {
        success: false,
        error: `Email '${normalizedData.email}' is already registered. Please use a different email address.`,
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(normalizedData.password, 12)

    // Generate unique patient ID with multiple attempts if needed
    let patientId = generateUniquePatientId(normalizedData.username)
    let attempts = 0
    const maxAttempts = 5

    while (attempts < maxAttempts) {
      const existingPatientId = await executeQuery("SELECT id FROM users WHERE patient_id = $1", [patientId])

      if (!existingPatientId || existingPatientId.length === 0) {
        break // Patient ID is unique
      }

      attempts++
      patientId = generateUniquePatientId(normalizedData.username + attempts)
      console.log(`Patient ID collision attempt ${attempts}, using new ID:`, patientId)
    }

    if (attempts >= maxAttempts) {
      return { success: false, error: "Unable to generate unique patient ID. Please try again." }
    }

    console.log("Final patient ID:", patientId)

    // Insert user into database
    const result = await executeQuery(
      `INSERT INTO users (username, full_name, email, password_hash, patient_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, username, full_name, email, patient_id, created_at`,
      [normalizedData.username, normalizedData.fullName, normalizedData.email, passwordHash, patientId],
    )

    if (!result || result.length === 0) {
      return { success: false, error: "Failed to create user account. Please try again." }
    }

    const newUser = result[0]
    console.log("User created successfully:", newUser)

    // Create user profile
    try {
      await executeQuery(
        `INSERT INTO user_profiles (user_id, patient_id) 
         VALUES ($1, $2)`,
        [newUser.id, patientId],
      )
      console.log("User profile created successfully")
    } catch (profileError) {
      console.error("Error creating user profile:", profileError)
      // Don't fail the entire operation if profile creation fails
    }

    return {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        full_name: newUser.full_name,
        email: newUser.email,
        patient_id: newUser.patient_id,
      },
    }
  } catch (error) {
    console.error("Error creating user:", error)

    // Handle specific database constraint errors
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase()
      if (
        errorMessage.includes("users_username_key") ||
        errorMessage.includes('duplicate key value violates unique constraint "users_username_key"')
      ) {
        return { success: false, error: "Username already exists. Please choose a different username." }
      }
      if (
        errorMessage.includes("users_email_key") ||
        errorMessage.includes('duplicate key value violates unique constraint "users_email_key"')
      ) {
        return { success: false, error: "Email already exists. Please use a different email address." }
      }
      if (errorMessage.includes("users_patient_id_key")) {
        return { success: false, error: "Patient ID conflict. Please try again." }
      }
    }

    return { success: false, error: "Failed to create user account. Please try again." }
  }
}

export async function authenticateUser(username: string, password: string) {
  try {
    if (!username || !password) {
      return { success: false, error: "Username and password are required" }
    }

    const normalizedUsername = username.trim().toLowerCase()

    const result = await executeQuery(
      "SELECT id, username, full_name, email, password_hash, patient_id FROM users WHERE username = $1",
      [normalizedUsername],
    )

    if (!result || result.length === 0) {
      return { success: false, error: "Invalid username or password" }
    }

    const user = result[0]

    if (!user || !user.password_hash) {
      return { success: false, error: "Invalid user data" }
    }

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
    return { success: false, error: "Authentication failed. Please try again." }
  }
}

export async function checkUsernameAvailability(username: string) {
  try {
    if (!username || username.length < 3) {
      return { available: false, error: "Username must be at least 3 characters long" }
    }

    const normalizedUsername = username.trim().toLowerCase()
    const result = await executeQuery("SELECT id FROM users WHERE username = $1", [normalizedUsername])

    return { available: !result || result.length === 0 }
  } catch (error) {
    console.error("Error checking username availability:", error)
    return { available: false, error: "Failed to check username availability" }
  }
}

export async function checkEmailAvailability(email: string) {
  try {
    if (!email || !email.includes("@")) {
      return { available: false, error: "Please enter a valid email address" }
    }

    const normalizedEmail = email.trim().toLowerCase()
    const result = await executeQuery("SELECT id FROM users WHERE email = $1", [normalizedEmail])

    return { available: !result || result.length === 0 }
  } catch (error) {
    console.error("Error checking email availability:", error)
    return { available: false, error: "Failed to check email availability" }
  }
}

export async function getAllUsers() {
  try {
    const result = await executeQuery(
      "SELECT id, username, full_name, email, patient_id, created_at FROM users ORDER BY created_at DESC",
    )
    return { success: true, users: result || [] }
  } catch (error) {
    console.error("Error fetching all users:", error)
    return { success: false, error: "Failed to fetch users" }
  }
}

export async function clearAllData() {
  try {
    const result = await clearAllTables()
    return { success: true, message: `Cleared all data. Deleted ${result.deletedUsers} users.` }
  } catch (error) {
    console.error("Error clearing all data:", error)
    return { success: false, error: "Failed to clear all data" }
  }
}

export async function getUserProfile(patientId: string) {
  try {
    if (!patientId) {
      return { success: false, error: "Patient ID is required" }
    }

    const result = await executeQuery(
      `SELECT u.*, p.date_of_birth, p.gender, p.blood_type, p.height_cm, p.weight_kg,
              p.emergency_contact_name, p.emergency_contact_phone, p.allergies, p.medical_conditions
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.patient_id = $1`,
      [patientId],
    )

    if (!result || result.length === 0) {
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
    if (!patientId) {
      return { success: false, error: "Patient ID is required" }
    }

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
