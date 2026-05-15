import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
  log: ['error', 'warn'],
})

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL não encontrada nas variáveis de ambiente!')
}

export default prisma
