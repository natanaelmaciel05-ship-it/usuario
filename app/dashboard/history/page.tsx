'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar, Clock, Search, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Appointment {
  id: string
  therapistName: string
  date: string
  time: string
  notes: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
}

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const exampleAppointments: Appointment[] = [
      {
        id: 'ex1',
        therapistName: 'Dr. Angelica',
        date: '2025-01-10',
        time: '10:00',
        notes: 'Consulta sobre ansiedade no trabalho',
        status: 'completed'
      },
      {
        id: 'ex2',
        therapistName: 'Dr. Angelica',
        date: '2025-01-05',
        time: '14:00',
        notes: 'Sessão de acompanhamento',
        status: 'completed'
      },
      {
        id: 'ex3',
        therapistName: 'Dr. Angelica',
        date: '2024-12-28',
        time: '11:00',
        notes: 'Precisei remarcar por compromisso',
        status: 'rescheduled'
      },
      {
        id: 'ex4',
        therapistName: 'Dr. Angelica',
        date: '2024-12-20',
        time: '15:00',
        notes: 'Cancelada por motivos pessoais',
        status: 'cancelled'
      }
    ]

    const saved = localStorage.getItem('appointments')
    if (saved) {
      const allAppointments = JSON.parse(saved)
      const historyAppointments = allAppointments.filter((apt: Appointment) => 
        apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'rescheduled'
      )
      // Combina consultas salvas com exemplos
      setAppointments([...exampleAppointments, ...historyAppointments])
    } else {
      // Se não houver consultas salvas, mostra apenas os exemplos
      setAppointments(exampleAppointments)
    }
  }, [])


  const filteredAppointments = appointments.filter(apt => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    const statusText = 
      apt.status === 'completed' ? 'concluída' :
      apt.status === 'cancelled' ? 'cancelada' :
      apt.status === 'rescheduled' ? 'remarcada' : 'agendada'
    
    return (
      apt.therapistName.toLowerCase().includes(query) ||
      statusText.includes(query) ||
      apt.notes.toLowerCase().includes(query) ||
      apt.date.includes(query)
    )
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Concluída</Badge>
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelada</Badge>
      case 'rescheduled':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Remarcada</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">Agendada</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Histórico de Consultas</h1>
          <p className="text-gray-600">Visualize suas consultas realizadas, remarcadas e canceladas</p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Buscar</h3>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por doutor, status (concluída, cancelada, remarcada) ou palavras-chave..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        <p className="text-sm text-gray-600 mb-4">
          {filteredAppointments.length} consultas no histórico
        </p>

        <div className="space-y-4">
          {filteredAppointments.length === 0 ? (
            <Card className="p-12">
              <div className="text-center text-gray-600">
                Nenhuma consulta encontrada
              </div>
            </Card>
          ) : (
            filteredAppointments.map(apt => (
              <Card key={apt.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{apt.therapistName}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(apt.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                    </div>
                    {apt.notes && (
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">{apt.notes}</p>
                    )}
                  </div>
                  <div>
                    {getStatusBadge(apt.status)}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
