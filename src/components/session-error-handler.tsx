"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function SessionErrorHandler() {
  const { data: session, status } = useSession()

  useEffect(() => {
    // Listen for JWT errors in the console and provide user feedback
    const originalConsoleError = console.error
    
    console.error = (...args) => {
      const message = args.join(' ')
      if (message.includes('JWT_SESSION_ERROR') || message.includes('decryption operation failed')) {
        // JWT decryption failed - this usually means the user has an old session token
        // The session will be null, so the user will need to login again
        console.log('Session token expired or invalid. Please login again.')
      }
      originalConsoleError.apply(console, args)
    }

    return () => {
      console.error = originalConsoleError
    }
  }, [])

  // This component doesn't render anything
  return null
}