"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { CalendarHeader } from "@/components/calendar-header"
import { CalendarDayView } from "@/components/calendar-day-view"
import { CalendarWeekView } from "@/components/calendar-week-view"
import { CalendarMonthView } from "@/components/calendar-month-view"
import { EmotionRecordModal } from "@/components/emotion-record-modal"
import { SearchFilterPanel, type FilterOptions } from "@/components/search-filter-panel"
import { NotificationsSettingsModal } from "@/components/notifications-settings-modal"
import { useEmotionRecords } from "@/hooks/use-emotion-records"
import { useNotifications } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Bell } from "lucide-react"
import type { ViewMode, EmotionRecord } from "@/lib/types"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [modalOpen, setModalOpen] = useState(false)
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<EmotionRecord | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterOptions>({
    emotions: [],
    dateRange: {},
    tags: [],
    intensityRange: { min: 1, max: 5 },
  })

  const { records, addRecord, updateRecord, deleteRecord, filterRecords, getAllTags } = useEmotionRecords()
  const { settings: notificationSettings, updateSettings: updateNotificationSettings } = useNotifications()

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

  const filteredRecords = filterRecords(searchQuery, filters)
  const availableTags = getAllTags()

  const handlePrevious = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleSelectDate = (date: Date) => {
    setCurrentDate(date)
    setViewMode("day")
  }

  const handleAddRecord = () => {
    setSelectedRecord(undefined)
    setSelectedDate(currentDate)
    setModalOpen(true)
  }

  const handleSelectRecord = (record: EmotionRecord) => {
    setSelectedRecord(record)
    setSelectedDate(undefined)
    setModalOpen(true)
  }

  const handleSaveRecord = (record: Omit<EmotionRecord, "id"> | EmotionRecord) => {
    if ("id" in record) {
      updateRecord(record)
    } else {
      addRecord(record)
    }
  }

  const handleDeleteRecord = (id: string) => {
    deleteRecord(id)
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Calendário Emocional</h1>
            <p className="text-sm text-muted-foreground">Acompanhe suas emoções diariamente</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setNotificationsModalOpen(true)}>
                <Bell className="mr-2 h-4 w-4" />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <SearchFilterPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filters={filters}
          onFiltersChange={setFilters}
          availableTags={availableTags}
        />

        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onViewModeChange={setViewMode}
        />

        <div className="mt-6">
          {viewMode === "day" && (
            <CalendarDayView
              date={currentDate}
              records={records}
              onAddRecord={handleAddRecord}
              onSelectRecord={handleSelectRecord}
            />
          )}
          {viewMode === "week" && (
            <CalendarWeekView
              date={currentDate}
              records={records}
              onSelectDate={handleSelectDate}
              onSelectRecord={handleSelectRecord}
            />
          )}
          {viewMode === "month" && (
            <CalendarMonthView date={currentDate} records={records} onSelectDate={handleSelectDate} />
          )}
        </div>

        <EmotionRecordModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveRecord}
          onDelete={handleDeleteRecord}
          record={selectedRecord}
          selectedDate={selectedDate}
        />

        <NotificationsSettingsModal
          open={notificationsModalOpen}
          onClose={() => setNotificationsModalOpen(false)}
          settings={notificationSettings}
          onSave={updateNotificationSettings}
        />
      </div>
    </div>
  )
}
