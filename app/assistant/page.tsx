"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Mic, StopCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

type Message = {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const [message, setMessage] = useState("")
  const [conversation, setConversation] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
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
  ]

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  useEffect(() => {
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
    setConversation([...conversation, { role: "user", content: message, timestamp: new Date() }])
    setIsTyping(true)

    // Simulate AI response with typing effect
    const responses = [
      "Based on your health records, your blood pressure has been stable over the last 3 months.",
      "I recommend discussing these symptoms with your doctor at your next appointment.",
      "The normal range for fasting blood sugar is between 70-100 mg/dL.",
      "Regular exercise can help improve your cardiovascular health.",
      "Your recent lab results show improvement in your cholesterol levels.",
      "High cholesterol refers to elevated levels of lipids in your blood. LDL (often called 'bad' cholesterol) above 130 mg/dL is considered elevated. High cholesterol can increase your risk of heart disease and stroke.",
      "Common side effects of Lisinopril include dry cough, dizziness, headache, and fatigue. Serious side effects are rare but can include swelling of the face/lips/tongue and difficulty breathing.",
      "BMI stands for Body Mass Index. It's a value derived from the weight and height of a person. The BMI is defined as the body mass divided by the square of the body height, and is expressed in units of kg/m², resulting from mass in kilograms and height in metres.",
    ]

    const randomResponse = responses[Math.floor(Math.random() * responses.length)]

    // Simulate typing with a delay proportional to message length
    const typingDelay = Math.min(1000, randomResponse.length * 10)

    setTimeout(() => {
      setConversation((prev) => [...prev, { role: "assistant", content: randomResponse, timestamp: new Date() }])
      setIsTyping(false)
    }, typingDelay)

    setMessage("")
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
      setMessage("What are the side effects of Lisinopril?")
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

  return (
    <div className="p-6 h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Health Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your health records or get information about medical terms
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-orange-500 text-white hover:bg-orange-600">
          Assistant
        </Button>
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
                <h3 className="text-xl font-medium mb-2">MediVault Assistant</h3>
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
              <CardTitle>About the Assistant</CardTitle>
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
