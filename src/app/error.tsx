"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 flex flex-col">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-red-500/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-orange-500/8 to-transparent rounded-full blur-3xl animate-drift"></div>
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
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/60 to-orange-50/40 rounded-3xl transform -rotate-2"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-12 rounded-3xl border border-white/40 shadow-xl">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-white" />
              </div>
              <div className="text-6xl font-bold text-red-500 mb-4">
                Oops!
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed max-w-lg mx-auto">
              We encountered an unexpected error. Don't worry, our team has been notified 
              and we're working to fix it.
            </p>
            
            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === "development" && (
              <details className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200 text-left">
                <summary className="cursor-pointer text-sm font-medium text-red-800 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs text-red-700 overflow-auto">
                  {error.message}
                  {error.digest && `\nDigest: ${error.digest}`}
                </pre>
              </details>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              onClick={reset}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link 
              href="/home"
              className="inline-flex items-center gap-2 bg-white/60 border border-white/40 hover:bg-white/80 text-slate-700 px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:-translate-y-0.5"
            >
              <Home className="w-4 h-4" />
              Go to Homepage
            </Link>
          </div>

          {/* Additional Help */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-500 mb-4">
              If the problem persists, please contact our support team:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/home#team" className="text-primary hover:text-primary/80 transition-colors">
                Contact Development Team
              </Link>
              <span className="text-slate-300">•</span>
              <Link href="/login" className="text-primary hover:text-primary/80 transition-colors">
                Return to Login
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