import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'

async function simulate(nameParam: string, codeParam: string, nParam = '1') {
  const nameSlug = slugifyName(decodeURIComponent(nameParam))
  const code = (codeParam || '').trim().toUpperCase()
  const requestedN = Number(nParam || '1')

  console.log('inputs:', { nameParam, nameSlug, code, requestedN })

  if (!/^[A-Z0-9]{4}$/.test(code)) {
    console.log('result: INVALID_CODE')
    return
  }

  const invite = await prisma.inviteCode.findUnique({ where: { code }, include: { assignedTo: true } })
  console.log('invite found:', !!invite)
  if (!invite) {
    console.log('result: NOT_FOUND_INVITE')
    return
  }
  if (!invite.assignedTo) {
    console.log('result: NOT_ASSIGNED')
    return
  }
  if (invite.assignedTo.nameSlug !== nameSlug) {
    console.log('result: NAME_MISMATCH', { expected: invite.assignedTo.nameSlug, got: nameSlug })
    return
  }
  if (invite.usedAt) {
    console.log('result: ALREADY_USED')
    return
  }
  const allowed = Math.max(1, Math.min(invite.maxAttendees, isFinite(requestedN) ? requestedN : 1))
  console.log('result: OK', { allowed, guest: invite.assignedTo.fullName })
}

const [name, code, n] = process.argv.slice(2)

simulate(name || 'desmond-smith', code || 'HCPX', n || '2')
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
