"use client"

import { SessionProvider } from "next-auth/react"
import { SessionErrorHandler } from "./session-error-handler"

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SessionErrorHandler />
      {children}
    </SessionProvider>
  )
}