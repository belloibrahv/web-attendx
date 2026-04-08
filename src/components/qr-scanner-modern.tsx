"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Scanner } from "@yudiel/react-qr-scanner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading"
import { 
  Camera, 
  CameraOff, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  QrCode,
  Smartphone,
  RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QRScannerModernProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  className?: string
}

export function QRScannerModern({ onScanSuccess, onScanError, className }: QRScannerModernProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const hasHandledResult = useRef(false)

  // Check for camera and secure context support
  const [hasCameraSupport, setHasCameraSupport] = useState(false)
  const [isSecureContext, setIsSecureContext] = useState(false)

  useEffect(() => {
    setHasCameraSupport(Boolean(navigator.mediaDevices?.getUserMedia))
    setIsSecureContext(window.isSecureContext)
  }, [])

  const handleScanResult = useCallback((result: string) => {
    if (hasHandledResult.current) return
    
    hasHandledResult.current = true
    setScanResult(result)
    setIsScanning(false)
    onScanSuccess(result)
  }, [onScanSuccess])

  const handleScanError = useCallback((error: Error) => {
    console.warn("QR scan error:", error)
    
    // Only handle significant errors, not routine scanning failures
    if (error.message.includes("NotAllowedError") || error.message.includes("Permission denied")) {
      setScannerError("Camera access denied. Please allow camera permissions.")
      setHasPermission(false)
      setIsScanning(false)
      onScanError?.("Camera access denied")
    } else if (error.message.includes("NotFoundError") || error.message.includes("No camera")) {
      setScannerError("No camera found on this device.")
      setHasPermission(false)
      setIsScanning(false)
      onScanError?.("No camera found")
    } else if (error.message.includes("NotSupportedError")) {
      setScannerError("Camera not supported in this browser.")
      setHasPermission(false)
      setIsScanning(false)
      onScanError?.("Camera not supported")
    }
    // Ignore routine scanning errors (no QR code found, etc.)
  }, [onScanError])

  const startScanning = async () => {
    setIsInitializing(true)
    setScannerError(null)
    hasHandledResult.current = false
    setScanResult(null)
    
    try {
      // Check permissions first
      if (!hasCameraSupport) {
        throw new Error("Camera not supported in this browser")
      }
      
      if (!isSecureContext) {
        throw new Error("Camera access requires HTTPS or localhost")
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      stream.getTracks().forEach(track => track.stop())
      
      setHasPermission(true)
      setIsScanning(true)
    } catch (error: any) {
      console.error("Failed to start camera:", error)
      setRetryCount(prev => prev + 1)
      
      if (error.name === "NotAllowedError") {
        setScannerError("Camera access denied. Please allow camera permissions.")
        setHasPermission(false)
      } else if (error.name === "NotFoundError") {
        setScannerError("No camera found on this device.")
        setHasPermission(false)
      } else if (error.message.includes("HTTPS") || error.message.includes("secure")) {
        setScannerError("Camera access requires HTTPS or localhost.")
        setHasPermission(false)
      } else {
        setScannerError(`Failed to start camera: ${error.message}`)
        setHasPermission(false)
      }
      
      onScanError?.(error.message)
    } finally {
      setIsInitializing(false)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    hasHandledResult.current = false
    setScanResult(null)
  }

  // Permission denied or no camera
  if (hasPermission === false) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center pb-3 sm:pb-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 sm:mb-4 sm:h-12 sm:w-12">
            <CameraOff className="h-5 w-5 text-destructive sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-lg text-destructive sm:text-xl">Camera Access Required</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {scannerError || "Please allow camera access to scan QR codes for attendance"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm sm:p-4">
            <h4 className="font-medium mb-2">How to enable camera access:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground sm:text-sm">
              <li>Click the camera icon in your browser's address bar</li>
              <li>Select "Allow" for camera permissions</li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
          <Button onClick={startScanning} className="w-full" disabled={isInitializing}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="text-center pb-3 sm:pb-6">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-12 sm:w-12">
          <QrCode className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
        </div>
        <CardTitle className="text-lg sm:text-xl">QR Code Scanner</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Position the QR code within the camera frame to mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {isInitializing ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-lg border-2 border-dashed border-primary/25 bg-primary/5 p-6 text-center sm:p-8">
              <LoadingSpinner size="lg" className="mx-auto mb-3 sm:mb-4" />
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                Initializing camera...
              </p>
              <p className="text-xs text-muted-foreground">
                Please allow camera access when prompted
              </p>
            </div>
          </div>
        ) : !isScanning ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center sm:p-8">
              <Smartphone className="mx-auto h-10 w-10 text-muted-foreground mb-3 sm:h-12 sm:w-12 sm:mb-4" />
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                Ready to scan attendance QR code
              </p>
              <Button onClick={startScanning} size="lg" className="w-full" disabled={isInitializing}>
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
              
              {/* Debug info */}
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Camera support: {hasCameraSupport ? "✓" : "✗"}</p>
                <p>Secure context: {isSecureContext ? "✓" : "✗"}</p>
                {retryCount > 0 && <p>Retry attempts: {retryCount}</p>}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Instructions:</h4>
              <ul className="text-xs text-muted-foreground space-y-1 sm:text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Ensure good lighting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Hold device steady
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Center QR code in frame
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {/* Scanner Component */}
            <div className="relative overflow-hidden rounded-xl border bg-black shadow-sm">
              <Scanner
                onScan={handleScanResult}
                onError={handleScanError}
                constraints={{
                  facingMode: "environment",
                  aspectRatio: 1
                }}
                styles={{
                  container: { 
                    width: "100%", 
                    height: "300px",
                    position: "relative"
                  },
                  video: { 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover",
                    borderRadius: "0.75rem"
                  }
                }}
                components={{
                  audio: false,
                  finder: true
                }}
              />
              
              {/* Overlay for better UX */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-xs">
                  Position QR code in the frame
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Scanning Active
              </Badge>
              <Button variant="outline" onClick={stopScanning} size="sm">
                <CameraOff className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Stop</span>
              </Button>
            </div>
          </div>
        )}
        
        {scannerError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{scannerError}</span>
          </div>
        )}

        {scanResult && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-700 sm:text-sm">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>QR code scanned successfully!</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}