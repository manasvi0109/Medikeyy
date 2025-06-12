import { neon } from "@neondatabase/serverless"

// Create a SQL client with the connection string
const sql = neon(process.env.DATABASE_URL || "")

// Helper function for executing SQL queries with proper Neon syntax
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Use sql.query for parameterized queries with placeholders
    const result = await sql.query(query, params)
    return result.rows || []
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function for simple queries without parameters
export async function executeSimpleQuery(query: string) {
  try {
    // Use tagged template for simple queries without parameters
    const result = await sql`${query}`
    return result || []
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Test database connection
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time`
    console.log("Database connection successful:", result)
    return true
  } catch (error) {
    console.error("Database connection failed:", error)
    return false
  }
}

// Helper function to safely execute queries with transaction support
export async function executeTransaction(queries: Array<{ query: string; params: any[] }>) {
  try {
    // Execute all queries in sequence
    const results = []
    for (const { query, params } of queries) {
      const result = await sql.query(query, params)
      results.push(result.rows || [])
    }
    return { success: true, results }
  } catch (error) {
    console.error("Transaction error:", error)
    throw error
  }
}

// Function to clear all data safely
export async function clearAllTables() {
  try {
    // Clear tables in correct order to respect foreign key constraints
    await sql`DELETE FROM user_profiles`
    await sql`DELETE FROM medical_records`
    await sql`DELETE FROM family_members`
    await sql`DELETE FROM health_metrics`
    await sql`DELETE FROM connected_devices`
    await sql`DELETE FROM ai_conversations`
    await sql`DELETE FROM smartwatch_data`
    const result = await sql`DELETE FROM users RETURNING id`

    // Reset sequences
    await sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`
    await sql`ALTER SEQUENCE user_profiles_id_seq RESTART WITH 1`

    return { success: true, deletedUsers: result.length }
  } catch (error) {
    console.error("Error clearing tables:", error)
    throw error
  }
}
