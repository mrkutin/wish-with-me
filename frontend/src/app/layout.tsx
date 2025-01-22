import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import RootLayoutClient from "@/components/RootLayoutClient"

export const metadata: Metadata = {
  title: "WishWithMe - Create and Share Wishlists",
  description: "Create, manage and share your wishlists with friends and family",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <AuthProvider>
          <RootLayoutClient>{children}</RootLayoutClient>
        </AuthProvider>
      </body>
    </html>
  )
}
