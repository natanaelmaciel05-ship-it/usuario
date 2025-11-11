"use client"

import type { EmotionRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { EmotionIndicator } from "@/components/emotion-indicator"
import { getMonthDays, formatDate, getDayName, isSameDay } from "@/lib/calendar-utils"
import { cn } from "@/lib/utils"

interface CalendarMonthViewProps {
  date: Date
  records: EmotionRecord[]
  onSelectDate: (date: Date) => void
}

export function CalendarMonthView({ date, records, onSelectDate }: CalendarMonthViewProps) {
  const monthDays = getMonthDays(date.getFullYear(), date.getMonth())
  const today = new Date()

  const getRecordsForDate = (targetDate: Date) => {
    return records.filter((record) => formatDate(record.date) === formatDate(targetDate))
  }

  const isCurrentMonth = (day: Date) => {
    return day.getMonth() === date.getMonth()
  }

  return (
    <div className="space-y-2">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground">
            {getDayName(day)}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {monthDays.map((day) => {
          const dayRecords = getRecordsForDate(day)
          const isToday = isSameDay(day, today)
          const inCurrentMonth = isCurrentMonth(day)

          return (
            <Card
              key={day.toISOString()}
              className={cn(
                "aspect-square cursor-pointer p-2 transition-colors hover:bg-accent",
                !inCurrentMonth && "opacity-40",
                isToday && "border-primary",
              )}
              onClick={() => onSelectDate(day)}
            >
              <div className="flex h-full flex-col">
                <div className={cn("text-sm font-medium", isToday && "text-primary")}>{day.getDate()}</div>

                <div className="mt-1 flex flex-wrap gap-0.5">
                  {dayRecords.slice(0, 4).map((record) => (
                    <EmotionIndicator key={record.id} emotion={record.emotion} intensity={record.intensity} size="sm" />
                  ))}
                  {dayRecords.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{dayRecords.length - 4}</span>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
