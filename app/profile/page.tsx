"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("personal")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "Manasvi",
    email: "manasvi01003@gmail.com",
    phone: "9958582766",
    dob: "2003-09-01",
    gender: "Female",
  })
  const [emergencyInfo, setEmergencyInfo] = useState({
    bloodType: "",
    allergies: "",
    conditions: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  })

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPersonalInfo({ ...personalInfo, [id]: value })
  }

  const handleEmergencyInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setEmergencyInfo({ ...emergencyInfo, [id]: value })
  }

  const handleSelectChange = (id: string, value: string) => {
    setEmergencyInfo({ ...emergencyInfo, [id]: value })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const savePersonalInfo = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem(
      "medikey_profile",
      JSON.stringify({
        ...personalInfo,
        profileImage,
      }),
    )
    alert("Personal information saved successfully!")
  }

  const saveEmergencyInfo = () => {
    // Save to localStorage for demo purposes
    localStorage.setItem("medikey_emergency", JSON.stringify(emergencyInfo))
    alert("Emergency information saved successfully!")
  }

  // Load saved data on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("medikey_profile")
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile)
      setPersonalInfo({
        fullName: parsedProfile.fullName || "",
        email: parsedProfile.email || "",
        phone: parsedProfile.phone || "",
        dob: parsedProfile.dob || "",
        gender: parsedProfile.gender || "",
      })
      if (parsedProfile.profileImage) {
        setProfileImage(parsedProfile.profileImage)
      }
    }

    const savedEmergency = localStorage.getItem("medikey_emergency")
    if (savedEmergency) {
      const parsedEmergency = JSON.parse(savedEmergency)
      setEmergencyInfo({
        bloodType: parsedEmergency.bloodType || "",
        allergies: parsedEmergency.allergies || "",
        conditions: parsedEmergency.conditions || "",
        emergencyContactName: parsedEmergency.emergencyContactName || "",
        emergencyContactPhone: parsedEmergency.emergencyContactPhone || "",
      })
    }
  }, [])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your personal information and emergency contacts</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full bg-orange-500 text-white hover:bg-orange-600">
          Profile
        </Button>
      </div>

      <Tabs defaultValue="personal" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Information</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="bg-accent/20 rounded-lg p-6">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <Avatar className="w-32 h-32 border-4 border-background">
                {profileImage ? (
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
                ) : (
                  <AvatarFallback className="text-4xl">{personalInfo.fullName.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0">
                <label htmlFor="profile-upload" className="cursor-pointer">
                  <div className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-full">
                    <Camera className="h-4 w-4" />
                  </div>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Click on the avatar to upload a profile picture</p>
          </div>

          <div className="grid gap-6 max-w-2xl mx-auto">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={personalInfo.fullName} onChange={handlePersonalInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={personalInfo.email} onChange={handlePersonalInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" value={personalInfo.phone} onChange={handlePersonalInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input id="dob" type="date" value={personalInfo.dob} onChange={handlePersonalInfoChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={personalInfo.gender}
                onValueChange={(value) => setPersonalInfo({ ...personalInfo, gender: value })}
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                  <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={savePersonalInfo} className="justify-self-end bg-orange-500 hover:bg-orange-600">
              Save Changes
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="emergency" className="bg-accent/20 rounded-lg p-6">
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-600/80 dark:text-red-400/80">
              This information will be accessible to emergency responders through your emergency QR code. Make sure it's
              accurate and up-to-date.
            </p>
          </div>

          <div className="grid gap-6 max-w-2xl mx-auto">
            <div className="grid gap-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={emergencyInfo.bloodType} onValueChange={(value) => handleSelectChange("bloodType", value)}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                placeholder="List any allergies (medications, food, etc.)"
                value={emergencyInfo.allergies}
                onChange={handleEmergencyInfoChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="conditions">Chronic Conditions</Label>
              <Textarea
                id="conditions"
                placeholder="List any chronic conditions (diabetes, asthma, etc.)"
                value={emergencyInfo.conditions}
                onChange={handleEmergencyInfoChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                placeholder="Enter emergency contact name"
                value={emergencyInfo.emergencyContactName}
                onChange={handleEmergencyInfoChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                placeholder="Enter emergency contact phone"
                value={emergencyInfo.emergencyContactPhone}
                onChange={handleEmergencyInfoChange}
              />
            </div>
            <Button onClick={saveEmergencyInfo} className="justify-self-end bg-red-500 hover:bg-red-600">
              Save Emergency Information
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
