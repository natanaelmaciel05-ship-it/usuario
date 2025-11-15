'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, History, Settings, User, LogOut, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/auth-provider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout, isLoading } = useAuth()

  const navigation = [
    { name: 'Home', href: '/dashboard/home', icon: Home },
    { name: 'Meu Perfil', href: '/dashboard/profile', icon: User },
    { name: 'Agendar Consultas', href: '/dashboard/appointments', icon: Calendar },
    { name: 'Histórico', href: '/dashboard/history', icon: History },
    { name: 'Configurações', href: '/dashboard/settings', icon: Settings },
  ]

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-green-600" />
            <h1 className="text-xl font-bold text-gray-900">TerapiSys</h1>
          </div>
          <p className="text-sm text-gray-600">Seu diário emocional</p>
        </div>

        <div className="px-4 py-2 bg-gray-50 mx-4 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-600 truncate">{user.email}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role === 'patient' ? 'Paciente' : 'Psicólogo'}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
