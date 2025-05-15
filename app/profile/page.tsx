"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"
import { generatePatientId } from "@/lib/patient-id"
import { Copy, Check, User, Shield, Bell, Key, Smartphone } from "lucide-react"

export default function ProfilePage() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [patientId, setPatientId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    bloodType: "",
    allergies: "",
    conditions: "",
  })

  useEffect(() => {
    // Load user profile data
    if (user?.name) {
      // In a real app, this would fetch from the database
      setProfile({
        name: user.name || "John Doe",
        email: user.email || "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        address: "123 Health St, Medical City, MC 12345",
        emergencyContact: "Jane Doe",
        emergencyPhone: "+1 (555) 987-6543",
        bloodType: "O+",
        allergies: "Penicillin",
        conditions: "Hypertension",
      })

      // Generate or retrieve patient ID
      const storedId = localStorage.getItem(`patient_id_${user.name}`)
      if (storedId) {
        setPatientId(storedId)
      } else {
        const newId = generatePatientId(user.name)
        setPatientId(newId)
        localStorage.setItem(`patient_id_${user.name}`, newId)
      }
    }
  }, [user])

  const handleCopyId = () => {
    navigator.clipboard.writeText(patientId)
    setCopied(true)
    toast({
      title: "Patient ID copied",
      description: "Your patient ID has been copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveProfile = () => {
    // In a real app, this would save to the database
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully",
    })
  }

  const handleSavePreferences = () => {
    toast({
      title: "Preferences saved",
      description: "Your notification preferences have been updated",
    })
  }

  const handleChangePassword = () => {
    toast({
      title: "Password updated",
      description: "Your password has been changed successfully",
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="mb-6 bg-accent/20 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">YOUR PATIENT ID</p>
          <p className="text-xl font-mono font-bold">{patientId}</p>
          <p className="text-xs text-muted-foreground mt-1">Use this ID when communicating with healthcare providers</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyId}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy ID"}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="devices" className="gap-2">
            <Smartphone className="h-4 w-4" />
            Connected Devices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Medical Information</CardTitle>
                <CardDescription>Update your medical details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergency-contact">Emergency Contact</Label>
                  <Input
                    id="emergency-contact"
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                  <Input
                    id="emergency-phone"
                    value={profile.emergencyPhone}
                    onChange={(e) => setProfile({ ...profile, emergencyPhone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-type">Blood Type</Label>
                  <Input
                    id="blood-type"
                    value={profile.bloodType}
                    onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Textarea
                    id="allergies"
                    value={profile.allergies}
                    onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conditions">Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    value={profile.conditions}
                    onChange={(e) => setProfile({ ...profile, conditions: e.target.value })}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Appointment Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive reminders about upcoming appointments</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="appointment-email" className="text-sm">
                    Email
                  </Label>
                  <input type="checkbox" id="appointment-email" className="rounded" defaultChecked />
                  <Label htmlFor="appointment-sms" className="text-sm">
                    SMS
                  </Label>
                  <input type="checkbox" id="appointment-sms" className="rounded" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Medication Reminders</p>
                  <p className="text-sm text-muted-foreground">Receive reminders to take your medications</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="medication-email" className="text-sm">
                    Email
                  </Label>
                  <input type="checkbox" id="medication-email" className="rounded" defaultChecked />
                  <Label htmlFor="medication-sms" className="text-sm">
                    SMS
                  </Label>
                  <input type="checkbox" id="medication-sms" className="rounded" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Health Alerts</p>
                  <p className="text-sm text-muted-foreground">Receive alerts about abnormal health metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="health-email" className="text-sm">
                    Email
                  </Label>
                  <input type="checkbox" id="health-email" className="rounded" defaultChecked />
                  <Label htmlFor="health-sms" className="text-sm">
                    SMS
                  </Label>
                  <input type="checkbox" id="health-sms" className="rounded" defaultChecked />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Updates</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about MediKey features and improvements
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="system-email" className="text-sm">
                    Email
                  </Label>
                  <input type="checkbox" id="system-email" className="rounded" defaultChecked />
                  <Label htmlFor="system-sms" className="text-sm">
                    SMS
                  </Label>
                  <input type="checkbox" id="system-sms" className="rounded" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSavePreferences}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Connected Devices</CardTitle>
              <CardDescription>Manage devices connected to your MediKey account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-accent/20 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">iPhone 13 Pro</p>
                    <p className="text-sm text-muted-foreground">Last active: Today, 10:42 AM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
                <div className="bg-accent/20 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">Apple Watch Series 7</p>
                    <p className="text-sm text-muted-foreground">Last active: Today, 10:30 AM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
                <div className="bg-accent/20 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-medium">MacBook Pro</p>
                    <p className="text-sm text-muted-foreground">Last active: Yesterday, 8:15 PM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Disconnect
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Manage Device Access
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
