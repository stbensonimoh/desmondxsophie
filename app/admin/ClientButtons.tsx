'use client'

interface ClientButtonsProps {
  link: string
}

export function CopyLinkButton({ link }: ClientButtonsProps) {
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const fullLink = link.startsWith('http') ? link : `${window.location.origin}${link}`
      navigator.clipboard.writeText(fullLink)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className="text-blue-600 hover:text-blue-800 text-sm"
    >
      Copy Link
    </button>
  )
}

export function PrintButton() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <button 
      onClick={handlePrint}
      className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
    >
      Print Summary
    </button>
  )
}

interface CopyInviteLinkProps {
  link: string
  text?: string
  className?: string
}

export function CopyInviteLink({ link, text = "Copy Link", className = "ml-2 text-blue-600 hover:text-blue-800 underline" }: CopyInviteLinkProps) {
  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      const fullLink = link.startsWith('http') ? link : `${window.location.origin}${link}`
      navigator.clipboard.writeText(fullLink)
    }
  }

  return (
    <button 
      onClick={handleCopy}
      className={className}
    >
      {text}
    </button>
  )
}