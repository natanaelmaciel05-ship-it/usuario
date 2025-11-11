"use client"

import { useState, useEffect } from "react"
import type { EmotionRecord } from "@/lib/types"
import type { FilterOptions } from "@/components/search-filter-panel"

const STORAGE_KEY = "terapisys-emotion-records"

export function useEmotionRecords() {
  const [records, setRecords] = useState<EmotionRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load records from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const recordsWithDates = parsed.map((record: any) => ({
          ...record,
          date: new Date(record.date),
          reminder: record.reminder ? new Date(record.reminder) : undefined,
        }))
        setRecords(recordsWithDates)
      }
    } catch (error) {
      console.error("[v0] Error loading records:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
      } catch (error) {
        console.error("[v0] Error saving records:", error)
      }
    }
  }, [records, isLoading])

  const addRecord = (record: Omit<EmotionRecord, "id">) => {
    const newRecord: EmotionRecord = {
      ...record,
      id: crypto.randomUUID(),
    }
    setRecords((prev) => [...prev, newRecord])
    return newRecord
  }

  const updateRecord = (record: EmotionRecord) => {
    setRecords((prev) => prev.map((r) => (r.id === record.id ? record : r)))
  }

  const deleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id))
  }

  const getRecordById = (id: string) => {
    return records.find((r) => r.id === id)
  }

  const filterRecords = (searchQuery: string, filters: FilterOptions) => {
    return records.filter((record) => {
      // Search in note and tags
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesNote = record.note.toLowerCase().includes(query)
        const matchesTags = record.tags?.some((tag) => tag.toLowerCase().includes(query))
        if (!matchesNote && !matchesTags) return false
      }

      // Filter by emotions
      if (filters.emotions.length > 0 && !filters.emotions.includes(record.emotion)) {
        return false
      }

      // Filter by date range
      if (filters.dateRange.from && record.date < filters.dateRange.from) {
        return false
      }
      if (filters.dateRange.to) {
        const endOfDay = new Date(filters.dateRange.to)
        endOfDay.setHours(23, 59, 59, 999)
        if (record.date > endOfDay) {
          return false
        }
      }

      // Filter by tags
      if (filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) => record.tags?.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Filter by intensity range
      if (record.intensity < filters.intensityRange.min || record.intensity > filters.intensityRange.max) {
        return false
      }

      return true
    })
  }

  const getAllTags = () => {
    const tagsSet = new Set<string>()
    records.forEach((record) => {
      record.tags?.forEach((tag) => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  }

  return {
    records,
    isLoading,
    addRecord,
    updateRecord,
    deleteRecord,
    getRecordById,
    filterRecords,
    getAllTags,
  }
}
