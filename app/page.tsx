import Link from "next/link"
import { Calendar, FileText, Heart, Shield, Users, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Dashboard() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Health Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Manasvi. Here's your health overview.</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-blue-500 text-white hover:bg-blue-600">
          Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Link
          href="/emergency"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-full mb-2">
            <Shield className="h-6 w-6 text-blue-500" />
          </div>
          <h3 className="font-medium text-center">Emergency Access</h3>
          <p className="text-xs text-center text-muted-foreground">Critical health info</p>
        </Link>

        <Link
          href="/records"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-teal-100 dark:bg-teal-950 rounded-full mb-2">
            <FileText className="h-6 w-6 text-teal-500" />
          </div>
          <h3 className="font-medium text-center">Medical Records</h3>
          <p className="text-xs text-center text-muted-foreground">View & manage records</p>
        </Link>

        <Link
          href="/appointments"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-pink-100 dark:bg-pink-950 rounded-full mb-2">
            <Calendar className="h-6 w-6 text-pink-500" />
          </div>
          <h3 className="font-medium text-center">Appointments</h3>
          <p className="text-xs text-center text-muted-foreground">Schedule & track visits</p>
        </Link>

        <Link
          href="/analytics"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-yellow-100 dark:bg-yellow-950 rounded-full mb-2">
            <Heart className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="font-medium text-center">Health Analytics</h3>
          <p className="text-xs text-center text-muted-foreground">Track your metrics</p>
        </Link>

        <Link
          href="/family"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-green-100 dark:bg-green-950 rounded-full mb-2">
            <Users className="h-6 w-6 text-green-500" />
          </div>
          <h3 className="font-medium text-center">Family Vault</h3>
          <p className="text-xs text-center text-muted-foreground">Manage dependents</p>
        </Link>

        <Link
          href="/assistant"
          className="flex flex-col items-center p-4 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-full mb-2">
            <Briefcase className="h-6 w-6 text-orange-500" />
          </div>
          <h3 className="font-medium text-center">AI Assistant</h3>
          <p className="text-xs text-center text-muted-foreground">Get health answers</p>
        </Link>
      </div>

      <div className="bg-accent/20 rounded-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Emergency Information</h2>
          <Button variant="outline" size="sm">
            Always Accessible
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">BLOOD TYPE</h3>
            <p className="font-medium">Not specified</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">ALLERGIES</h3>
            <p className="font-medium">None recorded</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">CHRONIC CONDITIONS</h3>
            <p className="font-medium">None recorded</p>
          </div>
          <div>
            <h3 className="text-sm text-muted-foreground mb-1">EMERGENCY CONTACT</h3>
            <p className="font-medium">Not specified</p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Update Emergency Info
          </Button>
          <Button variant="secondary" className="gap-2">
            <Shield className="h-4 w-4" />
            Show Emergency QR Code
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-accent/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Medical Summary</h2>
          <p className="text-sm text-muted-foreground mb-6">AI-generated summary based on your records</p>

          <p className="text-muted-foreground italic">
            No medical records available to generate a summary. Upload your medical records to see an AI-generated
            summary of your health history.
          </p>

          <Button variant="link" className="mt-4 p-0 text-blue-500">
            View detailed health timeline
          </Button>
        </div>

        <div className="bg-accent/20 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Upcoming Appointments</h2>
          <p className="text-sm text-muted-foreground mb-6">Your next 3 scheduled visits</p>

          <div className="flex flex-col items-center justify-center py-8">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No upcoming appointments</p>
          </div>
        </div>
      </div>
    </div>
  )
}
