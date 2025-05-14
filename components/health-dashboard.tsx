"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Activity, Droplet, Thermometer, Footprints, Clock } from "lucide-react"
import HealthMetricsChart from "./health-metrics-chart"
import HealthMetricsSummary from "./health-metrics-summary"

type HealthDashboardProps = {
  userId: string
}

export default function HealthDashboard({ userId }: HealthDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cardiac">Cardiac</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HealthMetricsSummary
              userId={userId}
              metricType="heart_rate"
              title="Heart Rate"
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              unit="bpm"
              normalRange={{ min: 60, max: 100 }}
              colorScheme="red"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_oxygen"
              title="Blood Oxygen"
              icon={<Activity className="h-5 w-5 text-blue-500" />}
              unit="%"
              normalRange={{ min: 95, max: 100 }}
              colorScheme="blue"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="steps"
              title="Steps"
              icon={<Footprints className="h-5 w-5 text-green-500" />}
              unit="steps"
              colorScheme="green"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="temperature"
              title="Temperature"
              icon={<Thermometer className="h-5 w-5 text-amber-500" />}
              unit="°F"
              normalRange={{ min: 97, max: 99 }}
              colorScheme="yellow"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="sleep"
              title="Sleep"
              icon={<Clock className="h-5 w-5 text-indigo-500" />}
              unit="hours"
              normalRange={{ min: 7, max: 9 }}
              colorScheme="purple"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_glucose"
              title="Blood Glucose"
              icon={<Droplet className="h-5 w-5 text-blue-500" />}
              unit="mg/dL"
              normalRange={{ min: 70, max: 100 }}
              colorScheme="blue"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthMetricsChart
              userId={userId}
              metricType="heart_rate"
              title="Heart Rate"
              unit="bpm"
              color="#ef4444"
              normalRange={{ min: 60, max: 100 }}
            />

            <HealthMetricsChart userId={userId} metricType="steps" title="Daily Steps" unit="steps" color="#22c55e" />
          </div>
        </TabsContent>

        <TabsContent value="cardiac" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HealthMetricsSummary
              userId={userId}
              metricType="heart_rate"
              title="Heart Rate"
              icon={<Heart className="h-5 w-5 text-rose-500" />}
              unit="bpm"
              normalRange={{ min: 60, max: 100 }}
              colorScheme="red"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_pressure_systolic"
              title="Systolic BP"
              icon={<Activity className="h-5 w-5 text-rose-500" />}
              unit="mmHg"
              normalRange={{ min: 90, max: 120 }}
              colorScheme="red"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_pressure_diastolic"
              title="Diastolic BP"
              icon={<Activity className="h-5 w-5 text-rose-500" />}
              unit="mmHg"
              normalRange={{ min: 60, max: 80 }}
              colorScheme="red"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <HealthMetricsChart
              userId={userId}
              metricType="heart_rate"
              title="Heart Rate"
              unit="bpm"
              color="#ef4444"
              normalRange={{ min: 60, max: 100 }}
            />

            <Card>
              <CardHeader>
                <CardTitle>Blood Pressure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Blood pressure chart will be displayed here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HealthMetricsSummary
              userId={userId}
              metricType="steps"
              title="Steps"
              icon={<Footprints className="h-5 w-5 text-green-500" />}
              unit="steps"
              colorScheme="green"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="active_minutes"
              title="Active Minutes"
              icon={<Activity className="h-5 w-5 text-green-500" />}
              unit="min"
              colorScheme="green"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="calories"
              title="Calories"
              icon={<Activity className="h-5 w-5 text-green-500" />}
              unit="kcal"
              colorScheme="green"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <HealthMetricsChart userId={userId} metricType="steps" title="Daily Steps" unit="steps" color="#22c55e" />

            <HealthMetricsChart
              userId={userId}
              metricType="active_minutes"
              title="Active Minutes"
              unit="min"
              color="#22c55e"
            />
          </div>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <HealthMetricsSummary
              userId={userId}
              metricType="temperature"
              title="Temperature"
              icon={<Thermometer className="h-5 w-5 text-amber-500" />}
              unit="°F"
              normalRange={{ min: 97, max: 99 }}
              colorScheme="yellow"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_oxygen"
              title="Blood Oxygen"
              icon={<Activity className="h-5 w-5 text-blue-500" />}
              unit="%"
              normalRange={{ min: 95, max: 100 }}
              colorScheme="blue"
            />

            <HealthMetricsSummary
              userId={userId}
              metricType="blood_glucose"
              title="Blood Glucose"
              icon={<Droplet className="h-5 w-5 text-blue-500" />}
              unit="mg/dL"
              normalRange={{ min: 70, max: 100 }}
              colorScheme="blue"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <HealthMetricsChart
              userId={userId}
              metricType="temperature"
              title="Body Temperature"
              unit="°F"
              color="#eab308"
              normalRange={{ min: 97, max: 99 }}
            />

            <HealthMetricsChart
              userId={userId}
              metricType="blood_oxygen"
              title="Blood Oxygen"
              unit="%"
              color="#3b82f6"
              normalRange={{ min: 95, max: 100 }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
