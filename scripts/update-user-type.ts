// Script para atualizar o tipo de conta do usuário Cleiton Rasta

if (typeof window !== 'undefined') {
  const usersData = localStorage.getItem('users')
  
  if (usersData) {
    const users = JSON.parse(usersData)
    
    // Encontrar o usuário Cleiton Rasta
    const userIndex = users.findIndex((u: any) => 
      u.email === 'olhaapedra@gmail.com' || u.name === 'Cleiton Rasta'
    )
    
    if (userIndex !== -1) {
      // Atualizar o tipo de conta para paciente
      users[userIndex].accountType = 'paciente'
      
      // Salvar de volta no localStorage
      localStorage.setItem('users', JSON.stringify(users))
      
      // Se este for o usuário atualmente logado, atualizar também
      const currentUserData = localStorage.getItem('currentUser')
      if (currentUserData) {
        const currentUser = JSON.parse(currentUserData)
        if (currentUser.email === users[userIndex].email) {
          currentUser.accountType = 'paciente'
          localStorage.setItem('currentUser', JSON.stringify(currentUser))
        }
      }
      
      console.log('[v0] Tipo de conta atualizado com sucesso para: paciente')
      console.log('[v0] Usuário:', users[userIndex])
    } else {
      console.log('[v0] Usuário Cleiton Rasta não encontrado')
    }
  } else {
    console.log('[v0] Nenhum usuário encontrado no localStorage')
  }
}
