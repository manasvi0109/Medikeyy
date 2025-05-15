"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Send, User, Bot, Trash2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { generatePatientId } from "@/lib/patient-id"

// Types for messages
type MessageType = "user" | "assistant"

interface Message {
  id: string
  type: MessageType
  content: string
  timestamp: Date
}

// Knowledge base for the AI assistant
const knowledgeBase = {
  greetings: [
    "Hello! How can I help with your health questions today?",
    "Hi there! I'm your MediKey health assistant. What can I help you with?",
    "Good day! How may I assist you with your health information?",
    "Welcome to MediKey! I'm here to help with your health questions.",
  ],

  farewells: [
    "Take care! Let me know if you need anything else.",
    "Goodbye! Stay healthy and reach out anytime you need assistance.",
    "Have a great day! I'm here 24/7 if you have more questions.",
  ],

  thanks: [
    "You're welcome! Is there anything else I can help with?",
    "Happy to help! Let me know if you have other questions.",
    "My pleasure! I'm here to assist with all your health inquiries.",
  ],

  bloodPressure: {
    info: "Blood pressure is measured in millimeters of mercury (mmHg) and is recorded as two numbers: systolic pressure (as the heart beats) over diastolic pressure (as the heart relaxes). Normal blood pressure is less than 120/80 mmHg.",
    readings: [
      { date: "May 10, 2025", value: "128/82 mmHg", status: "Elevated" },
      { date: "April 25, 2025", value: "132/84 mmHg", status: "Elevated" },
      { date: "April 12, 2025", value: "135/87 mmHg", status: "Stage 1 Hypertension" },
    ],
    recommendations:
      "For elevated blood pressure, consider reducing sodium intake, regular exercise, stress management, and limiting alcohol. Continue taking prescribed medications as directed by your doctor.",
  },

  bloodSugar: {
    info: "Blood sugar (glucose) levels are measured in milligrams per deciliter (mg/dL) or millimoles per liter (mmol/L). Normal fasting blood sugar is less than 100 mg/dL (5.6 mmol/L).",
    readings: [
      { date: "May 8, 2025", value: "95 mg/dL", status: "Normal" },
      { date: "April 22, 2025", value: "98 mg/dL", status: "Normal" },
      { date: "April 10, 2025", value: "102 mg/dL", status: "Prediabetes" },
    ],
    recommendations:
      "Your blood sugar levels have improved to the normal range. Continue with your current diet and exercise regimen.",
  },

  cholesterol: {
    info: "Cholesterol is measured in milligrams per deciliter (mg/dL). Total cholesterol should be less than 200 mg/dL, with LDL (bad) cholesterol less than 100 mg/dL and HDL (good) cholesterol above 60 mg/dL.",
    readings: [
      { date: "March 15, 2025", value: "Total: 195 mg/dL, LDL: 110 mg/dL, HDL: 55 mg/dL", status: "Borderline" },
    ],
    recommendations:
      "Your cholesterol levels are borderline. Consider increasing intake of omega-3 fatty acids, fiber, and plant sterols. Limit saturated fats and trans fats.",
  },

  medications: [
    {
      name: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      purpose: "Blood pressure management",
      sideEffects: "Dry cough, dizziness, headache",
      refill: "June 5, 2025",
    },
    {
      name: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily at bedtime",
      purpose: "Cholesterol management",
      sideEffects: "Muscle pain, liver enzyme abnormalities",
      refill: "July 12, 2025",
    },
  ],

  appointments: [
    {
      type: "Annual Physical Exam",
      doctor: "Dr. Smith",
      location: "City Medical Center",
      date: "June 15, 2025",
      time: "9:00 AM",
    },
    {
      type: "Dental Checkup",
      doctor: "Dr. Johnson",
      location: "Smile Dental Clinic",
      date: "July 22, 2025",
      time: "2:30 PM",
    },
  ],

  allergies: ["Penicillin"],

  conditions: ["Hypertension", "Hyperlipidemia"],

  familyHistory: {
    father: "Hypertension, Type 2 Diabetes",
    mother: "Hyperlipidemia",
    siblings: "No significant medical conditions",
  },

  vaccinations: [
    { name: "Influenza (Flu)", date: "October 10, 2024", dueNext: "October 2025" },
    { name: "Tetanus, Diphtheria, Pertussis (Tdap)", date: "May 15, 2022", dueNext: "May 2032" },
    { name: "COVID-19", date: "January 5, 2025", dueNext: "January 2026" },
  ],

  healthMetrics: {
    weight: { value: "165 lbs", trend: "Stable" },
    bmi: { value: "27.2", classification: "Overweight" },
    heartRate: { value: "72 bpm", status: "Normal" },
    bloodOxygen: { value: "98%", status: "Normal" },
    temperature: { value: "98.6°F", status: "Normal" },
  },

  preventiveCare: [
    {
      test: "Colonoscopy",
      recommended: "Every 10 years starting at age 45",
      lastDone: "Not yet done",
      dueNext: "When you turn 45",
    },
    {
      test: "Cholesterol Screening",
      recommended: "Every 4-6 years",
      lastDone: "March 15, 2025",
      dueNext: "March 2029",
    },
    {
      test: "Blood Pressure Screening",
      recommended: "At least once a year",
      lastDone: "May 10, 2025",
      dueNext: "May 2026",
    },
  ],
}

// Function to generate a response based on the user's query
function generateResponse(query: string, patientId: string): string {
  const lowerQuery = query.toLowerCase()

  // Check for greetings
  if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/.test(lowerQuery)) {
    return `${knowledgeBase.greetings[Math.floor(Math.random() * knowledgeBase.greetings.length)]} Your patient ID is ${patientId}.`
  }

  // Check for thanks/gratitude
  if (/thank|thanks|appreciate|grateful/.test(lowerQuery)) {
    return knowledgeBase.thanks[Math.floor(Math.random() * knowledgeBase.thanks.length)]
  }

  // Check for farewells
  if (/bye|goodbye|see you|farewell/.test(lowerQuery)) {
    return knowledgeBase.farewells[Math.floor(Math.random() * knowledgeBase.farewells.length)]
  }

  // Check for questions about the assistant
  if (/who are you|what are you|tell me about yourself|what can you do/.test(lowerQuery)) {
    return "I'm your MediKey AI health assistant. I can help you understand your health records, answer medical questions, provide information about your medications, appointments, and health metrics. I can also offer general health advice and reminders for preventive care."
  }

  // Check for blood pressure related queries
  if (/blood pressure|hypertension|systolic|diastolic/.test(lowerQuery)) {
    const { info, readings, recommendations } = knowledgeBase.bloodPressure
    const latestReading = readings[0]

    return `${info}\n\nYour latest blood pressure reading from ${latestReading.date} was ${latestReading.value}, which is classified as ${latestReading.status}.\n\nRecommendation: ${recommendations}`
  }

  // Check for blood sugar related queries
  if (/blood sugar|glucose|diabetes|a1c|glycemic/.test(lowerQuery)) {
    const { info, readings, recommendations } = knowledgeBase.bloodSugar
    const latestReading = readings[0]

    return `${info}\n\nYour latest blood sugar reading from ${latestReading.date} was ${latestReading.value}, which is classified as ${latestReading.status}.\n\nRecommendation: ${recommendations}`
  }

  // Check for cholesterol related queries
  if (/cholesterol|lipid|ldl|hdl|triglyceride/.test(lowerQuery)) {
    const { info, readings, recommendations } = knowledgeBase.cholesterol
    const latestReading = readings[0]

    return `${info}\n\nYour latest cholesterol panel from ${latestReading.date} showed ${latestReading.value}, which is classified as ${latestReading.status}.\n\nRecommendation: ${recommendations}`
  }

  // Check for medication related queries
  if (/medication|medicine|drug|prescription|pill/.test(lowerQuery)) {
    const medications = knowledgeBase.medications

    if (medications.length === 0) {
      return "You don't have any medications recorded in your profile."
    }

    let response = "Here are your current medications:\n\n"

    medications.forEach((med) => {
      response += `• ${med.name} (${med.dosage}): Take ${med.frequency} for ${med.purpose}. Possible side effects include ${med.sideEffects}. Next refill due: ${med.refill}.\n\n`
    })

    return response
  }

  // Check for appointment related queries
  if (/appointment|visit|doctor|schedule|checkup|exam/.test(lowerQuery)) {
    const appointments = knowledgeBase.appointments

    if (appointments.length === 0) {
      return "You don't have any upcoming appointments scheduled."
    }

    let response = "Here are your upcoming appointments:\n\n"

    appointments.forEach((appt) => {
      response += `• ${appt.type} with ${appt.doctor} at ${appt.location} on ${appt.date} at ${appt.time}.\n\n`
    })

    return response
  }

  // Check for allergy related queries
  if (/allerg|sensitive|reaction/.test(lowerQuery)) {
    const allergies = knowledgeBase.allergies

    if (allergies.length === 0) {
      return "You don't have any allergies recorded in your profile."
    }

    return `Your recorded allergies are: ${allergies.join(", ")}. Make sure to inform all healthcare providers about these allergies.`
  }

  // Check for medical condition related queries
  if (/condition|disease|disorder|diagnosis|health problem/.test(lowerQuery)) {
    const conditions = knowledgeBase.conditions

    if (conditions.length === 0) {
      return "You don't have any medical conditions recorded in your profile."
    }

    return `Your recorded medical conditions are: ${conditions.join(", ")}. These conditions are being managed with your current treatment plan.`
  }

  // Check for family history related queries
  if (/family|hereditary|genetic|inherited|parent|mother|father|sibling/.test(lowerQuery)) {
    const { father, mother, siblings } = knowledgeBase.familyHistory

    return `Your family medical history:\n\nFather: ${father}\nMother: ${mother}\nSiblings: ${siblings}\n\nBased on your family history, you may have an increased risk for hypertension and metabolic disorders. Regular screenings are recommended.`
  }

  // Check for vaccination related queries
  if (/vaccine|vaccination|immunization|shot|booster/.test(lowerQuery)) {
    const vaccinations = knowledgeBase.vaccinations

    if (vaccinations.length === 0) {
      return "You don't have any vaccinations recorded in your profile."
    }

    let response = "Here are your vaccination records:\n\n"

    vaccinations.forEach((vax) => {
      response += `• ${vax.name}: Last received on ${vax.date}. Next dose due: ${vax.dueNext}.\n\n`
    })

    return response
  }

  // Check for health metrics related queries
  if (/weight|bmi|heart rate|pulse|oxygen|temperature|metric|vital/.test(lowerQuery)) {
    const { weight, bmi, heartRate, bloodOxygen, temperature } = knowledgeBase.healthMetrics

    return `Your current health metrics:\n\n• Weight: ${weight.value} (${weight.trend})\n• BMI: ${bmi.value} (${bmi.classification})\n• Heart Rate: ${heartRate.value} (${heartRate.status})\n• Blood Oxygen: ${bloodOxygen.value} (${bloodOxygen.status})\n• Temperature: ${temperature.value} (${temperature.status})`
  }

  // Check for preventive care related queries
  if (/preventive|screening|checkup|test|exam/.test(lowerQuery)) {
    const preventiveCare = knowledgeBase.preventiveCare

    let response = "Here are your recommended preventive care screenings:\n\n"

    preventiveCare.forEach((test) => {
      response += `• ${test.test}: Recommended ${test.recommended}. Last done: ${test.lastDone}. Next due: ${test.dueNext}.\n\n`
    })

    return response
  }

  // Check for patient ID related queries
  if (/patient id|medical id|my id|identification number/.test(lowerQuery)) {
    return `Your patient ID is ${patientId}. This ID is unique to you and should be used when communicating with healthcare providers or accessing your medical records.`
  }

  // Default response for unrecognized queries
  return "I don't have specific information about that in your health records. Would you like me to provide general information on this topic, or is there something else I can help you with?"
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const [patientId, setPatientId] = useState<string>("")

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      // Generate or retrieve patient ID
      const userId = user?.name || "guest"
      const storedId = localStorage.getItem(`patient_id_${userId}`)
      const newId = storedId || generatePatientId(userId)

      if (!storedId) {
        localStorage.setItem(`patient_id_${userId}`, newId)
      }

      setPatientId(newId)

      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: "assistant",
        content: `Hello! I'm your MediKey health assistant. I can help you understand your health records, medications, appointments, and more. Your patient ID is ${newId}. How can I assist you today?`,
        timestamp: new Date(),
      }

      setMessages([welcomeMessage])
    }
  }, [messages.length, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Simulate AI thinking and typing
    const responseTime = Math.min(1000 + input.length * 10, 3000)

    setTimeout(() => {
      // Generate AI response
      const response = generateResponse(input, patientId)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsTyping(false)
    }, responseTime)
  }

  // Handle voice recording
  const handleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false)

      // Simulate voice recognition result
      setTimeout(() => {
        const recognizedText = "What are my upcoming appointments?"
        setInput(recognizedText)
      }, 1500)
    } else {
      // Start recording
      setIsRecording(true)
    }
  }

  // Handle clearing the chat
  const handleClearChat = () => {
    // Keep only the welcome message
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: "assistant",
      content: `Hello! I'm your MediKey health assistant. I can help you understand your health records, medications, appointments, and more. Your patient ID is ${patientId}. How can I assist you today?`,
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])
  }

  // Format message timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Health Assistant</h1>
          <p className="text-muted-foreground">Ask questions about your health records and get personalized guidance</p>
        </div>
        <Button variant="outline" onClick={handleClearChat} className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clear Chat
        </Button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardContent className="p-4 flex-1 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`p-2 rounded-full ${message.type === "user" ? "bg-blue-500" : "bg-accent"}`}>
                    {message.type === "user" ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5" />}
                  </div>
                  <div className={`p-3 rounded-lg ${message.type === "user" ? "bg-blue-500 text-white" : "bg-accent"}`}>
                    <div className="whitespace-pre-line">{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${message.type === "user" ? "text-blue-100" : "text-muted-foreground"}`}
                    >
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-2 max-w-[80%]">
                  <div className="p-2 rounded-full bg-accent">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div className="p-3 rounded-lg bg-accent">
                    <div className="flex space-x-1">
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleVoiceRecording}
              className={isRecording ? "bg-red-100 text-red-500 animate-pulse" : ""}
            >
              <Mic className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Ask a question about your health..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
            />
            <Button onClick={handleSendMessage}>
              <Send className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <p>
              Try asking: "What are my medications?", "When is my next appointment?", or "What was my last blood
              pressure reading?"
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
