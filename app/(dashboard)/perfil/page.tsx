"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Briefcase, Save, Link2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, updateUser } = useAuth()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [doctorCode, setDoctorCode] = useState("")
  const [linkedDoctor, setLinkedDoctor] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    } else if (user) {
      setName(user.name)
      setEmail(user.email)
      const saved = localStorage.getItem(`terapisys_linked_doctor_${user.id}`)
      if (saved) {
        setLinkedDoctor(saved)
      }
    }
  }, [user, authLoading, router])

  const handleSave = () => {
    if (name.trim() && email.trim()) {
      updateUser({ ...user, name: name.trim(), email: email.trim() })
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      })
    }
  }

  const handleLinkDoctor = () => {
    if (!doctorCode.trim()) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira um código válido.",
        variant: "destructive",
      })
      return
    }

    if (!doctorCode.match(/^DOC-\d{5}$/)) {
      toast({
        title: "Código inválido",
        description: "O código deve estar no formato DOC-XXXXX.",
        variant: "destructive",
      })
      return
    }

    localStorage.setItem(`terapisys_linked_doctor_${user?.id}`, "Dr. Angelica")
    setLinkedDoctor("Dr. Angelica")
    setDoctorCode("")

    toast({
      title: "Vinculação realizada",
      description: "Você foi vinculado com sucesso a Dr. Angelica.",
    })
  }

  const handleUnlinkDoctor = () => {
    localStorage.removeItem(`terapisys_linked_doctor_${user?.id}`)
    setLinkedDoctor(null)

    toast({
      title: "Desvinculado",
      description: "Você foi desvinculado do psicólogo.",
    })
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-balance">Meu Perfil</h1>
          <p className="text-sm text-muted-foreground">Gerencie suas informações pessoais</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize seus dados cadastrais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="pl-9" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Tipo de Conta</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="role"
                    value={user.role === "patient" ? "Paciente" : "Psicólogo"}
                    disabled
                    className="pl-9"
                  />
                </div>
              </div>

              <Button onClick={handleSave} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Seu progresso no TerapiSys</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registros Totais</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Dias Consecutivos</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </div>
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
              {linkedDoctor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Vinculado com sucesso</p>
                      <p className="text-sm text-green-700">{linkedDoctor}</p>
                    </div>
                  </div>
                  <Button onClick={handleUnlinkDoctor} variant="outline" className="w-full bg-transparent">
                    Desvincular
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorCode">Código de Vinculação</Label>
                    <div className="relative">
                      <Link2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="doctorCode"
                        placeholder="DOC-12345"
                        value={doctorCode}
                        onChange={(e) => setDoctorCode(e.target.value.toUpperCase())}
                        className="pl-9"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">O código deve estar no formato DOC-XXXXX</p>
                  </div>
                  <Button onClick={handleLinkDoctor} className="w-full">
                    <Link2 className="mr-2 h-4 w-4" />
                    Vincular
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
