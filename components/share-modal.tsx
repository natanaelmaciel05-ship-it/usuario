"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Share2, Trash2, UserPlus } from "lucide-react"
import type { SharedContact } from "@/lib/types"

interface ShareModalProps {
  open: boolean
  onClose: () => void
  contacts: SharedContact[]
  onAddContact: (contact: Omit<SharedContact, "id" | "addedDate">) => void
  onToggleAccess: (contactId: string) => void
  onRemoveContact: (contactId: string) => void
}

export function ShareModal({
  open,
  onClose,
  contacts,
  onAddContact,
  onToggleAccess,
  onRemoveContact,
}: ShareModalProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    relationship: "psychologist" as "psychologist" | "family" | "friend",
    hasAccess: true,
  })

  const handleAddContact = () => {
    if (newContact.name && newContact.email) {
      onAddContact(newContact)
      setNewContact({
        name: "",
        email: "",
        relationship: "psychologist",
        hasAccess: true,
      })
      setShowAddForm(false)
    }
  }

  const relationshipLabels = {
    psychologist: "Psicólogo(a)",
    family: "Familiar",
    friend: "Amigo(a)",
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartilhar Registros
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Compartilhe seus registros emocionais com seu psicólogo ou pessoas de confiança. Você pode controlar o
            acesso a qualquer momento.
          </p>

          {/* Existing Contacts */}
          <div className="space-y-3">
            {contacts.length === 0 ? (
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground">Nenhum contato adicionado ainda</p>
              </Card>
            ) : (
              contacts.map((contact) => (
                <Card key={contact.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{contact.name}</h4>
                        <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                          {relationshipLabels[contact.relationship]}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{contact.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`access-${contact.id}`} className="text-sm">
                          {contact.hasAccess ? "Acesso ativo" : "Acesso pausado"}
                        </Label>
                        <Switch
                          id={`access-${contact.id}`}
                          checked={contact.hasAccess}
                          onCheckedChange={() => onToggleAccess(contact.id)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => onRemoveContact(contact.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Add New Contact Form */}
          {showAddForm ? (
            <Card className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Nome</Label>
                  <Input
                    id="contact-name"
                    placeholder="Nome completo"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-relationship">Relacionamento</Label>
                  <Select
                    value={newContact.relationship}
                    onValueChange={(value) =>
                      setNewContact({
                        ...newContact,
                        relationship: value as "psychologist" | "family" | "friend",
                      })
                    }
                  >
                    <SelectTrigger id="contact-relationship">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="psychologist">Psicólogo(a)</SelectItem>
                      <SelectItem value="family">Familiar</SelectItem>
                      <SelectItem value="friend">Amigo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddContact} className="flex-1">
                    Adicionar
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Contato
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
