'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  login: (userData: User) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is logged in on mount and whenever localStorage changes
    const checkAuth = () => {
      const currentUserJSON = localStorage.getItem('currentUser')
      
      if (currentUserJSON) {
        try {
          const userData = JSON.parse(currentUserJSON)
          setUser(userData)
        } catch (error) {
          console.error('Error parsing user data:', error)
          localStorage.removeItem('currentUser')
          setUser(null)
        }
      } else {
        setUser(null)
      }
      
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (including from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'currentUser') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  useEffect(() => {
    // Redirect logic after loading is complete
    if (!isLoading) {
      const isAuthPage = pathname?.startsWith('/auth')
      
      if (!user && !isAuthPage) {
        // Not logged in and not on auth page -> redirect to login
        router.push('/auth/login')
      } else if (user && isAuthPage) {
        // Logged in and on auth page -> redirect to dashboard
        router.push('/dashboard/home')
      }
    }
  }, [user, isLoading, pathname, router])

  const login = (userData: User) => {
    localStorage.setItem('currentUser', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
    router.push('/auth/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
