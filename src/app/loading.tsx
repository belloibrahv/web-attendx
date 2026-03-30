import { BrandMark } from "@/components/brand-mark";
import { LoadingSpinner } from "@/components/ui/loading";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20 flex flex-col items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-bl from-accent/8 to-transparent rounded-full blur-3xl animate-drift"></div>
      </div>

      {/* Loading Content */}
      <div className="relative z-10 text-center space-y-8">
        {/* Brand */}
        <div className="animate-pulse">
          <BrandMark />
        </div>

        {/* Loading Animation */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl transform rotate-2"></div>
          <div className="relative bg-white/80 backdrop-blur-sm p-12 rounded-3xl border border-white/40 shadow-xl">
            <LoadingSpinner size="lg" className="mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              Loading TASUED AttendX
            </h2>
            <p className="text-slate-600">
              Please wait while we prepare your dashboard...
            </p>
          </div>
        </div>

        {/* Loading Progress */}
        <div className="w-64 mx-auto">
          <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}