"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

type User = {
  name: string
  [key: string]: any
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (username: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => false,
  signOut: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("medikey_user") || sessionStorage.getItem("medikey_user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    setIsLoading(false)

    // Redirect to login if accessing protected route without auth
    const isAuthRoute = pathname?.startsWith("/auth/")
    if (!storedUser && !isAuthRoute && pathname !== "/") {
      router.push("/auth/signin")
    }
  }, [pathname, router])

  const signIn = async (username: string, password: string): Promise<boolean> => {
    // This is a mock authentication
    if (username && password) {
      // Get stored users or create default
      const storedUsers = JSON.parse(localStorage.getItem("medikey_users") || "[]")

      // Find user
      const foundUser = storedUsers.find((u: any) => u.username === username && u.password === password)

      if (foundUser) {
        // Create user session
        const userData = {
          name: username,
          fullName: foundUser.fullName || username,
          email: foundUser.email || "",
          initial: username.charAt(0).toUpperCase(),
          lastLogin: new Date().toISOString(),
        }

        localStorage.setItem("medikey_user", JSON.stringify(userData))
        setUser(userData)
        return true
      }
    }
    return false
  }

  const signOut = () => {
    localStorage.removeItem("medikey_user")
    sessionStorage.removeItem("medikey_user")
    setUser(null)
    router.push("/auth/signin")
  }

  return <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
