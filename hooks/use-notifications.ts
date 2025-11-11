"use client"

import { useState, useEffect, useCallback } from "react"
import type { NotificationSettings } from "@/components/notifications-settings-modal"

const STORAGE_KEY = "terapisys-notification-settings"
const LAST_NOTIFICATION_KEY = "terapisys-last-notification"

const defaultSettings: NotificationSettings = {
  enabled: false,
  dailyReminder: true,
  dailyReminderTime: "20:00",
  weeklyCheckIn: true,
  weeklyCheckInDay: 0, // Sunday
  weeklyCheckInTime: "10:00",
  beforeAppointment: true,
  appointmentLeadTime: 2,
}

export function useNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSettings(JSON.parse(stored))
      }
    } catch (error) {
      console.error("[v0] Error loading notification settings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.error("[v0] Error saving notification settings:", error)
      }
    }
  }, [settings, isLoading])

  const updateSettings = useCallback((newSettings: NotificationSettings) => {
    setSettings(newSettings)
  }, [])

  const sendNotification = useCallback(
    (title: string, body: string) => {
      if (!settings.enabled) return

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/terapisys-app-icon.jpg",
          badge: "/terapisys-app-badge.jpg",
        })
      }
    },
    [settings.enabled],
  )

  const checkAndSendReminders = useCallback(() => {
    if (!settings.enabled) return

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
    const currentDay = now.getDay()

    const lastNotification = localStorage.getItem(LAST_NOTIFICATION_KEY)
    const lastNotificationDate = lastNotification ? new Date(lastNotification) : null

    // Check if we already sent a notification today
    const isSameDay =
      lastNotificationDate &&
      lastNotificationDate.getDate() === now.getDate() &&
      lastNotificationDate.getMonth() === now.getMonth() &&
      lastNotificationDate.getFullYear() === now.getFullYear()

    // Daily reminder
    if (settings.dailyReminder && currentTime === settings.dailyReminderTime && !isSameDay) {
      sendNotification("TerapiSys - Lembrete Diário", "Como você está se sentindo hoje? Registre suas emoções.")
      localStorage.setItem(LAST_NOTIFICATION_KEY, now.toISOString())
    }

    // Weekly check-in
    if (
      settings.weeklyCheckIn &&
      currentDay === settings.weeklyCheckInDay &&
      currentTime === settings.weeklyCheckInTime &&
      !isSameDay
    ) {
      sendNotification(
        "TerapiSys - Check-in Semanal",
        "Hora de refletir sobre sua semana. Como foram suas emoções nos últimos dias?",
      )
      localStorage.setItem(LAST_NOTIFICATION_KEY, now.toISOString())
    }
  }, [settings, sendNotification])

  // Check for reminders every minute
  useEffect(() => {
    if (!settings.enabled) return

    const interval = setInterval(() => {
      checkAndSendReminders()
    }, 60000) // Check every minute

    // Check immediately on mount
    checkAndSendReminders()

    return () => clearInterval(interval)
  }, [settings, checkAndSendReminders])

  return {
    settings,
    isLoading,
    updateSettings,
    sendNotification,
  }
}
