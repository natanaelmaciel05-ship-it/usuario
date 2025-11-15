'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Heart, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/components/auth-provider'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState(false)
  
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('patient')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(false)
    
    const usersJSON = localStorage.getItem('users')
    const users = usersJSON ? JSON.parse(usersJSON) : []
    
    const user = users.find((u: any) => u.email === loginEmail && u.password === loginPassword)
    
    if (user) {
      login({
        name: user.name,
        email: user.email,
        role: user.role
      })
      
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo de volta, ${user.name}!`,
      })
      
      setTimeout(() => {
        router.push('/dashboard/home')
      }, 500)
    } else {
      setIsLoading(false)
      setLoginError(true)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (signupPassword !== confirmPassword) {
      setIsLoading(false)
      toast({
        title: "Erro ao criar conta",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }
    
    if (signupPassword.length < 6) {
      setIsLoading(false)
      toast({
        title: "Erro ao criar conta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }
    
    const usersJSON = localStorage.getItem('users')
    const users = usersJSON ? JSON.parse(usersJSON) : []
    
    const existingUser = users.find((u: any) => u.email === signupEmail)
    if (existingUser) {
      setIsLoading(false)
      toast({
        title: "Erro ao criar conta",
        description: "Este email já está cadastrado.",
        variant: "destructive",
      })
      return
    }
    
    const newUser = {
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: accountType,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    localStorage.setItem('users', JSON.stringify(users))
    
    login({
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    })
    
    toast({
      title: "Conta criada com sucesso",
      description: `Bem-vindo, ${newUser.name}!`,
    })
    
    setTimeout(() => {
      router.push('/dashboard/home')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f0] p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-[#d4ede7] flex items-center justify-center mb-4">
            <Heart className="w-10 h-10 text-[#10b981] fill-[#10b981]" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">TerapiSys</h1>
          <p className="text-gray-600 mt-2">Seu diário emocional pessoal</p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200 p-0 h-auto rounded-lg mb-6">
            <TabsTrigger 
              value="login" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-none py-3"
            >
              Entrar
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 data-[state=active]:shadow-none py-3"
            >
              Criar Conta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <p className="text-sm text-gray-600">Entre com suas credenciais para continuar</p>
              </div>
              
              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-600">Email ou senha incorretos</p>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value)
                      setLoginError(false)
                    }}
                    required
                    className="h-11 bg-blue-50/50 border-blue-100 focus:bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-900 font-medium">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      setLoginError(false)
                    }}
                    required
                    className="h-11 bg-blue-50/50 border-blue-100 focus:bg-white"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white h-11 text-base font-medium mt-6" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </div>
            <p className="text-xs text-center text-gray-600 mt-6 px-4">
              Ao continuar, você concorda com nossos{' '}
              <Link href="#" className="text-[#10b981] hover:underline font-medium">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link href="#" className="text-[#10b981] hover:underline font-medium">
                Política de Privacidade
              </Link>
            </p>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Criar conta</h2>
                <p className="text-sm text-gray-600 mt-1">Preencha os dados para começar sua jornada</p>
              </div>
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-900 font-medium">Nome completo</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-gray-900 font-medium">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-gray-900 font-medium">Senha</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-900 font-medium">Confirmar senha</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="account-type" className="text-gray-900 font-medium">Tipo de conta</Label>
                  <select
                    id="account-type"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full h-11 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="patient">Paciente</option>
                    <option value="therapist">Psicólogo</option>
                  </select>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#10b981] hover:bg-[#059669] text-white h-11 text-base font-medium mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </form>
            </div>
            <p className="text-xs text-center text-gray-600 mt-6 px-4">
              Ao continuar, você concorda com nossos{' '}
              <Link href="#" className="text-[#10b981] hover:underline font-medium">
                Termos de Serviço
              </Link>{' '}
              e{' '}
              <Link href="#" className="text-[#10b981] hover:underline font-medium">
                Política de Privacidade
              </Link>
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
