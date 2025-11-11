"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TimeSlot {
  time: string
  available: boolean
}

interface AppointmentRecord {
  id: string
  date: Date
  time: string
  note?: string
  tags?: string[]
}

interface AppointmentSchedulerProps {
  onSelectSlot: (date: string, time: string) => void
  selectedDate?: string
  selectedTime?: string
  appointments?: AppointmentRecord[] // <-- recebe os agendamentos prontos
}

const AppointmentScheduler = ({
  onSelectSlot,
  selectedDate,
  selectedTime,
  appointments = [],
}: AppointmentSchedulerProps) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const times = ["10:00", "11:00", "14:00", "15:00", "16:00"]
    return times.map((time) => ({
      time,
      available: true,
    }))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null)
    for (let day = 1; day <= daysInMonth; day++) days.push(new Date(year, month, day))
    return days
  }

  const getWeekDays = () => {
    const start = selectedDay || new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      return d
    })
  }

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
  ]

  const weekDayNames = ["D", "S", "T", "Q", "Q", "S", "S"]
  const weekDayFullNames = ["DOM.", "SEG.", "TER.", "QUA.", "QUI.", "SEX.", "SÁB."]

  const handleDayClick = (date: Date) => setSelectedDay(date)
  const handleTimeSlotClick = (date: Date, time: string) =>
    onSelectSlot(date.toISOString().split("T")[0], time)

  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()
  const isSameDay = (d1: Date | null, d2: Date) => d1?.toDateString() === d2.toDateString()

  // Agrupar consultas como no histórico
  const groupedAppointments = appointments.reduce((acc, appt) => {
    const dateKey = appt.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(appt)
    return acc
  }, {} as Record<string, AppointmentRecord[]>)

  const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
    const dateA = groupedAppointments[a][0].date
    const dateB = groupedAppointments[b][0].date
    return dateB.getTime() - dateA.getTime()
  })

  return (
    <div className="flex flex-col gap-10">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Agendar nova consulta</h2>
        <span className="text-sm text-muted-foreground">(GMT-03:00) Horário de Brasília</span>
      </div>

      {/* Calendário + horários */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Calendário */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {weekDayNames.map((d, i) => (
              <div key={i} className="text-center text-xs text-muted-foreground p-2">{d}</div>
            ))}
            {getDaysInMonth(currentDate).map((date, i) => (
              <button
                key={i}
                onClick={() => date && handleDayClick(date)}
                disabled={!date}
                className={`p-2 text-sm rounded-full aspect-square flex items-center justify-center transition-colors
                  ${!date ? "invisible" : ""}
                  ${date && isToday(date) ? "bg-primary text-primary-foreground" : ""}
                  ${date && isSameDay(selectedDay, date) ? "bg-blue-100 text-blue-700" : "hover:bg-accent"}
                `}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>
        </div>

        {/* Horários */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-max">
            <div className="grid grid-cols-6 gap-4">
              {getWeekDays().map((date, i) => {
                const slots = generateTimeSlots(date)
                return (
                  <div key={i} className="space-y-3">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">{weekDayFullNames[date.getDay()]}</div>
                      <div className="text-lg font-semibold">{date.getDate()}</div>
                    </div>
                    <div className="space-y-2">
                      {slots.map((slot, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          onClick={() => handleTimeSlotClick(date, slot.time)}
                          className={`w-full h-10 text-sm ${
                            selectedDate === date.toISOString().split("T")[0] &&
                            selectedTime === slot.time
                              ? "bg-primary text-primary-foreground border-primary"
                              : ""
                          }`}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Consultas agendadas (igual ao histórico) */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Consultas agendadas</h2>
        {appointments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhuma consulta encontrada</p>
          </Card>
        ) : (
          sortedDates.map((dateKey) => (
            <div key={dateKey} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground">{dateKey}</h3>
              <div className="space-y-2">
                {groupedAppointments[dateKey].map((appt) => (
                  <Card key={appt.id} className="cursor-pointer p-4 transition-colors hover:bg-accent">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="text-sm text-muted-foreground">Horário: {appt.time}</div>
                        {appt.note && <p className="text-sm">{appt.note}</p>}
                        {appt.tags && appt.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {appt.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appt.date.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AppointmentScheduler
