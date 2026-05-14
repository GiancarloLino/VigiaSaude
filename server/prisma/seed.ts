import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Limpar dados existentes (opcional, cuidado em produção)
  // await prisma.auditoria.deleteMany({})
  // await prisma.pedidoCompra.deleteMany({})
  // await prisma.medicamentoAta.deleteMany({})
  // await prisma.ata.deleteMany({})
  // await prisma.user.deleteMany({})

  // Criar Usuário Comprador
  const comprador = await prisma.user.upsert({
    where: { email: 'comprador@vigiasaude.com.br' },
    update: {},
    create: {
      nome: 'João Comprador',
      email: 'comprador@vigiasaude.com.br',
      senhaHash: '$2b$10$YourHashHere', // Idealmente usar bcrypt para gerar
      role: 'COMPRADOR',
    },
  })

  // Criar Usuário Fornecedor
  const fornecedor = await prisma.user.upsert({
    where: { email: 'fornecedor@medsupply.com.br' },
    update: {},
    create: {
      nome: 'Maria Fornecedora',
      email: 'fornecedor@medsupply.com.br',
      senhaHash: '$2b$10$YourHashHere',
      role: 'FORNECEDOR',
      fornecedorId: 'f1', // ID fictício para o fornecedor
    },
  })

  console.log({ comprador, fornecedor })
  console.log('Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
