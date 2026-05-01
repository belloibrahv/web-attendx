"use client"

import { useEffect, useRef } from "react"
import QRCode from "react-qr-code"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Download, 
  Copy, 
  QrCode, 
  Clock, 
  MapPin, 
  BookOpen,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { encodePayload } from "@/lib/qr"

interface QRGeneratorProps {
  sessionData: {
    id: string
    courseId: string
    sessionToken: string
    courseCode: string
    courseTitle: string
    venue?: string
    expiryTime: string
    status: string
  }
  className?: string
}

export function QRGenerator({ sessionData, className }: QRGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null)
  
  // Create the proper payload format that matches what the API expects
  const payload = {
    sessionId: sessionData.id,
    courseId: sessionData.courseId,
    token: sessionData.sessionToken,
    expires: sessionData.expiryTime,
  }
  
  // Encode the payload using the same function used by the backend
  const qrValue = encodePayload(payload)
  
  console.log("[QR Generator] Generated QR payload:", {
    sessionId: payload.sessionId,
    courseId: payload.courseId,
    expires: payload.expires,
    tokenLength: payload.token.length
  })
  console.log("[QR Generator] Encoded QR value length:", qrValue.length)
  console.log("[QR Generator] Encoded QR value (first 50 chars):", qrValue.substring(0, 50))

  const downloadQR = () => {
    if (!qrRef.current) return
    
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    canvas.width = 512
    canvas.height = 512
    
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        const link = document.createElement('a')
        link.download = `attendance-qr-${sessionData.courseCode}-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
      }
    }
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  const copyQRData = async () => {
    try {
      await navigator.clipboard.writeText(qrValue)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy QR data:', err)
    }
  }

  const getTimeRemaining = () => {
    const now = new Date()
    const expiry = new Date(sessionData.expiryTime)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m remaining`
    }
    return `${minutes}m remaining`
  }

  const isExpired = new Date(sessionData.expiryTime) <= new Date()
  const isActive = sessionData.status === "ACTIVE" && !isExpired

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Attendance QR Code</CardTitle>
        <CardDescription>
          Students scan this code to mark their attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Session Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge 
              variant={isActive ? "success" : isExpired ? "destructive" : "secondary"}
              className="flex items-center gap-1"
            >
              {isActive ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                  Active Session
                </>
              ) : isExpired ? (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3" />
                  {sessionData.status}
                </>
              )}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getTimeRemaining()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{sessionData.courseCode}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-muted-foreground">{sessionData.courseTitle}</span>
            </div>
            
            {sessionData.venue && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{sessionData.venue}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires at {new Date(sessionData.expiryTime).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div 
            ref={qrRef}
            className={cn(
              "rounded-lg border-2 p-4 bg-white transition-all",
              isActive 
                ? "border-green-200 shadow-lg shadow-green-100" 
                : "border-muted opacity-60"
            )}
          >
            <QRCode
              value={qrValue}
              size={200}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              viewBox="0 0 256 256"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-lg bg-muted/50 p-4 text-sm">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Instructions for Students
          </h4>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Open the attendance scanner on your device</li>
            <li>• Point your camera at this QR code</li>
            <li>• Wait for automatic detection and confirmation</li>
            <li>• Your attendance will be recorded instantly</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={downloadQR}
            className="flex-1"
            disabled={!isActive}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={copyQRData}
            className="flex-1"
            disabled={!isActive}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy Data
          </Button>
        </div>

        {!isActive && (
          <div className="text-center text-sm text-muted-foreground">
            {isExpired 
              ? "This session has expired. Create a new session to generate a fresh QR code."
              : "Session is not active. Students cannot scan this code yet."
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}