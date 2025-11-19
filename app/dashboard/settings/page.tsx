'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Briefcase, Check, Link2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SettingsPage() {
  const [linkCode, setLinkCode] = useState('')
  const [isLinked, setIsLinked] = useState(false)
  const [codeError, setCodeError] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const psychologistLink = localStorage.getItem('psychologistLink')
    if (psychologistLink) {
      setLinkCode(psychologistLink)
      setIsLinked(true)
    }
  }, [])

  const validateCode = (code: string) => {
    const pattern = /^DOC-\d{5}$/
    return pattern.test(code)
  }

  const handleLink = () => {
    if (!validateCode(linkCode)) {
      setCodeError('O código deve estar no formato DOC-XXXXX (ex: DOC-12345)')
      toast({
        title: "Código inválido",
        description: "O código deve estar no formato DOC-XXXXX",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setIsLinked(true)
    setCodeError('')
    toast({
      title: "Vinculação concluída",
      description: "Você foi vinculado com sucesso ao psicólogo.",
      duration: 3000,
    })
    localStorage.setItem('psychologistLink', linkCode)
  }

  const handleUnlink = () => {
    setIsLinked(false)
    setLinkCode('')
    localStorage.removeItem('psychologistLink')
    toast({
      title: "Desvinculado",
      description: "Você foi desvinculado do psicólogo.",
      duration: 3000,
    })
  }

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
              <Link2 className="w-5 h-5 text-gray-600" />
              Vincular ao Psicólogo
            </CardTitle>
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
                  setCodeError('')
                }}
                placeholder="DOC-12345"
                className={codeError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                disabled={isLinked}
              />
              {codeError ? (
                <p className="text-xs text-red-500 mt-2">{codeError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  O código deve estar no formato DOC-XXXXX
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={handleLink}
                disabled={!linkCode.trim() || isLinked}
                className={`transition-colors ${
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
              
              {isLinked && (
                <Button
                  onClick={handleUnlink}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  Desvincular
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

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
                <p className="font-semibold text-gray-900">angelia@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Telefone</p>
                <p className="font-semibold text-gray-900">(46) 999895624</p>
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
                <p className="font-semibold text-gray-900">Av. Das torres, 157- Dois Vizinhos, PR</p>
              </div>
            </div>

          </CardContent>
        </Card>

      </div>
    </DashboardLayout>
  )
}
