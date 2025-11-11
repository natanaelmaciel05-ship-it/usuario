"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "patient" | "psychologist"
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, role: "patient" | "psychologist") => Promise<boolean>
  logout: () => void
  updateUser: (updatedUser: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("terapisys_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem("terapisys_users")
      const users: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []

      // Find user with matching email and password
      const foundUser = users.find((u) => u.email === email && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem("terapisys_user", JSON.stringify(userWithoutPassword))
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Login error:", error)
      return false
    }
  }

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "patient" | "psychologist",
  ): Promise<boolean> => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem("terapisys_users")
      const users: Array<User & { password: string }> = storedUsers ? JSON.parse(storedUsers) : []

      // Check if email already exists
      if (users.some((u) => u.email === email)) {
        return false
      }

      // Create new user
      const newUser: User & { password: string } = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
        role,
      }

      // Save to storage
      users.push(newUser)
      localStorage.setItem("terapisys_users", JSON.stringify(users))

      // Auto login after registration
      const { password: _, ...userWithoutPassword } = newUser
      setUser(userWithoutPassword)
      localStorage.setItem("terapisys_user", JSON.stringify(userWithoutPassword))

      return true
    } catch (error) {
      console.error("[v0] Register error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("terapisys_user")
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("terapisys_user", JSON.stringify(updatedUser))

    // Also update in users list
    const storedUsers = localStorage.getItem("terapisys_users")
    if (storedUsers) {
      const users: Array<User & { password: string }> = JSON.parse(storedUsers)
      const userIndex = users.findIndex((u) => u.id === updatedUser.id)
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updatedUser }
        localStorage.setItem("terapisys_users", JSON.stringify(users))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
