"use client";

import Link from "next/link";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, QrCode, Users, BookOpen, ChartColumn, GraduationCap, LogOut, House } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ReactNode };

const navByRole: Record<"admin" | "lecturer" | "student", NavItem[]> = {
  admin: [
    { href: "/admin", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { href: "/admin/students", label: "Students", icon: <Users className="size-4" /> },
    { href: "/admin/lecturers", label: "Lecturers", icon: <GraduationCap className="size-4" /> },
    { href: "/admin/courses", label: "Courses", icon: <BookOpen className="size-4" /> },
    { href: "/admin/reports", label: "Reports", icon: <ChartColumn className="size-4" /> },
  ],
  lecturer: [
    { href: "/lecturer", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { href: "/lecturer/sessions", label: "Sessions", icon: <QrCode className="size-4" /> },
    { href: "/lecturer/reports", label: "Reports", icon: <ChartColumn className="size-4" /> },
  ],
  student: [
    { href: "/student", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
    { href: "/student/scan", label: "Scan QR", icon: <QrCode className="size-4" /> },
    { href: "/student/history", label: "History", icon: <ChartColumn className="size-4" /> },
  ],
};

export function DashboardShell({
  role,
  title,
  children,
}: {
  role: "admin" | "lecturer" | "student";
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const nav = navByRole[role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-accent/8 to-transparent rounded-full blur-3xl animate-drift"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-gradient-to-tr from-secondary/6 to-transparent rounded-full blur-3xl animate-pulse"></div>
      </div>

      {open ? (
        <button 
          className="fixed inset-0 z-10 bg-slate-950/30 backdrop-blur-sm md:hidden" 
          onClick={() => setOpen(false)} 
          aria-label="Close navigation" 
        />
      ) : null}
      
      <div className="relative mx-auto flex max-w-7xl gap-0">
        <aside className={`fixed inset-y-0 left-0 z-20 w-72 p-4 transition-transform md:static md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
          {/* Sidebar Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent rounded-3xl m-2"></div>
          <div className="absolute inset-0 bg-black/10 rounded-3xl m-2"></div>
          
          {/* Sidebar Content */}
          <div className="relative h-full flex flex-col text-white">
            <BrandMark 
              disableNavigation
              compact 
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white shadow-lg hover:bg-white/25 [&_.text-primary]:text-white [&_.text-slate-600]:text-white/80" 
            />
            
            <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-sm p-4 text-sm leading-relaxed text-white/90 border border-white/20">
              Real-time academic attendance management for Tai Solarin University of Education.
            </div>
            
            <nav className="flex-1 space-y-2 mt-6">
              <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                Workspace
              </div>
              
              <Link
                href="/home"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 hover:translate-x-1"
              >
                <House className="size-4" />
                <span>Homepage</span>
              </Link>
              
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:translate-x-1",
                      active 
                        ? "bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30" 
                        : "text-white/80 hover:bg-white/15 hover:text-white"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="mt-6 border-t border-white/20 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-white/80 hover:bg-white/15 hover:text-white transition-all duration-200 hover:translate-x-1"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>
        
        <div className="relative min-h-screen flex-1 md:ml-0">
          <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/80 border-b border-white/40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="icon-sm" 
                  onClick={() => setOpen((v) => !v)} 
                  className="md:hidden bg-white/60 border-white/40 hover:bg-white/80"
                >
                  <Menu className="size-4" />
                </Button>
                <div>
                  <h1 className="font-heading text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {title}
                  </h1>
                  <p className="text-sm text-slate-600">TASUED AttendX workspace</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2 text-sm font-semibold text-primary uppercase tracking-wide">
                  {role}
                </span>
              </div>
            </div>
          </header>
          
          <main className="relative p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
