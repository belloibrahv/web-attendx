import type { Metadata } from "next";
import "./globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "TASUED AttendX",
    template: "%s | TASUED AttendX",
  },
  description:
    "A mobile-first QR-based attendance management system for Tai Solarin University of Education (TASUED).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-background text-foreground font-body">
        {children}
      </body>
    </html>
  );
}
