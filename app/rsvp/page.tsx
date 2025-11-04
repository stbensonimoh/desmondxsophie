import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { verifyInviteToken } from '@/lib/token'
import { normalizeNgPhone } from '@/lib/phone'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

async function getContext(token: string | null) {
  if (!token) return null
  const payload = verifyInviteToken(token)
  if (!payload) return null

  const [guest, invite] = await Promise.all([
    prisma.guest.findUnique({ where: { id: payload.gid } }),
    prisma.inviteCode.findUnique({ where: { code: payload.code } }),
  ])

  if (!guest || !invite) return null
  if (invite.assignedToId !== guest.id) return null // code must belong to guest
  if (invite.usedAt) return { guest, invite, used: true }
  return { guest, invite, used: false }
}

async function submitAction(formData: FormData) {
  'use server'
  const token = formData.get('token')?.toString() ?? ''
  const status = formData.get('status')?.toString() as 'YES' | 'NO' | 'MAYBE'
  const note = formData.get('note')?.toString() ?? ''
  const attendees = Number(formData.get('attendees')?.toString() ?? '1')
  const phoneInput = formData.get('phone')?.toString() ?? ''

  if (!['YES', 'NO', 'MAYBE'].includes(status)) {
    redirect('/')
  }

  const ctx = await getContext(token)
  if (!ctx || ctx.used) {
    redirect('/')
  }
  const { guest, invite } = ctx

  const count = Math.max(1, Math.min(invite.maxAttendees, isFinite(attendees) ? attendees : 1))
  const phone = normalizeNgPhone(phoneInput)
  if (!phone) {
    redirect(`/rsvp?token=${encodeURIComponent(token)}&error=phone`)
  }

  const existing = await prisma.rsvpResponse.findUnique({ where: { codeId: invite.id } })
  if (existing) {
    redirect('/rsvp/thanks')
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.guest.update({
      where: { id: guest.id },
      data: {
        phone: phone!,
        note: note || null,
      },
    })

    await tx.rsvpResponse.create({
      data: {
        guestId: guest.id,
        codeId: invite.id,
        status,
        attendees: count,
        note: note || null,
      },
    })

    await tx.inviteCode.update({
      where: { id: invite.id },
      data: { usedAt: new Date() },
    })
  })

  const message =
    status === 'YES'
      ? `Hello! We are thrilled to hear that you'll be attending our wedding lunch! Your positive response has filled our hearts with joy, and we can't wait to celebrate this special day with you.

We look forward to sharing the joy with you on our big day!

Desmond & Sophie`
      : status === 'NO'
      ? `Hello! Thank you for taking the time to RSVP to our wedding. We appreciate your response, and while we'll miss having you with us on our special day, we understand that sometimes other commitments come first.

Your thoughtfulness in responding means a lot to us. We hope you have a wonderful day, and we'll be sure to celebrate together another time.

Wishing you all the best,
Desmond & Sophie`
      : `Thanks for responding. Kindly let us know when you decide.

Desmond & Sophie`

  // Redirect to thanks page with the message
  const encodedMessage = encodeURIComponent(message)
  redirect(`/rsvp/thanks?message=${encodedMessage}`)
}

export default async function RsvpPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await (searchParams || Promise.resolve({}))
  const tokenParam = Array.isArray((resolvedSearchParams as any)?.token)
    ? ((resolvedSearchParams as any)?.token?.[0] ?? '')
    : ((resolvedSearchParams as any)?.token as string | undefined) ?? ''
  const errorParam = Array.isArray((resolvedSearchParams as any)?.error)
    ? ((resolvedSearchParams as any)?.error?.[0] ?? '')
    : ((resolvedSearchParams as any)?.error as string | undefined) ?? ''

  const ctx = await getContext(tokenParam || null)
  if (!ctx) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">Invalid or expired link</h1>
        <p className="mt-2 text-gray-600">Open your RSVP link from your invite page.</p>
      </div>
    )
  }
  if (ctx.used) {
    return (
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">RSVP already submitted</h1>
        <p className="mt-2 text-gray-700">Thank you! If this is a mistake, contact the couple.</p>
      </div>
    )
  }

  const { guest, invite } = ctx
  const phoneError = errorParam === 'phone'

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold text-center">RSVP</h1>
      <p className="mt-2 text-center text-gray-700">
        Hi {guest.fullName}, your invite allows up to {invite.maxAttendees}.
      </p>
      <form action={submitAction} className="mt-6 space-y-4">
  <input type="hidden" name="token" value={tokenParam} />

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="YES" required />
            Attending
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="NO" />
            Not attending
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="MAYBE" />
            Not sure yet
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Number attending</label>
          <input
            type="number"
            name="attendees"
            min={1}
            max={invite.maxAttendees}
            defaultValue={Math.min(1, invite.maxAttendees)}
            className="mt-1 w-full rounded border p-2"
          />
          <p className="mt-1 text-xs text-gray-500">Up to {invite.maxAttendees}.</p>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Phone (Nigeria)</label>
          <input
            type="tel"
            name="phone"
            required
            inputMode="tel"
            placeholder="+2348031234567 or 08031234567"
            className={`mt-1 w-full rounded border p-2 ${phoneError ? 'border-red-500' : ''}`}
            defaultValue={guest.phone ?? ''}
          />
          {phoneError && <p className="mt-1 text-sm text-red-600">Enter a valid Nigerian phone number.</p>}
        </div>

        <div>
          <label className="block text-sm text-gray-600">Notes (optional)</label>
          <textarea name="note" defaultValue={guest.note ?? ''} className="mt-1 w-full rounded border p-2" rows={3} />
        </div>

        <button className="rounded bg-black px-5 py-2 text-white hover:bg-gray-800" type="submit">
          Submit RSVP
        </button>
      </form>
    </div>
  )
}
