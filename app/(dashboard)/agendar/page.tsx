"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, User, Plus, Trash2, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAppointments } from "@/hooks/use-appointments"
import AppointmentScheduler from "@/components/appointment-scheduler" // Import the AppointmentScheduler component

interface Appointment {
  id: string
  psychologist: string
  date: string
  time: string
  notes: string
}

export default function AgendarPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { toast } = useToast()

  const { appointments, saveAppointment, deleteAppointment, getUpcomingAppointments } = useAppointments(user?.id)

  const [showScheduler, setShowScheduler] = useState(false)
  const psychologist = "Dr. Angelica"
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSelectSlot = (date: string, time: string) => {
    setSelectedDate(date)
    setSelectedTime(time)
  }

  const handleAddAppointment = () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione data e horário.",
        variant: "destructive",
      })
      return
    }

    saveAppointment({
      userId: user!.id,
      professionalName: psychologist,
      professionalSpecialty: "Psicólogo(a)",
      date: selectedDate,
      time: selectedTime,
      status: "scheduled",
      notes: notes.trim(),
    })

    setSelectedDate("")
    setSelectedTime("")
    setNotes("")
    setShowScheduler(false)

    toast({
      title: "Consulta agendada",
      description: "Sua consulta foi registrada com sucesso.",
    })
  }

  const handleDeleteAppointment = (id: string) => {
    deleteAppointment(id)

    toast({
      title: "Consulta removida",
      description: "A consulta foi excluída.",
    })
  }

  const upcomingAppointments = getUpcomingAppointments()

  if (showScheduler) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Button variant="ghost" onClick={() => setShowScheduler(false)} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Agendar Nova Consulta</CardTitle>
              <CardDescription>Selecione o horário desejado com Dr. Angelica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Psicólogo(a)</Label>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-input">
                  <User className="h-5 w-5 text-primary" />
                  <span className="font-medium">Dr. Angelica</span>
                </div>
              </div>

              <AppointmentScheduler
                onSelectSlot={handleSelectSlot}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />

              {selectedDate && selectedTime && (
                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-sm font-medium">Horário selecionado:</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    às {selectedTime}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a consulta..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleAddAppointment} className="flex-1">
                  Confirmar Agendamento
                </Button>
                <Button variant="outline" onClick={() => setShowScheduler(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Agendar Consultas</h1>
            <p className="text-sm text-muted-foreground">Gerencie seus compromissos terapêuticos</p>
          </div>
          <Button onClick={() => setShowScheduler(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Consulta
          </Button>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Próximas Consultas</h2>
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma consulta agendada</p>
                <p className="text-sm text-muted-foreground mt-2">Clique em "Nova Consulta" para agendar</p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{appointment.professionalName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString("pt-BR")}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {appointment.time}
                        </div>
                      </div>
                      {appointment.notes && <p className="text-sm text-muted-foreground">{appointment.notes}</p>}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
