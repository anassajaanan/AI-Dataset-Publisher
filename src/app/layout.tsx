import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { MainNavigation } from "@/components/ui/main-navigation";

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
        <MainNavigation />
        
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
