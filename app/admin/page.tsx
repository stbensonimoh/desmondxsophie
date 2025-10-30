import { prisma } from '@/lib/prisma'
import { slugifyName } from '@/lib/slug'
import { normalizeNgPhone } from '@/lib/phone'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { CopyLinkButton, PrintButton, CopyInviteLink } from './ClientButtons'

export const dynamic = 'force-dynamic'

async function loginAction(formData: FormData) {
  'use server'
  const pwd = formData.get('password')?.toString() ?? ''
  if (pwd && process.env.INVITE_ADMIN_PASSWORD && pwd === process.env.INVITE_ADMIN_PASSWORD) {
    const jar = await cookies()
    jar.set('admin_auth', 'true', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' })
    redirect('/admin')
  } else {
    redirect('/admin?error=invalid')
  }
}

async function logoutAction() {
  'use server'
  const jar = await cookies()
  jar.delete('admin_auth')
  redirect('/admin')
}

async function requireAdmin() {
  const jar = await cookies()
  const isAuth = jar.get('admin_auth')?.value === 'true'
  return isAuth
}

async function createGuestAction(formData: FormData) {
  'use server'
  if (!(await requireAdmin())) redirect('/admin')
  
  const fullName = formData.get('fullName')?.toString() ?? ''
  const email = formData.get('email')?.toString() || null
  const phoneInput = formData.get('phone')?.toString() ?? ''
  const maxAttendees = Number(formData.get('maxAttendees')?.toString() ?? '1')
  
  const phone = normalizeNgPhone(phoneInput)
  if (!phone) {
    redirect('/admin?error=phone')
  }
  
  const nameSlug = slugifyName(fullName)
  
  // Create guest and code in transaction
  const result = await prisma.$transaction(async (tx) => {
    const guest = await tx.guest.upsert({
      where: { nameSlug },
      update: { fullName, email, phone },
      create: { fullName, email, phone, nameSlug },
    })

    // Generate unique code
    let code: string
    while (true) {
      code = genCode()
      const exists = await tx.inviteCode.findUnique({ where: { code } })
      if (!exists) break
    }
    
    const inviteCode = await tx.inviteCode.create({
      data: {
        code,
        maxAttendees: Math.max(1, Math.min(10, maxAttendees)),
        assignedToId: guest.id,
      },
    })
    
    return { guest, inviteCode }
  })
  
  const link = `/invite/${result.guest.nameSlug}?code=${result.inviteCode.code}&n=${result.inviteCode.maxAttendees}`
  redirect(`/admin?created=true&link=${encodeURIComponent(link)}`)
}

function genCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
  return code
}

async function exportGuestListAction() {
  'use server'
  if (!(await requireAdmin())) redirect('/admin')
  redirect('/admin?exported=true')
}

export default async function AdminPage({ 
  searchParams 
}: { 
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedSearchParams = await (searchParams || Promise.resolve({}))
  const isAdmin = await requireAdmin()
  
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold mb-4">Admin Access</h1>
        <form action={loginAction} className="space-y-4">
          <input
            type="password"
            name="password"
            placeholder="Admin password"
            className="w-full rounded border p-2"
            required
          />
          <button className="w-full rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
            Login
          </button>
        </form>
        {(resolvedSearchParams as any).error === 'invalid' && (
          <p className="mt-2 text-red-600">Invalid password</p>
        )}
      </div>
    )
  }

  // Fetch all guests with their invite codes and RSVP responses
  const guests = await prisma.guest.findMany({
    include: {
      codes: {
        include: {
          response: true
        }
      }
    },
    orderBy: { fullName: 'asc' }
  })

  // Calculate attendance summary
  const summary = {
    totalGuests: guests.length,
    totalCodes: guests.reduce((sum, guest) => sum + guest.codes.length, 0),
    responded: 0,
    attending: 0,
    notAttending: 0,
    maybe: 0,
    totalAttendees: 0,
    notResponded: 0
  }

  guests.forEach(guest => {
    guest.codes.forEach(code => {
      if (code.response) {
        summary.responded++
        if (code.response.status === 'YES') {
          summary.attending++
          summary.totalAttendees += code.response.attendees
        } else if (code.response.status === 'NO') {
          summary.notAttending++
        } else if (code.response.status === 'MAYBE') {
          summary.maybe++
          // Count maybe as 50% for planning purposes
          summary.totalAttendees += Math.ceil(code.response.attendees * 0.5)
        }
      } else {
        summary.notResponded++
      }
    })
  })

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Wedding Admin Dashboard</h1>
        <form action={logoutAction}>
          <button className="rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
            Logout
          </button>
        </form>
      </div>

      {(resolvedSearchParams as any).exported && (
        <div className="mb-4 rounded bg-green-50 border border-green-200 p-3 text-green-800">
          Guest list export initiated (feature to be implemented)
        </div>
      )}

      {/* Attendance Summary */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded bg-blue-50 p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{summary.totalAttendees}</div>
          <div className="text-sm text-blue-800">Expected Attendees</div>
        </div>
        <div className="rounded bg-green-50 p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{summary.attending}</div>
          <div className="text-sm text-green-800">Confirmed Yes</div>
        </div>
        <div className="rounded bg-yellow-50 p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{summary.maybe}</div>
          <div className="text-sm text-yellow-800">Maybe</div>
        </div>
        <div className="rounded bg-red-50 p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{summary.notAttending}</div>
          <div className="text-sm text-red-800">Not Attending</div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold">{summary.totalGuests}</div>
          <div className="text-gray-600">Total Guests</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{summary.totalCodes}</div>
          <div className="text-gray-600">Invite Codes</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{summary.responded}</div>
          <div className="text-gray-600">Responded</div>
        </div>
        <div className="text-center">
          <div className="font-semibold">{summary.notResponded}</div>
          <div className="text-gray-600">Not Responded</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex gap-4">
        <form action={exportGuestListAction}>
          <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Export Guest List (CSV)
          </button>
        </form>
        <PrintButton />
      </div>

      {/* Guest List Table */}
      <div className="mb-8 overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Guest List & RSVP Status</h2>
        <table className="w-full border-collapse border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="border border-gray-200 px-4 py-2 text-left">Guest Name</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Contact</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Invite Code</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Max Guests</th>
              <th className="border border-gray-200 px-4 py-2 text-left">RSVP Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Attendees</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Responded</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Note</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map(guest => 
              guest.codes.map(code => (
                <tr key={code.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2 font-medium">
                    {guest.fullName}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm">
                    {guest.email && <div>{guest.email}</div>}
                    {guest.phone && <div>{guest.phone}</div>}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 font-mono text-sm">
                    {code.code}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {code.maxAttendees}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    {code.response ? (
                      <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                        code.response.status === 'YES' 
                          ? 'bg-green-100 text-green-800'
                          : code.response.status === 'NO'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {code.response.status}
                      </span>
                    ) : (
                      <span className="inline-block rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                        No Response
                      </span>
                    )}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-center">
                    {code.response?.attendees || '-'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm text-gray-600">
                    {code.response?.respondedAt.toLocaleDateString() || '-'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2 text-sm max-w-xs truncate">
                    {code.response?.note || '-'}
                  </td>
                  <td className="border border-gray-200 px-4 py-2">
                    <CopyLinkButton 
                      link={`/invite/${guest.nameSlug}?code=${code.code}&n=${code.maxAttendees}`}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Guest Section */}
      <div className="rounded border p-6">
        <h2 className="text-xl font-semibold mb-4">Add New Guest</h2>
        <form action={createGuestAction} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              className="rounded border p-2"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email (optional)"
              className="rounded border p-2"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone (+234...)"
              className="rounded border p-2"
              required
            />
            <input
              type="number"
              name="maxAttendees"
              placeholder="Max attendees"
              min="1"
              max="10"
              defaultValue="1"
              className="rounded border p-2"
              required
            />
          </div>
          <button className="rounded bg-black px-4 py-2 text-white hover:bg-gray-800">
            Create Guest & Generate Code
          </button>
        </form>

        {(resolvedSearchParams as any).created && (
          <div className="mt-4 rounded bg-green-50 border border-green-200 p-3">
            <p className="text-green-800">
              Guest created! Invite link: 
              <CopyInviteLink link={(resolvedSearchParams as any).link} />
            </p>
          </div>
        )}

        {(resolvedSearchParams as any).error === 'phone' && (
          <div className="mt-4 rounded bg-red-50 border border-red-200 p-3">
            <p className="text-red-800">Invalid Nigerian phone number format</p>
          </div>
        )}
      </div>
    </div>
  )
}
