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
    <main className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-lilac-light via-white to-lilac-light">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, #C8A2C8 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}></div>
      </div>

      {/* Wedding rings background image */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20">
        <img 
          src="/rings.svg" 
          alt="Wedding rings" 
          className="w-64 h-64 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-4xl">
        {/* Names in cursive */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-lilac-dark mb-6 sm:mb-8" style={{ fontFamily: "'Dancing Script', cursive" }}>
          Desmond & Sophie
        </h1>

        {/* Coming Soon */}
        <div className="mb-8 sm:mb-12">
          <p className="text-xl sm:text-2xl md:text-3xl text-lilac-dark/80 font-light tracking-wide">
            Coming Soon
          </p>
          <div className="w-24 sm:w-32 h-1 bg-lilac mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Wedding Date */}
        <p className="text-lg sm:text-xl md:text-2xl text-lilac-dark/70 mb-8 sm:mb-12 font-light">
          December 6th, 2025
        </p>

        {/* Countdown Timer */}
        <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6 max-w-2xl mx-auto">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 shadow-lg border border-lilac/20">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lilac-dark">
              {timeLeft.days}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-lilac-dark/70 mt-1 sm:mt-2">
              Days
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 shadow-lg border border-lilac/20">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lilac-dark">
              {timeLeft.hours}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-lilac-dark/70 mt-1 sm:mt-2">
              Hours
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 shadow-lg border border-lilac/20">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lilac-dark">
              {timeLeft.minutes}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-lilac-dark/70 mt-1 sm:mt-2">
              Minutes
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 sm:p-4 md:p-6 shadow-lg border border-lilac/20">
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-lilac-dark">
              {timeLeft.seconds}
            </div>
            <div className="text-xs sm:text-sm md:text-base text-lilac-dark/70 mt-1 sm:mt-2">
              Seconds
            </div>
          </div>
        </div>

        {/* Decorative element */}
        <div className="mt-12 sm:mt-16">
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <div className="w-12 sm:w-16 md:w-24 h-px bg-lilac"></div>
            <div className="text-2xl sm:text-3xl md:text-4xl text-lilac">❤️</div>
            <div className="w-12 sm:w-16 md:w-24 h-px bg-lilac"></div>
          </div>
        </div>
      </div>
    </main>
  )
}
