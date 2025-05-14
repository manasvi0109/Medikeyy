import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Initialize the SQL client with the database URL
const sql = neon(process.env.DATABASE_URL!)

// Initialize the Drizzle ORM instance
export const db = drizzle(sql)

// Helper function for direct SQL queries
export async function executeQuery(query: string, params: any[] = []) {
  try {
    return await sql(query, params)
  } catch (error) {
    console.error("Database query error:", error)
    throw error
  }
}

// Helper function to format date for database
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString()
}
