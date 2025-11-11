"use client"

import { useState, useEffect } from "react"
import type { SharedContact } from "@/lib/types"

const STORAGE_KEY = "terapisys-shared-contacts"

export function useSharedContacts() {
  const [contacts, setContacts] = useState<SharedContact[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load contacts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const contactsWithDates = parsed.map((contact: any) => ({
          ...contact,
          addedDate: new Date(contact.addedDate),
        }))
        setContacts(contactsWithDates)
      }
    } catch (error) {
      console.error("[v0] Error loading contacts:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save contacts to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
      } catch (error) {
        console.error("[v0] Error saving contacts:", error)
      }
    }
  }, [contacts, isLoading])

  const addContact = (contact: Omit<SharedContact, "id" | "addedDate">) => {
    const newContact: SharedContact = {
      ...contact,
      id: crypto.randomUUID(),
      addedDate: new Date(),
    }
    setContacts((prev) => [...prev, newContact])
    return newContact
  }

  const toggleAccess = (contactId: string) => {
    setContacts((prev) => prev.map((c) => (c.id === contactId ? { ...c, hasAccess: !c.hasAccess } : c)))
  }

  const removeContact = (contactId: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== contactId))
  }

  return {
    contacts,
    isLoading,
    addContact,
    toggleAccess,
    removeContact,
  }
}
