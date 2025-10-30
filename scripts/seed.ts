import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'

async function main() {
  const people = ['Sophie Doe', 'Desmond Smith']
  for (const fullName of people) {
    const nameSlug = slugifyName(fullName)
    const guest = await prisma.guest.upsert({
      where: { nameSlug },
      update: { fullName },
      create: { fullName, nameSlug },
    })

    const existing = await prisma.inviteCode.findFirst({ where: { assignedToId: guest.id } })
    if (!existing) {
      const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
      let code = ''
      while (true) {
        code = Array.from({ length: 4 })
          .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
          .join('')
        if (!(await prisma.inviteCode.findUnique({ where: { code } }))) break
      }
      await prisma.inviteCode.create({ data: { code, maxAttendees: 2, assignedToId: guest.id } })
      console.log(`Invite: /invite/${nameSlug}?code=${code}&n=2`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
