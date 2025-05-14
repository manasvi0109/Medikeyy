"use server"
import { addHealthMetric } from "./health-metrics"
import { addConnectedDevice } from "./connected-devices"
import { addFamilyMember } from "./family-members"
import { addMedicalRecord } from "./medical-records"

export async function seedSampleData(userId: string) {
  try {
    // Add a connected device
    const deviceResult = await addConnectedDevice({
      user_id: userId,
      device_name: "Apple Watch",
      device_type: "apple_watch",
    })

    // Seed health metrics
    await seedHealthMetrics(userId)

    // Seed family members
    await seedFamilyMembers(userId)

    // Seed medical records
    await seedMedicalRecords(userId)

    return { success: true, message: "Sample data seeded successfully" }
  } catch (error) {
    console.error("Error seeding sample data:", error)
    return { success: false, error: "Failed to seed sample data" }
  }
}

async function seedHealthMetrics(userId: string) {
  // Generate dates for the last 30 days
  const now = new Date()
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return date
  })

  // Heart rate data (60-100 bpm)
  for (const date of dates) {
    // Generate 3-5 readings per day
    const readings = Math.floor(Math.random() * 3) + 3

    for (let i = 0; i < readings; i++) {
      const hour = Math.floor(Math.random() * 24)
      const minute = Math.floor(Math.random() * 60)
      date.setHours(hour, minute)

      // Heart rate with some variation
      const heartRate = Math.floor(70 + Math.sin(hour / 3) * 15 + (Math.random() * 10 - 5))

      await addHealthMetric({
        user_id: userId,
        metric_type: "heart_rate",
        value: heartRate,
        unit: "bpm",
        device_type: "apple_watch",
        recorded_at: date.toISOString(),
      })
    }

    // Blood oxygen (95-100%)
    const bloodOxygen = 95 + Math.random() * 5
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
    await addHealthMetric({
      user_id: userId,
      metric_type: "blood_oxygen",
      value: Number.parseFloat(bloodOxygen.toFixed(1)),
      unit: "%",
      device_type: "apple_watch",
      recorded_at: date.toISOString(),
    })

    // Steps (3000-12000)
    const steps = Math.floor(3000 + Math.random() * 9000)
    await addHealthMetric({
      user_id: userId,
      metric_type: "steps",
      value: steps,
      unit: "steps",
      device_type: "apple_watch",
      recorded_at: date.toISOString(),
    })

    // Temperature (97-99°F)
    const temp = 97 + Math.random() * 2
    await addHealthMetric({
      user_id: userId,
      metric_type: "temperature",
      value: Number.parseFloat(temp.toFixed(1)),
      unit: "°F",
      device_type: "apple_watch",
      recorded_at: date.toISOString(),
    })

    // Sleep (5-9 hours)
    const sleep = 5 + Math.random() * 4
    await addHealthMetric({
      user_id: userId,
      metric_type: "sleep",
      value: Number.parseFloat(sleep.toFixed(1)),
      unit: "hours",
      device_type: "apple_watch",
      recorded_at: date.toISOString(),
    })

    // Blood glucose (70-140 mg/dL)
    const glucose = 70 + Math.random() * 70
    await addHealthMetric({
      user_id: userId,
      metric_type: "blood_glucose",
      value: Number.parseFloat(glucose.toFixed(1)),
      unit: "mg/dL",
      device_type: "apple_watch",
      recorded_at: date.toISOString(),
    })
  }
}

async function seedFamilyMembers(userId: string) {
  // Add a family member
  await addFamilyMember({
    user_id: userId,
    name: "Subha Latha",
    relationship: "Mother",
    dob: "1971-05-15",
    gender: "Female",
    blood_type: "O+",
    allergies: "None",
    conditions: "Type 2 diabetes",
  })
}

async function seedMedicalRecords(userId: string) {
  // Add some medical records
  await addMedicalRecord({
    user_id: userId,
    title: "Annual Physical Examination",
    record_type: "check-up",
    record_date: "2025-03-15",
    provider: "Dr. Smith",
    description: "Routine annual physical examination. All results within normal range.",
    file_name: "annual_physical_2025.pdf",
  })

  await addMedicalRecord({
    user_id: userId,
    title: "Blood Test Results",
    record_type: "lab-report",
    record_date: "2025-03-10",
    provider: "City Medical Lab",
    description: "Complete blood count and metabolic panel.",
    file_name: "blood_test_results.pdf",
  })

  await addMedicalRecord({
    user_id: userId,
    title: "Vaccination Record",
    record_type: "immunization",
    record_date: "2025-02-01",
    provider: "Community Health Clinic",
    description: "COVID-19 booster and seasonal flu vaccine.",
    file_name: "vaccination_record.pdf",
  })
}
