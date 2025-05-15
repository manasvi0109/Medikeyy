"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, StopCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Health knowledge base for the assistant
const healthKnowledgeBase = {
  "blood test":
    "Your latest blood test from May 10, 2025 shows normal levels for most markers. Your cholesterol is slightly elevated at 210 mg/dL (normal range: <200 mg/dL). Your doctor recommended dietary changes and a follow-up in 3 months.",

  cholesterol:
    "Cholesterol is a waxy substance found in your blood. While your body needs cholesterol to build healthy cells, high levels can increase your risk of heart disease. Your latest reading shows total cholesterol at 210 mg/dL (slightly elevated), with LDL at 130 mg/dL and HDL at 55 mg/dL.",

  lisinopril:
    "Lisinopril is an ACE inhibitor used to treat high blood pressure and heart failure. Common side effects include dry cough (occurs in about 10% of patients), dizziness, headache, and fatigue. Serious side effects are rare but can include swelling of the face/lips/tongue, difficulty breathing, and kidney problems. Always take as prescribed.",

  mammogram:
    "For women at average risk of breast cancer, mammograms are recommended every 1-2 years beginning at age 40 or 50, depending on the guideline. Based on your family history (mother diagnosed at age 52), your doctor recommended annual mammograms starting at age 40. Your last mammogram was on January 15, 2025, and was normal.",

  bmi: "BMI (Body Mass Index) is a value derived from a person's weight and height. It provides a rough estimate of body fat and is used to categorize individuals as underweight (<18.5), normal weight (18.5-24.9), overweight (25-29.9), or obese (≥30). Your current BMI is 26.3, which falls in the overweight category.",

  asthma:
    "To better manage your asthma, ensure you: 1) Take your controller medication daily as prescribed, 2) Keep your rescue inhaler with you at all times, 3) Identify and avoid triggers like pollen and pet dander, 4) Follow your asthma action plan, and 5) Get annual flu shots. Your last pulmonary function test showed mild obstruction with good response to bronchodilators.",

  "blood pressure":
    "Your blood pressure has been stable over the last 3 months, averaging 128/82 mmHg, which is considered elevated but not hypertensive. Continue with your current medication (Lisinopril 10mg daily) and lifestyle modifications including reduced sodium intake and regular exercise.",

  diabetes:
    "Your latest HbA1c test result from April 2025 was 5.6%, which is in the prediabetes range (5.7-6.4% is prediabetic, ≥6.5% is diabetic). Your doctor recommended increasing physical activity and reducing simple carbohydrate intake to prevent progression to type 2 diabetes.",

  "vitamin d":
    "Your Vitamin D level is 28 ng/mL, which is slightly below the recommended range of 30-50 ng/mL. Your doctor prescribed a supplement of 2000 IU daily. Vitamin D is important for bone health and immune function.",

  "heart rate":
    "Your resting heart rate has averaged 72 BPM over the past month, which is within the normal range (60-100 BPM). During exercise, your heart rate appropriately increases to 130-150 BPM, indicating good cardiovascular response.",

  spo2: "Your blood oxygen saturation (SpO2) has consistently been between 96-99%, which is in the normal range (95-100%). This indicates good lung function and adequate oxygen delivery to your tissues.",

  sleep:
    "Your sleep data shows an average of 6.8 hours per night over the past month, with sleep efficiency of 85%. Recommendations for improving sleep include maintaining a consistent sleep schedule, limiting screen time before bed, and ensuring your bedroom is dark and cool.",

  allergies:
    "Your medical record indicates allergies to penicillin (severe - anaphylaxis) and pollen (moderate - seasonal rhinitis). You're currently prescribed Flonase nasal spray for seasonal allergies and carry an EpiPen for emergency use in case of accidental penicillin exposure.",

  medications:
    "Your current medications include: 1) Lisinopril 10mg daily for blood pressure, 2) Flonase nasal spray for allergies, 3) Vitamin D 2000 IU daily, and 4) Albuterol inhaler as needed for asthma symptoms. Your last medication review was on March 15, 2025.",

  appointment:
    "Your next scheduled appointments are: 1) Dr. Smith (Primary Care) on June 10, 2025 at 2:30 PM for a follow-up on blood pressure, and 2) Dr. Johnson (Allergist) on July 15, 2025 at 10:00 AM for seasonal allergy management.",

  exercise:
    "Based on your health profile, recommended exercise includes 150 minutes of moderate aerobic activity weekly (like brisk walking) and strength training twice weekly. Your smartwatch data shows you've averaged 110 minutes of activity per week over the past month.",

  diet: "Your nutritionist recommended a Mediterranean-style diet with emphasis on fruits, vegetables, whole grains, lean proteins, and healthy fats. Specific recommendations include limiting sodium to <2300mg daily and added sugars to <25g daily to help manage your blood pressure and prediabetes risk.",

  headache:
    "Your health records show occasional tension headaches, typically associated with stress or poor sleep. If you're experiencing a new or severe headache pattern, especially with symptoms like visual changes, weakness, or confusion, please contact your healthcare provider immediately.",

  covid:
    "Your COVID-19 vaccination record shows you received the initial series plus two booster shots, with the most recent on November 10, 2024. Based on current guidelines, you're eligible for another booster in November 2025.",

  "family history":
    "Your family health history includes: Mother - breast cancer at age 52 (survivor), hypertension; Father - type 2 diabetes, heart attack at age 65; Sister - asthma; Maternal grandmother - stroke at age 78. This history places you at increased risk for cardiovascular disease, diabetes, and breast cancer.",
}

// Function to find the best match for a query in the knowledge base
function findBestMatch(query: string): string {
  query = query.toLowerCase()
  let bestMatch = ""
  let highestScore = 0

  for (const [key, value] of Object.entries(healthKnowledgeBase)) {
    if (query.includes(key)) {
      const score = key.length // Longer matches are prioritized
      if (score > highestScore) {
        highestScore = score
        bestMatch = value
      }
    }
  }

  // If no direct match, look for partial matches
  if (!bestMatch) {
    for (const [key, value] of Object.entries(healthKnowledgeBase)) {
      const keyWords = key.split(" ")
      for (const word of keyWords) {
        if (word.length > 3 && query.includes(word)) {
          // Only consider meaningful words
          const score = word.length / 2 // Partial matches get lower scores
          if (score > highestScore) {
            highestScore = score
            bestMatch = value
          }
        }
      }
    }
  }

  // If still no match, provide a general response
  if (!bestMatch) {
    return "I don't have specific information about that in your health records. Would you like me to provide general health information on this topic or connect you with a healthcare provider?"
  }

  return bestMatch
}

// Function to generate a response based on the user's query
function generateResponse(query: string): string {
  const lowerQuery = query.toLowerCase()

  // Check for greetings
  if (lowerQuery.match(/^(hi|hello|hey|greetings)/)) {
    return "Hello! I'm your MediKey AI Health Assistant. How can I help you with your health information today?"
  }

  // Check for gratitude
  if (lowerQuery.match(/(thank you|thanks|thx)/)) {
    return "You're welcome! Is there anything else I can help you with regarding your health?"
  }

  // Check for questions about the assistant itself
  if (lowerQuery.includes("who are you") || lowerQuery.includes("what can you do")) {
    return "I'm your MediKey AI Health Assistant. I can access your health records to answer questions about your medical history, explain medical terms, interpret lab results, provide medication information, and offer general health guidance. All your data is kept private and secure."
  }

  // Find the best match in the knowledge base
  return findBestMatch(query)
}

export default function AssistantPage() {
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null)

  const suggestedQuestions = [
    "What does my last blood test show?",
    "Explain what high cholesterol means",
    "What are the side effects of Lisinopril?",
    "How often should I get a mammogram?",
    "What does BMI stand for?",
    "How can I manage my asthma better?",
    "What's my current blood pressure?",
    "Am I at risk for diabetes?",
    "What's my vitamin D level?",
    "When is my next appointment?",
    "What medications am I taking?",
    "What are my allergies?",
  ]

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  useEffect(() => {
    // Add welcome message when component mounts
    if (conversation.length === 0) {
      setTimeout(() => {
        setConversation([
          {
            role: "assistant",
            content:
              "Hello! I'm your MediKey AI Health Assistant. I can answer questions about your health records, explain medical terms, and provide health information. How can I help you today?",
            timestamp: new Date(),
          },
        ])
      }, 500)
    }

    // Cleanup recording timer on unmount
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message to conversation
    const userMessage = { role: "user" as const, content: message, timestamp: new Date() }
    setConversation((prev) => [...prev, userMessage])
    setIsTyping(true)
    setMessage("")

    // Generate AI response with typing effect
    const aiResponse = generateResponse(message)

    // Calculate typing delay based on response length (faster for short responses)
    const typingDelay = Math.min(2000, Math.max(800, aiResponse.length * 10))

    setTimeout(() => {
      setConversation((prev) => [...prev, { role: "assistant" as const, content: aiResponse, timestamp: new Date() }])
      setIsTyping(false)
    }, typingDelay)
  }

  const handleSuggestedQuestion = (question: string) => {
    setMessage(question)
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    // Check if browser supports speech recognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      })
      return
    }

    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    // Simulate recording for demo purposes
    toast({
      title: "Recording Started",
      description: "Speak clearly into your microphone.",
    })

    // In a real app, you would use the Web Speech API here
    // For demo, we'll simulate a recording after 3 seconds
    setTimeout(() => {
      stopRecording()
      const randomQuestions = [
        "What are the side effects of Lisinopril?",
        "What does my blood test show?",
        "When is my next appointment?",
        "What's my current blood pressure?",
        "How can I manage my asthma better?",
      ]
      const randomQuestion = randomQuestions[Math.floor(Math.random() * randomQuestions.length)]
      setMessage(randomQuestion)
      setTimeout(() => {
        handleSendMessage()
      }, 500)
    }, 3000)
  }

  const stopRecording = () => {
    setIsRecording(false)
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const clearConversation = () => {
    setConversation([
      {
        role: "assistant",
        content:
          "Hello! I'm your MediKey AI Health Assistant. I can answer questions about your health records, explain medical terms, and provide health information. How can I help you today?",
        timestamp: new Date(),
      },
    ])
    toast({
      title: "Conversation cleared",
      description: "Your conversation history has been cleared.",
    })
  }

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Health Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your health records or get information about medical terms
          </p>
        </div>
        <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="voice">Voice</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 flex flex-col">
          <div className="flex-1 overflow-auto bg-accent/20 rounded-lg p-6 mb-6">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-8 h-8 text-orange-600 dark:text-orange-300"
                  >
                    <path d="M12 8V4H8"></path>
                    <rect width="16" height="12" x="4" y="8" rx="2"></rect>
                    <path d="M2 14h2"></path>
                    <path d="M20 14h2"></path>
                    <path d="M15 13v2"></path>
                    <path d="M9 13v2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">MediKey Assistant</h3>
                <p className="text-muted-foreground max-w-md">Your personal AI-powered medical assistant</p>
                <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
                  {suggestedQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="text-left justify-start h-auto py-2"
                      onClick={() => handleSuggestedQuestion(question)}
                    >
                      <span className="mr-2">🔍</span> {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role === "assistant" && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 mr-2">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user" ? "bg-orange-600 text-white" : "bg-accent text-foreground"
                      }`}
                    >
                      <div className="mb-1">{msg.content}</div>
                      <div className="text-xs opacity-70 text-right">{formatTime(msg.timestamp)}</div>
                    </div>
                    {msg.role === "user" && (
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-600 text-white ml-2">
                        M
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 mr-2">
                      AI
                    </div>
                    <div className="bg-accent text-foreground rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask a question about your health..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSendMessage()
                }
              }}
              className="flex-1"
              disabled={isRecording}
            />
            <Button
              variant="outline"
              size="icon"
              className={`rounded-full ${isRecording ? "bg-red-500 text-white animate-pulse" : ""}`}
              onClick={toggleRecording}
            >
              {isRecording ? <StopCircle className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600" disabled={isRecording}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>

          {isRecording && (
            <div className="mt-2 text-sm text-orange-500 animate-pulse flex items-center">
              <Mic className="h-3 w-3 mr-1" /> Recording... {formatRecordingTime(recordingTime)}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>About the Assistant</span>
                <Button variant="outline" size="sm" onClick={clearConversation}>
                  Clear Chat
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">
                Your AI Health Assistant can access your medical records to provide personalized answers.
              </p>
              <p className="text-sm">
                It can explain medical terms, help you understand lab results, and provide general health information.
              </p>
              <p className="text-sm text-muted-foreground">
                All conversations are private and securely stored in your account.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-2 px-3 hover:bg-orange-500/10"
                  onClick={() => handleSuggestedQuestion(question)}
                >
                  <span className="mr-2 text-orange-500">🔍</span> {question}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voice Commands</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">Try these voice commands:</p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>"What are my latest test results?"</li>
                <li>"Explain what hypertension means"</li>
                <li>"When is my next appointment?"</li>
                <li>"What medications am I taking?"</li>
              </ul>
              <Button variant="outline" className="w-full mt-2 gap-2 hover:bg-orange-500/10" onClick={toggleRecording}>
                {isRecording ? (
                  <StopCircle className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4 text-orange-500" />
                )}
                {isRecording ? "Stop Recording" : "Start Voice Command"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
