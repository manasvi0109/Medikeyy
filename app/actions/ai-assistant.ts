"use server"

import { executeQuery } from "@/lib/db"

export async function saveConversationMessage(patientId: string, messageType: "user" | "assistant", content: string) {
  try {
    const userResult = await executeQuery("SELECT id FROM users WHERE patient_id = $1", [patientId])

    if (userResult.length === 0) {
      return { success: false, error: "User not found" }
    }

    await executeQuery(
      `INSERT INTO ai_conversations (user_id, patient_id, message_type, content) 
       VALUES ($1, $2, $3, $4)`,
      [userResult[0].id, patientId, messageType, content],
    )

    return { success: true }
  } catch (error) {
    console.error("Error saving conversation message:", error)
    return { success: false, error: "Failed to save message" }
  }
}

export async function getConversationHistory(patientId: string, limit = 50) {
  try {
    const result = await executeQuery(
      `SELECT message_type, content, timestamp 
       FROM ai_conversations 
       WHERE patient_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [patientId, limit],
    )

    return { success: true, messages: result.reverse() }
  } catch (error) {
    console.error("Error fetching conversation history:", error)
    return { success: false, error: "Failed to fetch conversation history" }
  }
}

export async function getUserHealthData(patientId: string) {
  try {
    // Get user profile
    const profileResult = await executeQuery(
      `SELECT u.full_name, u.email, p.date_of_birth, p.gender, p.blood_type, 
              p.emergency_contact_name, p.emergency_contact_phone, p.allergies, p.medical_conditions
       FROM users u
       LEFT JOIN user_profiles p ON u.id = p.user_id
       WHERE u.patient_id = $1`,
      [patientId],
    )

    // Get recent medical records
    const recordsResult = await executeQuery(
      `SELECT title, record_type, record_date, provider, description
       FROM medical_records 
       WHERE patient_id = $1 
       ORDER BY record_date DESC 
       LIMIT 10`,
      [patientId],
    )

    // Get recent health metrics
    const metricsResult = await executeQuery(
      `SELECT metric_type, value, unit, recorded_at
       FROM health_metrics 
       WHERE patient_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT 20`,
      [patientId],
    )

    // Get family members
    const familyResult = await executeQuery(
      `SELECT name, relationship, blood_type, allergies, conditions
       FROM family_members 
       WHERE patient_id = $1`,
      [patientId],
    )

    // Get connected devices
    const devicesResult = await executeQuery(
      `SELECT device_name, device_type, last_sync
       FROM connected_devices 
       WHERE patient_id = $1`,
      [patientId],
    )

    return {
      success: true,
      data: {
        profile: profileResult[0] || {},
        medicalRecords: recordsResult,
        healthMetrics: metricsResult,
        familyMembers: familyResult,
        connectedDevices: devicesResult,
      },
    }
  } catch (error) {
    console.error("Error fetching user health data:", error)
    return { success: false, error: "Failed to fetch health data" }
  }
}

export async function generateAIResponse(patientId: string, userMessage: string) {
  try {
    // Save user message
    await saveConversationMessage(patientId, "user", userMessage)

    // Get user's health data for context
    const healthDataResult = await getUserHealthData(patientId)

    if (!healthDataResult.success) {
      throw new Error("Failed to fetch health data")
    }

    const healthData = healthDataResult.data

    // Generate intelligent response using local AI logic
    const response = generateIntelligentResponse(userMessage, patientId, healthData)

    // Save AI response
    await saveConversationMessage(patientId, "assistant", response)

    return { success: true, response }
  } catch (error) {
    console.error("Error generating AI response:", error)

    // Fallback response
    const fallbackResponse =
      "I apologize, but I'm having trouble accessing your health information right now. Please try again in a moment, or contact your healthcare provider if you have urgent questions."

    await saveConversationMessage(patientId, "assistant", fallbackResponse)

    return { success: true, response: fallbackResponse }
  }
}

// Advanced AI response generator using health data
function generateIntelligentResponse(query: string, patientId: string, healthData: any): string {
  const lowerQuery = query.toLowerCase()
  const { profile, medicalRecords, healthMetrics, familyMembers, connectedDevices } = healthData

  // Greeting responses
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(lowerQuery)) {
    const greetings = [
      `Hello ${profile.full_name || "there"}! I'm your MediKey AI assistant. How can I help you today?`,
      `Hi! I'm here to help with your health questions. Your patient ID is ${patientId}.`,
      `Good day! I have access to your health records and can answer questions about your medical history.`,
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }

  // Gratitude responses
  if (/thank|thanks|appreciate|grateful/.test(lowerQuery)) {
    return "You're very welcome! I'm here to help with all your health questions. Is there anything else you'd like to know?"
  }

  // Farewell responses
  if (/bye|goodbye|see you|farewell/.test(lowerQuery)) {
    return "Take care and stay healthy! Remember to keep your health records updated. Feel free to ask me anything anytime."
  }

  // Blood pressure queries
  if (/blood pressure|hypertension|systolic|diastolic|bp/.test(lowerQuery)) {
    const bpMetrics = healthMetrics.filter(
      (m: any) =>
        m.metric_type.toLowerCase().includes("blood pressure") ||
        m.metric_type.toLowerCase().includes("systolic") ||
        m.metric_type.toLowerCase().includes("diastolic"),
    )

    if (bpMetrics.length > 0) {
      const latest = bpMetrics[0]
      const date = new Date(latest.recorded_at).toLocaleDateString()
      return `Your most recent blood pressure reading was ${latest.value} ${latest.unit} recorded on ${date}. 

Normal blood pressure is typically less than 120/80 mmHg. ${getBPAdvice(latest.value)}

Would you like me to show you trends over time or provide tips for maintaining healthy blood pressure?`
    }

    return `I don't see any recent blood pressure readings in your records. Regular blood pressure monitoring is important for cardiovascular health. 

Normal ranges:
• Normal: Less than 120/80 mmHg
• Elevated: 120-129 systolic, less than 80 diastolic
• High (Stage 1): 130-139/80-89 mmHg
• High (Stage 2): 140/90 mmHg or higher

Consider getting your blood pressure checked regularly and recording the results here.`
  }

  // Heart rate queries
  if (/heart rate|pulse|bpm|heartbeat/.test(lowerQuery)) {
    const hrMetrics = healthMetrics.filter(
      (m: any) => m.metric_type.toLowerCase().includes("heart rate") || m.metric_type.toLowerCase().includes("pulse"),
    )

    if (hrMetrics.length > 0) {
      const latest = hrMetrics[0]
      const date = new Date(latest.recorded_at).toLocaleDateString()
      return `Your most recent heart rate was ${latest.value} ${latest.unit} recorded on ${date}.

${getHeartRateAdvice(Number.parseFloat(latest.value))}

${connectedDevices.length > 0 ? "I see you have connected devices that can help monitor your heart rate continuously." : "Consider using a fitness tracker or smartwatch for continuous heart rate monitoring."}`
    }

    return `I don't see any recent heart rate readings. Normal resting heart rate for adults is typically 60-100 beats per minute. Athletes may have lower rates (40-60 bpm).

Factors affecting heart rate:
• Physical fitness level
• Age and medications
• Stress and caffeine intake
• Temperature and body position`
  }

  // Medication queries
  if (/medication|medicine|drug|prescription|pill|dose/.test(lowerQuery)) {
    const medRecords = medicalRecords.filter(
      (r: any) =>
        r.record_type.toLowerCase().includes("medication") ||
        r.record_type.toLowerCase().includes("prescription") ||
        r.title.toLowerCase().includes("medication"),
    )

    if (medRecords.length > 0) {
      let response = "Here are your current medications:\n\n"
      medRecords.forEach((med: any, index: number) => {
        response += `${index + 1}. **${med.title}**\n   Prescribed by: ${med.provider}\n   Date: ${med.record_date}\n   Notes: ${med.description}\n\n`
      })
      response +=
        "💡 **Medication Tips:**\n• Take medications as prescribed\n• Set reminders for consistent timing\n• Keep an updated list for emergencies\n• Inform all healthcare providers about your medications"
      return response
    }

    return `I don't see any medications listed in your current records. If you're taking any medications:

📝 **Please add them to your records including:**
• Medication name and dosage
• Prescribing doctor
• Frequency and timing
• Purpose/condition being treated

This information is crucial for:
• Emergency situations
• Avoiding drug interactions
• Coordinating care between providers`
  }

  // Appointment queries
  if (/appointment|visit|doctor|schedule|checkup|exam/.test(lowerQuery)) {
    const appointments = medicalRecords.filter(
      (r: any) =>
        r.record_type.toLowerCase().includes("appointment") ||
        r.title.toLowerCase().includes("appointment") ||
        r.title.toLowerCase().includes("visit"),
    )

    if (appointments.length > 0) {
      let response = "Here are your recent/upcoming appointments:\n\n"
      appointments.forEach((apt: any, index: number) => {
        response += `${index + 1}. **${apt.title}**\n   Provider: ${apt.provider}\n   Date: ${apt.record_date}\n   Type: ${apt.record_type}\n\n`
      })
      response +=
        "📅 **Appointment Tips:**\n• Arrive 15 minutes early\n• Bring your insurance card and ID\n• Prepare questions in advance\n• Update your medication list"
      return response
    }

    return `I don't see any upcoming appointments in your records. 

🏥 **Recommended Regular Checkups:**
• Annual physical exam
• Dental cleaning (every 6 months)
• Eye exam (every 1-2 years)
• Preventive screenings based on age

Would you like help scheduling an appointment or information about what to expect during different types of visits?`
  }

  // Family history queries
  if (/family|hereditary|genetic|inherited|parent|mother|father|sibling/.test(lowerQuery)) {
    if (familyMembers.length > 0) {
      let response = "Here's your family medical history:\n\n"
      familyMembers.forEach((member: any, index: number) => {
        response += `${index + 1}. **${member.name}** (${member.relationship})\n`
        response += `   Blood Type: ${member.blood_type || "Not specified"}\n`
        response += `   Allergies: ${member.allergies || "None recorded"}\n`
        response += `   Conditions: ${member.conditions || "None recorded"}\n\n`
      })
      response +=
        "🧬 **Family History Importance:**\n• Helps identify genetic risk factors\n• Guides preventive care decisions\n• Important for emergency medical care"
      return response
    }

    return `I don't see any family medical history recorded. Family history is important for:

🧬 **Risk Assessment:**
• Heart disease and stroke
• Diabetes and metabolic disorders
• Cancer predisposition
• Mental health conditions

📝 **Consider adding information about:**
• Parents, siblings, grandparents
• Major medical conditions
• Age of diagnosis
• Cause of death (if applicable)`
  }

  // Health metrics and vitals
  if (/health metrics|vitals|measurements|readings|stats/.test(lowerQuery)) {
    if (healthMetrics.length > 0) {
      let response = "Here are your recent health metrics:\n\n"
      const recentMetrics = healthMetrics.slice(0, 8)
      recentMetrics.forEach((metric: any, index: number) => {
        const date = new Date(metric.recorded_at).toLocaleDateString()
        response += `${index + 1}. **${metric.metric_type}**: ${metric.value} ${metric.unit}\n   Recorded: ${date}\n\n`
      })

      response +=
        "📊 **Tracking Benefits:**\n• Monitor health trends\n• Early detection of issues\n• Better healthcare discussions\n• Motivation for healthy habits"

      if (connectedDevices.length > 0) {
        response += `\n\n📱 **Connected Devices:** You have ${connectedDevices.length} device(s) helping track your health automatically.`
      }

      return response
    }

    return `I don't see any recent health metrics. Regular monitoring helps track your health trends.

📊 **Important Metrics to Track:**
• Blood pressure and heart rate
• Weight and BMI
• Blood glucose (if diabetic)
• Sleep quality and duration
• Physical activity levels

${connectedDevices.length > 0 ? "You have connected devices that can help automate this tracking!" : "Consider using wearable devices or manual logging to track these metrics."}`
  }

  // Allergies queries
  if (/allerg|sensitive|reaction/.test(lowerQuery)) {
    const allergies = profile.allergies
    if (allergies && allergies.trim()) {
      return `Your recorded allergies: **${allergies}**

⚠️ **Important Reminders:**
• Always inform healthcare providers
• Carry emergency medication if prescribed
• Read food and medication labels carefully
• Consider wearing a medical alert bracelet
• Keep your allergy information updated

If you experience severe allergic reactions, seek immediate medical attention.`
    }

    return `No allergies are currently recorded in your profile.

🔍 **Common Allergies to Consider:**
• Food allergies (nuts, shellfish, dairy)
• Medication allergies (penicillin, aspirin)
• Environmental allergies (pollen, dust)
• Contact allergies (latex, metals)

It's important to keep this information updated for safe medical care.`
  }

  // Emergency contact queries
  if (/emergency|contact|urgent/.test(lowerQuery)) {
    const emergencyContact = profile.emergency_contact_name
    const emergencyPhone = profile.emergency_contact_phone

    if (emergencyContact) {
      return `Your emergency contact: **${emergencyContact}**${emergencyPhone ? `\nPhone: ${emergencyPhone}` : ""}

🚨 **Emergency Preparedness:**
• Keep this information current
• Ensure your contact knows your medical conditions
• Consider adding a backup contact
• Share your patient ID: ${patientId}

**For Medical Emergencies:** Call 911 immediately
**For Urgent Care:** Contact your primary care provider`
    }

    return `No emergency contact is currently recorded.

🚨 **Please add an emergency contact including:**
• Full name and relationship
• Phone number (primary and backup)
• Someone who knows your medical history

This information is crucial during medical emergencies when you might not be able to communicate.`
  }

  // Connected devices queries
  if (/device|smartwatch|tracker|wearable|sync/.test(lowerQuery)) {
    if (connectedDevices.length > 0) {
      let response = "Your connected devices:\n\n"
      connectedDevices.forEach((device: any, index: number) => {
        const lastSync = new Date(device.last_sync).toLocaleDateString()
        response += `${index + 1}. **${device.device_name}** (${device.device_type})\n   Last sync: ${lastSync}\n\n`
      })
      response +=
        "📱 **Device Benefits:**\n• Automatic health tracking\n• Continuous monitoring\n• Trend analysis\n• Early warning alerts"
      return response
    }

    return `No connected devices found. 

📱 **Recommended Devices:**
• Fitness trackers for activity monitoring
• Smart scales for weight tracking
• Blood pressure monitors
• Glucose meters (if diabetic)
• Sleep tracking devices

Connected devices can automatically sync your health data and provide valuable insights into your health trends.`
  }

  // Patient ID queries
  if (/patient id|medical id|my id|identification/.test(lowerQuery)) {
    return `Your patient ID is: **${patientId}**

📋 **Uses for your Patient ID:**
• Accessing medical records
• Communicating with healthcare providers
• Emergency identification
• Insurance and billing purposes

Keep this ID handy and share it with your healthcare team when needed.`
  }

  // General health advice queries
  if (/advice|tips|healthy|wellness|prevention/.test(lowerQuery)) {
    return `Based on your health profile, here are some personalized wellness tips:

🏃‍♂️ **Physical Health:**
• Aim for 150 minutes of moderate exercise weekly
• Maintain a balanced diet with fruits and vegetables
• Stay hydrated (8 glasses of water daily)
• Get 7-9 hours of quality sleep

🧠 **Mental Health:**
• Practice stress management techniques
• Maintain social connections
• Consider mindfulness or meditation
• Seek support when needed

📊 **Health Monitoring:**
• Regular checkups with your healthcare provider
• Track key health metrics
• Stay up-to-date with preventive screenings
• Keep your health records current

${healthMetrics.length > 0 ? "I can see you're already tracking some health metrics - keep it up!" : "Consider starting to track basic health metrics like weight and blood pressure."}

Would you like specific advice about any particular aspect of your health?`
  }

  // Default response with personalized suggestions
  return `I'm here to help with your health questions! Based on your records, I can provide information about:

📋 **Your Health Data:**
${medicalRecords.length > 0 ? `• ${medicalRecords.length} medical records` : "• No medical records yet"}
${healthMetrics.length > 0 ? `• ${healthMetrics.length} health metrics` : "• No health metrics yet"}
${familyMembers.length > 0 ? `• ${familyMembers.length} family members` : "• No family history yet"}
${connectedDevices.length > 0 ? `• ${connectedDevices.length} connected devices` : "• No connected devices"}

💬 **Try asking me about:**
• "What are my recent health metrics?"
• "Show me my medications"
• "What's my family medical history?"
• "Give me health advice"
• "What are my upcoming appointments?"

How can I help you today?`
}

// Helper functions for specific advice
function getBPAdvice(value: string): string {
  const [systolic, diastolic] = value.split("/").map((v) => Number.parseInt(v.replace(/\D/g, "")))

  if (systolic < 120 && diastolic < 80) {
    return "Your blood pressure is in the normal range. Keep up the good work!"
  } else if (systolic < 130 && diastolic < 80) {
    return "Your blood pressure is elevated. Consider lifestyle changes like reducing sodium and increasing exercise."
  } else if (systolic < 140 || diastolic < 90) {
    return "This indicates Stage 1 hypertension. Please consult with your healthcare provider about treatment options."
  } else {
    return "This indicates Stage 2 hypertension. Please contact your healthcare provider promptly for evaluation and treatment."
  }
}

function getHeartRateAdvice(rate: number): string {
  if (rate < 60) {
    return "Your heart rate is below the typical range. This could be normal if you're very fit, but consult your doctor if you have symptoms."
  } else if (rate <= 100) {
    return "Your heart rate is in the normal range for adults at rest."
  } else {
    return "Your heart rate is above the typical resting range. Consider factors like stress, caffeine, or recent activity. Consult your doctor if consistently elevated."
  }
}
