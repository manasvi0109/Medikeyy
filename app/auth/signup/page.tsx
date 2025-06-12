"use client"

import type React from "react"

import { useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  createUser,
  checkUsernameAvailability,
  checkEmailAvailability,
  createDemoUser,
  clearDatabase,
  getAllUsers,
} from "@/app/actions/auth"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Check, X, User, Trash2, Database } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingDemo, setIsCreatingDemo] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle")

  // Debounced username checking
  const debouncedCheckUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length >= 3) {
        setUsernameStatus("checking")
        try {
          const result = await checkUsernameAvailability(username)
          setUsernameStatus(result.available ? "available" : "taken")
        } catch (error) {
          console.error("Error checking username:", error)
          setUsernameStatus("idle")
        }
      }
    }, 500),
    [],
  )

  // Debounced email checking
  const debouncedCheckEmail = useCallback(
    debounce(async (email: string) => {
      if (email.includes("@")) {
        setEmailStatus("checking")
        try {
          const result = await checkEmailAvailability(email)
          setEmailStatus(result.available ? "available" : "taken")
        } catch (error) {
          console.error("Error checking email:", error)
          setEmailStatus("idle")
        }
      }
    }, 500),
    [],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    // Clear error when user starts typing
    if (error) setError("")

    // Check username availability
    if (name === "username") {
      if (value.length >= 3) {
        debouncedCheckUsername(value)
      } else {
        setUsernameStatus("idle")
      }
    }

    // Check email availability
    if (name === "email") {
      if (value.includes("@")) {
        debouncedCheckEmail(value)
      } else {
        setEmailStatus("idle")
      }
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({ ...formData, agreeTerms: checked })
  }

  const handleClearDatabase = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will permanently delete ALL users and data from the database. This cannot be undone. Are you absolutely sure?",
      )
    ) {
      return
    }

    setIsClearing(true)
    try {
      const result = await clearDatabase()
      toast({
        title: "Database cleared successfully",
        description: `Deleted ${result.deletedUsers} users and all associated data`,
      })

      // Reset form validation states
      setUsernameStatus("idle")
      setEmailStatus("idle")
      setError("")
    } catch (error) {
      console.error("Error clearing database:", error)
      toast({
        title: "Error",
        description: "Failed to clear database. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsClearing(false)
    }
  }

  const handleCheckUsers = async () => {
    setIsChecking(true)
    try {
      const result = await getAllUsers()
      if (result.success) {
        console.log("Current users in database:", result.users)
        toast({
          title: "Database status",
          description: `Found ${result.users.length} users in database. Check console for details.`,
        })
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check database status",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
    }
  }

  const handleCreateDemo = async () => {
    setIsCreatingDemo(true)
    try {
      const result = await createDemoUser()
      if (result.success) {
        // Store demo user info in localStorage
        localStorage.setItem(
          "medikey_user",
          JSON.stringify({
            id: result.user.id,
            name: result.user.username,
            fullName: result.user.full_name,
            email: result.user.email,
            patientId: result.user.patient_id,
            initial: result.user.username.charAt(0).toUpperCase(),
          }),
        )

        toast({
          title: "Demo account created!",
          description: `Demo user created with patient ID: ${result.user.patient_id}`,
        })

        // Redirect to dashboard
        router.push("/")
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create demo account",
        variant: "destructive",
      })
    } finally {
      setIsCreatingDemo(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.username || !formData.email || !formData.password || !formData.fullName) {
      setError("All fields are required")
      setIsLoading(false)
      return
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long")
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (!formData.agreeTerms) {
      setError("You must agree to the terms and conditions")
      setIsLoading(false)
      return
    }

    if (usernameStatus === "taken") {
      setError("Username is already taken. Please choose a different one.")
      setIsLoading(false)
      return
    }

    if (emailStatus === "taken") {
      setError("Email is already registered. Please use a different email.")
      setIsLoading(false)
      return
    }

    try {
      const result = await createUser({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      if (result.success) {
        // Store user info in localStorage for session
        localStorage.setItem(
          "medikey_user",
          JSON.stringify({
            id: result.user.id,
            name: result.user.username,
            fullName: result.user.full_name,
            email: result.user.email,
            patientId: result.user.patient_id,
            initial: result.user.username.charAt(0).toUpperCase(),
          }),
        )

        toast({
          title: "Account created successfully!",
          description: `Welcome to MediKey! Your patient ID is ${result.user.patient_id}`,
        })

        // Redirect to dashboard
        router.push("/")
      } else {
        setError(result.error || "Failed to create account")
      }
    } catch (err) {
      console.error("Signup error:", err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getUsernameIcon = () => {
    switch (usernameStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      case "available":
        return <Check className="h-4 w-4 text-green-500" />
      case "taken":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getEmailIcon = () => {
    switch (emailStatus) {
      case "checking":
        return <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
      case "available":
        return <Check className="h-4 w-4 text-green-500" />
      case "taken":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-black">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-orange-500 text-white font-bold">
              M
            </div>
            <span className="text-2xl font-semibold text-white">MediKey</span>
          </div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400">Start managing your medical records securely</p>
        </div>

        {/* Database management buttons */}
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          <Button
            onClick={handleCreateDemo}
            variant="outline"
            size="sm"
            disabled={isCreatingDemo}
            className="text-xs bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20"
          >
            {isCreatingDemo ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <User className="mr-1 h-3 w-3" />
                Demo Account
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckUsers}
            variant="outline"
            size="sm"
            disabled={isChecking}
            className="text-xs bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Database className="mr-1 h-3 w-3" />
                Check DB
              </>
            )}
          </Button>

          <Button
            onClick={handleClearDatabase}
            variant="outline"
            size="sm"
            disabled={isClearing}
            className="text-xs bg-red-500/10 border-red-500/50 text-red-400 hover:bg-red-500/20"
          >
            {isClearing ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="mr-1 h-3 w-3" />
                Clear DB
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
            {error}
            {error.includes("duplicate key") && (
              <div className="mt-2 text-xs">
                Try clicking "Clear DB" button above to reset the database, then try again.
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-white">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="bg-blue-950/50 border-blue-800 text-white placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getUsernameIcon()}</div>
              </div>
              {usernameStatus === "taken" && <p className="text-red-400 text-sm mt-1">Username is already taken</p>}
              {usernameStatus === "available" && <p className="text-green-400 text-sm mt-1">Username is available</p>}
            </div>
            <div>
              <Label htmlFor="fullName" className="text-white">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-blue-950/50 border-blue-800 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-blue-950/50 border-blue-800 text-white placeholder:text-gray-400 pr-10"
                  disabled={isLoading}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">{getEmailIcon()}</div>
              </div>
              {emailStatus === "taken" && <p className="text-red-400 text-sm mt-1">Email is already registered</p>}
              {emailStatus === "available" && <p className="text-green-400 text-sm mt-1">Email is available</p>}
            </div>
            <div>
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                className="bg-blue-950/50 border-blue-800 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="bg-blue-950/50 border-blue-800 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={handleCheckboxChange}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm text-gray-300">
                I agree to the{" "}
                <Link href="#" className="text-blue-400 hover:text-blue-300">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-blue-400 hover:text-blue-300">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-blue-400 hover:text-blue-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout
  return ((...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }) as T
}
