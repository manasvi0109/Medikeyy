"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"

export default function FamilyPage() {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: "1",
      name: "Subha Latha",
      relationship: "Mother",
      age: 52,
      bloodType: "O+",
      allergies: "-",
      conditions: "type 2 diabetes",
      gender: "female",
    },
  ])

  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    dob: "",
    gender: "",
    bloodType: "",
    allergies: "",
    conditions: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewMember({ ...newMember, [id]: value })
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.relationship) {
      const age = newMember.dob ? new Date().getFullYear() - new Date(newMember.dob).getFullYear() : 0

      setFamilyMembers([
        ...familyMembers,
        {
          id: Date.now().toString(),
          name: newMember.name,
          relationship: newMember.relationship,
          age,
          bloodType: newMember.bloodType || "Not specified",
          allergies: newMember.allergies || "-",
          conditions: newMember.conditions || "None",
          gender: newMember.gender || "Not specified",
        },
      ])

      setNewMember({
        name: "",
        relationship: "",
        dob: "",
        gender: "",
        bloodType: "",
        allergies: "",
        conditions: "",
      })

      setIsAddMemberDialogOpen(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Family Vault</h1>
          <p className="text-muted-foreground">Manage your family members' health records</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full bg-green-500 text-white hover:bg-green-600">
            Family
          </Button>
          <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-500 hover:bg-green-600">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
                <DialogDescription>Add a new member to your family vault</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input id="name" placeholder="Enter full name" value={newMember.name} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="relationship">
                      Relationship <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="relationship"
                      placeholder="e.g. Spouse, Child, Parent"
                      value={newMember.relationship}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input id="dob" type="date" value={newMember.dob} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      placeholder="e.g. Male, Female, Other"
                      value={newMember.gender}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Input
                      id="bloodType"
                      placeholder="e.g. A+, B-, O+"
                      value={newMember.bloodType}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allergies">Allergies</Label>
                  <Input
                    id="allergies"
                    placeholder="e.g. Peanuts, Penicillin"
                    value={newMember.allergies}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conditions">Chronic Conditions</Label>
                  <Textarea
                    id="conditions"
                    placeholder="e.g. Asthma, Diabetes"
                    value={newMember.conditions}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember} className="bg-green-500 hover:bg-green-600">
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {familyMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 font-semibold">
                      {member.name.charAt(0)}
                      {member.name.split(" ")[1]?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {member.relationship}, {member.age} years
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit member</DropdownMenuItem>
                      <DropdownMenuItem>Remove member</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="grid gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Blood Type</p>
                    <p className="font-medium">{member.bloodType}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Allergies</p>
                    <p className="font-medium">{member.allergies}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Chronic Conditions</p>
                    <p className="font-medium">{member.conditions}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Gender</p>
                    <p className="font-medium">{member.gender}</p>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-6 gap-2">
                  <FileText className="h-4 w-4" />
                  View Medical Records
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
