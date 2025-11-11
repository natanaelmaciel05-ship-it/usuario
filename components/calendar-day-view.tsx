"use client"

import type { EmotionRecord } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { EmotionIndicator } from "@/components/emotion-indicator"
import { formatDate } from "@/lib/calendar-utils"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CalendarDayViewProps {
  date: Date
  records: EmotionRecord[]
  onAddRecord: () => void
  onSelectRecord: (record: EmotionRecord) => void
}

export function CalendarDayView({ date, records, onAddRecord, onSelectRecord }: CalendarDayViewProps) {
  const dayRecords = records.filter((record) => formatDate(record.date) === formatDate(date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{date.toLocaleDateString("pt-BR", { weekday: "long" })}</h2>
        <Button onClick={onAddRecord} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Registro
        </Button>
      </div>

      <div className="space-y-3">
        {dayRecords.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum registro para este dia</p>
            <p className="mt-2 text-sm text-muted-foreground">Clique em "Adicionar Registro" para começar</p>
          </Card>
        ) : (
          dayRecords.map((record) => (
            <Card
              key={record.id}
              className="cursor-pointer p-4 transition-colors hover:bg-accent"
              onClick={() => onSelectRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <EmotionIndicator emotion={record.emotion} intensity={record.intensity} showLabel size="lg" />
                    <span className="text-sm text-muted-foreground">Intensidade: {record.intensity}/5</span>
                  </div>
                  {record.note && <p className="text-sm text-foreground line-clamp-2">{record.note}</p>}
                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {record.tags.map((tag) => (
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
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
