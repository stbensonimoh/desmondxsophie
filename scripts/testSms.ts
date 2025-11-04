import { normalizeNgPhone } from '@/lib/phone'

// Direct API test function with detailed debugging
async function testSmsApiDirect() {
  const phoneInput = process.argv[2] || '08031234567'
  const message = process.argv[3] || 'Test message from D&S Wedding RSVP system'
  const gateway = process.argv[4] as 'direct-refund' | 'direct-corporate' | 'otp' | 'dual-backup' | undefined

  console.log('🔧 Testing SMS Configuration...')
  console.log('API Token:', process.env.SMS_API_TOKEN ? `✅ Set (${process.env.SMS_API_TOKEN.substring(0, 8)}...)` : '❌ Not set')
  console.log('API URL:', process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms')
  console.log('Sender ID: DS2025')
  console.log('')

  const apiToken = process.env.SMS_API_TOKEN
  const apiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
  
  if (!apiToken) {
    console.log('❌ No API token found. Set SMS_API_TOKEN in your .env file.')
    return
  }

  console.log('📱 Input Details:')
  console.log('Phone Input:', phoneInput)
  
  const normalizedPhone = normalizeNgPhone(phoneInput)
  if (!normalizedPhone) {
    console.log('❌ Phone normalization failed')
    console.log('Expected format: +2348031234567 or 08031234567')
    return
  }
  
  // Remove + prefix for BulkSMS Nigeria format
  const to = normalizedPhone.startsWith('+') ? normalizedPhone.slice(1) : normalizedPhone
  
  console.log('Normalized Phone:', normalizedPhone)
  console.log('API Format Phone:', to)
  console.log('Message:', message)
  console.log('Gateway:', gateway || 'default')
  console.log('')

  const data = {
    from: 'DS2025',
    to,
    body: message,
    ...(gateway && { gateway }),
    customer_reference: `test-${Date.now()}`,
  }

  console.log('📤 API Request Details:')
  const testUrl = new URL(apiUrl)
  testUrl.searchParams.append('api_token', apiToken)
  console.log('URL:', testUrl.toString())
  console.log('Headers:')
  console.log('  Content-Type: application/json')
  console.log('Payload:', JSON.stringify(data, null, 2))
  console.log('')

  try {
    console.log('🌐 Making API request...')
    const response = await fetch(testUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    })

    console.log('📡 Response Status:', response.status, response.statusText)
    console.log('📡 Response Headers:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    console.log('')

    const responseText = await response.text()
    console.log('📡 Raw Response Body:')
    console.log(responseText.substring(0, 500) + (responseText.length > 500 ? '...' : ''))
    console.log('')

    if (!response.ok) {
      console.log('❌ HTTP Error:', response.status, response.statusText)
      return
    }

    // Try to parse as JSON
    try {
      const result = JSON.parse(responseText)
      console.log('✅ SMS sent successfully!')
      console.log('Parsed Result:', JSON.stringify(result, null, 2))
    } catch (parseError) {
      console.log('❌ Failed to parse response as JSON')
      console.log('Parse Error:', parseError)
      console.log('This might indicate an API endpoint or authentication issue.')
    }

  } catch (error) {
    console.log('❌ Network/Fetch Error!')
    if (error instanceof Error) {
      console.log('Error:', error.message)
    } else {
      console.log('Error:', error)
    }
  }
}

console.log('📧 SMS Test Script')
console.log('=================')
console.log('Usage: bun run scripts/testSms.ts [phone] [message] [gateway]')
console.log('Example: bun run scripts/testSms.ts "08031234567" "Hello World" "otp"')
console.log('')

testSmsApiDirect()
  .catch((error: any) => {
    console.error('Script error:', error)
    process.exit(1)
  })