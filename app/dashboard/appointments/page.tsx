'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CalendarIcon, Clock, Plus, Trash2, ChevronLeft, ChevronRight, User, ArrowLeft, CheckCircle2, Pencil } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

interface Appointment {
  id: string
  therapistName: string
  date: string
  time: string
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
  originalId?: string
}

const TIME_SLOTS = [
  '08:00',
  '08:45',
  '09:30',
  '10:15',
  '11:00',
  '11:45',
  '12:30',
  '13:15',
  '14:00',
  '14:45',
  '15:30',
  '16:15',
  '17:00',
  '17:45',
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<{date: Date, time: string} | null>(null)
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [showPastDateDialog, setShowPastDateDialog] = useState(false)
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('appointments')
    if (saved) {
      setAppointments(JSON.parse(saved))
    }
  }, [])

  const getDayName = (date: Date) => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
    return days[date.getDay()]
  }

  const isTimeAvailable = (date: Date, time: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (checkDate < today) {
      return false
    }
    
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return false
    }
    
    const dateStr = date.toISOString().split('T')[0]
    const unavailable = [
      `${dateStr}-12:00`,
    ]
    return !unavailable.includes(`${dateStr}-${time}`)
  }

  const getTwoDaysSlots = () => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() + i)
      days.push(date)
    }
    return days
  }

  const isDateInPast = (date: string, time: string) => {
    const appointmentDateTime = new Date(`${date}T${time}`)
    const now = new Date()
    return appointmentDateTime < now
  }

  const toggleTimeSelection = (day: Date, time: string) => {
    const dateStr = day.toDateString()
    
    if (selectedTime && selectedTime.date.toDateString() === dateStr && selectedTime.time === time) {
      setSelectedTime(null)
    } else {
      setSelectedTime({ date: day, time })
    }
  }

  const isTimeSelected = (day: Date, time: string) => {
    if (!selectedTime) return false
    return selectedTime.date.toDateString() === day.toDateString() && selectedTime.time === time
  }

  const saveAppointment = () => {
    if (!selectedDate || !selectedTime) return
    
    const newAppointment: Appointment = {
      id: Date.now().toString() + Math.random(),
      therapistName: 'Dr. Angelica',
      date: selectedTime.date.toISOString().split('T')[0],
      time: selectedTime.time,
      notes: notes,
      status: 'scheduled',
      originalId: editingId || undefined
    }

    const hasPastDate = isDateInPast(newAppointment.date, newAppointment.time)

    if (hasPastDate) {
      setPendingAppointment(newAppointment)
      setShowPastDateDialog(true)
      return
    }

    saveSingleAppointment(newAppointment)
  }

  const saveSingleAppointment = (newAppointment: Appointment, completed: boolean = false) => {
    const finalAppointment = completed 
      ? { ...newAppointment, status: 'completed' as const }
      : newAppointment
    
    const updated = editingId
      ? [
          ...appointments.map(apt => 
            apt.id === editingId 
              ? { ...apt, status: 'rescheduled' as const } 
              : apt
          ),
          finalAppointment
        ]
      : [...appointments, finalAppointment]

    setAppointments(updated)
    localStorage.setItem('appointments', JSON.stringify(updated))
    
    toast({
      title: completed 
        ? 'Consulta registrada no histórico' 
        : editingId 
        ? 'Consulta remarcada com sucesso' 
        : 'Consulta agendada com sucesso',
      description: completed 
        ? 'A consulta foi marcada como realizada.'
        : 'Horário agendado',
    })
    
    resetForm()
  }

  const handlePastDateConfirm = (wasCompleted: boolean) => {
    if (selectedTime) {
      const newAppointment: Appointment = {
        id: Date.now().toString() + Math.random(),
        therapistName: 'Dr. Angelica',
        date: selectedTime.date.toISOString().split('T')[0],
        time: selectedTime.time,
        notes: notes,
        status: 'scheduled',
        originalId: editingId || undefined
      }
      saveSingleAppointment(newAppointment, wasCompleted)
    }
    setShowPastDateDialog(false)
    setPendingAppointment(null)
  }

  const resetForm = () => {
    setShowNewAppointment(false)
    setSelectedDate(new Date())
    setSelectedTime(null)
    setNotes('')
    setEditingId(null)
    setDayOffset(0)
  }

  const deleteAppointment = (id: string) => {
    const updated = appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' as const } : apt
    )
    setAppointments(updated)
    localStorage.setItem('appointments', JSON.stringify(updated))
    toast({
      title: 'Consulta cancelada',
      description: 'A consulta foi cancelada e movida para o histórico.',
    })
  }

  const startEdit = (apt: Appointment) => {
    setEditingId(apt.id)
    setSelectedDate(new Date(apt.date))
    setSelectedTime({ date: new Date(apt.date), time: apt.time })
    setNotes(apt.notes)
    setShowNewAppointment(true)
  }

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())

  const twoDays = getTwoDaysSlots()

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    // Apenas permite scroll, sem carregar mais dias automaticamente
  }

  const navigateDays = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setDayOffset(prev => prev - 7)
    } else if (direction === 'next') {
      setDayOffset(prev => prev + 7)
    }
  }

  if (showNewAppointment) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl">
          <Button
            variant="ghost"
            onClick={resetForm}
            className="mb-6 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-8">
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Remarcar Consulta' : 'Agendar Nova Consulta'}
                </h1>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Psicólogo(a)</Label>
                <div className="p-3 border rounded-lg flex items-center gap-2 bg-white">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Dr. Angelica</span>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-4 block">
                  Selecione um horário
                </Label>
                
                <div className="flex gap-6">
                  <div className="w-80 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newMonth = new Date(calendarMonth)
                          newMonth.setMonth(newMonth.getMonth() - 1)
                          setCalendarMonth(newMonth)
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="font-medium text-sm capitalize">
                        {calendarMonth.toLocaleDateString('pt-BR', { month: 'long' })} de {calendarMonth.getFullYear()}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => {
                          const newMonth = new Date(calendarMonth)
                          newMonth.setMonth(newMonth.getMonth() + 1)
                          setCalendarMonth(newMonth)
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg p-3">
                      <div className="grid grid-cols-7 gap-1.5 mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                    
                      <div className="grid grid-cols-7 gap-1.5">
                        {(() => {
                          const year = calendarMonth.getFullYear()
                          const month = calendarMonth.getMonth()
                          const firstDay = new Date(year, month, 1).getDay()
                          const daysInMonth = new Date(year, month + 1, 0).getDate()
                          const days = []
                          
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          
                          for (let i = 0; i < firstDay; i++) {
                            days.push(<div key={`empty-${i}`} className="aspect-square" />)
                          }
                          
                          for (let day = 1; day <= daysInMonth; day++) {
                            const date = new Date(year, month, day)
                            const isSelected = selectedDate?.toDateString() === date.toDateString()
                            const isToday = new Date().toDateString() === date.toDateString()
                            const checkDate = new Date(date)
                            checkDate.setHours(0, 0, 0, 0)
                            const isPast = checkDate < today
                            const isWeekend = date.getDay() === 0 || date.getDay() === 6
                            const isDisabled = isPast || isWeekend
                            
                            days.push(
                              <button
                                key={day}
                                onClick={() => {
                                  if (!isDisabled) {
                                    setSelectedDate(date)
                                    setDayOffset(0)
                                  }
                                }}
                                disabled={isDisabled}
                                className={`
                                  aspect-square flex items-center justify-center text-xs rounded-full
                                  transition-colors
                                  ${isDisabled ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}
                                  ${isSelected ? 'bg-green-600 text-white hover:bg-green-700 hover:text-white' : ''}
                                  ${isToday && !isSelected ? 'bg-green-100 text-green-600 font-semibold' : ''}
                                `}
                              >
                                {day}
                              </button>
                            )
                          }
                          
                          return days
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <div 
                      className="grid grid-cols-7 gap-2 max-h-[420px] overflow-y-auto pr-2"
                    >
                      {twoDays.map((day, dayIndex) => {
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6
                        return (
                          <div key={dayIndex} className="flex flex-col min-w-[90px]">
                            <div className="text-center mb-2 pb-2 border-b sticky top-0 bg-white z-10">
                              <div className="text-xs text-gray-500 uppercase mb-0.5">
                                {getDayName(day).slice(0, 3)}.
                              </div>
                              <div className={`text-2xl font-bold ${
                                selectedDate?.toDateString() === day.toDateString()
                                  ? 'bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mx-auto'
                                  : ''
                              }`}>
                                {day.getDate()}
                              </div>
                            </div>
                            <div className="space-y-1.5 flex-1">
                              {TIME_SLOTS.map((time, timeIndex) => {
                                const available = isTimeAvailable(day, time)
                                const isSelected = isTimeSelected(day, time)
                                
                                return (
                                  <Button
                                    key={timeIndex}
                                    variant="outline"
                                    disabled={!available || isWeekend}
                                    className={`w-full h-9 text-xs font-medium ${
                                      isSelected
                                        ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white'
                                        : available && !isWeekend
                                        ? 'hover:border-green-600 bg-white'
                                        : 'opacity-30 bg-gray-50'
                                    }`}
                                    onClick={() => {
                                      if (available && !isWeekend) {
                                        toggleTimeSelection(day, time)
                                      }
                                    }}
                                  >
                                    {available && !isWeekend ? time : '—'}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Observações (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre a consulta..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button
                  onClick={saveAppointment}
                  className="bg-green-600 hover:bg-green-700 h-12 text-base"
                  disabled={!selectedTime}
                >
                  Confirmar Agendamento
                </Button>
                <Button 
                  variant="outline" 
                  onClick={resetForm}
                  className="h-12 text-base"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Dialog open={showPastDateDialog} onOpenChange={setShowPastDateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Consulta Passada</DialogTitle>
              <DialogDescription>
                Você está agendando uma consulta em uma data passada. A consulta já foi realizada?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => handlePastDateConfirm(false)}
              >
                Não, agendar normalmente
              </Button>
              <Button
                onClick={() => handlePastDateConfirm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Sim, já foi realizada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Agendar Consultas</h1>
            <p className="text-gray-600">Gerencie seus compromissos terapêuticos</p>
          </div>
          <Button
            onClick={() => setShowNewAppointment(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Próximas Consultas</h2>
          
          {upcomingAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma consulta agendada</h3>
                <p className="text-gray-600 mb-4">
                  Clique em "Nova Consulta" para agendar
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(apt => (
                <Card key={apt.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-gray-900">{apt.therapistName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="w-4 h-4" />
                          {new Date(apt.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {apt.time}
                        </div>
                      </div>
                      {apt.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mt-2">{apt.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(apt)}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAppointment(apt.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
