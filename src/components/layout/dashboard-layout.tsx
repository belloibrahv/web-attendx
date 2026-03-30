"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  QrCode,
  Clock,
  FileText,
  Menu,
  X
} from "lucide-react"
import { BrandMark } from "@/components/brand-mark"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useState } from "react"

// Helper function to get user initials
function getUserInitials(name?: string | null): string {
  if (!name) return "U"
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface DashboardLayoutProps {
  children: ReactNode
  role: "ADMIN" | "LECTURER" | "STUDENT"
}

const navigationConfig = {
  ADMIN: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Lecturers", href: "/admin/lecturers", icon: User },
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
  ],
  LECTURER: [
    { name: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
    { name: "Sessions", href: "/lecturer/sessions", icon: QrCode },
    { name: "Reports", href: "/lecturer/reports", icon: FileText },
  ],
  STUDENT: [
    { name: "Dashboard", href: "/student", icon: LayoutDashboard },
    { name: "Scan QR", href: "/student/scan", icon: QrCode },
    { name: "History", href: "/student/history", icon: Clock },
  ],
}

const roleColors = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  LECTURER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100", 
  STUDENT: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const navigation = navigationConfig[role]
  
  const handleSignOut = () => {
    signOut({ callbackUrl: "/home" })
  }

  const getUserInitials = (name?: string) => {
    if (!name) return "U"
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            <BrandMark compact className="bg-sidebar-primary/10 border-sidebar-primary/20" />
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* User info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
                  {getUserInitials(session?.user?.name ?? undefined)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {session?.user?.name || "User"}
                </p>
                <Badge className={cn("text-xs", roleColors[role])}>
                  {role.toLowerCase()}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          {/* Sidebar footer */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {navigation.find(item => item.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="hidden sm:inline-flex">
              {role.toLowerCase()} dashboard
            </Badge>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}