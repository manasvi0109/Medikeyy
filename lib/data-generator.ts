/**
 * Utility functions for generating realistic health data
 */

// Generate a random number between min and max
export function randomNumber(min: number, max: number, decimals = 0): number {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(decimals))
}

// Generate a random date between start and end
export function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Generate random heart rate data (60-100 bpm)
export function generateHeartRateData(count = 50): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() - i)

    // Add some realistic patterns
    let baseRate = 72

    // Higher in the morning, lower at night
    const hour = date.getHours()
    if (hour >= 6 && hour <= 9) {
      baseRate += 10 // Morning spike
    } else if (hour >= 22 || hour <= 4) {
      baseRate -= 8 // Night dip
    }

    // Add some random variation
    const value = baseRate + randomNumber(-8, 8)

    data.push({
      recorded_at: date.toISOString(),
      value,
      unit: "bpm",
    })
  }

  return data.reverse()
}

// Generate random blood pressure data (systolic: 100-140, diastolic: 60-90)
export function generateBloodPressureData(count = 50): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() - i * 6) // Every 6 hours

    // Base values with some patterns
    let baseSystolic = 120
    let baseDiastolic = 80

    // Add time-of-day variations
    const hour = date.getHours()
    if (hour >= 6 && hour <= 9) {
      baseSystolic += 5
      baseDiastolic += 3
    } else if (hour >= 22 || hour <= 4) {
      baseSystolic -= 5
      baseDiastolic -= 3
    }

    // Add some random variation
    const systolic = baseSystolic + randomNumber(-10, 10)
    const diastolic = baseDiastolic + randomNumber(-5, 5)

    data.push({
      recorded_at: date.toISOString(),
      value: `${systolic}/${diastolic}`,
      unit: "mmHg",
    })
  }

  return data.reverse()
}

// Generate random blood oxygen data (94-100%)
export function generateBloodOxygenData(count = 50): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() - i * 2) // Every 2 hours

    // Most readings should be 97-99%
    let value
    const rand = Math.random()

    if (rand < 0.7) {
      // 70% chance of normal (97-99)
      value = randomNumber(97, 99, 0)
    } else if (rand < 0.9) {
      // 20% chance of perfect (100)
      value = 100
    } else {
      // 10% chance of slightly low (94-96)
      value = randomNumber(94, 96, 0)
    }

    data.push({
      recorded_at: date.toISOString(),
      value,
      unit: "%",
    })
  }

  return data.reverse()
}

// Generate random steps data (0-15000 steps)
export function generateStepsData(count = 30): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(23, 59, 59) // End of day

    // Base steps with weekly pattern
    let baseSteps = 8000

    // Weekend vs weekday
    const day = date.getDay()
    if (day === 0 || day === 6) {
      // Weekend
      baseSteps = randomNumber(5000, 12000)
    } else {
      // Weekday
      baseSteps = randomNumber(7000, 10000)
    }

    // Add some random variation
    const value = Math.round(baseSteps + randomNumber(-1000, 1000))

    data.push({
      recorded_at: date.toISOString(),
      value,
      unit: "steps",
    })
  }

  return data.reverse()
}

// Generate random sleep data (4-9 hours)
export function generateSleepData(count = 30): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    date.setHours(8, 0, 0) // Morning time

    // Base sleep hours with weekly pattern
    let baseSleep = 7

    // Weekend vs weekday
    const day = date.getDay()
    if (day === 0 || day === 6) {
      // Weekend
      baseSleep = randomNumber(7, 9, 1)
    } else {
      // Weekday
      baseSleep = randomNumber(6, 8, 1)
    }

    // Add some random variation
    const value = Number(baseSleep.toFixed(1))

    data.push({
      recorded_at: date.toISOString(),
      value,
      unit: "hours",
    })
  }

  return data.reverse()
}

// Generate random temperature data (97-99°F)
export function generateTemperatureData(count = 50): any[] {
  const data = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setHours(date.getHours() - i * 4) // Every 4 hours

    // Base temperature with daily pattern
    let baseTemp = 98.6

    // Add time-of-day variations (body temp is lower in morning, higher in evening)
    const hour = date.getHours()
    if (hour >= 4 && hour <= 8) {
      baseTemp -= 0.5 // Lower in early morning
    } else if (hour >= 18 && hour <= 22) {
      baseTemp += 0.3 // Higher in evening
    }

    // Add some random variation
    const value = Number((baseTemp + randomNumber(-0.3, 0.3, 1)).toFixed(1))

    data.push({
      recorded_at: date.toISOString(),
      value,
      unit: "°F",
    })
  }

  return data.reverse()
}

// Generate random weight data (trend over time)
export function generateWeightData(count = 90): any[] {
  const data = []
  const now = new Date()

  // Starting weight
  let currentWeight = 165

  for (let i = 0; i < count; i++) {
    const date = new Date(now)
    date.setDate(date.getDate() - (count - i))

    // Slight downward trend with fluctuations
    currentWeight -= randomNumber(-0.2, 0.3, 1)

    // Add weekly pattern (weekend fluctuations)
    const day = date.getDay()
    if (day === 0) {
      // Sunday after weekend
      currentWeight += randomNumber(0.1, 0.5, 1)
    } else if (day === 5) {
      // Friday before weekend
      currentWeight -= randomNumber(0.1, 0.3, 1)
    }

    data.push({
      recorded_at: date.toISOString(),
      value: Number(currentWeight.toFixed(1)),
      unit: "lbs",
    })
  }

  return data
}

// Generate all health metrics data
export function generateAllHealthData(): any {
  return {
    heart_rate: generateHeartRateData(),
    blood_pressure: generateBloodPressureData(),
    blood_oxygen: generateBloodOxygenData(),
    steps: generateStepsData(),
    sleep: generateSleepData(),
    temperature: generateTemperatureData(),
    weight: generateWeightData(),
  }
}
