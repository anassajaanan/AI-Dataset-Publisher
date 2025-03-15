"use client"

import { Home, Upload, LayoutDashboard, Shield } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export function MainNavigation() {
  // Define navigation items for the NavBar
  const navItems = [
    { name: 'Home', url: '/', icon: Home },
    { name: 'Upload', url: '/upload', icon: Upload },
    { name: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    { name: 'Supervisor', url: '/supervisor/dashboard', icon: Shield }
  ];

  return <NavBar items={navItems} className="sm:top-6" />;
} 