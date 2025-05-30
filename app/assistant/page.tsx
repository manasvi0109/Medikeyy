"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Send, User, Bot, Trash2, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { generateAIResponse, getConversationHistory } from "@/app/actions/ai-assistant"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load conversation history on mount
  useEffect(() => {
    async function loadHistory() {
      if (!user?.patientId) return

      try {
        const result = await getConversationHistory(user.patientId)
        if (result.success && result.messages.length > 0) {
          const formattedMessages = result.messages.map((msg: any, index: number) => ({
            id: index.toString(),
            type: msg.message_type,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }))
          setMessages(formattedMessages)
        } else {
          // Add welcome message if no history
          const welcomeMessage: Message = {
            id: "0",
            type: "assistant",
            content: `Hello! I'm your MediKey AI assistant powered by Grok. I have access to your health records and can help answer questions about your medical history, medications, appointments, and provide health guidance. Your patient ID is ${user.patientId}. How can I help you today?`,
            timestamp: new Date(),
          }
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error("Error loading conversation history:", error)
        // Add welcome message on error
        const welcomeMessage: Message = {
          id: "0",
          type: "assistant",
          content: `Hello! I'm your MediKey AI assistant. I can help answer questions about your health. How can I assist you today?`,
          timestamp: new Date(),
        }
        setMessages([welcomeMessage])
      }
    }

    loadHistory()
  }, [user])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!input.trim() || !user?.patientId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await generateAIResponse(user.patientId, input)

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: result.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error("Failed to generate response")
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])

      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle voice recording (simulated)
  const handleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false)
      // Simulate voice recognition result
      setTimeout(() => {
        const recognizedText = "What are my recent health metrics?"
        setInput(recognizedText)
      }, 1000)
    } else {
      setIsRecording(true)
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone.",
      })

      // Auto-stop recording after 5 seconds
      setTimeout(() => {
        setIsRecording(false)
      }, 5000)
    }
  }

  // Handle clearing the chat
  const handleClearChat = () => {
    const welcomeMessage: Message = {
      id: "0",
      type: "assistant",
      content: `Hello! I'm your MediKey AI assistant powered by Grok. I have access to your health records and can help answer questions about your medical history, medications, appointments, and provide health guidance. Your patient ID is ${user?.patientId}. How can I help you today?`,
      timestamp: new Date(),
    }
    setMessages([welcomeMessage])

    toast({
      title: "Chat cleared",
      description: "Your conversation has been cleared.",
    })
  }

  // Format message timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="assistant-theme min-h-screen">
      <div className="p-6 flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">AI Health Assistant</h1>
            <p className="text-muted-foreground">Powered by Grok AI - Ask questions about your health records</p>
          </div>
          <Button variant="outline" onClick={handleClearChat} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear Chat
          </Button>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col bg-white/50 dark:bg-black/50">
          <CardContent className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`flex items-start gap-2 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`p-2 rounded-full ${message.type === "user" ? "bg-orange-500" : "bg-orange-100 dark:bg-orange-900"}`}
                    >
                      {message.type === "user" ? (
                        <User className="h-5 w-5 text-white" />
                      ) : (
                        <Bot className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-orange-500 text-white"
                          : "bg-orange-50 dark:bg-orange-950/50 text-foreground"
                      }`}
                    >
                      <div className="whitespace-pre-line">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          message.type === "user" ? "text-orange-100" : "text-muted-foreground"
                        }`}
                      >
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="p-2 rounded-full bg-orange-100 dark:bg-orange-900">
                      <Bot className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/50">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Grok is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          <div className="p-4 border-t bg-white/70 dark:bg-black/70">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleVoiceRecording}
                className={isRecording ? "bg-red-100 text-red-500 animate-pulse" : ""}
                disabled={isLoading}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <Input
                placeholder="Ask about your health records, medications, or get health advice..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                disabled={isLoading}
                className="bg-white/70 dark:bg-black/70"
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>

            <div className="mt-2 text-xs text-muted-foreground">
              <p>
                Try asking: "What are my medications?", "Show my recent blood pressure readings", or "When is my next
                appointment?"
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
