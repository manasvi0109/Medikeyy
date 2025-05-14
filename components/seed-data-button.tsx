"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { seedSampleData } from "@/app/actions/seed-data"
import { useToast } from "@/hooks/use-toast"
import { Database } from "lucide-react"

type SeedDataButtonProps = {
  userId: string
}

export default function SeedDataButton({ userId }: SeedDataButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSeedData = async () => {
    setIsLoading(true)
    try {
      const result = await seedSampleData(userId)
      if (result.success) {
        toast({
          title: "Success",
          description: "Sample data has been seeded successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to seed sample data.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error seeding data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeedData} disabled={isLoading} className="gap-2">
      <Database className="h-4 w-4" />
      {isLoading ? "Seeding Data..." : "Seed Sample Data"}
    </Button>
  )
}
