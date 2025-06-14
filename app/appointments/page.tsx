"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, Plus, Trash2, Edit, Check } from "lucide-react"
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
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
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

type Appointment = {
  id: string
  title: string
  date: string
  time: string
  provider: string
  location: string
  type: string
  notes: string
  duration: string
  reminder: string
}

export default function AppointmentsPage() {
  const [isAddAppointmentDialogOpen, setIsAddAppointmentDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([])
  const [newAppointment, setNewAppointment] = useState<Appointment>({
    id: "",
    title: "",
    date: "",
    time: "",
    provider: "",
    location: "",
    type: "",
    notes: "",
    duration: "30",
    reminder: "none",
  })
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null)
  const [calendarHighlights, setCalendarHighlights] = useState<Date[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load appointments from localStorage
    const savedAppointments = localStorage.getItem("medikey_appointments")
    if (savedAppointments) {
      const parsed = JSON.parse(savedAppointments)

      // Split into upcoming and past appointments
      const now = new Date()
      const upcoming: Appointment[] = []
      const past: Appointment[] = []

      parsed.forEach((appt: Appointment) => {
        const apptDate = new Date(`${appt.date}T${appt.time}`)
        if (apptDate > now) {
          upcoming.push(appt)
        } else {
          past.push(appt)
        }
      })

      setAppointments(upcoming)
      setPastAppointments(past)
    }

    // Generate some sample appointments if none exist
    else {
      const sampleAppointments = [
        {
          id: "1",
          title: "Annual Physical Exam",
          date: format(addDays(new Date(), 7), "yyyy-MM-dd"),
          time: "09:00",
          provider: "Dr. Smith",
          location: "City Medical Center",
          type: "check-up",
          notes: "Annual physical examination",
          duration: "60",
          reminder: "1day",
        },
        {
          id: "2",
          title: "Dental Checkup",
          date: format(addDays(new Date(), 14), "yyyy-MM-dd"),
          time: "14:30",
          provider: "Dr. Johnson",
          location: "Smile Dental Clinic",
          type: "dental",
          notes: "Regular dental cleaning and checkup",
          duration: "45",
          reminder: "1day",
        },
      ]

      setAppointments(sampleAppointments)
      localStorage.setItem("medikey_appointments", JSON.stringify(sampleAppointments))
    }
  }, [])

  useEffect(() => {
    // Update calendar highlights when appointments change
    const highlights = appointments.map((appt) => new Date(appt.date))
    setCalendarHighlights(highlights)
  }, [appointments])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    if (isEditMode && editingAppointment) {
      setAppointments(appointments.map((appt) => (appt.id === editingAppointment ? { ...appt, [id]: value } : appt)))
    } else {
      setNewAppointment({ ...newAppointment, [id]: value })
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    if (isEditMode && editingAppointment) {
      setAppointments(appointments.map((appt) => (appt.id === editingAppointment ? { ...appt, [id]: value } : appt)))
    } else {
      setNewAppointment({ ...newAppointment, [id]: value })
    }
  }

  const handleDateChange = (date: Date | undefined) => {
    if (!date) return

    if (isEditMode && editingAppointment) {
      setAppointments(
        appointments.map((appt) =>
          appt.id === editingAppointment ? { ...appt, date: format(date, "yyyy-MM-dd") } : appt,
        ),
      )
    } else {
      setNewAppointment({ ...newAppointment, date: format(date, "yyyy-MM-dd") })
    }

    setSelectedDate(date)
  }

  const handleAddAppointment = () => {
    if (newAppointment.title && newAppointment.date && newAppointment.time && newAppointment.provider) {
      const newAppt = {
        ...newAppointment,
        id: Date.now().toString(),
      }

      const updatedAppointments = [...appointments, newAppt]
      setAppointments(updatedAppointments)
      localStorage.setItem("medikey_appointments", JSON.stringify([...updatedAppointments, ...pastAppointments]))

      setNewAppointment({
        id: "",
        title: "",
        date: "",
        time: "",
        provider: "",
        location: "",
        type: "",
        notes: "",
        duration: "30",
        reminder: "none",
      })

      toast({
        title: "Appointment Scheduled",
        description: `Your appointment for ${newAppt.title} has been scheduled.`,
      })

      setIsAddAppointmentDialogOpen(false)
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
    }
  }

  const handleEditAppointment = (id: string) => {
    setEditingAppointment(id)
    setIsEditMode(true)

    const appt = appointments.find((a) => a.id === id)
    if (appt) {
      setSelectedDate(new Date(appt.date))
      setIsAddAppointmentDialogOpen(true)
    }
  }

  const handleSaveEdit = () => {
    localStorage.setItem("medikey_appointments", JSON.stringify([...appointments, ...pastAppointments]))

    toast({
      title: "Appointment Updated",
      description: "Your appointment has been updated successfully.",
    })

    setIsEditMode(false)
    setEditingAppointment(null)
    setIsAddAppointmentDialogOpen(false)
  }

  const handleDeleteAppointment = (id: string) => {
    const updatedAppointments = appointments.filter((appt) => appt.id !== id)
    setAppointments(updatedAppointments)
    localStorage.setItem("medikey_appointments", JSON.stringify([...updatedAppointments, ...pastAppointments]))

    toast({
      title: "Appointment Cancelled",
      description: "Your appointment has been cancelled.",
    })
  }

  const getDayClassName = (date: Date) => {
    if (calendarHighlights.some((d) => isSameDay(d, date))) {
      return "bg-pink-500 text-white hover:bg-pink-600"
    }
    return undefined
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Schedule and manage your medical appointments</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="rounded-full bg-pink-500 text-white hover:bg-pink-600">
            Appointments
          </Button>
          <Dialog
            open={isAddAppointmentDialogOpen}
            onOpenChange={(open) => {
              setIsAddAppointmentDialogOpen(open)
              if (!open) {
                setIsEditMode(false)
                setEditingAppointment(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 bg-pink-500 hover:bg-pink-600">
                <Plus className="h-4 w-4" />
                Schedule New Appointment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Appointment" : "Schedule New Appointment"}</DialogTitle>
                <DialogDescription>
                  {isEditMode ? "Update your appointment details." : "Add a new appointment to your calendar."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">
                    Appointment Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="E.g., Annual Physical, Dental Checkup"
                    value={
                      isEditMode && editingAppointment
                        ? appointments.find((a) => a.id === editingAppointment)?.title || ""
                        : newAppointment.title
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">
                      Date <span className="text-red-500">*</span>
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          initialFocus
                          modifiers={{
                            booked: calendarHighlights,
                          }}
                          modifiersClassNames={{
                            booked: "bg-pink-500/20",
                          }}
                          className="rounded-md border"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">
                      Time <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={
                          isEditMode && editingAppointment
                            ? appointments.find((a) => a.id === editingAppointment)?.time || ""
                            : newAppointment.time
                        }
                        onValueChange={(value) => handleSelectChange("time", value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, hour) =>
                            ["00", "15", "30", "45"].map((minute) => {
                              const formattedHour = hour.toString().padStart(2, "0")
                              const timeValue = `${formattedHour}:${minute}`
                              const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
                              const amPm = hour >= 12 ? "PM" : "AM"
                              return (
                                <SelectItem key={timeValue} value={timeValue}>
                                  {`${displayHour}:${minute} ${amPm}`}
                                </SelectItem>
                              )
                            }),
                          ).flat()}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">
                    Appointment Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={
                      isEditMode && editingAppointment
                        ? appointments.find((a) => a.id === editingAppointment)?.type || ""
                        : newAppointment.type
                    }
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="check-up">Check-up</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="specialist">Specialist Consultation</SelectItem>
                      <SelectItem value="test">Medical Test</SelectItem>
                      <SelectItem value="procedure">Medical Procedure</SelectItem>
                      <SelectItem value="dental">Dental</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="provider">
                    Provider Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="provider"
                    placeholder="E.g., Dr. Smith, City Hospital"
                    value={
                      isEditMode && editingAppointment
                        ? appointments.find((a) => a.id === editingAppointment)?.provider || ""
                        : newAppointment.provider
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="E.g., 123 Medical Plaza, Suite 100"
                    value={
                      isEditMode && editingAppointment
                        ? appointments.find((a) => a.id === editingAppointment)?.location || ""
                        : newAppointment.location
                    }
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      value={
                        isEditMode && editingAppointment
                          ? appointments.find((a) => a.id === editingAppointment)?.duration || "30"
                          : newAppointment.duration
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="reminder">Set Reminder</Label>
                    <Select
                      value={
                        isEditMode && editingAppointment
                          ? appointments.find((a) => a.id === editingAppointment)?.reminder || "none"
                          : newAppointment.reminder
                      }
                      onValueChange={(value) => handleSelectChange("reminder", value)}
                    >
                      <SelectTrigger id="reminder">
                        <SelectValue placeholder="Select reminder time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No reminder</SelectItem>
                        <SelectItem value="15min">15 minutes before</SelectItem>
                        <SelectItem value="30min">30 minutes before</SelectItem>
                        <SelectItem value="1hour">1 hour before</SelectItem>
                        <SelectItem value="1day">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information about this appointment"
                    rows={3}
                    value={
                      isEditMode && editingAppointment
                        ? appointments.find((a) => a.id === editingAppointment)?.notes || ""
                        : newAppointment.notes
                    }
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddAppointmentDialogOpen(false)}>
                  Cancel
                </Button>
                {isEditMode ? (
                  <Button onClick={handleSaveEdit} className="bg-pink-500 hover:bg-pink-600">
                    Update Appointment
                  </Button>
                ) : (
                  <Button onClick={handleAddAppointment} className="bg-pink-500 hover:bg-pink-600">
                    Schedule
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="upcoming">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments
                    .sort(
                      (a, b) => new Date(a.date + "T" + a.time).getTime() - new Date(b.date + "T" + b.time).getTime(),
                    )
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-accent/20 p-4 rounded-lg flex items-center">
                        <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full mr-4">
                          <Clock className="h-6 w-6 text-pink-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <span>
                              {new Date(appointment.date).toLocaleDateString()} at {(() => {
                                const [hour, minute] = appointment.time.split(":")
                                const hourNum = Number.parseInt(hour)
                                const ampm = hourNum >= 12 ? "PM" : "AM"
                                const hour12 = hourNum % 12 || 12
                                return `${hour12}:${minute} ${ampm}`
                              })()}
                            </span>
                            <span>•</span>
                            <span>{appointment.provider}</span>
                            {appointment.location && (
                              <>
                                <span>•</span>
                                <span>{appointment.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
                            onClick={() => handleEditAppointment(appointment.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel this appointment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 hover:bg-red-600"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                >
                                  Cancel Appointment
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-accent/20 rounded-lg p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                  <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No upcoming appointments</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    You don't have any scheduled appointments. Click the button below to schedule a new appointment.
                  </p>
                  <Button
                    className="gap-2 bg-pink-500 hover:bg-pink-600"
                    onClick={() => setIsAddAppointmentDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Schedule Your First Appointment
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments
                    .sort(
                      (a, b) => new Date(b.date + "T" + b.time).getTime() - new Date(a.date + "T" + a.time).getTime(),
                    )
                    .map((appointment) => (
                      <div key={appointment.id} className="bg-accent/20 p-4 rounded-lg flex items-center opacity-70">
                        <div className="bg-pink-100 dark:bg-pink-900 p-3 rounded-full mr-4">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{appointment.title}</h3>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <span>
                              {new Date(appointment.date).toLocaleDateString()} at {(() => {
                                const [hour, minute] = appointment.time.split(":")
                                const hourNum = Number.parseInt(hour)
                                const ampm = hourNum >= 12 ? "PM" : "AM"
                                const hour12 = hourNum % 12 || 12
                                return `${hour12}:${minute} ${ampm}`
                              })()}
                            </span>
                            <span>•</span>
                            <span>{appointment.provider}</span>
                            {appointment.location && (
                              <>
                                <span>•</span>
                                <span>{appointment.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="bg-accent/20 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                  <p className="text-muted-foreground">No past appointments found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Calendar</h2>
          <div className="bg-accent/20 p-4 rounded-lg">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                booked: calendarHighlights,
              }}
              modifiersStyles={{
                booked: {
                  fontWeight: "bold",
                },
              }}
              components={{
                DayContent: (props) => {
                  const isBooked = calendarHighlights.some((d) => isSameDay(d, props.date))
                  return (
                    <div
                      className={cn(
                        "relative",
                        isBooked &&
                          "after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-pink-500 after:rounded-full",
                      )}
                    >
                      {props.date.getDate()}
                    </div>
                  )
                },
              }}
            />

            <div className="mt-6">
              <h3 className="font-medium mb-2">
                {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
              </h3>

              {selectedDate && appointments.some((appt) => appt.date === format(selectedDate, "yyyy-MM-dd")) ? (
                <div className="space-y-2">
                  {appointments
                    .filter((appt) => appt.date === format(selectedDate, "yyyy-MM-dd"))
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((appt) => (
                      <div key={appt.id} className="bg-pink-500/10 p-3 rounded-lg border border-pink-500/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-pink-500">{appt.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {(() => {
                                const [hour, minute] = appt.time.split(":")
                                const hourNum = Number.parseInt(hour)
                                const ampm = hourNum >= 12 ? "PM" : "AM"
                                const hour12 = hourNum % 12 || 12
                                return `${hour12}:${minute} ${ampm}`
                              })()}
                              {appt.duration && ` • ${appt.duration} min`}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleEditAppointment(appt.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                        {appt.provider && (
                          <p className="text-xs mt-1">
                            <span className="text-muted-foreground">Provider:</span> {appt.provider}
                          </p>
                        )}
                        {appt.location && (
                          <p className="text-xs">
                            <span className="text-muted-foreground">Location:</span> {appt.location}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No appointments on this date</p>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-4 text-pink-500 border-pink-500/30 hover:bg-pink-500/10"
                onClick={() => {
                  setNewAppointment({
                    ...newAppointment,
                    date: format(selectedDate || new Date(), "yyyy-MM-dd"),
                  })
                  setIsAddAppointmentDialogOpen(true)
                }}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add for this date
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
