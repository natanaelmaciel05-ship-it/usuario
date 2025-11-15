'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CalendarIcon, Clock, Plus, Trash2, ChevronLeft, ChevronRight, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
  '9:00am',
  '10:00am',
  '11:00am',
  '12:00pm',
  '1:00pm',
  '2:00pm',
  '3:00pm',
  '4:00pm',
  '5:00pm'
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTimes, setSelectedTimes] = useState<Array<{date: Date, time: string}>>([])
  const [notes, setNotes] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(new Date())
  const [dayOffset, setDayOffset] = useState(0)
  const [showPastDateDialog, setShowPastDateDialog] = useState(false)
  const [pendingAppointment, setPendingAppointment] = useState<Appointment | null>(null)
  const { toast } = useToast()

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
      `${dateStr}-12:00pm`,
    ]
    return !unavailable.includes(`${dateStr}-${time}`)
  }

  const getTwoDaysSlots = () => {
    const days = []
    for (let i = 0; i < 5; i++) {
      const date = new Date(selectedDate)
      date.setDate(date.getDate() + dayOffset + i)
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
    const existing = selectedTimes.findIndex(
      slot => slot.date.toDateString() === dateStr && slot.time === time
    )
    
    if (existing !== -1) {
      setSelectedTimes(selectedTimes.filter((_, i) => i !== existing))
    } else {
      if (selectedTimes.length < 2) {
        setSelectedTimes([...selectedTimes, { date: day, time }])
      } else {
        toast({
          title: 'Limite atingido',
          description: 'Você pode selecionar no máximo 2 horários.',
          variant: 'destructive'
        })
      }
    }
  }

  const isTimeSelected = (day: Date, time: string) => {
    return selectedTimes.some(
      slot => slot.date.toDateString() === day.toDateString() && slot.time === time
    )
  }

  const saveAppointment = () => {
    if (!selectedDate || selectedTimes.length === 0) return
    
    const newAppointments: Appointment[] = selectedTimes.map(slot => ({
      id: Date.now().toString() + Math.random(),
      therapistName: 'Dr. Angelica',
      date: slot.date.toISOString().split('T')[0],
      time: slot.time,
      notes: notes,
      status: 'scheduled',
      originalId: editingId || undefined
    }))

    const hasPastDate = newAppointments.some(apt => 
      isDateInPast(apt.date, apt.time)
    )

    if (hasPastDate) {
      setPendingAppointment(newAppointments[0])
      setShowPastDateDialog(true)
      return
    }

    saveMultipleAppointments(newAppointments)
  }

  const saveMultipleAppointments = (newAppointments: Appointment[], completed: boolean = false) => {
    const finalAppointments = completed 
      ? newAppointments.map(apt => ({ ...apt, status: 'completed' as const }))
      : newAppointments
    
    const updated = editingId
      ? [
          ...appointments.map(apt => 
            apt.id === editingId 
              ? { ...apt, status: 'rescheduled' as const } 
              : apt
          ),
          ...finalAppointments
        ]
      : [...appointments, ...finalAppointments]

    setAppointments(updated)
    localStorage.setItem('appointments', JSON.stringify(updated))
    
    toast({
      title: completed 
        ? 'Consultas registradas no histórico' 
        : editingId 
        ? 'Consulta remarcada com sucesso' 
        : `${finalAppointments.length} consulta${finalAppointments.length > 1 ? 's' : ''} agendada${finalAppointments.length > 1 ? 's' : ''} com sucesso`,
      description: completed 
        ? `${finalAppointments.length} consulta${finalAppointments.length > 1 ? 's foram marcadas' : ' foi marcada'} como realizada.`
        : `${finalAppointments.length} horário${finalAppointments.length > 1 ? 's agendados' : ' agendado'}`,
    })
    
    resetForm()
  }

  const handlePastDateConfirm = (wasCompleted: boolean) => {
    if (selectedTimes.length > 0) {
      const newAppointments: Appointment[] = selectedTimes.map(slot => ({
        id: Date.now().toString() + Math.random(),
        therapistName: 'Dr. Angelica',
        date: slot.date.toISOString().split('T')[0],
        time: slot.time,
        notes: notes,
        status: 'scheduled',
        originalId: editingId || undefined
      }))
      saveMultipleAppointments(newAppointments, wasCompleted)
    }
    setShowPastDateDialog(false)
    setPendingAppointment(null)
  }

  const resetForm = () => {
    setShowNewAppointment(false)
    setSelectedDate(new Date())
    setSelectedTimes([])
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
    setSelectedTimes([{ date: new Date(apt.date), time: apt.time }])
    setNotes(apt.notes)
    setShowNewAppointment(true)
  }

  const upcomingAppointments = appointments
    .filter(apt => apt.status === 'scheduled')
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())

  const twoDays = getTwoDaysSlots()

  if (showNewAppointment) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl">
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
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  {editingId ? 'Remarcar Consulta' : 'Agendar Nova Consulta'}
                </h1>
                <p className="text-sm text-red-600">
                  Selecione o horário desejado com Dr. Angelica
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">Psicólogo(a)</Label>
                <div className="p-3 border rounded-lg flex items-center gap-2 bg-white">
                  <User className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Dr. Angelica</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">
                    Selecione um horário
                    {selectedTimes.length > 0 && (
                      <span className="text-green-600 ml-2">
                        ({selectedTimes.length}/2 selecionado{selectedTimes.length > 1 ? 's' : ''})
                      </span>
                    )}
                  </Label>
                  <span className="text-xs text-gray-500">
                    (GMT-03:00) Horário Padrão de Brasília - São Paulo
                  </span>
                </div>
                
                <div className="grid grid-cols-[300px_1fr] gap-8">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
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
                        className="h-8 w-8"
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
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                    
                      <div className="grid grid-cols-7 gap-1">
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
                                  aspect-square flex items-center justify-center text-sm rounded-full
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

                  <div className="flex flex-col">
                    <div className="grid grid-cols-5 gap-3 flex-1">
                      {twoDays.map((day, dayIndex) => (
                        <div key={dayIndex} className="flex flex-col min-w-[140px]">
                          <div className="text-center mb-3 pb-3 border-b">
                            <div className="text-xs text-gray-500 uppercase mb-1">
                              {getDayName(day)}
                            </div>
                            <div className="text-2xl font-semibold">
                              {day.getDate()}
                            </div>
                          </div>
                          <div className="space-y-2 flex-1">
                            {TIME_SLOTS.map((time, timeIndex) => {
                              const available = isTimeAvailable(day, time)
                              const isSelected = isTimeSelected(day, time)
                              
                              return (
                                <Button
                                  key={timeIndex}
                                  variant="outline"
                                  disabled={!available}
                                  className={`w-full h-11 ${
                                    isSelected
                                      ? 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:text-white'
                                      : available
                                      ? 'hover:border-green-600'
                                      : 'opacity-40'
                                  }`}
                                  onClick={() => {
                                    if (available) {
                                      toggleTimeSelection(day, time)
                                    }
                                  }}
                                >
                                  {available ? time : '—'}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDayOffset(prev => prev - 5)}
                        className="shrink-0"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <div className="flex-1 relative h-1 bg-gray-200 rounded-full cursor-pointer group">
                        <div 
                          className="absolute inset-y-0 left-0 bg-green-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (dayOffset / 30) * 100 + 16)}%` }}
                        />
                        <div 
                          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-600 rounded-full shadow-md transition-all group-hover:scale-110"
                          style={{ left: `calc(${Math.min(100, (dayOffset / 30) * 100 + 16)}% - 8px)` }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDayOffset(prev => prev + 5)}
                        className="shrink-0"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
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
                  disabled={selectedTimes.length === 0}
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
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(apt)}
                        className="text-green-600 border-green-600 hover:bg-green-50"
                      >
                        Remarcar
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
