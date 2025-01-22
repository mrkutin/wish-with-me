'use client'

import { Gift, Heart } from 'lucide-react'

export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden max-w-[1800px] mx-auto">
      {/* Left side decorations */}
      <div className="absolute left-8 top-[20%] text-primary/5 transform -rotate-12">
        <Gift className="w-24 h-24" />
      </div>
      <div className="absolute left-12 bottom-[30%] text-primary/5 transform rotate-12">
        <Heart className="w-20 h-20" />
      </div>

      {/* Right side decorations */}
      <div className="absolute right-8 top-[30%] text-primary/5 transform rotate-12">
        <Heart className="w-24 h-24" />
      </div>
      <div className="absolute right-12 bottom-[20%] text-primary/5 transform -rotate-12">
        <Gift className="w-20 h-20" />
      </div>
    </div>
  )
} 