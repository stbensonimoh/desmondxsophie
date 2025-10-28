'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const weddingDate = new Date('2025-12-06T00:00:00')

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = weddingDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header/Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 px-6 py-6 md:px-12">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-800/30 backdrop-blur-sm flex items-center justify-center border border-gray-700/50">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-gray-700 font-cursive text-xl md:text-2xl" style={{ fontFamily: "'Mea Culpa', cursive" }}>Desmond & Sophie</span>
          </div>

          {/* Navigation Links */}
          {/* <div className="hidden md:flex items-center gap-8 text-gray-700">
            <a href="#gallery" className="hover:text-gray-900 transition-colors">Gallery</a>
            <a href="#registry" className="hover:text-gray-900 transition-colors">Registry</a>
            <button className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-2 rounded-full transition-colors font-medium">
              RSVP
            </button>
          </div> */}

          {/* Mobile Menu Button */}
          {/* <button className="md:hidden text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button> */}
        </nav>
      </header>

      {/* Hero Section with Background Image */}
      <main className="flex-1 relative overflow-hidden">
        {/* Background Image Overlay */}
        <div className="absolute inset-0">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/rings-bg.jpg)',
              backgroundPosition: 'center',
            }}
          />
          {/* Lilac overlay for better text readability and color palette */}
          <div className="absolute inset-0 bg-linear-to-b from-purple-100/60 via-white/50 to-purple-50/60"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Names in Fleur De Leah font */}
          <h1 
            className="text-7xl sm:text-8xl md:text-7xl lg:text-[8rem] xl:text-[12rem] mb-8 text-center leading-tight"
            style={{ 
              fontFamily: "'Fleur De Leah', cursive",
              color: '#9370DB',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(255, 255, 255, 0.8)'
            }}
          >
            <span className="block md:inline">Desmond</span>
            <span className="block md:inline"> & </span>
            <span className="block md:inline">Sophie</span>
          </h1>

          {/* Save the Date */}
          <p className="text-purple-700 text-lg md:text-xl tracking-widest mb-12 uppercase font-light" style={{textAlign: 'center'}}>
            Save the Date - December 6, 2025
          </p>

          {/* Countdown Title */}
          <h2 className="text-purple-800 text-2xl md:text-3xl mb-8 font-light">
            Countdown to Our Day
          </h2>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-3xl w-full mb-16">
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold text-purple-800 mb-2">
                {timeLeft.days}
              </div>
              <div className="text-purple-700 text-sm md:text-base uppercase tracking-wider">
                Days
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold text-purple-800 mb-2">
                {timeLeft.hours}
              </div>
              <div className="text-purple-700 text-sm md:text-base uppercase tracking-wider">
                Hours
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold text-purple-800 mb-2">
                {timeLeft.minutes}
              </div>
              <div className="text-purple-700 text-sm md:text-base uppercase tracking-wider">
                Minutes
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-7xl font-bold text-purple-800 mb-2">
                {timeLeft.seconds}
              </div>
              <div className="text-purple-700 text-sm md:text-base uppercase tracking-wider">
                Seconds
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/90 backdrop-blur-sm py-8 px-6 relative z-20 border-t border-purple-200">
        <div className="max-w-6xl mx-auto">
          {/* Navigation Links */}
          {/* <div className="flex items-center justify-center gap-8 mb-6 text-purple-700">
            <a href="#gallery" className="hover:text-purple-900 transition-colors">Gallery</a>
            <a href="#registry" className="hover:text-purple-900 transition-colors">Registry</a>
            <a href="#rsvp" className="hover:text-purple-900 transition-colors">RSVP</a>
          </div> */}

          {/* Social Icons */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <a href="#" className="text-purple-400 hover:text-purple-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-purple-400 hover:text-purple-600 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>

          {/* Copyright */}
            <div className="text-center text-purple-600 text-sm">
            © {new Date().getFullYear()} Desmond & Sophie. All Rights Reserved.
            </div>
        </div>
      </footer>
    </div>
  )
}
