import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'
import { signInviteToken } from '@/lib/token'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ name: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await params
  const resolvedSearchParams = await (searchParams || Promise.resolve({}))
  const nameSlug = slugifyName(decodeURIComponent(resolvedParams.name))
  const rawCode = Array.isArray((resolvedSearchParams as any)?.code)
    ? ((resolvedSearchParams as any)?.code?.[0] ?? '')
    : ((resolvedSearchParams as any)?.code as string | undefined) ?? ''
  const rawN = Array.isArray((resolvedSearchParams as any)?.n)
    ? ((resolvedSearchParams as any)?.n?.[0] ?? '1')
    : ((resolvedSearchParams as any)?.n as string | undefined) ?? '1'

  const code = rawCode.trim().toUpperCase()
  const requestedN = Number(rawN)
  const isCodeFormatOK = /^[A-Z0-9]{4}$/.test(code)

  if (!isCodeFormatOK) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">Invalid invite code</h1>
        <p className="mt-2 text-gray-600">Please check your link or contact the couple.</p>
        {process.env.NODE_ENV !== 'production' && (
          <pre className="mt-4 rounded bg-gray-100 p-3 text-left text-xs text-gray-600 overflow-auto">
{JSON.stringify({ resolvedParams, resolvedSearchParams, parsed: { nameSlug, rawCode, code, rawN, requestedN, isCodeFormatOK } }, null, 2)}
          </pre>
        )}
      </div>
    )
  }

  const invite = await prisma.inviteCode.findUnique({
    where: { code },
    include: { assignedTo: true },
  })

  if (!invite || !invite.assignedTo || invite.assignedTo.nameSlug !== nameSlug) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">Invite not found</h1>
        <p className="mt-2 text-gray-600">Please check your link or contact the couple.</p>
      </div>
    )
  }

  if (invite.usedAt) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">This invite code has already been used</h1>
        <p className="mt-2 text-gray-600">Contact the couple if you need help.</p>
      </div>
    )
  }

  const guest = invite.assignedTo
  const allowed = Math.max(1, Math.min(invite.maxAttendees, isFinite(requestedN) ? requestedN : 1))
  const token = signInviteToken({ gid: guest.id, code })

  return (
    <div className="mx-auto max-w-2xl p-8 text-center">
      <h1 className="text-3xl font-serif">You’re Invited</h1>
      <p className="mt-6 text-lg">Dear {guest.fullName},</p>
      <p className="mt-4">We are thrilled to invite you to celebrate our special day with us.</p>
      <p className="mt-4">Your invitation admits up to {allowed} {allowed > 1 ? 'guests' : 'guest'}.</p>
      <div className="mt-8">
        <Link
          href={`/rsvp?token=${encodeURIComponent(token)}`}
          prefetch={false}
          className="inline-block rounded bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          Please RSVP
        </Link>
      </div>
    </div>
  )
}
