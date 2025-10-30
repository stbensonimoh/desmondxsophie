import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'

async function main() {
  const code = process.argv[2]?.toUpperCase() || 'HCPX'
  const invite = await prisma.inviteCode.findUnique({ where: { code }, include: { assignedTo: true } })
  console.log('invite', invite?.code, 'max', invite?.maxAttendees, 'usedAt', invite?.usedAt)
  console.log('guest', invite?.assignedTo?.fullName, 'slug', invite?.assignedTo?.nameSlug)
}

main().finally(() => prisma.$disconnect())
