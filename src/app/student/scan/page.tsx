"use client";

import Link from "next/link";
import { useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QRScanner } from "@/components/qr-scanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  BookOpen,
  ArrowRight,
  RefreshCw
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
    } catch (error) {
      setStatusType("error");
      setStatus("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleScanError(error: string) {
    console.warn("QR scan error:", error);
  }

  function resetScanner() {
    setStatus("");
    setStatusType("idle");
    setAttendanceMeta(null);
    setShowScanner(true);
  }

  return (
    <DashboardShell role="student" title="Mark Attendance">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              How to Mark Attendance
            </CardTitle>
            <CardDescription>
              Follow these steps to successfully record your attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Locate QR Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Find the QR code displayed by your lecturer
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Scan Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Use the camera scanner below to scan the QR code
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Confirm Attendance</h4>
                  <p className="text-sm text-muted-foreground">
                    Your attendance will be automatically recorded
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Scanner Section */}
          <div className="space-y-4">
            {showScanner && !isSubmitting && statusType !== "success" && (
              <QRScanner 
                onScanSuccess={handleScanSuccess}
                onScanError={handleScanError}
              />
            )}

            {isSubmitting && (
              <Card className="w-full max-w-md mx-auto">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LoadingSpinner size="lg" className="mb-4" />
                  <h3 className="text-lg font-medium mb-2">Processing Attendance</h3>
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
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {statusType === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {statusType === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                    {statusType === "idle" && <AlertCircle className="h-5 w-5 text-blue-600" />}
                    {statusType === "success" ? "Attendance Recorded" : 
                     statusType === "error" ? "Scan Failed" : "Processing"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={
                    statusType === "success" ? "text-green-700" :
                    statusType === "error" ? "text-red-700" : 
                    "text-muted-foreground"
                  }>
                    {status}
                  </p>
                  
                  {attendanceMeta && (
                    <div className="mt-4 space-y-3">
                      <div className="rounded-lg bg-white/80 p-4 border">
                        <h4 className="font-medium text-green-800 mb-2">
                          {attendanceMeta.courseCode} - {attendanceMeta.courseTitle}
                        </h4>
                        <div className="space-y-1 text-sm text-muted-foreground">
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
