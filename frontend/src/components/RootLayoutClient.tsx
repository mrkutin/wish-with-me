'use client'

import { Inter } from "next/font/google"
import { useAuth } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"
import LayoutSkeleton from "@/components/LayoutSkeleton"
import BackgroundDecorations from "@/components/BackgroundDecorations"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayoutClient({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth()

  if (loading) {
    return <LayoutSkeleton />
  }

  return (
    <>
      <Navbar />
      <div className="relative min-h-screen">
        <BackgroundDecorations />
        <main className={inter.className}>{children}</main>
      </div>
    </>
  )
} 