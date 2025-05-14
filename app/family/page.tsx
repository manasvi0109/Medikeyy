"use client"

import { DialogDescription } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { FileText, MoreVertical, UserPlus, Loader2, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import {
  getFamilyMembers,
  addFamilyMember,
  updateFamilyMember,
  deleteFamilyMember,
  type FamilyMember,
} from "../actions/family-members"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function FamilyPage() {
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const [newMember, setNewMember] = useState({
    name: "",
    relationship: "",
    dob: "",
    gender: "",
    blood_type: "",
    allergies: "",
    conditions: "",
  })

  // Load family members from database
  useEffect(() => {
    async function loadFamilyMembers() {
      if (!user?.name) return

      setIsLoading(true)
      setError(null)

      try {
        const result = await getFamilyMembers(user.name)

        if (result.success) {
          setFamilyMembers(result.data)
        } else {
          setError(result.error || "Failed to load family members")
        }
      } catch (err) {
        setError("An error occurred while loading family members")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadFamilyMembers()
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setNewMember({ ...newMember, [id]: value })
  }

  const handleAddMember = async () => {
    if (!user?.name) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add family members",
        variant: "destructive",
      })
      return
    }

    if (!newMember.name || !newMember.relationship) {
      toast({
        title: "Missing information",
        description: "Name and relationship are required",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isEditMode && editingMemberId) {
        // Update existing member
        const result = await updateFamilyMember(editingMemberId, newMember)

        if (result.success) {
          toast({
            title: "Member updated",
            description: `${newMember.name}'s information has been updated successfully`,
          })

          // Refresh the family members
          const updatedMembers = await getFamilyMembers(user.name)
          if (updatedMembers.success) {
            setFamilyMembers(updatedMembers.data)
          }
        } else {
          toast({
            title: "Update failed",
            description: result.error || "Failed to update family member",
            variant: "destructive",
          })
        }
      } else {
        // Add new member
        const result = await addFamilyMember({
          user_id: user.name,
          name: newMember.name,
          relationship: newMember.relationship,
          dob: newMember.dob || undefined,
          gender: newMember.gender || undefined,
          blood_type: newMember.blood_type || undefined,
          allergies: newMember.allergies || undefined,
          conditions: newMember.conditions || undefined,
        })

        if (result.success) {
          toast({
            title: "Member added",
            description: `${newMember.name} has been added to your family vault`,
          })

          // Refresh the family members
          const updatedMembers = await getFamilyMembers(user.name)
          if (updatedMembers.success) {
            setFamilyMembers(updatedMembers.data)
          }
        } else {
          toast({
            title: "Addition failed",
            description: result.error || "Failed to add family member",
            variant: "destructive",
          })
        }
      }

      // Reset form and close dialog
      setNewMember({
        name: "",
        relationship: "",
        dob: "",
        gender: "",
        blood_type: "",
        allergies: "",
        conditions: "",
      })
      setIsEditMode(false)
      setEditingMemberId(null)
      setIsAddMemberDialogOpen(false)
    } catch (err) {
      console.error(err)
      toast({
        title: isEditMode ? "Update failed" : "Addition failed",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditMember = (member: FamilyMember) => {
    setNewMember({
      name: member.name,
      relationship: member.relationship,
      dob: member.dob || "",
      gender: member.gender || "",
      blood_type: member.blood_type || "",
      allergies: member.allergies || "",
      conditions: member.conditions || "",
    })
    setIsEditMode(true)
    setEditingMemberId(member.id!)
    setIsAddMemberDialogOpen(true)
  }

  const handleDeleteMember = async (id: number) => {
    if (!user?.name) return

    setIsLoading(true)

    try {
      const result = await deleteFamilyMember(id)

      if (result.success) {
        toast({
          title: "Member removed",
          description: "Family member has been removed from your vault",
        })

        // Refresh the family members
        const updatedMembers = await getFamilyMembers(user.name)
        if (updatedMembers.success) {
          setFamilyMembers(updatedMembers.data)
        }
      } else {
        toast({
          title: "Removal failed",
          description: result.error || "Failed to remove family member",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({
        title: "Removal failed",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <Dialog
            open={isAddMemberDialogOpen}
            onOpenChange={(open) => {
              setIsAddMemberDialogOpen(open)
              if (!open) {
                setIsEditMode(false)
                setEditingMemberId(null)
                setNewMember({
                  name: "",
                  relationship: "",
                  dob: "",
                  gender: "",
                  blood_type: "",
                  allergies: "",
                  conditions: "",
                })
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-500 hover:bg-green-600">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Family Member" : "Add Family Member"}</DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Update member information in your family vault"
                    : "Add a new member to your family vault"}
                </DialogDescription>
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
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <Input
                      id="blood_type"
                      placeholder="e.g. A+, B-, O+"
                      value={newMember.blood_type}
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
                <Button onClick={handleAddMember} className="bg-green-500 hover:bg-green-600" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Saving..."}
                    </>
                  ) : isEditMode ? (
                    "Update"
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-green-500 mb-4" />
          <p className="text-muted-foreground">Loading family members...</p>
        </div>
      ) : familyMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-accent/20 rounded-lg p-12">
          <UserPlus className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No family members yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            Add your first family member to start managing their health information in your family vault.
          </p>
          <Button className="gap-2 bg-green-500 hover:bg-green-600" onClick={() => setIsAddMemberDialogOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Your First Family Member
          </Button>
        </div>
      ) : (
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
                          {member.relationship}
                          {member.dob && <>, {new Date().getFullYear() - new Date(member.dob).getFullYear()} years</>}
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
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>Edit member</DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Remove member</DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove family member</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {member.name} from your family vault? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 hover:bg-red-600"
                                onClick={() => handleDeleteMember(member.id!)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="grid gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Blood Type</p>
                      <p className="font-medium">{member.blood_type || "Not specified"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Allergies</p>
                      <p className="font-medium">{member.allergies || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chronic Conditions</p>
                      <p className="font-medium">{member.conditions || "None"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gender</p>
                      <p className="font-medium">{member.gender || "Not specified"}</p>
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
      )}
    </div>
  )
}
