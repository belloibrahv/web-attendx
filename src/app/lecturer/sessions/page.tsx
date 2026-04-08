"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { QRGenerator } from "@/components/qr-generator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";
import { 
  Plus, 
  Clock, 
  Users, 
  MapPin, 
  BookOpen, 
  Activity,
  StopCircle,
  RefreshCw,
  AlertCircle
} from "lucide-react";

type SessionResult = {
  sessionId: string;
  expiresAt: string;
  encodedPayload: string;
  sessionToken: string;
  course?: { courseCode: string; courseTitle: string };
  venue?: string;
  status: string;
  courseId: string;
};

type CourseOption = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

type AttendanceItem = {
  id: string;
  markedAt: string;
  student: { matricNumber: string; firstName: string; lastName: string };
};

type RecentSession = {
  id: string;
  status: "ACTIVE" | "CLOSED" | "EXPIRED";
  startTime: string;
  expiryTime: string;
  venue?: string | null;
  course: { courseCode: string; courseTitle: string };
  _count: { attendance: number };
};

export default function LecturerSessionsPage() {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [courseId, setCourseId] = useState("");
  const [ttlMinutes, setTtlMinutes] = useState(15);
  const [venue, setVenue] = useState("");
  const [result, setResult] = useState<SessionResult | null>(null);
  const [attendance, setAttendance] = useState<AttendanceItem[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  async function loadRecentSessions() {
    try {
      const response = await fetch("/api/sessions");
      const data = await response.json();
      if (response.ok && data.ok) {
        setRecentSessions(data.sessions);
      }
    } catch (err) {
      console.error("Failed to load recent sessions:", err);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch("/api/lecturer/courses");
        const data = await response.json();
        if (!response.ok || !data.ok) return;
        setCourses(data.courses);
        if (data.courses.length > 0) setCourseId(data.courses[0].id);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    })();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadRecentSessions();
  }, []);

  // Live attendance updates
  useEffect(() => {
    if (!result?.sessionId) return;
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sessions/${result.sessionId}/attendance`);
        const data = await response.json();
        if (response.ok && data.ok) {
          setAttendance(data.session.attendance);
        }
      } catch (err) {
        console.error("Failed to update attendance:", err);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [result?.sessionId]);

  // Timer countdown
  useEffect(() => {
    if (!result?.expiresAt) return;
    const interval = setInterval(() => {
      const diffMs = new Date(result.expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);
      setTimeLeft(`${minutes}m ${seconds.toString().padStart(2, "0")}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [result?.expiresAt]);

  async function handleCreateSession() {
    setError("");
    setIsCreating(true);

    const normalizedTtl = Math.min(15, Math.max(5, Math.round(ttlMinutes)));
    if (!Number.isFinite(normalizedTtl)) {
      setError("Session duration must be between 5 and 15 minutes.");
      setIsCreating(false);
      return;
    }
    if (normalizedTtl !== ttlMinutes) {
      setTtlMinutes(normalizedTtl);
    }
    
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, ttlMinutes: normalizedTtl, venue: venue || undefined }),
      });
      
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Failed to create session.");
        return;
      }
      
      setResult({
        sessionId: data.sessionId,
        expiresAt: data.expiresAt,
        encodedPayload: data.encodedPayload,
        sessionToken: data.sessionToken || data.encodedPayload,
        course: data.course,
        venue: venue || undefined,
        status: "ACTIVE",
        courseId: courseId,
      });
      setAttendance([]);
      await loadRecentSessions();
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  async function closeSession() {
    if (!result?.sessionId) return;
    setIsClosing(true);
    
    try {
      const response = await fetch(`/api/sessions/${result.sessionId}/close`, { method: "POST" });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.message ?? "Failed to close session.");
        return;
      }
      setResult(null);
      setAttendance([]);
      await loadRecentSessions();
    } catch (err) {
      setError("Failed to close session. Please try again.");
    } finally {
      setIsClosing(false);
    }
  }

  const selectedCourse = courses.find(c => c.id === courseId);

  return (
    <DashboardShell role="lecturer" title="Attendance Sessions">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Create Session Form */}
        {!result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                Create New Attendance Session
              </CardTitle>
              <CardDescription>
                Generate a QR code for students to scan and mark their attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course">Select Course</Label>
                  <select
                    id="course"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.courseCode} - {course.courseTitle}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Session Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={5}
                    max={15}
                    step={1}
                    value={ttlMinutes}
                    onChange={(e) => {
                      const nextValue = Number(e.target.value);
                      if (Number.isNaN(nextValue)) {
                        setTtlMinutes(15);
                        return;
                      }
                      setTtlMinutes(Math.min(15, Math.max(5, nextValue)));
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    Session duration: 5 to 15 minutes only.
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="venue">Venue (Optional)</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Lecture Hall A, Room 101"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                />
              </div>
              
              {selectedCourse && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <h4 className="font-medium mb-2">Session Preview</h4>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3 w-3" />
                      <span>{selectedCourse.courseCode} - {selectedCourse.courseTitle}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>Duration: {ttlMinutes} minutes</span>
                    </div>
                    {venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <Button 
                onClick={handleCreateSession} 
                disabled={!courseId || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating Session...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Session & Generate QR
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Session */}
        {result && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* QR Code Display */}
            <QRGenerator 
              sessionData={{
                id: result.sessionId,
                courseId: result.courseId,
                sessionToken: result.sessionToken,
                courseCode: result.course?.courseCode || "",
                courseTitle: result.course?.courseTitle || "",
                venue: result.venue,
                expiryTime: result.expiresAt,
                status: result.status
              }}
            />
            
            {/* Live Attendance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Live Attendance
                  </span>
                  <Badge variant="success" className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-green-600 animate-pulse" />
                    {attendance.length} Present
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Real-time attendance updates • Refreshes every 3 seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Time Remaining:</span>
                    <span className="font-mono font-medium text-primary">
                      {timeLeft || "Calculating..."}
                    </span>
                  </div>
                  
                  <div className="max-h-64 space-y-2 overflow-auto">
                    {attendance.map((record, index) => (
                      <div 
                        key={record.id} 
                        className="flex items-center justify-between rounded-lg border p-3 animate-reveal-up"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {record.student.firstName} {record.student.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {record.student.matricNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {new Date(record.markedAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {attendance.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">Waiting for Students</h3>
                        <p className="text-sm text-muted-foreground">
                          Students will appear here as they scan the QR code
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="destructive" 
                    onClick={closeSession}
                    disabled={isClosing}
                    className="w-full"
                  >
                    {isClosing ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Closing Session...
                      </>
                    ) : (
                      <>
                        <StopCircle className="mr-2 h-4 w-4" />
                        Close Session
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Sessions
              </span>
              <Button variant="outline" size="sm" onClick={loadRecentSessions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Your recent attendance sessions and their statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">
                          {session.course.courseCode} - {session.course.courseTitle}
                        </h4>
                        <Badge 
                          variant={
                            session.status === "ACTIVE" ? "success" : 
                            session.status === "CLOSED" ? "secondary" : "destructive"
                          }
                          className="text-xs"
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{new Date(session.startTime).toLocaleString()}</span>
                        {session.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {session.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {session._count.attendance}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        attendees
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Sessions Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your first attendance session to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
