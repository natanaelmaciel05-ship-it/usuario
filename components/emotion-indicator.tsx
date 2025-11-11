import { type EmotionType, emotionColors, emotionLabels } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EmotionIndicatorProps {
  emotion: EmotionType
  intensity?: number
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

export function EmotionIndicator({ emotion, intensity = 3, showLabel = false, size = "md" }: EmotionIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn("rounded-full", emotionColors[emotion], sizeClasses[size])}
        style={{ opacity: intensity / 5 }}
      />
      {showLabel && <span className="text-xs text-muted-foreground">{emotionLabels[emotion]}</span>}
    </div>
  )
}
