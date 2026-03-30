"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner, Html5QrcodeScannerConfig } from "html5-qrcode"
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
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  const startScanner = async () => {
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop()) // Stop the test stream
      setHasPermission(true)
      setScannerError(null)
      
      if (elementRef.current && !scannerRef.current) {
        const config: Html5QrcodeScannerConfig = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          showZoomSliderIfSupported: true,
          defaultZoomValueIfSupported: 2,
        }

        scannerRef.current = new Html5QrcodeScanner("qr-scanner", config, false)
        
        scannerRef.current.render(
          (decodedText) => {
            onScanSuccess(decodedText)
            stopScanner()
          },
          (error) => {
            // Ignore frequent scanning errors, only log actual issues
            if (error.includes("NotFoundException")) return
            console.warn("QR scan error:", error)
            onScanError?.(error)
          }
        )
        
        setIsScanning(true)
      }
    } catch (error) {
      console.error("Camera permission error:", error)
      setHasPermission(false)
      setScannerError("Camera access denied. Please allow camera permissions and try again.")
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
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <CameraOff className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-destructive">Camera Access Required</CardTitle>
          <CardDescription>
            Please allow camera access to scan QR codes for attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm">
            <h4 className="font-medium mb-2">How to enable camera access:</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Click the camera icon in your browser's address bar</li>
              <li>Select "Allow" for camera permissions</li>
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
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <QrCode className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>QR Code Scanner</CardTitle>
        <CardDescription>
          Position the QR code within the camera frame to mark attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isScanning ? (
          <div className="space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center">
              <Smartphone className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Ready to scan attendance QR code
              </p>
              <Button onClick={startScanner} size="lg" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Instructions:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
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
          <div className="space-y-4">
            <div id="qr-scanner" className="w-full" ref={elementRef} />
            
            <div className="flex items-center justify-between">
              <Badge variant="success" className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                Scanning Active
              </Badge>
              <Button variant="outline" onClick={stopScanner} size="sm">
                <CameraOff className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </div>
          </div>
        )}
        
        {scannerError && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{scannerError}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}