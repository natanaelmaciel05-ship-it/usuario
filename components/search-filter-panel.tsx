"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import type { EmotionType } from "@/lib/types"
import { emotionLabels } from "@/lib/types"

export interface FilterOptions {
  emotions: EmotionType[]
  dateRange: {
    from?: Date
    to?: Date
  }
  tags: string[]
  intensityRange: {
    min: number
    max: number
  }
}

interface SearchFilterPanelProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  availableTags: string[]
}

export function SearchFilterPanel({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  availableTags,
}: SearchFilterPanelProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const activeFilterCount = [
    filters.emotions.length > 0,
    filters.dateRange.from || filters.dateRange.to,
    filters.tags.length > 0,
    filters.intensityRange.min > 1 || filters.intensityRange.max < 5,
  ].filter(Boolean).length

  const handleEmotionToggle = (emotion: EmotionType) => {
    const newEmotions = filters.emotions.includes(emotion)
      ? filters.emotions.filter((e) => e !== emotion)
      : [...filters.emotions, emotion]
    onFiltersChange({ ...filters, emotions: newEmotions })
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag) ? filters.tags.filter((t) => t !== tag) : [...filters.tags, tag]
    onFiltersChange({ ...filters, tags: newTags })
  }

  const handleClearFilters = () => {
    onFiltersChange({
      emotions: [],
      dateRange: {},
      tags: [],
      intensityRange: { min: 1, max: 5 },
    })
    onSearchChange("")
  }

  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar em notas, tags..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative bg-transparent">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filtros</h3>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Limpar
                </Button>
              )}
            </div>

            {/* Emotions Filter */}
            <div className="space-y-2">
              <Label>Emoções</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(emotionLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={`emotion-${key}`}
                      checked={filters.emotions.includes(key as EmotionType)}
                      onCheckedChange={() => handleEmotionToggle(key as EmotionType)}
                    />
                    <label
                      htmlFor={`emotion-${key}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      {filters.dateRange.from ? filters.dateRange.from.toLocaleDateString("pt-BR") : "Data inicial"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.from}
                      onSelect={(date) =>
                        onFiltersChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, from: date },
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                      {filters.dateRange.to ? filters.dateRange.to.toLocaleDateString("pt-BR") : "Data final"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateRange.to}
                      onSelect={(date) =>
                        onFiltersChange({
                          ...filters,
                          dateRange: { ...filters.dateRange, to: date },
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Button
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Intensity Range */}
            <div className="space-y-2">
              <Label>Intensidade</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={filters.intensityRange.min}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      intensityRange: {
                        ...filters.intensityRange,
                        min: Number.parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-16"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="number"
                  min={1}
                  max={5}
                  value={filters.intensityRange.max}
                  onChange={(e) =>
                    onFiltersChange({
                      ...filters,
                      intensityRange: {
                        ...filters.intensityRange,
                        max: Number.parseInt(e.target.value),
                      },
                    })
                  }
                  className="w-16"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear All Button */}
      {hasActiveFilters && (
        <Button variant="ghost" size="icon" onClick={handleClearFilters}>
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
