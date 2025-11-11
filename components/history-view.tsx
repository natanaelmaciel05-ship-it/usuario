"use client"

import { Card } from "@/components/ui/card"
import { EmotionIndicator } from "@/components/emotion-indicator"
import type { EmotionRecord } from "@/lib/types"
import { formatDate } from "@/lib/calendar-utils"

interface HistoryViewProps {
  records: EmotionRecord[]
  onSelectRecord: (record: EmotionRecord) => void
}

export function HistoryView({ records, onSelectRecord }: HistoryViewProps) {
  // Group records by date
  const groupedRecords = records.reduce(
    (acc, record) => {
      const dateKey = formatDate(record.date, "long")
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(record)
      return acc
    },
    {} as Record<string, EmotionRecord[]>,
  )

  const sortedDates = Object.keys(groupedRecords).sort((a, b) => {
    const dateA = groupedRecords[a][0].date
    const dateB = groupedRecords[b][0].date
    return dateB.getTime() - dateA.getTime()
  })

  if (records.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum registro encontrado</p>
        <p className="mt-2 text-sm text-muted-foreground">Tente ajustar os filtros ou busca</p>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateKey) => (
        <div key={dateKey} className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">{dateKey}</h3>
          <div className="space-y-2">
            {groupedRecords[dateKey].map((record) => (
              <Card
                key={record.id}
                className="cursor-pointer p-4 transition-colors hover:bg-accent"
                onClick={() => onSelectRecord(record)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <EmotionIndicator emotion={record.emotion} intensity={record.intensity} showLabel size="lg" />
                      <span className="text-sm text-muted-foreground">Intensidade: {record.intensity}/5</span>
                    </div>
                    {record.note && <p className="text-sm text-foreground">{record.note}</p>}
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
                  <div className="text-xs text-muted-foreground">
                    {record.date.toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
