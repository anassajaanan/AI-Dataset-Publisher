import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { NavBar } from "@/components/ui/tubelight-navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dataset Publishing Platform",
  description: "Upload, process, and publish datasets with AI-powered metadata generation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Define navigation items for the NavBar with string icon names
  const navItems = [
    { name: 'Home', url: '/', icon: 'Home' },
    { name: 'Features', url: '/#features', icon: 'CheckCircle' },
    { name: 'How It Works', url: '/#how-it-works', icon: 'BarChart' },
    { name: 'Upload', url: '/upload', icon: 'Upload' },
    { name: 'Dashboard', url: '/dashboard', icon: 'LayoutDashboard' },
    { name: 'Supervisor', url: '/supervisor/dashboard', icon: 'Shield' }
  ];

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <header className="h-16 sm:h-20 flex items-center justify-between border-b">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Dataset Publishing Platform
            </Link>
          </div>
        </header>
        
        {/* TubeLight NavBar */}
        <NavBar items={navItems} className="sm:top-4" />
        
        <main className="flex-1 pt-8">
          {children}
        </main>
        
        <footer className="border-t py-6">
          <div className="container mx-auto px-4 text-center text-gray-500">
            <p>© {new Date().getFullYear()} Dataset Publishing Platform. All rights reserved.</p>
          </div>
        </footer>
        
        <Toaster />
      </body>
    </html>
  );
}
