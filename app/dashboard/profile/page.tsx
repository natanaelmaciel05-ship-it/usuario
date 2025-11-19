'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'

export default function ProfilePage() {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthdate: '',
    accountType: 'patient'
  })
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      const userDataFromStorage = localStorage.getItem('currentUser')
      if (userDataFromStorage) {
        const fullUserData = JSON.parse(userDataFromStorage)
        setProfile({
          name: fullUserData.name || '',
          email: fullUserData.email || '',
          phone: fullUserData.phone || '',
          birthdate: fullUserData.birthdate || '',
          accountType: fullUserData.role || 'patient'
        })
      }
    }
  }, [user])

  const handleSave = () => {
    const updatedUser = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      birthdate: profile.birthdate,
      role: profile.accountType
    }
    
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
    login(updatedUser)
    
    toast({
      title: "Alterações salvas",
      description: "Suas informações foram atualizadas com sucesso.",
      duration: 3000,
    })
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
            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
