"use server"

import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
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

    return {
      success: true,
      data: {
        profile: profileResult[0] || {},
        medicalRecords: recordsResult,
        healthMetrics: metricsResult,
        familyMembers: familyResult,
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

    // Create context for the AI
    const systemPrompt = `You are MediKey AI, a helpful medical assistant. You have access to the user's health information and should provide personalized, accurate responses about their health data.

User's Health Profile:
- Name: ${healthData.profile.full_name || "Not provided"}
- Patient ID: ${patientId}
- Blood Type: ${healthData.profile.blood_type || "Not specified"}
- Allergies: ${healthData.profile.allergies || "None recorded"}
- Medical Conditions: ${healthData.profile.medical_conditions || "None recorded"}
- Emergency Contact: ${healthData.profile.emergency_contact_name || "Not specified"}

Recent Medical Records:
${healthData.medicalRecords
  .map((record) => `- ${record.title} (${record.record_type}) on ${record.record_date} by ${record.provider}`)
  .join("\n")}

Recent Health Metrics:
${healthData.healthMetrics
  .map((metric) => `- ${metric.metric_type}: ${metric.value} ${metric.unit} (${metric.recorded_at})`)
  .join("\n")}

Family Members:
${healthData.familyMembers
  .map(
    (member) =>
      `- ${member.name} (${member.relationship}): Blood type ${member.blood_type || "unknown"}, Allergies: ${member.allergies || "none"}`,
  )
  .join("\n")}

Guidelines:
1. Always be helpful, accurate, and empathetic
2. Use the user's actual health data when relevant
3. If you don't have specific information, say so clearly
4. Never provide emergency medical advice - always recommend contacting healthcare providers for urgent issues
5. Keep responses concise but informative
6. Reference specific data points when available`

    let response

    try {
      // Try using Grok AI first
      const { text } = await generateText({
        model: xai("grok"), // Changed from grok-beta to grok
        system: systemPrompt,
        prompt: userMessage,
        maxTokens: 500,
        temperature: 0.7,
      })
      response = text
    } catch (error) {
      console.error("Error with Grok AI, using simulated response:", error)

      // Fallback to simulated response
      response = simulateAIResponse(userMessage, patientId, healthData)
    }

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

// Simulate AI response for when the AI service is unavailable
function simulateAIResponse(query: string, patientId: string, healthData: any): string {
  const lowerQuery = query.toLowerCase()

  // Check for greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(lowerQuery)) {
    return `Hello! I'm your MediKey health assistant. How can I help you today? Your patient ID is ${patientId}.`
  }

  // Check for thanks/gratitude
  if (/thank|thanks|appreciate|grateful/.test(lowerQuery)) {
    return "You're welcome! Is there anything else I can help with?"
  }

  // Check for farewells
  if (/bye|goodbye|see you|farewell/.test(lowerQuery)) {
    return "Goodbye! Stay healthy and reach out anytime you need assistance."
  }

  // Check for questions about the assistant
  if (/who are you|what are you|tell me about yourself|what can you do/.test(lowerQuery)) {
    return "I'm your MediKey AI health assistant. I can help you understand your health records, answer medical questions, provide information about your medications, appointments, and health metrics. I can also offer general health advice and reminders for preventive care."
  }

  // Check for blood pressure related queries
  if (/blood pressure|hypertension|systolic|diastolic/.test(lowerQuery)) {
    const metrics = healthData.healthMetrics.filter((m: any) => m.metric_type.toLowerCase().includes("blood pressure"))
    if (metrics.length > 0) {
      const latest = metrics[0]
      return `Your latest blood pressure reading was ${latest.value} ${latest.unit} recorded on ${new Date(latest.recorded_at).toLocaleDateString()}. Regular monitoring is important for maintaining cardiovascular health.`
    }
    return "I don't see any recent blood pressure readings in your records. Regular monitoring is recommended, especially if you have a history of hypertension."
  }

  // Check for medication related queries
  if (/medication|medicine|drug|prescription|pill/.test(lowerQuery)) {
    const records = healthData.medicalRecords.filter((r: any) => r.record_type.toLowerCase().includes("medication"))
    if (records.length > 0) {
      return `Here are your current medications:\n\n${records.map((r: any) => `- ${r.title}: ${r.description}`).join("\n")}`
    }
    return "I don't see any medications listed in your records. If you're currently taking any medications, please update your medical records."
  }

  // Check for appointment related queries
  if (/appointment|visit|doctor|schedule|checkup|exam/.test(lowerQuery)) {
    const appointments = healthData.medicalRecords.filter((r: any) =>
      r.record_type.toLowerCase().includes("appointment"),
    )
    if (appointments.length > 0) {
      return `Here are your upcoming appointments:\n\n${appointments.map((a: any) => `- ${a.title} with ${a.provider} on ${a.record_date}`).join("\n")}`
    }
    return "I don't see any upcoming appointments in your records. Would you like information on scheduling a checkup?"
  }

  // Check for health metrics
  if (/health metrics|vitals|measurements|readings/.test(lowerQuery)) {
    if (healthData.healthMetrics.length > 0) {
      const metrics = healthData.healthMetrics.slice(0, 5)
      return `Here are your recent health metrics:\n\n${metrics.map((m: any) => `- ${m.metric_type}: ${m.value} ${m.unit} (${new Date(m.recorded_at).toLocaleDateString()})`).join("\n")}`
    }
    return "I don't see any recent health metrics in your records. Regular monitoring of vital signs is important for preventive care."
  }

  // Check for family history
  if (/family|hereditary|genetic|inherited|parent|mother|father|sibling/.test(lowerQuery)) {
    if (healthData.familyMembers.length > 0) {
      return `Here's information about your family members:\n\n${healthData.familyMembers.map((m: any) => `- ${m.name} (${m.relationship}): ${m.conditions ? `Conditions: ${m.conditions}` : "No conditions recorded"}`).join("\n")}`
    }
    return "I don't see any family members listed in your records. Family medical history can provide important insights into potential health risks."
  }

  // Default response
  return "Based on your health records, I can provide personalized information about your medical history, medications, appointments, and health metrics. What specific aspect of your health would you like to know more about?"
}
