'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    accountType: 'patient'
  })
  const [linkCode, setLinkCode] = useState('')
  const [isLinked, setIsLinked] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (user) {
      const userData = JSON.parse(user)
      setProfile({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || '',
        birthdate: userData.birthdate || '',
        accountType: userData.role || 'patient'
      })
    }
    const psychologistLink = localStorage.getItem('psychologistLink')
    if (psychologistLink) {
      setLinkCode(psychologistLink)
      setIsLinked(true)
    }
  }, [])

  const handleSave = () => {
    const updatedUser = {
      ...profile,
      role: profile.accountType
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    alert('Alterações salvas com sucesso!')
  }

  const handleLink = () => {
    if (linkCode.trim()) {
      setIsLinked(true)
      toast({
        title: "Vinculação concluída",
        description: "Você foi vinculado com sucesso ao psicólogo.",
        duration: 3000,
      })
      localStorage.setItem('psychologistLink', linkCode)
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados cadastrais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="chalong"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="chaylong@gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <Label htmlFor="birthdate">Data de Nascimento</Label>
              <Input
                id="birthdate"
                type="date"
                value={profile.birthdate}
                onChange={(e) => setProfile({ ...profile, birthdate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="accountType">Tipo de Conta</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <span className="font-medium capitalize">
                  {profile.accountType === 'patient' ? 'Paciente' : 'Psicólogo'}
                </span>
              </div>
            </div>
            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vincular ao Psicólogo</CardTitle>
            <CardDescription>
              Insira o código fornecido pelo seu psicólogo para estabelecer a vinculação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="linkCode">Código de Vinculação</Label>
              <Input
                id="linkCode"
                value={linkCode}
                onChange={(e) => {
                  setLinkCode(e.target.value)
                  setIsLinked(false)
                }}
                placeholder="DOC-12345"
              />
              <p className="text-xs text-gray-500 mt-2">
                O código deve estar no formato DOC-XXXXX
              </p>
            </div>
            <Button 
              onClick={handleLink}
              disabled={!linkCode.trim()}
              className={`w-full transition-colors ${
                isLinked 
                  ? 'bg-white text-gray-900 border border-gray-300 hover:bg-gray-50' 
                  : linkCode.trim() 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLinked && <Check className="w-4 h-4 mr-2" />}
              {isLinked ? 'Vinculado' : 'Vincular'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
