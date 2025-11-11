"use client"

import { useState, useEffect } from "react"

export interface Appointment {
  id: string
  userId: string
  professionalName: string
  professionalSpecialty: string
  date: string
  time: string
  status: "scheduled" | "completed" | "cancelled"
  notes?: string
  createdAt: string
}

const STORAGE_KEY = "terapisys_appointments"

export function useAppointments(userId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      let allAppointments: Appointment[] = []

      if (stored) {
        allAppointments = JSON.parse(stored) as Appointment[]
      }

      if (userId) {
        const userAppointments = allAppointments.filter((apt) => apt.userId === userId)
        setAppointments(userAppointments)
      } else {
        setAppointments(allAppointments)
      }
    }
  }, [userId])

  const saveAppointment = (appointment: Omit<Appointment, "id" | "createdAt">) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    const stored = localStorage.getItem(STORAGE_KEY)
    const allAppointments = stored ? (JSON.parse(stored) as Appointment[]) : []
    const updated = [...allAppointments, newAppointment]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

    if (!userId || newAppointment.userId === userId) {
      setAppointments((prev) => [...prev, newAppointment])
    }

    return newAppointment
  }

  const updateAppointment = (appointment: Appointment) => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const allAppointments = JSON.parse(stored) as Appointment[]
      const updated = allAppointments.map((apt) => (apt.id === appointment.id ? appointment : apt))
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

      if (!userId || appointment.userId === userId) {
        setAppointments((prev) => prev.map((apt) => (apt.id === appointment.id ? appointment : apt)))
      }
    }
  }

  const deleteAppointment = (id: string) => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const allAppointments = JSON.parse(stored) as Appointment[]
      const updated = allAppointments.filter((apt) => apt.id !== id)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      setAppointments((prev) => prev.filter((apt) => apt.id !== id))
    }
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments
      .filter((apt) => {
        const aptDate = new Date(`${apt.date}T${apt.time}`)
        return aptDate >= now && apt.status === "scheduled"
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateA.getTime() - dateB.getTime()
      })
  }

  const getPastAppointments = () => {
    const now = new Date()
    return appointments
      .filter((apt) => {
        const aptDate = new Date(`${apt.date}T${apt.time}`)
        return aptDate < now || apt.status !== "scheduled"
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`)
        const dateB = new Date(`${b.date}T${b.time}`)
        return dateB.getTime() - dateA.getTime()
      })
  }

  return {
    appointments,
    saveAppointment,
    updateAppointment,
    deleteAppointment,
    getUpcomingAppointments,
    getPastAppointments,
  }
}
