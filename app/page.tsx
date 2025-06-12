import Link from "next/link"
import { Calendar, FileText, Heart, Shield, Users, Briefcase, Watch, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import HealthMetricsSummary from "@/components/health-metrics-summary"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export default function Dashboard() {
  // Check if user is logged in via server-side cookie
  const cookieStore = cookies()
  const userCookie = cookieStore.get("medikey_user")

  // If no user cookie, show a welcome page instead of redirecting
  if (!userCookie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-2xl mb-6">
          M
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to MediKey</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          Your personal health management platform. Securely store and access your medical records anytime, anywhere.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/signin">
            <Button size="lg" className="px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="px-8">
              Create Account
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="bg-accent/20 p-6 rounded-lg text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Secure Storage</h3>
            <p className="text-muted-foreground">Your medical data is encrypted and securely stored</p>
          </div>

          <div className="bg-accent/20 p-6 rounded-lg text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-green-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Health Tracking</h3>
            <p className="text-muted-foreground">Monitor your health metrics and see trends over time</p>
          </div>

          <div className="bg-accent/20 p-6 rounded-lg text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Watch className="h-6 w-6 text-purple-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">Device Integration</h3>
            <p className="text-muted-foreground">Connect your smartwatch and other health devices</p>
          </div>
        </div>
      </div>
    )
  }

  // Parse user data
  let userData
  try {
    userData = JSON.parse(userCookie.value)
  } catch (error) {
    // If invalid JSON, redirect to login
    redirect("/auth/signin")
  }

  const userId = userData?.id || ""
  const userName = userData?.name || "User"

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
        <div>
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}. Here's your health overview.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-blue-500 text-white hover:bg-blue-600">
          Dashboard
        </Button>
      </div>

      {/* SmartWatch Integration Section */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Watch className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">SmartWatch Connected</h2>
              <p className="text-sm text-muted-foreground">Apple Watch Series 9 • Last sync: 2 min ago</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              <Activity className="h-3 w-3 mr-1" />
              Live
            </Badge>
            <Link href="/smartwatch">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Real-time Health Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            title="Steps Today"
            icon={<Activity className="h-5 w-5 text-green-500" />}
            unit="steps"
            colorScheme="green"
          />

          <HealthMetricsSummary
            userId={userId}
            metricType="sleep"
            title="Sleep"
            icon={<Activity className="h-5 w-5 text-purple-500" />}
            unit="hours"
            normalRange={{ min: 7, max: 9 }}
            colorScheme="purple"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/smartwatch">
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Watch className="h-4 w-4" />
              Sync Now
            </Button>
          </Link>
          <Link href="/analytics">
            <Button variant="outline" className="gap-2">
              <Activity className="h-4 w-4" />
              View Trends
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
        <Link
          href="/emergency"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-950 rounded-full mb-2">
            <Shield className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">Emergency Access</h3>
          <p className="text-xs text-center text-muted-foreground">Critical health info</p>
        </Link>

        <Link
          href="/records"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-teal-100 dark:bg-teal-950 rounded-full mb-2">
            <FileText className="h-5 w-5 md:h-6 md:w-6 text-teal-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">Medical Records</h3>
          <p className="text-xs text-center text-muted-foreground">View & manage records</p>
        </Link>

        <Link
          href="/appointments"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-pink-100 dark:bg-pink-950 rounded-full mb-2">
            <Calendar className="h-5 w-5 md:h-6 md:w-6 text-pink-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">Appointments</h3>
          <p className="text-xs text-center text-muted-foreground">Schedule & track visits</p>
        </Link>

        <Link
          href="/analytics"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-yellow-100 dark:bg-yellow-950 rounded-full mb-2">
            <Heart className="h-5 w-5 md:h-6 md:w-6 text-yellow-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">Health Analytics</h3>
          <p className="text-xs text-center text-muted-foreground">Track your metrics</p>
        </Link>

        <Link
          href="/family"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-green-100 dark:bg-green-950 rounded-full mb-2">
            <Users className="h-5 w-5 md:h-6 md:w-6 text-green-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">Family Vault</h3>
          <p className="text-xs text-center text-muted-foreground">Manage dependents</p>
        </Link>

        <Link
          href="/assistant"
          className="flex flex-col items-center p-3 md:p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-2 md:p-3 bg-orange-100 dark:bg-orange-950 rounded-full mb-2">
            <Briefcase className="h-5 w-5 md:h-6 md:w-6 text-orange-500" />
          </div>
          <h3 className="font-medium text-center text-sm md:text-base">AI Assistant</h3>
          <p className="text-xs text-center text-muted-foreground">Get health answers</p>
        </Link>
      </div>

      <div className="bg-accent/20 rounded-lg p-4 md:p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 md:gap-0">
          <h2 className="text-xl font-semibold">Emergency Information</h2>
          <Button variant="outline" size="sm">
            Always Accessible
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">BLOOD TYPE</h3>
            <p className="font-medium">O+</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">ALLERGIES</h3>
            <p className="font-medium">Penicillin</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">CHRONIC CONDITIONS</h3>
            <p className="font-medium">Hypertension</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">EMERGENCY CONTACT</h3>
            <p className="font-medium">Jane Doe (+1 555-987-6543)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Link href="/profile">
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              Update Emergency Info
            </Button>
          </Link>
          <Link href="/emergency">
            <Button variant="secondary" className="gap-2">
              <Shield className="h-4 w-4" />
              Show Emergency QR Code
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-accent/20 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-2">Medical Summary</h2>
          <p className="text-sm text-muted-foreground mb-6">AI-generated summary based on your records</p>

          <div className="space-y-4">
            <p>
              <strong>Recent Activity:</strong> Your last checkup was on May 2, 2025. Blood pressure readings show
              improvement (128/82 mmHg).
            </p>
            <p>
              <strong>Medications:</strong> Currently taking Lisinopril (10mg daily) for hypertension management.
            </p>
            <p>
              <strong>Upcoming:</strong> Annual physical scheduled for June 15, 2025. Cholesterol screening recommended.
            </p>
          </div>

          <Link href="/records">
            <Button variant="link" className="mt-4 p-0 text-blue-500">
              View detailed health timeline
            </Button>
          </Link>
        </div>

        <div className="bg-accent/20 rounded-lg p-4 md:p-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
          <p className="text-sm text-muted-foreground mb-6">Your next 3 scheduled visits</p>

          <div className="space-y-4">
            <div className="bg-accent/30 p-3 rounded-lg">
              <div className="flex justify-between">
                <h3 className="font-medium">Annual Physical Exam</h3>
                <span className="text-sm text-blue-500">Jun 15, 2025</span>
              </div>
              <p className="text-sm text-muted-foreground">Dr. Smith • City Medical Center • 9:00 AM</p>
            </div>

            <div className="bg-accent/30 p-3 rounded-lg">
              <div className="flex justify-between">
                <h3 className="font-medium">Dental Checkup</h3>
                <span className="text-sm text-blue-500">Jul 22, 2025</span>
              </div>
              <p className="text-sm text-muted-foreground">Dr. Johnson • Smile Dental Clinic • 2:30 PM</p>
            </div>

            <Link href="/appointments" className="block">
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All Appointments
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
