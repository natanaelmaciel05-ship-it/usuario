'use client'

import DashboardLayout from '@/components/dashboard-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ChevronLeft, ChevronRight, Filter, MoreVertical, Plus, Search, Trash2, Bell, X } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'

type EmotionalRecord = {
  id: string
  date: string
  emotion: string
  intensity: number
  description: string
  tags: string[]
}

const EMOTIONS = [
  'Feliz',
  'Ansioso(a)',
  'Com raiva',
  'Estressado(a)',
  'Triste',
]

const FILTER_EMOTIONS = [
  'Feliz',
  'Ansioso(a)',
  'Com raiva',
  'Estressado(a)',
  'Triste',
]

const LOCATIONS = [
  'Trabalho',
  'Casa',
  'Família',
  'Sozinho(a)',
  'Amigos',
  'Escola/Universidade',
  'Academia',
  'Terapia',
  'Viagem',
  'Outro',
]

export default function HomePage() {
  const [view, setView] = useState<'day' | 'week' | 'month'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [records, setRecords] = useState<EmotionalRecord[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<EmotionalRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [notificationsPermission, setNotificationsPermission] = useState<'default' | 'granted' | 'denied'>('default')
  
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    emotions: [] as string[],
    startDate: '',
    endDate: '',
    minIntensity: 1,
    maxIntensity: 5,
  })
  
  const [formData, setFormData] = useState({
    emotion: 'Feliz',
    intensity: 3,
    description: '',
    tags: '',
  })

  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)
  const [endDatePickerOpen, setEndDatePickerOpen] = useState(false)

  const filtersRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()
  const [notificationPermissionGranted, setNotificationPermissionGranted] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const stored = localStorage.getItem('emotionalRecords')
    if (stored) {
      setRecords(JSON.parse(stored))
    }
    
    const notifEnabled = localStorage.getItem('notificationsEnabled') === 'true'
    setNotificationsEnabled(notifEnabled)
    
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission)
      setNotificationPermissionGranted(Notification.permission === 'granted')
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setIsFiltersOpen(false)
      }
    }

    if (isFiltersOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isFiltersOpen])

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationsPermission(permission)
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        setNotificationPermissionGranted(true)
        localStorage.setItem('notificationsEnabled', 'true')
        toast({
          title: 'Vinculação concluída',
          description: 'Notificações foram ativadas com sucesso',
        })
        setIsNotificationsDialogOpen(false)
      } else {
        toast({
          title: 'Permissão negada',
          description: 'Você negou a permissão de notificações',
          variant: 'destructive',
        })
      }
    }
  }

  const saveNotificationSettings = () => {
    localStorage.setItem('notificationsEnabled', notificationsEnabled.toString())
    setIsNotificationsDialogOpen(false)
  }

  const toggleEmotionFilter = (emotion: string) => {
    setFilters(prev => ({
      ...prev,
      emotions: prev.emotions.includes(emotion)
        ? prev.emotions.filter(e => e !== emotion)
        : [...prev.emotions, emotion]
    }))
  }

  const saveRecords = (newRecords: EmotionalRecord[]) => {
    setRecords(newRecords)
    localStorage.setItem('emotionalRecords', JSON.stringify(newRecords))
  }

  const handleAddRecord = () => {
    const newRecord: EmotionalRecord = {
      id: Date.now().toString(),
      date: currentDate.toISOString().split('T')[0],
      emotion: formData.emotion,
      intensity: formData.intensity,
      description: formData.description,
      tags: formData.tags ? [formData.tags] : [],
    }
    saveRecords([...records, newRecord])
    setIsAddDialogOpen(false)
    resetForm()
  }

  const handleEditRecord = () => {
    if (!editingRecord) return
    const updated = records.map(r =>
      r.id === editingRecord.id
        ? {
            ...editingRecord,
            emotion: formData.emotion,
            intensity: formData.intensity,
            description: formData.description,
            tags: formData.tags ? [formData.tags] : [],
          }
        : r
    )
    saveRecords(updated)
    setIsEditDialogOpen(false)
    setEditingRecord(null)
    resetForm()
  }

  const handleDeleteRecord = (id: string) => {
    saveRecords(records.filter(r => r.id !== id))
    setIsEditDialogOpen(false)
    setEditingRecord(null)
  }

  const resetForm = () => {
    setFormData({
      emotion: 'Feliz',
      intensity: 3,
      description: '',
      tags: '',
    })
  }

  const openEditDialog = (record: EmotionalRecord) => {
    setEditingRecord(record)
    setFormData({
      emotion: record.emotion,
      intensity: record.intensity,
      description: record.description,
      tags: record.tags[0] || '',
    })
    setIsEditDialogOpen(true)
  }

  const openAddDialog = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const getRecordsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredRecords.filter(r => r.date === dateStr)
  }

  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const formatDate = (date: Date) => {
    if (view === 'day') {
      return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    } else if (view === 'month') {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    } else if (view === 'week') {
      const weekDays = getWeekDays()
      const firstDay = weekDays[0]
      const lastDay = weekDays[6]
      return `Semana de ${firstDay.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`
    }
    return date.toLocaleDateString('pt-BR')
  }

  const getCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days: (Date | null)[] = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -(startingDayOfWeek - i - 1))
      days.push(prevDate)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    const remainingDays = 7 - (days.length % 7)
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i))
      }
    }
    
    return days
  }

  const getWeekDays = () => {
    const days: Date[] = []
    const current = new Date(currentDate)
    
    // Get the day of week (0 = Sunday, 6 = Saturday)
    const dayOfWeek = current.getDay()
    
    // Calculate the start of the week (Sunday)
    const startOfWeek = new Date(current)
    startOfWeek.setDate(current.getDate() - dayOfWeek)
    
    // Generate 7 days starting from Sunday
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesEmotion = filters.emotions.length === 0 || filters.emotions.includes(r.emotion)
    
    const recordDate = new Date(r.date)
    const matchesStartDate = !filters.startDate || recordDate >= new Date(filters.startDate)
    const matchesEndDate = !filters.endDate || recordDate <= new Date(filters.endDate)
    
    const matchesIntensity = r.intensity >= filters.minIntensity && r.intensity <= filters.maxIntensity
    
    return matchesSearch && matchesEmotion && matchesStartDate && matchesEndDate && matchesIntensity
  })

  const renderDayView = () => {
    const dayRecords = filteredRecords.filter(r => r.date === currentDate.toISOString().split('T')[0])

    return (
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">
          {currentDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
        </h3>
        
        {dayRecords.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">Nenhum registro para este dia</p>
            <p className="text-gray-400 text-sm">Clique em "Adicionar Registro" para começar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {dayRecords.map(record => (
              <div
                key={record.id}
                className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-green-300 transition-colors"
                onClick={() => openEditDialog(record)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="font-medium text-gray-900">{record.emotion}</span>
                  <span className="text-gray-500">Intensidade: {record.intensity}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays()
    const weekDayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((date, idx) => {
          const dayRecords = getRecordsForDate(date)
          const today = isToday(date)
          
          return (
            <div
              key={idx}
              className={`bg-white rounded-lg border-2 p-4 transition-all cursor-pointer hover:shadow-md ${
                today ? 'border-green-500' : 'border-gray-200'
              }`}
              onClick={() => {
                setCurrentDate(date)
                setView('day')
              }}
            >
              <div className="text-center mb-4">
                <div className="text-sm text-gray-600 mb-1">{weekDayNames[idx]}</div>
                <div className={`text-2xl font-bold ${today ? 'text-green-600' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
              </div>
              
              {dayRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Sem registros</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dayRecords.map(record => (
                    <div
                      key={record.id}
                      className="text-xs bg-green-100 text-green-800 rounded px-2 py-1.5 cursor-pointer hover:bg-green-200 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        openEditDialog(record)
                      }}
                    >
                      <div className="font-medium truncate">{record.emotion}</div>
                      <div className="text-green-600">Intensidade: {record.intensity}/5</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMonthView = () => {
    const days = getCalendarDays()
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((date, idx) => {
            if (!date) return <div key={idx} className="aspect-square border-b border-r border-gray-200" />
            
            const dayRecords = getRecordsForDate(date)
            const today = isToday(date)
            const currentMonth = isCurrentMonth(date)
            
            return (
              <div
                key={idx}
                className={`aspect-square border-b border-r border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !currentMonth ? 'bg-gray-50' : ''
                } ${today ? 'ring-2 ring-green-500 ring-inset' : ''}`}
                onClick={() => {
                  setCurrentDate(date)
                  setView('day')
                }}
              >
                <div className={`text-sm font-medium mb-1 ${!currentMonth ? 'text-gray-400' : 'text-gray-900'}`}>
                  {date.getDate()}
                </div>
                {dayRecords.length > 0 && (
                  <div className="space-y-1">
                    {dayRecords.slice(0, 2).map(record => (
                      <div
                        key={record.id}
                        className="text-xs bg-green-100 text-green-800 rounded px-1 py-0.5 truncate"
                      >
                        {record.emotion}
                      </div>
                    ))}
                    {dayRecords.length > 2 && (
                      <div className="text-xs text-gray-500">+{dayRecords.length - 2} mais</div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const clearFilters = () => {
    setFilters({
      emotions: [],
      startDate: '',
      endDate: '',
      minIntensity: 1,
      maxIntensity: 5,
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.emotions.length > 0) count += filters.emotions.length
    if (filters.startDate) count++
    if (filters.endDate) count++
    if (filters.minIntensity > 1 || filters.maxIntensity < 5) count++
    return count
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Calendário Emocional</h1>
              <p className="text-gray-600">Acompanhe suas emoções diariamente</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={() => {
                    if (notificationPermissionGranted) {
                      toast({
                        title: 'Notificações já ativadas',
                        description: 'As notificações já estão habilitadas',
                      })
                    } else {
                      setIsNotificationsDialogOpen(true)
                    }
                  }}
                  className={notificationPermissionGranted ? 'bg-white' : ''}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Notificações
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar em notas, tags..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="gap-2 bg-green-100 hover:bg-green-200 text-green-700 border-green-300 relative"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                <Filter className="w-4 h-4" />
                Filtros
                {getActiveFiltersCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {getActiveFiltersCount()}
                  </span>
                )}
              </Button>
              {!isFiltersOpen && getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={clearFilters}
                  className="bg-red-50 hover:bg-red-100 text-red-600 border-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900 capitalize">
                {formatDate(currentDate)}
              </h2>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
            </div>
            
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'day' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dia
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'week' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Semana
                </button>
                <button
                  onClick={() => setView('month')}
                  className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                    view === 'month' ? 'bg-green-600 text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Mês
                </button>
              </div>

              {/* Navigation Arrows */}
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={goToPrevious}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {view === 'day' && (
            <div className="flex justify-end mb-6">
              <Button
                onClick={openAddDialog}
                className="bg-green-600 hover:bg-green-700 gap-2"
              >
                <Plus className="w-4 h-4" />
                Adicionar Registro
              </Button>
            </div>
          )}

          {/* Calendar Content */}
          {view === 'day' && renderDayView()}
          {view === 'week' && renderWeekView()}
          {view === 'month' && renderMonthView()}
        </div>

        {isFiltersOpen && (
          <div ref={filtersRef} className="w-80 bg-white rounded-lg border border-gray-200 shadow-lg h-fit sticky top-6">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
              <button 
                onClick={clearFilters}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Limpar
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* Emotions Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Emoções</h4>
                <div className="grid grid-cols-2 gap-3">
                  {FILTER_EMOTIONS.map(emotion => (
                    <div key={emotion} className="flex items-center space-x-2">
                      <Checkbox
                        id={`filter-${emotion}`}
                        checked={filters.emotions.includes(emotion)}
                        onCheckedChange={() => toggleEmotionFilter(emotion)}
                      />
                      <Label 
                        htmlFor={`filter-${emotion}`} 
                        className="text-sm text-gray-700 cursor-pointer leading-none"
                      >
                        {emotion}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Period Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Período</h4>
                <div className="space-y-3">
                  {/* Start Date */}
                  <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {filters.startDate ? (
                          new Date(filters.startDate + 'T00:00:00').toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-gray-500">Data inicial</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.startDate ? new Date(filters.startDate + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters({ ...filters, startDate: date.toISOString().split('T')[0] })
                          }
                          setStartDatePickerOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  {/* End Date */}
                  <Popover open={endDatePickerOpen} onOpenChange={setEndDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {filters.endDate ? (
                          new Date(filters.endDate + 'T00:00:00').toLocaleDateString('pt-BR')
                        ) : (
                          <span className="text-gray-500">Data final</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.endDate ? new Date(filters.endDate + 'T00:00:00') : undefined}
                        onSelect={(date) => {
                          if (date) {
                            setFilters({ ...filters, endDate: date.toISOString().split('T')[0] })
                          }
                          setEndDatePickerOpen(false)
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Intensity Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Intensidade</h4>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.minIntensity}
                    onChange={(e) => setFilters({ ...filters, minIntensity: Math.min(5, Math.max(1, parseInt(e.target.value) || 1)) })}
                    className="w-16 text-center"
                  />
                  <span className="text-sm text-gray-500">até</span>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={filters.maxIntensity}
                    onChange={(e) => setFilters({ ...filters, maxIntensity: Math.min(5, Math.max(1, parseInt(e.target.value) || 5)) })}
                    className="w-16 text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isNotificationsDialogOpen} onOpenChange={setIsNotificationsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Configurações de Notificações
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Permission Section */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <Bell className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">Permissão de Notificações</h4>
                  <p className="text-sm text-gray-600">
                    Para receber lembretes, você precisa permitir notificações do navegador.
                  </p>
                </div>
              </div>
              <Button 
                onClick={requestNotificationPermission}
                className={`w-full transition-colors ${
                  notificationPermissionGranted 
                    ? 'bg-white text-gray-900 hover:bg-gray-50 border border-gray-300' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {notificationPermissionGranted ? '✓ Notificações Ativadas' : 'Permitir Notificações'}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsNotificationsDialogOpen(false)} 
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Registro Emocional</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Como você está se sentindo?
              </label>
              <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intensidade: {formData.intensity}/5
              </label>
              <Slider
                value={[formData.intensity]}
                onValueChange={([value]) => setFormData({ ...formData, intensity: value })}
                min={1}
                max={5}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                O que aconteceu? Como você se sente?
              </label>
              <Textarea
                placeholder="Descreva seus sentimentos, pensamentos ou o que aconteceu hoje..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lugar que se encontrava
              </label>
              <Select value={formData.tags} onValueChange={(value) => setFormData({ ...formData, tags: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleAddRecord} className="flex-1 bg-green-600 hover:bg-green-700">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Registro</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Como você está se sentindo?
              </label>
              <Select value={formData.emotion} onValueChange={(value) => setFormData({ ...formData, emotion: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONS.map(emotion => (
                    <SelectItem key={emotion} value={emotion}>{emotion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Intensidade: {formData.intensity}/5
              </label>
              <Slider
                value={[formData.intensity]}
                onValueChange={([value]) => setFormData({ ...formData, intensity: value })}
                min={1}
                max={5}
                step={1}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Leve</span>
                <span>Moderado</span>
                <span>Intenso</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                O que aconteceu? Como você se sente?
              </label>
              <Textarea
                placeholder="Descreva seus sentimentos, pensamentos ou o que aconteceu hoje..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Lugar que se encontrava
              </label>
              <Select value={formData.tags} onValueChange={(value) => setFormData({ ...formData, tags: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um local" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="destructive"
                onClick={() => editingRecord && handleDeleteRecord(editingRecord.id)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditRecord} className="bg-green-600 hover:bg-green-700">
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
