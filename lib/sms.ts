interface SendSmsOptions {
  gateway?: 'direct-refund' | 'direct-corporate' | 'otp' | 'dual-backup'
  appendSender?: 'none' | 'hosted' | 'all'
  callbackUrl?: string
  customerReference?: string
}

export async function sendSms(
  phoneE164: string, 
  message: string, 
  options: SendSmsOptions = {}
) {
  const apiToken = process.env.SMS_API_TOKEN
  const senderId = 'DS2025' // Max 11 characters
  const apiUrl = process.env.SMS_API_URL || 'https://www.bulksmsnigeria.com/api/v2/sms'
  
  if (!apiToken) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SMS:DEV]', phoneE164, message)
      return { success: true, messageId: `dev-${Date.now()}` }
    }
    throw new Error('SMS API token not configured (SMS_API_TOKEN)')
  }

  // Remove + prefix if present for BulkSMS Nigeria format
  const to = phoneE164.startsWith('+') ? phoneE164.slice(1) : phoneE164

  const data = {
    from: senderId,
    to,
    body: message,
    ...(options.gateway && { gateway: options.gateway }),
    ...(options.appendSender && { append_sender: options.appendSender }),
    ...(options.callbackUrl && { callback_url: options.callbackUrl }),
    ...(options.customerReference && { customer_reference: options.customerReference }),
  }

  try {
    // Build URL with api_token query parameter
    const url = new URL(apiUrl)
    url.searchParams.append('api_token', apiToken)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      cache: 'no-store',
    })

    const responseText = await response.text()
    
    // Try to parse as JSON
    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      throw new Error(`SMS API returned invalid JSON. Response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`)
    }
    
    if (!response.ok) {
      throw new Error(`SMS API error (${response.status}): ${result.message || response.statusText}`)
    }

    return result
  } catch (error) {
    console.error('SMS sending failed:', error)
    throw error
  }
}
