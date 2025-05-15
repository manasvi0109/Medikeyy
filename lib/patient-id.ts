/**
 * Utility functions for generating and validating patient IDs
 */

// Generate a unique patient ID with format MK-YYYY-XXXXX
export function generatePatientId(userId: string): string {
  const currentYear = new Date().getFullYear()
  const randomPart = Math.floor(10000 + Math.random() * 90000) // 5-digit number
  const hash = hashString(userId).substring(0, 3).toUpperCase()

  return `MK-${currentYear}-${randomPart}-${hash}`
}

// Simple string hashing function
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}

// Validate a patient ID format
export function isValidPatientId(id: string): boolean {
  const pattern = /^MK-\d{4}-\d{5}-[A-Z0-9]{3}$/
  return pattern.test(id)
}
