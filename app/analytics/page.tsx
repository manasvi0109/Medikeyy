"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Droplet, Scale, Thermometer } from "lucide-react"
import HealthDashboard from "@/components/health-dashboard"
import { useAuth } from "@/components/auth-provider"

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("3 Months")
  const { user } = useAuth()
  const userId = user?.name || "guest"

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Health Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Time Period:</span>
            <select
              className="bg-background border rounded px-2 py-1 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          <Button variant="outline" size="sm" className="rounded-full bg-yellow-500 text-white hover:bg-yellow-600">
            Analytics
          </Button>
        </div>
      </div>

      <HealthDashboard userId={userId} />

      <div className="bg-accent/20 p-6 rounded-lg mt-8">
        <h2 className="text-xl font-semibold mb-2">Health Insights & Recommendations</h2>
        <p className="text-sm text-muted-foreground mb-6">AI-generated insights based on your health metrics</p>

        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Heart className="h-5 w-5 mr-2" /> Blood Pressure Insight
            </h3>
            <p>
              Your blood pressure readings are showing improvement over the past 3 months, with a 4% reduction in
              systolic pressure. Continue with your current medication regimen and consider maintaining or slightly
              increasing your physical activity.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Droplet className="h-5 w-5 mr-2" /> Blood Sugar Insight
            </h3>
            <p>
              Recent fasting blood sugar values are consistently within the normal range (70-100 mg/dL), indicating good
              glycemic control. Continue with your current diet and monitoring schedule.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Scale className="h-5 w-5 mr-2" /> Weight Management
            </h3>
            <p>
              Your BMI has decreased from 28.5 to 27.2, showing positive progress. Consider scheduling your next
              cholesterol screening as your last one was over 6 months ago.
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h3 className="font-medium text-yellow-500 mb-2 flex items-center">
              <Thermometer className="h-5 w-5 mr-2" /> Recommended Actions
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Schedule a follow-up appointment with your primary care physician</li>
              <li>Continue monitoring blood pressure 2-3 times per week</li>
              <li>Maintain current exercise routine of 30 minutes, 5 days per week</li>
              <li>Consider reducing sodium intake to help further lower blood pressure</li>
              <li>Schedule your annual cholesterol screening</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
