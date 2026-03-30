import { DashboardShell } from "@/components/layout/dashboard-shell";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Activity, 
  TrendingUp, 
  Clock,
  MapPin,
  ArrowRight,
  BarChart3,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);
  
  const [
    students, 
    lecturers, 
    courses, 
    activeSessions, 
    attendanceRecords, 
    latestSessions,
    todayAttendance
  ] = await Promise.all([
    db.student.count(),
    db.lecturer.count(),
    db.course.count(),
    db.session.count({
      where: {
        status: "ACTIVE",
        expiryTime: {
          gt: new Date(),
        },
      },
    }),
    db.attendanceRecord.count(),
    db.session.findMany({
      take: 6,
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        status: true,
        startTime: true,
        expiryTime: true,
        venue: true,
        course: {
          select: {
            courseCode: true,
            courseTitle: true,
          },
        },
        lecturer: {
          select: {
            title: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            attendance: true,
          },
        },
      },
    }),
    db.attendanceRecord.count({
      where: {
        markedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
  ]);

  const quickActions = [
    {
      title: "Manage Students",
      description: "Create student accounts, enroll students, or import CSV enrollments",
      href: "/admin/students",
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100/50",
      iconBg: "bg-blue-500",
    },
    {
      title: "Manage Lecturers", 
      description: "Register lecturer profiles and assign course ownership",
      href: "/admin/lecturers",
      icon: GraduationCap,
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100/50",
      iconBg: "bg-green-500",
    },
    {
      title: "Course Management",
      description: "Create course records and configure academic offerings",
      href: "/admin/courses", 
      icon: BookOpen,
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100/50",
      iconBg: "bg-purple-500",
    },
    {
      title: "Analytics & Reports",
      description: "Review attendance analytics and export institutional records",
      href: "/admin/reports",
      icon: BarChart3,
      gradient: "from-orange-500 to-orange-600",
      bgGradient: "from-orange-50 to-orange-100/50",
      iconBg: "bg-orange-500",
    },
  ];

  return (
    <DashboardShell role="admin" title="Administrative Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl transform rotate-1"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white/40 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Welcome to Admin Dashboard</h2>
                <p className="text-slate-600">Manage your institution's attendance system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/60 to-blue-200/40 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Registered Students
                </CardTitle>
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{students}</div>
                <p className="text-sm text-slate-500 mt-1">
                  Active student accounts
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 to-green-200/40 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Faculty Members
                </CardTitle>
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">{lecturers}</div>
                <p className="text-sm text-slate-500 mt-1">
                  Registered lecturers
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 to-purple-200/40 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Course Offerings
                </CardTitle>
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">{courses}</div>
                <p className="text-sm text-slate-500 mt-1">
                  Configured courses
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-100/60 to-orange-200/40 rounded-3xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
            <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Active Sessions
                </CardTitle>
                <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">{activeSessions}</div>
                <p className="text-sm text-slate-500 mt-1">
                  {todayAttendance} attendance today
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-3xl transform -rotate-1"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">Administrative Quick Actions</div>
                  <CardDescription className="text-slate-600">
                    Manage institutional data and configure system settings
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group relative"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={cn(
                      "absolute inset-0 bg-gradient-to-br rounded-2xl transform rotate-1 group-hover:rotate-2 transition-all duration-300 opacity-60",
                      action.bgGradient
                    )}></div>
                    <div className="relative flex items-start gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white/40 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-2">
                      <div className={cn("rounded-xl p-3", action.iconBg)}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5 rounded-3xl transform rotate-1"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900">Recent Session Activity</div>
                  <CardDescription className="text-slate-600">
                    Latest attendance sessions and system activity
                  </CardDescription>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestSessions.length > 0 ? (
                <div className="space-y-4">
                  {latestSessions.map((session, index) => (
                    <div 
                      key={session.id} 
                      className="group relative"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-50/60 to-slate-100/40 rounded-2xl transform rotate-0.5 group-hover:rotate-1 transition-transform duration-300"></div>
                      <div className="relative flex items-center justify-between rounded-2xl bg-white/60 backdrop-blur-sm border border-white/40 p-4 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-semibold text-slate-900">
                              {session.course.courseCode} - {session.course.courseTitle}
                            </h4>
                            <Badge 
                              variant={session.status === "ACTIVE" ? "success" : "secondary"}
                              className="text-xs"
                            >
                              {session.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>
                              {session.lecturer.title} {session.lecturer.firstName} {session.lecturer.lastName}
                            </span>
                            {session.venue && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.venue}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">
                            Started {new Date(session.startTime).toLocaleString()} • 
                            Expires {new Date(session.expiryTime).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {session._count.attendance}
                          </div>
                          <div className="text-xs text-slate-500">
                            attendees
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No Recent Activity</h3>
                  <p className="text-sm text-slate-600 mb-6">
                    No attendance sessions have been created yet.
                  </p>
                  <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                    <Link href="/admin/courses">
                      Set Up Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Overview */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-3xl transform -rotate-1"></div>
          <Card className="relative bg-white/80 backdrop-blur-sm border-white/40 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-900">System Overview</CardTitle>
              <CardDescription className="text-slate-600">
                Total attendance records and system utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{attendanceRecords}</div>
                  <p className="text-sm text-slate-600">Total attendance records</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{todayAttendance}</div>
                  <p className="text-sm text-slate-600">Recorded today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
