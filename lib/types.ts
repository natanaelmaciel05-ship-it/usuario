export type EmotionType = "happy" | "sad" | "anxious" | "calm" | "angry" | "peaceful" | "stressed" | "hopeful"

export type ViewMode = "day" | "week" | "month"

export interface EmotionRecord {
  id: string
  date: Date
  emotion: EmotionType
  note: string
  intensity: number // 1-5 scale
  tags?: string[]
  isRecurring?: boolean
  recurringType?: "daily" | "weekly"
  sharedWith?: string[] // user IDs
  reminder?: Date
}

export interface SharedContact {
  id: string
  name: string
  email: string
  relationship: "psychologist" | "family" | "friend"
  hasAccess: boolean
  addedDate: Date
}

export const emotionColors: Record<EmotionType, string> = {
  happy: "bg-[var(--emotion-happy)]",
  sad: "bg-[var(--emotion-sad)]",
  anxious: "bg-[var(--emotion-anxious)]",
  calm: "bg-[var(--emotion-calm)]",
  angry: "bg-[var(--emotion-angry)]",
  peaceful: "bg-[var(--emotion-peaceful)]",
  stressed: "bg-[var(--emotion-stressed)]",
  hopeful: "bg-[var(--emotion-hopeful)]",
}

export const emotionLabels: Record<EmotionType, string> = {
  happy: "Feliz",
  sad: "Triste",
  anxious: "Ansioso(a)",
  calm: "Calmo(a)",
  angry: "Com Raiva",
  peaceful: "Em Paz",
  stressed: "Estressado(a)",
  hopeful: "Esperançoso(a)",
}
