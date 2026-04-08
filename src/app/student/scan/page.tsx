"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QRScannerReliable } from "@/components/qr-scanner-reliable";
import { QRScannerModern } from "@/components/qr-scanner-modern";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { cn } from "@/lib/utils";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  BookOpen,
  ArrowRight,
  RefreshCw,
  RotateCcw
} from "lucide-react";

interface AttendanceMeta {
  courseCode: string;
  courseTitle: string;
  markedAt: string;
  venue?: string;
  lecturerName?: string;
}

export default function StudentScanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"idle" | "success" | "error">("idle");
  const [attendanceMeta, setAttendanceMeta] = useState<AttendanceMeta | null>(null);
  const [showScanner, setShowScanner] = useState(true);
  const [useFallbackScanner, setUseFallbackScanner] = useState(false);

  async function handleScanSuccess(decodedText: string) {
    setIsSubmitting(true);
    setStatus("");
    setStatusType("idle");
    setShowScanner(false);
    
    try {
      const response = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          encodedPayload: decodedText,
          deviceInfo: navigator.userAgent,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.ok) {
        setStatusType("error");
        setStatus(data.message ?? "Failed to record attendance. Please try again.");
        return;
      }
      
      setStatusType("success");
      setAttendanceMeta(data.attendance ?? null);
      setStatus(
        data.attendance
          ? `Attendance successfully recorded for ${data.attendance.courseCode}`
          : "Attendance recorded successfully."
      );
    } catch {
      setStatusType("error");
      setStatus("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleScanError(error: string) {
    console.warn("QR scan error:", error);
    // If we get a critical error with the main scanner, suggest fallback
    if (error.includes("HTML Element") || error.includes("not found") || error.includes("failed to start")) {
      setUseFallbackScanner(true);
    }
  }

  function resetScanner() {
    setStatus("");
    setStatusType("idle");
    setAttendanceMeta(null);
    setShowScanner(true);
    setUseFallbackScanner(false);
  }

  function switchToFallback() {
    setUseFallbackScanner(!useFallbackScanner);
    setStatus("");
    setStatusType("idle");
  }

  return (
    <DashboardShell role="student" title="Mark Attendance">
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
        {/* Instructions Card */}
        <Card>
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <BookOpen className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
              How to Mark Attendance
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Follow these steps to successfully record your attendance
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-medium sm:text-base">Locate QR Code</h4>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Find the QR code displayed by your lecturer
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-medium sm:text-base">Scan Code</h4>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Use the camera scanner below to scan the QR code
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold sm:h-8 sm:w-8 sm:text-sm">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-medium sm:text-base">Confirm Attendance</h4>
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    Your attendance will be automatically recorded
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {/* Scanner Section */}
          <div className="space-y-4">
            {showScanner && !isSubmitting && statusType !== "success" && (
              <>
                {!useFallbackScanner ? (
                  <QRScannerReliable 
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                  />
                ) : (
                  <QRScannerModern 
                    onScanSuccess={handleScanSuccess}
                    onScanError={handleScanError}
                  />
                )}
                
                {/* Scanner Switch Options */}
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={switchToFallback}
                    className="text-xs"
                  >
                    <RotateCcw className="mr-2 h-3 w-3" />
                    {useFallbackScanner ? "Switch to Primary Scanner" : "Try Alternative Scanner"}
                  </Button>
                </div>
              </>
            )}

            {isSubmitting && (
              <Card className="w-full">
                <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <h3 className="text-base font-medium mb-2 sm:text-lg">Processing Attendance</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Please wait while we record your attendance...
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Status Section */}
          <div className="space-y-4">
            {status && (
              <Card className={
                statusType === "success" 
                  ? "border-green-200 bg-green-50" 
                  : statusType === "error" 
                  ? "border-red-200 bg-red-50" 
                  : ""
              }>
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    {statusType === "success" && <CheckCircle className="h-4 w-4 text-green-600 sm:h-5 sm:w-5" />}
                    {statusType === "error" && <XCircle className="h-4 w-4 text-red-600 sm:h-5 sm:w-5" />}
                    {statusType === "idle" && <AlertCircle className="h-4 w-4 text-blue-600 sm:h-5 sm:w-5" />}
                    {statusType === "success" ? "Attendance Recorded" : 
                     statusType === "error" ? "Scan Failed" : "Processing"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className={cn(
                    "text-sm sm:text-base",
                    statusType === "success" ? "text-green-700" :
                    statusType === "error" ? "text-red-700" : 
                    "text-muted-foreground"
                  )}>
                    {status}
                  </p>
                  
                  {attendanceMeta && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg bg-white/80 p-3 border sm:p-4">
                        <h4 className="font-medium text-green-800 mb-2 text-sm sm:text-base">
                          {attendanceMeta.courseCode} - {attendanceMeta.courseTitle}
                        </h4>
                        <div className="space-y-1 text-xs text-muted-foreground sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            <span>Recorded at {new Date(attendanceMeta.markedAt).toLocaleString()}</span>
                          </div>
                          {attendanceMeta.venue && (
                            <div className="flex items-center gap-2">
                              <span>Venue: {attendanceMeta.venue}</span>
                            </div>
                          )}
                          {attendanceMeta.lecturerName && (
                            <div className="flex items-center gap-2">
                              <span>Lecturer: {attendanceMeta.lecturerName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <Link 
                        href="/student/history"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-2.5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        View Attendance History
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  )}
                  
                  {statusType === "error" && (
                    <Button onClick={resetScanner} className="w-full mt-4">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            {!status && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scanning Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Ensure good lighting conditions</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Hold your device steady</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Position QR code in center of frame</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Wait for automatic detection</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
