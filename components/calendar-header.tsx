"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { ViewMode } from "@/lib/types"
import { getMonthName } from "@/lib/calendar-utils"

interface CalendarHeaderProps {
  currentDate: Date
  viewMode: ViewMode
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewModeChange: (mode: ViewMode) => void
}

export function CalendarHeader({
  currentDate,
  viewMode,
  onPrevious,
  onNext,
  onToday,
  onViewModeChange,
}: CalendarHeaderProps) {
  const getHeaderText = () => {
    if (viewMode === "month") {
      return `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`
    }
    if (viewMode === "week") {
      return `Semana de ${currentDate.toLocaleDateString("pt-BR")}`
    }
    return currentDate.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-semibold text-balance">{getHeaderText()}</h1>
        <Button variant="outline" size="sm" onClick={onToday}>
          Hoje
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1">
          <Button
            variant={viewMode === "day" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("day")}
          >
            Dia
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("week")}
          >
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("month")}
          >
            Mês
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={onPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
