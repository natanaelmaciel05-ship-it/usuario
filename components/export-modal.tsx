"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Download, FileText, Mail } from "lucide-react"
import { useState } from "react"
import type { EmotionRecord } from "@/lib/types"
import { emotionLabels } from "@/lib/types"

interface ExportModalProps {
  open: boolean
  onClose: () => void
  records: EmotionRecord[]
}

export function ExportModal({ open, onClose, records }: ExportModalProps) {
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({})

  const filterRecordsByDate = () => {
    if (!dateRange.from && !dateRange.to) return records

    return records.filter((record) => {
      if (dateRange.from && record.date < dateRange.from) return false
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (record.date > endOfDay) return false
      }
      return true
    })
  }

  const exportToPDF = () => {
    const filteredRecords = filterRecordsByDate()
    // In a real app, this would generate a PDF
    console.log("[v0] Exporting to PDF:", filteredRecords.length, "records")
    alert(`Exportando ${filteredRecords.length} registros para PDF`)
  }

  const exportToCSV = () => {
    const filteredRecords = filterRecordsByDate()
    const csvContent = [
      ["Data", "Emoção", "Intensidade", "Nota", "Tags"].join(","),
      ...filteredRecords.map((record) =>
        [
          record.date.toLocaleDateString("pt-BR"),
          emotionLabels[record.emotion],
          record.intensity,
          `"${record.note.replace(/"/g, '""')}"`,
          record.tags?.join("; ") || "",
        ].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `terapisys-registros-${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  const shareViaEmail = () => {
    const filteredRecords = filterRecordsByDate()
    console.log("[v0] Sharing via email:", filteredRecords.length, "records")
    alert(`Preparando ${filteredRecords.length} registros para compartilhar por email`)
  }

  const filteredCount = filterRecordsByDate().length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Registros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Exporte seus registros para compartilhar com seu psicólogo ou manter um backup pessoal.
          </p>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label>Período (opcional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    {dateRange.from ? dateRange.from.toLocaleDateString("pt-BR") : "Data inicial"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    {dateRange.to ? dateRange.to.toLocaleDateString("pt-BR") : "Data final"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <p className="text-xs text-muted-foreground">{filteredCount} registros serão exportados</p>
          </div>

          {/* Export Options */}
          <div className="space-y-2">
            <Button onClick={exportToPDF} variant="outline" className="w-full justify-start bg-transparent">
              <FileText className="mr-2 h-4 w-4" />
              Exportar como PDF
            </Button>
            <Button onClick={exportToCSV} variant="outline" className="w-full justify-start bg-transparent">
              <Download className="mr-2 h-4 w-4" />
              Exportar como CSV
            </Button>
            <Button onClick={shareViaEmail} variant="outline" className="w-full justify-start bg-transparent">
              <Mail className="mr-2 h-4 w-4" />
              Compartilhar por Email
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
