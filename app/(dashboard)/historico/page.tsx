"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useAppointments, type Appointment } from "@/hooks/use-appointments"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Search, Filter, CheckCircle2, XCircle, ClockIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function HistoricoPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const { appointments, updateAppointment } = useAppointments(user?.id)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [timeFilter, setTimeFilter] = useState<string>("all")

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

  const now = new Date()

  const filteredAppointments = appointments
    .filter((apt) => {
      // Search filter
      const matchesSearch =
        apt.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.notes?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      // Status filter
      if (statusFilter !== "all" && apt.status !== statusFilter) return false

      // Time filter
      const aptDate = new Date(`${apt.date}T${apt.time}`)
      if (timeFilter === "upcoming" && (aptDate < now || apt.status !== "scheduled")) return false
      if (timeFilter === "past" && aptDate >= now && apt.status === "scheduled") return false

      return true
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`)
      const dateB = new Date(`${b.date}T${b.time}`)
      return dateB.getTime() - dateA.getTime()
    })

  const handleStatusChange = (appointment: Appointment, newStatus: "completed" | "cancelled") => {
    updateAppointment({
      ...appointment,
      status: newStatus,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <ClockIcon className="h-3 w-3 mr-1" />
            Agendada
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Concluída
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelada
          </Badge>
        )
      default:
        return null
    }
  }

  const isPast = (date: string, time: string) => {
    const aptDate = new Date(`${date}T${time}`)
    return aptDate < now
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Histórico de Consultas</h1>
          <p className="text-sm text-muted-foreground">Visualize todas as suas consultas agendadas e passadas</p>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Filter className="h-4 w-4" />
              Filtros
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    placeholder="Nome do profissional..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="scheduled">Agendada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Período</Label>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger id="time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="upcoming">Futuras</SelectItem>
                    <SelectItem value="past">Passadas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredAppointments.length} {filteredAppointments.length === 1 ? "consulta" : "consultas"}{" "}
              {statusFilter !== "all" || timeFilter !== "all" || searchQuery ? "encontrada(s)" : "no total"}
            </p>
          </div>

          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma consulta encontrada</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery || statusFilter !== "all" || timeFilter !== "all"
                    ? "Tente ajustar os filtros"
                    : "Suas consultas aparecerão aqui"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAppointments.map((appointment) => {
              const isAppointmentPast = isPast(appointment.date, appointment.time)
              const canChangeStatus = isAppointmentPast && appointment.status === "scheduled"

              return (
                <Card key={appointment.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.professionalName}</span>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(appointment.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.time}
                          </div>
                        </div>

                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground border-l-2 border-accent pl-3">
                            {appointment.notes}
                          </p>
                        )}

                        {canChangeStatus && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(appointment, "completed")}
                              className="text-green-700 border-green-200 hover:bg-green-50"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Marcar como Concluída
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(appointment, "cancelled")}
                              className="text-red-700 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Marcar como Cancelada
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
