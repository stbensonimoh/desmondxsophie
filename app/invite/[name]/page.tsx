import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'
import { signInviteToken } from '@/lib/token'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

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
      <p className="mt-4 font-bold">Your invitation admits up to {allowed} {allowed > 1 ? 'guests' : 'guest'}.</p>
      <div className="mt-8">
        <p>
          We have some incredibly exciting news: We're taking the bold, most joyful step of our lives, we're getting married!..and we're over the moon about it.
        </p>
        
        <p>
          As we exchange vows and celebrate the beginning of our forever, we would be deeply honored if you would join us for our wedding ceremony.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Key Details</h3>
          <div className="space-y-1">
        <p><span className="font-medium">Date:</span> Saturday 6th December 2025</p>
        <p><span className="font-medium">Time:</span> 2:00 PM</p>
        <p><span className="font-medium">Venue:</span> To be communicated after RSVP.</p>
          </div>
        </div>
        
        <p>
          Our decision to keep the event small and intimate with only our closest friends and family stems from our desire to share this meaningful moment with the people who mean the most to us. You hold a special place in our hearts, and your presence would mean the world to us.
        </p>
        
        <p>
          However, we understand that schedules and commitments can vary, so please know that your well wishes are equally cherished, whether you can attend or not.
        </p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
          <h4 className="font-semibold text-amber-900 mb-2">Adults-Only Celebration</h4>
          <p className="text-amber-800">
        While we adore and cherish the little ones in our lives, we have made the decision to make this event an Adults-Only Affair. We hope you understand our choice, as it allows us to create a serene and relaxed atmosphere where we can fully enjoy your company and celebrate together.
          </p>
        </div>
        
        <p>
          Please know that your children are always dear to us, and we look forward to having opportunities to celebrate with them in the future. We trust that you will be able to make suitable childcare arrangements so that you can join us for this special occasion.
        </p>
        
        <p>
          As we prepare for this intimate gathering, we want to kindly emphasize that our wedding ceremony is a private event and is strictly by invitation.
        </p>
        
        <p className="text-center font-medium">
          We truly hope to see you on this special day, but most importantly, we are grateful for your presence in our lives.
        </p>
        
        <p className="text-center italic mb-4">
          With love and anticipation.
        </p>
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
