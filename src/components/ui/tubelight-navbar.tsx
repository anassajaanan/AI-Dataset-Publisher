"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import * as LucideIcons from "lucide-react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface NavItem {
  name: string
  url: string
  icon: LucideIcon
}

interface NavBarProps {
  items: NavItem[]
  className?: string
}

export function NavBar({ items, className }: NavBarProps) {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(items[0].name)
  const [isMobile, setIsMobile] = useState(false)

  // Set initial active tab based on pathname
  useEffect(() => {
    // Find the matching item based on the current path
    const currentPath = pathname.split("#")[0] // Remove hash part
    const matchingItem = items.find(item => {
      const itemPath = item.url.split("#")[0] // Remove hash part
      return currentPath === itemPath || (currentPath === "/" && itemPath === "/")
    })
    
    if (matchingItem) {
      setActiveTab(matchingItem.name)
    } else {
      // Default to first item if no match
      setActiveTab(items[0].name)
    }
  }, [pathname, items])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Handle scroll to update active tab
  useEffect(() => {
    const handleScroll = () => {
      // Only apply scroll-based navigation on the home page
      if (pathname !== "/") return
      
      const scrollPosition = window.scrollY + 100 // Add offset for better UX
      
      // Check if URL has hash links
      const sectionIds = ["top", "features", "how-it-works"]
      
      // Find the section that is currently in view
      for (const sectionId of sectionIds) {
        const section = document.getElementById(sectionId)
        if (section) {
          const { offsetTop, offsetHeight } = section
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            // Find the corresponding nav item
            const activeItem = items.find(item => 
              item.url === `/#${sectionId}` || item.url.includes(`#${sectionId}`)
            )
            if (activeItem && activeItem.name !== activeTab) {
              setActiveTab(activeItem.name)
            }
            break
          }
        }
      }
      
      // If at the top of the page, set Home as active
      if (scrollPosition < 100) {
        const homeItem = items.find(item => item.url === "/" || item.url === "/#top")
        if (homeItem) {
          setActiveTab(homeItem.name)
        }
      }
    }
    
    window.addEventListener("scroll", handleScroll)
    // Initial check
    handleScroll()
    
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [pathname, items, activeTab])

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className,
      )}
    >
      <div className="flex items-center gap-3 bg-background/5 border border-border backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.name

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-primary",
                isActive && "bg-muted text-primary",
              )}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden">
                <Icon size={18} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-primary/5 rounded-full -z-10"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-t-full">
                    <div className="absolute w-12 h-6 bg-primary/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-primary/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
} 