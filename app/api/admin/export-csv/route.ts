import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

async function requireAdmin() {
  const jar = await cookies()
  const isAuth = jar.get('admin_auth')?.value === 'true'
  return isAuth
}

function escapeCSV(value: string | null | undefined): string {
  if (!value) return ''
  const str = String(value)
  // Escape quotes by doubling them and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export async function GET(request: NextRequest) {
  // Check admin authentication
  if (!(await requireAdmin())) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
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

    // Create CSV headers
    const headers = [
      'Guest Name',
      'Email',
      'Phone',
      'Invite Code',
      'Max Guests',
      'RSVP Status',
      'Attendees',
      'Responded Date',
      'Note',
      'Invite Link'
    ]

    // Create CSV rows
    const rows: string[] = []
    
    guests.forEach(guest => {
      guest.codes.forEach(code => {
        const row = [
          escapeCSV(guest.fullName),
          escapeCSV(guest.email),
          escapeCSV(guest.phone),
          escapeCSV(code.code),
          String(code.maxAttendees),
          escapeCSV(code.response?.status || 'No Response'),
          escapeCSV(code.response?.attendees?.toString() || ''),
          escapeCSV(code.response?.respondedAt?.toLocaleDateString() || ''),
          escapeCSV(code.response?.note || ''),
          escapeCSV(`${request.nextUrl.origin}/invite/${guest.nameSlug}?code=${code.code}&n=${code.maxAttendees}`)
        ]
        rows.push(row.join(','))
      })
    })

    // Combine headers and rows
    const csvContent = [headers.join(','), ...rows].join('\n')

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `wedding-guest-list-${date}.csv`

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}