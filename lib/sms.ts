export async function sendSms(phoneE164: string, message: string) {
  const url = process.env.SMS_API_URL
  const key = process.env.SMS_API_KEY
  if (!url || !key) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SMS:DEV]', phoneE164, message)
      return
    }
    throw new Error('SMS API not configured')
  }
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ to: phoneE164, message }),
    cache: 'no-store',
  })
}
