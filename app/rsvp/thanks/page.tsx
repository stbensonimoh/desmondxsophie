'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function RsvpThanks() {
  const searchParams = useSearchParams()
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const messageParam = searchParams.get('message')
    if (messageParam) {
      setMessage(decodeURIComponent(messageParam))
      setShowModal(true)
    }
  }, [searchParams])

  return (
    <>
      <div className="mx-auto max-w-xl p-8 text-center">
        <h1 className="text-2xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-gray-700">Your response has been recorded.</p>
        <p className="mt-4 text-sm text-gray-600">
          A confirmation message has been prepared for you.
        </p>
      </div>

      {/* Sweet Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Message for You
            </h3>
            <div className="text-sm text-gray-600 mb-6 whitespace-pre-wrap leading-relaxed">
              {message}
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Thank You!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
