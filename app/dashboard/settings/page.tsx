import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Mail, Phone, MapPin, Clock, Briefcase } from 'lucide-react'

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie as configurações do aplicativo e informações do seu psicólogo</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-gray-600" />
              Informações do Psicólogo
            </CardTitle>
            <CardDescription>Dados de contato e informações profissionais do seu psicólogo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-semibold text-gray-900">Dr. Angelica</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">E-mail</p>
                <p className="font-semibold text-gray-900">dra.angelica@terapisys.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold text-gray-900">+55 (11) 98765-4321</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Especialidade</p>
                <p className="font-semibold text-gray-900">Psicologia Clínica e Terapia Cognitivo-Comportamental</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Endereço do Consultório</p>
                <p className="font-semibold text-gray-900">Av. Paulista, 1000 - Sala 405, São Paulo - SP</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Horário de Atendimento</p>
                <p className="font-semibold text-gray-900">Segunda a Sexta: 08:00 - 18:00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobre o Aplicativo</CardTitle>
            <CardDescription>Informações sobre o TerapiSys</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Versão</p>
              <p className="font-semibold text-gray-900">1.0.0</p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">Desenvolvido por</p>
              <p className="font-semibold text-gray-900">TerapiSys Team</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
