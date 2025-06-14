export function generatePatientId(username: string): string {
  // Create a unique patient ID based on username and timestamp
  const timestamp = Date.now().toString(36)
  const userHash = username
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .substring(0, 4)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase()

  return `MK-${userHash.toUpperCase()}-${timestamp.toUpperCase()}-${randomSuffix}`
}

export function validatePatientId(patientId: string): boolean {
  // Validate patient ID format: MK-XXXX-XXXXXXXX-XXXX
  const pattern = /^MK-[A-Z0-9]{1,4}-[A-Z0-9]{8}-[A-Z0-9]{4}$/
  return pattern.test(patientId)
}
