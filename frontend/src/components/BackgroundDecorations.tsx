'use client'

import { Gift, Heart, ShoppingBag, Package } from 'lucide-react'

export default function BackgroundDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden max-w-[1800px] mx-auto -z-10 pointer-events-none">
      {/* Left side decorations */}
      <div className="absolute left-8 top-[15%] text-indigo-50 transform -rotate-12">
        <Gift className="w-24 h-24" />
      </div>
      <div className="absolute left-12 top-[45%] text-indigo-50 transform rotate-12">
        <Heart className="w-20 h-20" />
      </div>
      <div className="absolute left-16 bottom-[20%] text-indigo-50 transform -rotate-6">
        <ShoppingBag className="w-16 h-16" />
      </div>

      {/* Right side decorations */}
      <div className="absolute right-8 top-[20%] text-indigo-50 transform rotate-12">
        <Package className="w-20 h-20" />
      </div>
      <div className="absolute right-12 top-[50%] text-indigo-50 transform -rotate-12">
        <Heart className="w-24 h-24" />
      </div>
      <div className="absolute right-16 bottom-[15%] text-indigo-50 transform rotate-6">
        <Gift className="w-16 h-16" />
      </div>
    </div>
  )
} 