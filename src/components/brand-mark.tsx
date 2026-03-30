import Image from "next/image";
import Link from "next/link";
import { appName } from "@/data/site";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  compact?: boolean;
  href?: string;
  className?: string;
  showTagline?: boolean;
  disableNavigation?: boolean;
};

export function BrandMark({
  compact = false,
  href = "/home",
  className,
  showTagline = true,
  disableNavigation = false,
}: BrandMarkProps) {
  const content = (
    <>
      <span className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 ring-2 ring-white/60 transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-110",
        compact ? "h-8 w-8 sm:h-10 sm:w-10" : "h-10 w-10"
      )}>
        <Image
          src="/main-logo.png"
          alt="Tai Solarin University of Education logo"
          fill
          className="object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
          sizes={compact ? "(max-width: 640px) 32px, 40px" : "40px"}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </span>
      {!compact && (
        <span className="flex flex-col leading-tight">
          <span className="font-heading text-sm font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent transition-all duration-300 group-hover:from-primary/90 group-hover:to-accent/90">
            {appName}
          </span>
          {showTagline && (
            <span className="text-xs text-slate-600 transition-colors duration-300 group-hover:text-slate-700">
              QR Attendance Platform
            </span>
          )}
        </span>
      )}
    </>
  );

  if (disableNavigation) {
    return (
      <div className={cn(
        "group inline-flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 px-4 py-3 text-foreground shadow-lg shadow-primary/10",
        compact && "px-2 py-2 gap-2 sm:px-3 sm:gap-3",
        className
      )}>
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/40 px-4 py-3 text-foreground shadow-lg shadow-primary/10 transition-all duration-300 hover:bg-white/95 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5",
        compact && "px-2 py-2 gap-2 sm:px-3 sm:gap-3",
        className
      )}
    >
      {content}
    </Link>
  );
}
