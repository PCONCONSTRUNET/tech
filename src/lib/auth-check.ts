import { createClient } from '@/utils/supabase/server'
import prisma from '@/lib/prisma'

export type Role = 'ADMIN' | 'VENDEDOR' | 'TECNICO' | 'FINANCEIRO'

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Não autorizado: Usuário não autenticado.')
  }
  
  return user
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await requireAuth()
  
  // Buscar o usuário no Prisma para checar a role
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! }
  })

  if (!dbUser) {
    throw new Error('Usuário não encontrado no banco de dados.')
  }

  // ADMIN sempre tem acesso a tudo
  if (!allowedRoles.includes(dbUser.role as Role) && dbUser.role !== 'ADMIN') {
    throw new Error(`Acesso negado: Nível de acesso insuficiente.`)
  }

  return { user, dbUser }
}

export async function getDbUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || !user.email) return null

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })
    
    return dbUser
  } catch (error) {
    return null
  }
}
