import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-accent/8 to-transparent rounded-full blur-3xl animate-drift"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <BrandMark />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Error Illustration */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl transform rotate-3"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-12 rounded-3xl border border-white/40 shadow-xl">
              <div className="text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
                404
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Page Not Found
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
              The page you're looking for doesn't exist or has been moved. 
              Let's get you back to the right place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              <Link href="/home">
                <Home className="w-4 h-4 mr-2" />
                Go to Homepage
              </Link>
            </Button>
            <Button variant="outline" asChild className="bg-white/60 border-white/40 hover:bg-white/80">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </Button>
          </div>

          {/* Help Links */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">Need help? Try these links:</p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/home" className="text-primary hover:text-primary/80 transition-colors">
                Homepage
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
                Login
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/home#team" className="text-primary hover:text-primary/80 transition-colors">
                Contact Team
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-sm text-slate-500">
          © 2026 TASUED AttendX • Final Year Project
        </p>
      </footer>
    </div>
  );
}