"use client"

import type { EmotionRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { EmotionIndicator } from "@/components/emotion-indicator"
import { getWeekDays, formatDate, getDayName, isSameDay } from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"

interface CalendarWeekViewProps {
  date: Date
  records: EmotionRecord[]
  onSelectDate: (date: Date) => void
  onSelectRecord: (record: EmotionRecord) => void
}

export function CalendarWeekView({ date, records, onSelectDate, onSelectRecord }: CalendarWeekViewProps) {
  const weekDays = getWeekDays(date)
  const today = new Date()

  const getRecordsForDate = (targetDate: Date) => {
    return records.filter((record) => formatDate(record.date) === formatDate(targetDate))
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
      {weekDays.map((day) => {
        const dayRecords = getRecordsForDate(day)
        const isToday = isSameDay(day, today)

        return (
          <Card
            key={day.toISOString()}
            className={cn("cursor-pointer p-3 transition-colors hover:bg-accent", isToday && "border-primary")}
            onClick={() => onSelectDate(day)}
          >
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-xs font-medium text-muted-foreground">{getDayName(day.getDay())}</div>
                <div className={cn("text-lg font-semibold", isToday && "text-primary")}>{day.getDate()}</div>
              </div>

              <div className="space-y-1">
                {dayRecords.length === 0 ? (
                  <div className="py-2 text-center text-xs text-muted-foreground">Sem registros</div>
                ) : (
                  dayRecords.slice(0, 3).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center gap-1.5 rounded-md bg-background p-1.5"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectRecord(record)
                      }}
                    >
                      <EmotionIndicator emotion={record.emotion} intensity={record.intensity} size="sm" />
                      <span className="truncate text-xs">{record.note.substring(0, 20)}</span>
                    </div>
                  ))
                )}
                {dayRecords.length > 3 && (
                  <div className="text-center text-xs text-muted-foreground">+{dayRecords.length - 3} mais</div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
