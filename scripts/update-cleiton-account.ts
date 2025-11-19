// Script para atualizar o tipo de conta de Cleiton Rasta de psicólogo para paciente

if (typeof window !== 'undefined') {
  console.log('[v0] Iniciando atualização do tipo de conta...')
  
  // Atualizar na lista de usuários
  const usersData = localStorage.getItem('users')
  if (usersData) {
    const users = JSON.parse(usersData)
    const userIndex = users.findIndex((u: any) => 
      u.email === 'olhaapedra@gmail.com' || 
      u.name?.toLowerCase().includes('cleiton')
    )
    
    if (userIndex !== -1) {
      users[userIndex].role = 'patient'
      users[userIndex].accountType = 'patient'
      localStorage.setItem('users', JSON.stringify(users))
      console.log('[v0] Usuário atualizado na lista:', users[userIndex])
    }
  }
  
  // Atualizar usuário atual se estiver logado
  const currentUserData = localStorage.getItem('currentUser')
  if (currentUserData) {
    const currentUser = JSON.parse(currentUserData)
    if (currentUser.email === 'olhaapedra@gmail.com' || 
        currentUser.name?.toLowerCase().includes('cleiton')) {
      currentUser.role = 'patient'
      currentUser.accountType = 'patient'
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
      console.log('[v0] Usuário atual atualizado:', currentUser)
      
      // Recarregar a página para aplicar as mudanças
      setTimeout(() => {
        window.location.reload()
      }, 500)
    }
  }
  
  console.log('[v0] Atualização concluída! O tipo de conta foi alterado para Paciente.')
}

export {}
