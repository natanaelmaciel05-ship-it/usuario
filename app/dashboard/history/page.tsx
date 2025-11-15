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
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    const saved = localStorage.getItem('appointments')
    if (saved) {
      const allAppointments = JSON.parse(saved)
      const historyAppointments = allAppointments.filter((apt: Appointment) => 
        apt.status === 'completed' || apt.status === 'cancelled' || apt.status === 'rescheduled'
      )
      setAppointments(historyAppointments)
    }
  }, [])


  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.therapistName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter
    return matchesSearch && matchesStatus
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
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Filtros</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Nome do profissional..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="all">Todos os status</option>
                <option value="completed">Concluída</option>
                <option value="rescheduled">Remarcada</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
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
