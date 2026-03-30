"use client"

import type { CameraDevice, Html5Qrcode as Html5QrcodeInstance } from "html5-qrcode"
import { useEffect, useId, useRef, useState } from "react"
import { AlertCircle, Camera, CameraOff, CheckCircle, QrCode, RefreshCw, Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void
  onScanError?: (error: string) => void
  className?: string
}

type ScannerErrorKind =
  | "permission"
  | "secure-context"
  | "unsupported"
  | "no-camera"
  | "busy"
  | "unknown"

const REAR_CAMERA_PATTERN = /(back|rear|environment)/i

export function QRScanner({ onScanSuccess, onScanError, className }: QRScannerProps) {
  const scannerElementId = `qr-scanner-${useId().replace(/:/g, "")}`
  const scannerRef = useRef<Html5QrcodeInstance | null>(null)
  const mountedRef = useRef(true)
  const startRequestRef = useRef(0)
  const handledResultRef = useRef(false)

  const [isInitializing, setIsInitializing] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const [errorKind, setErrorKind] = useState<ScannerErrorKind | null>(null)
  const [hasCameraSupport, setHasCameraSupport] = useState(false)
  const [isSecureContextReady, setIsSecureContextReady] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([])
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null)

  const resetScannerElement = () => {
    const element = document.getElementById(scannerElementId)
    if (element) {
      element.innerHTML = ""
    }
  }

  const stopScanner = async () => {
    const scanner = scannerRef.current
    scannerRef.current = null

    if (!scanner) {
      resetScannerElement()
      return
    }

    try {
      if (scanner.isScanning) {
        await scanner.stop()
      }
    } catch (error) {
      console.warn("Failed to stop QR scanner cleanly:", error)
    }

    try {
      scanner.clear()
    } catch (error) {
      console.warn("Failed to clear QR scanner UI:", error)
    }

    resetScannerElement()
  }

  const pickPreferredCamera = (cameras: CameraDevice[], preferredCameraId?: string | null) => {
    if (preferredCameraId) {
      const matchedCamera = cameras.find((camera) => camera.id === preferredCameraId)
      if (matchedCamera) {
        return matchedCamera
      }
    }

    return cameras.find((camera) => REAR_CAMERA_PATTERN.test(camera.label)) ?? cameras[0] ?? null
  }

  const classifyScannerError = (error: unknown) => {
    const rawMessage =
      typeof error === "string"
        ? error
        : error instanceof Error
        ? error.message
        : "Unable to start the camera."

    const normalizedMessage = rawMessage.toLowerCase()

    if (
      normalizedMessage.includes("notallowederror")
      || normalizedMessage.includes("permission denied")
      || normalizedMessage.includes("permission dismissed")
      || normalizedMessage.includes("permission request")
      || normalizedMessage.includes("denied permission")
    ) {
      return {
        kind: "permission" as const,
        message: "Camera access was blocked. Allow camera permission in your browser and try again.",
      }
    }

    if (
      normalizedMessage.includes("https")
      || normalizedMessage.includes("secure context")
      || normalizedMessage.includes("insecure")
      || normalizedMessage.includes("webcam permissions are only available")
    ) {
      return {
        kind: "secure-context" as const,
        message: "Camera access requires HTTPS or localhost. Open the app over a secure connection and try again.",
      }
    }

    if (
      normalizedMessage.includes("notfounderror")
      || normalizedMessage.includes("no camera")
      || normalizedMessage.includes("camera not found")
      || normalizedMessage.includes("unable to query supported devices")
    ) {
      return {
        kind: "no-camera" as const,
        message: "No camera was detected on this device.",
      }
    }

    if (
      normalizedMessage.includes("notreadableerror")
      || normalizedMessage.includes("trackstartenderror")
      || normalizedMessage.includes("could not start video source")
      || normalizedMessage.includes("device in use")
      || normalizedMessage.includes("device is busy")
    ) {
      return {
        kind: "busy" as const,
        message: "The camera is busy in another app or browser tab. Close other camera users and try again.",
      }
    }

    if (
      normalizedMessage.includes("getusermedia")
      || normalizedMessage.includes("media devices")
      || normalizedMessage.includes("unsupported")
      || normalizedMessage.includes("not supported")
    ) {
      return {
        kind: "unsupported" as const,
        message: "This browser does not support camera access.",
      }
    }

    return {
      kind: "unknown" as const,
      message: rawMessage || "Unable to start the camera. Please try again.",
    }
  }

  const startScanner = async (preferredCameraId?: string | null) => {
    if (isInitializing) {
      return
    }

    const requestId = Date.now()
    startRequestRef.current = requestId
    handledResultRef.current = false

    setIsInitializing(true)
    setScannerError(null)
    setErrorKind(null)

    try {
      if (!window.isSecureContext) {
        throw new Error("Camera access requires a secure context (HTTPS or localhost).")
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera access is not supported in this browser.")
      }

      await stopScanner()

      const permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: "environment" },
        },
      })

      permissionStream.getTracks().forEach((track) => track.stop())

      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import("html5-qrcode")

      const cameras = await Html5Qrcode.getCameras()
      const preferredCamera = pickPreferredCamera(cameras, preferredCameraId)

      if (!mountedRef.current || startRequestRef.current !== requestId) {
        return
      }

      setAvailableCameras(cameras)
      setActiveCameraId(preferredCamera?.id ?? null)

      resetScannerElement()

      const scanner = new Html5Qrcode(scannerElementId, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      })

      scannerRef.current = scanner

      await scanner.start(
        preferredCamera?.id ?? { facingMode: { ideal: "environment" } },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1,
          disableFlip: false,
        },
        (decodedText) => {
          if (handledResultRef.current) {
            return
          }

          handledResultRef.current = true

          try {
            scanner.pause(true)
          } catch (error) {
            console.warn("Failed to pause scanner after a successful read:", error)
          }

          onScanSuccess(decodedText)
        },
        (errorMessage) => {
          if (
            errorMessage.includes("NotFoundException")
            || errorMessage.includes("No MultiFormat Readers")
            || errorMessage.includes("No barcode or QR code detected")
          ) {
            return
          }

          onScanError?.(errorMessage)
        }
      )

      if (!mountedRef.current || startRequestRef.current !== requestId) {
        await stopScanner()
        return
      }

      setIsScanning(true)
    } catch (error) {
      const classifiedError = classifyScannerError(error)

      await stopScanner()

      if (!mountedRef.current || startRequestRef.current !== requestId) {
        return
      }

      setRetryCount((currentCount) => currentCount + 1)
      setIsScanning(false)
      setScannerError(classifiedError.message)
      setErrorKind(classifiedError.kind)
      onScanError?.(classifiedError.message)
    } finally {
      if (mountedRef.current && startRequestRef.current === requestId) {
        setIsInitializing(false)
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true
    setHasCameraSupport(Boolean(navigator.mediaDevices?.getUserMedia))
    setIsSecureContextReady(window.isSecureContext)

    return () => {
      mountedRef.current = false
      startRequestRef.current += 1
      const scanner = scannerRef.current
      scannerRef.current = null
      const clearScannerElement = () => {
        const element = document.getElementById(scannerElementId)
        if (element) {
          element.innerHTML = ""
        }
      }

      if (!scanner) {
        clearScannerElement()
        return
      }

      void (async () => {
        try {
          if (scanner.isScanning) {
            await scanner.stop()
          }
        } catch (error) {
          console.warn("Failed to stop QR scanner cleanly during unmount:", error)
        }

        try {
          scanner.clear()
        } catch (error) {
          console.warn("Failed to clear QR scanner UI during unmount:", error)
        }

        clearScannerElement()
      })()
    }
  }, [scannerElementId])

  const activeCameraLabel =
    availableCameras.find((camera) => camera.id === activeCameraId)?.label ?? null

  const showCameraAccessCard =
    errorKind === "permission" || errorKind === "secure-context" || errorKind === "no-camera"

  if (showCameraAccessCard) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader className="text-center pb-3 sm:pb-6">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 sm:mb-4 sm:h-12 sm:w-12">
            <CameraOff className="h-5 w-5 text-destructive sm:h-6 sm:w-6" />
          </div>
          <CardTitle className="text-lg text-destructive sm:text-xl">
            {errorKind === "no-camera" ? "Camera Not Available" : "Camera Access Required"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {scannerError ?? "Please allow camera access to scan QR codes for attendance."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="rounded-lg bg-muted p-3 text-sm sm:p-4">
            <h4 className="mb-2 font-medium">How to fix it:</h4>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground sm:text-sm">
              {errorKind === "secure-context" ? (
                <>
                  <li>Open the site using HTTPS or `localhost`</li>
                  <li>Reload the page after switching to a secure URL</li>
                  <li>Try starting the camera again</li>
                </>
              ) : errorKind === "no-camera" ? (
                <>
                  <li>Check that your device has a working camera</li>
                  <li>Close apps that might be blocking camera access</li>
                  <li>Try again from a device or browser with camera support</li>
                </>
              ) : (
                <>
                  <li>Click the camera icon in your browser&apos;s address bar</li>
                  <li>Select &quot;Allow&quot; for camera permissions</li>
                  <li>Refresh the page and try again</li>
                </>
              )}
            </ol>
          </div>

          <Button
            onClick={() => void startScanner(activeCameraId)}
            className="w-full"
            disabled={isInitializing}
          >
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
              <p className="mb-3 text-sm text-muted-foreground sm:mb-4">Initializing camera...</p>
              <p className="text-xs text-muted-foreground">
                Allow camera access when prompted by your browser
              </p>
            </div>
          </div>
        ) : !isScanning ? (
          <div className="space-y-3 sm:space-y-4">
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 text-center sm:p-8">
              <Smartphone className="mx-auto mb-3 h-10 w-10 text-muted-foreground sm:mb-4 sm:h-12 sm:w-12" />
              <p className="mb-3 text-sm text-muted-foreground sm:mb-4">
                Ready to scan your lecturer&apos;s attendance QR code
              </p>

              <Button onClick={() => void startScanner(activeCameraId)} size="lg" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Start Camera
              </Button>

              <div className="mt-4 text-xs text-muted-foreground">
                <p>Camera support: {hasCameraSupport ? "Yes" : "No"}</p>
                <p>Secure context: {isSecureContextReady ? "Yes" : "No"}</p>
                {retryCount > 0 ? <p>Retry attempts: {retryCount}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Instructions:</h4>
              <ul className="space-y-1 text-xs text-muted-foreground sm:text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Ensure good lighting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Hold your device steady
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  Center the QR code inside the frame
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div
              id={scannerElementId}
              className="overflow-hidden rounded-xl border bg-black shadow-sm [&>div]:border-0 [&>div]:bg-black [&_video]:!h-auto [&_video]:!w-full [&_video]:!rounded-xl [&_canvas]:!h-auto [&_canvas]:!w-full"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success" className="flex items-center gap-1 text-xs sm:text-sm">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-600" />
                  Scanning Active
                </Badge>

                {activeCameraLabel ? (
                  <Badge variant="outline" className="text-xs sm:text-sm">
                    {activeCameraLabel}
                  </Badge>
                ) : null}
              </div>

              <Button variant="outline" onClick={() => void stopScanner().then(() => setIsScanning(false))} size="sm">
                <CameraOff className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Stop</span>
              </Button>
            </div>
          </div>
        )}

        {scannerError ? (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive sm:text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{scannerError}</span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
