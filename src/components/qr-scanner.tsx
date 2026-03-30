"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
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
  Smartphone
} from "lucide-react"
import { cn } from "@/lib/utils"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  className?: string
}

export function QRScanner({ onScanSuccess, onScanError, className }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  const startScanner = async () => {
    try {
      // Clear any existing scanner first
      if (scannerRef.current) {
        scannerRef.current.clear()
        scannerRef.current = null
      }
      
      // Request camera permission with more specific constraints
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream
      setHasPermission(true)
      setScannerError(null)
      
      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))
      
      if (elementRef.current && !scannerRef.current) {
        const config = {
          fps: 10,
          qrbox: function(viewfinderWidth: number, viewfinderHeight: number) {
            // Make QR box responsive to screen size
            const minEdgePercentage = 0.7; // 70% of the smaller dimension
            const minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
            const qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
            return {
              width: Math.min(qrboxSize, 300),
              height: Math.min(qrboxSize, 300)
            };
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: false, // Disable zoom slider for mobile
          defaultZoomValueIfSupported: 1,
          supportedScanTypes: [0], // Only QR codes
          rememberLastUsedCamera: true,
          showPermissionButton: true,
        }

        scannerRef.current = new Html5QrcodeScanner("qr-scanner", config, false)
        
        scannerRef.current.render(
          (decodedText) => {
            console.log("QR Code scanned successfully:", decodedText)
            onScanSuccess(decodedText)
            stopScanner()
          },
          (error) => {
            // Ignore frequent scanning errors, only log actual issues
            if (error.includes("NotFoundException") || error.includes("No MultiFormat Readers")) return
            if (error.includes("Camera not found") || error.includes("Permission denied")) {
              setScannerError("Camera access denied or not available. Please check permissions.")
              setHasPermission(false)
              return
            }
            console.warn("QR scan error:", error)
            onScanError?.(error)
          }
        )
        
        setIsScanning(true)
      }
    } catch (error: any) {
      console.error("Camera permission error:", error)
      setHasPermission(false)
      setRetryCount(prev => prev + 1)
      
      if (error.name === "NotAllowedError") {
        setScannerError("Camera access denied. Please allow camera permissions and try again.")
      } else if (error.name === "NotFoundError") {
        setScannerError("No camera found on this device.")
      } else if (error.name === "NotSupportedError") {
        setScannerError("Camera not supported on this device or browser.")
      } else if (error.name === "NotReadableError") {
        setScannerError("Camera is being used by another application. Please close other camera apps and try again.")
      } else {
        setScannerError(`Failed to access camera: ${error.message || 'Unknown error'}. Please check your device settings and try again.`)
      }
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  if (hasPermission === false) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center pb-3 sm:pb-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 sm:mb-4 sm:h-12 sm:w-12">
            <CameraOff className="h-5 w-5 text-destructive sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-destructive text-lg sm:text-xl">Camera Access Required</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Please allow camera access to scan QR codes for attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm sm:p-4">
            <h4 className="font-medium mb-2">How to enable camera access:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground sm:text-sm">
              <li>Click the camera icon in your browser&apos;s address bar</li>
              <li>Select &quot;Allow&quot; for camera permissions</li>
              <li>Refresh the page and try again</li>
            </ol>
          </div>
          <Button onClick={startScanner} className="w-full">
            <Camera className="mr-2 h-4 w-4" />
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
        {!isScanning ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center sm:p-8">
              <Smartphone className="mx-auto h-10 w-10 text-muted-foreground mb-3 sm:h-12 sm:w-12 sm:mb-4" />
              <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                Ready to scan attendance QR code
              </p>
              <Button onClick={startScanner} size="lg" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
              
              {/* Debug info for development */}
              <div className="mt-4 text-xs text-muted-foreground">
                <p>Camera support: {navigator.mediaDevices ? "✓" : "✗"}</p>
                <p>HTTPS: {location.protocol === 'https:' ? "✓" : "✗"}</p>
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
            <div id="qr-scanner" className="w-full [&>div]:!w-full [&_video]:!w-full [&_canvas]:!w-full" ref={elementRef} />
            
            <div className="flex items-center justify-between">
              <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Scanning Active
              </Badge>
              <Button variant="outline" onClick={stopScanner} size="sm">
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
      </CardContent>
    </Card>
  )
}