"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignOutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear user data from storage
    localStorage.removeItem("medikey_user")
    sessionStorage.removeItem("medikey_user")
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 to-black">
      <div className="max-w-md w-full mx-auto p-8 text-center">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded bg-orange-500 text-white font-bold">
              M
            </div>
            <span className="text-2xl font-semibold text-white">MediKey</span>
          </div>
        </div>

        <div className="bg-blue-950/50 border border-blue-900 rounded-lg p-8 mb-8">
          <h1 className="text-2xl font-bold text-white mb-4">Logged out</h1>
          <p className="text-gray-300 mb-6">You've been successfully logged out.</p>

          <div className="flex flex-col gap-4">
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/auth/signin">Sign back in</Link>
            </Button>
            <Button asChild variant="outline" className="border-blue-800 text-blue-400 hover:text-blue-300">
              <Link href="/">Return to home</Link>
            </Button>
          </div>
        </div>

        <p className="text-gray-500 text-sm">Thank you for using MediKey. Your health data is always secure with us.</p>
      </div>
    </div>
  )
}
