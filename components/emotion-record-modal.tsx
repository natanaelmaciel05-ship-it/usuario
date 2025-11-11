"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Trash2 } from "lucide-react"
import type { EmotionRecord, EmotionType } from "@/lib/types"
import { emotionLabels } from "@/lib/types"

interface EmotionRecordModalProps {
  open: boolean
  onClose: () => void
  onSave: (record: Omit<EmotionRecord, "id"> | EmotionRecord) => void
  onDelete?: (id: string) => void
  record?: EmotionRecord
  selectedDate?: Date
}

export function EmotionRecordModal({ open, onClose, onSave, onDelete, record, selectedDate }: EmotionRecordModalProps) {
  const [emotion, setEmotion] = useState<EmotionType>("calm")
  const [note, setNote] = useState("")
  const [intensity, setIntensity] = useState(3)
  const [tags, setTags] = useState("")

  useEffect(() => {
    if (record) {
      setEmotion(record.emotion)
      setNote(record.note)
      setIntensity(record.intensity)
      setTags(record.tags?.join(", ") || "")
    } else {
      // Reset form for new record
      setEmotion("calm")
      setNote("")
      setIntensity(3)
      setTags("")
    }
  }, [record, open])

  const handleSave = () => {
    const recordData = {
      ...(record && { id: record.id }),
      date: record?.date || selectedDate || new Date(),
      emotion,
      note,
      intensity,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t),
    }

    onSave(recordData as EmotionRecord)
    onClose()
  }

  const handleDelete = () => {
    if (record && onDelete) {
      onDelete(record.id)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? "Editar Registro" : "Novo Registro Emocional"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Emotion Selection */}
          <div className="space-y-2">
            <Label htmlFor="emotion">Como você está se sentindo?</Label>
            <Select value={emotion} onValueChange={(value) => setEmotion(value as EmotionType)}>
              <SelectTrigger id="emotion">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(emotionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-2">
            <Label>Intensidade: {intensity}/5</Label>
            <Slider value={[intensity]} onValueChange={(value) => setIntensity(value[0])} min={1} max={5} step={1} />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Leve</span>
              <span>Moderado</span>
              <span>Intenso</span>
            </div>
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">O que aconteceu? Como você se sente?</Label>
            <Textarea
              id="note"
              placeholder="Descreva seus sentimentos, pensamentos ou o que aconteceu hoje..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              placeholder="ex: trabalho, família, terapia"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <div>
            {record && onDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
