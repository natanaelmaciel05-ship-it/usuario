"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Bell, BellOff } from "lucide-react"

export interface NotificationSettings {
  enabled: boolean
  dailyReminder: boolean
  dailyReminderTime: string
  weeklyCheckIn: boolean
  weeklyCheckInDay: number // 0-6 (Sunday-Saturday)
  weeklyCheckInTime: string
  beforeAppointment: boolean
  appointmentLeadTime: number // hours before
}

interface NotificationsSettingsModalProps {
  open: boolean
  onClose: () => void
  settings: NotificationSettings
  onSave: (settings: NotificationSettings) => void
}

export function NotificationsSettingsModal({ open, onClose, settings, onSave }: NotificationsSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<NotificationSettings>(settings)
  const [permissionStatus, setPermissionStatus] = useState<"granted" | "denied" | "default">("default")

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission()
      setPermissionStatus(permission)
      if (permission === "granted") {
        setLocalSettings({ ...localSettings, enabled: true })
      }
    }
  }

  const handleSave = () => {
    onSave(localSettings)
    onClose()
  }

  const weekDays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configurações de Notificações
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Permission Status */}
          {permissionStatus !== "granted" && (
            <Card className="border-primary/50 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <BellOff className="mt-0.5 h-5 w-5 text-primary" />
                <div className="flex-1">
                  <h4 className="font-medium">Permissão de Notificações</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Para receber lembretes, você precisa permitir notificações do navegador.
                  </p>
                  <Button onClick={requestPermission} size="sm" className="mt-3">
                    Permitir Notificações
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Enable Notifications */}
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label>Ativar Notificações</Label>
              <p className="text-sm text-muted-foreground">Receba lembretes para registrar suas emoções</p>
            </div>
            <Switch
              checked={localSettings.enabled}
              onCheckedChange={(checked) => setLocalSettings({ ...localSettings, enabled: checked })}
              disabled={permissionStatus !== "granted"}
            />
          </div>

          {localSettings.enabled && (
            <>
              {/* Daily Reminder */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lembrete Diário</Label>
                      <p className="text-sm text-muted-foreground">Receba um lembrete todos os dias</p>
                    </div>
                    <Switch
                      checked={localSettings.dailyReminder}
                      onCheckedChange={(checked) => setLocalSettings({ ...localSettings, dailyReminder: checked })}
                    />
                  </div>

                  {localSettings.dailyReminder && (
                    <div className="space-y-2">
                      <Label htmlFor="daily-time">Horário</Label>
                      <Input
                        id="daily-time"
                        type="time"
                        value={localSettings.dailyReminderTime}
                        onChange={(e) => setLocalSettings({ ...localSettings, dailyReminderTime: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </Card>

              {/* Weekly Check-in */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Check-in Semanal</Label>
                      <p className="text-sm text-muted-foreground">Reflexão semanal sobre suas emoções</p>
                    </div>
                    <Switch
                      checked={localSettings.weeklyCheckIn}
                      onCheckedChange={(checked) => setLocalSettings({ ...localSettings, weeklyCheckIn: checked })}
                    />
                  </div>

                  {localSettings.weeklyCheckIn && (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="weekly-day">Dia da Semana</Label>
                        <select
                          id="weekly-day"
                          value={localSettings.weeklyCheckInDay}
                          onChange={(e) =>
                            setLocalSettings({ ...localSettings, weeklyCheckInDay: Number.parseInt(e.target.value) })
                          }
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {weekDays.map((day, index) => (
                            <option key={index} value={index}>
                              {day}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weekly-time">Horário</Label>
                        <Input
                          id="weekly-time"
                          type="time"
                          value={localSettings.weeklyCheckInTime}
                          onChange={(e) => setLocalSettings({ ...localSettings, weeklyCheckInTime: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Before Appointment */}
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Lembrete Antes da Consulta</Label>
                      <p className="text-sm text-muted-foreground">Prepare-se para sua sessão de terapia</p>
                    </div>
                    <Switch
                      checked={localSettings.beforeAppointment}
                      onCheckedChange={(checked) => setLocalSettings({ ...localSettings, beforeAppointment: checked })}
                    />
                  </div>

                  {localSettings.beforeAppointment && (
                    <div className="space-y-2">
                      <Label htmlFor="appointment-lead">Antecedência (horas)</Label>
                      <Input
                        id="appointment-lead"
                        type="number"
                        min={1}
                        max={48}
                        value={localSettings.appointmentLeadTime}
                        onChange={(e) =>
                          setLocalSettings({ ...localSettings, appointmentLeadTime: Number.parseInt(e.target.value) })
                        }
                      />
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
