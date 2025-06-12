"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import {
  AlertTriangle,
  BarChart2,
  Calendar,
  FileText,
  LayoutDashboard,
  LogOut,
  Settings,
  Smartphone,
  Users,
  Briefcase,
  Menu,
  X,
  Watch,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useIsMobile } from "@/components/responsive-utils"
import { useAuth } from "@/components/auth-provider"

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  // Close sidebar when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener("keydown", handleEscape)
    return () => window.removeEventListener("keydown", handleEscape)
  }, [])

  const mainNavItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      color: "text-blue-500",
      active: "bg-blue-500/10 text-blue-500",
      hover: "hover:bg-blue-500/10 hover:text-blue-500",
    },
    {
      title: "My Records",
      href: "/records",
      icon: FileText,
      color: "text-teal-500",
      active: "bg-teal-500/10 text-teal-500",
      hover: "hover:bg-teal-500/10 hover:text-teal-500",
    },
    {
      title: "Health Analytics",
      href: "/analytics",
      icon: BarChart2,
      color: "text-yellow-500",
      active: "bg-yellow-500/10 text-yellow-500",
      hover: "hover:bg-yellow-500/10 hover:text-yellow-500",
    },
    {
      title: "Family Vault",
      href: "/family",
      icon: Users,
      color: "text-green-500",
      active: "bg-green-500/10 text-green-500",
      hover: "hover:bg-green-500/10 hover:text-green-500",
    },
    {
      title: "Appointments",
      href: "/appointments",
      icon: Calendar,
      color: "text-pink-500",
      active: "bg-pink-500/10 text-pink-500",
      hover: "hover:bg-pink-500/10 hover:text-pink-500",
    },
    {
      title: "SmartWatch",
      href: "/smartwatch",
      icon: Watch,
      color: "text-purple-500",
      active: "bg-purple-500/10 text-purple-500",
      hover: "hover:bg-purple-500/10 hover:text-purple-500",
    },
    {
      title: "AI Assistant",
      href: "/assistant",
      icon: Briefcase,
      color: "text-orange-500",
      active: "bg-orange-500/10 text-orange-500",
      hover: "hover:bg-orange-500/10 hover:text-orange-500",
    },
  ]

  // If no user is logged in, don't render the sidebar
  if (!user) {
    return null
  }

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-primary-foreground p-2 rounded-md shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-200"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative flex flex-col w-64 border-r bg-background z-50",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded bg-blue-600 text-white font-bold">M</div>
            <span className="text-xl font-semibold text-blue-500">MediKey</span>
          </Link>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileOpen(false)}>
            <X size={18} />
          </Button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="grid gap-1 px-2">
            {mainNavItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href ? item.active : "text-muted-foreground",
                  item.hover,
                )}
              >
                <item.icon className={cn("h-5 w-5", pathname === item.href ? item.color : "")} />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-auto">
          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold tracking-tight uppercase text-muted-foreground">
              EMERGENCY ACCESS
            </h3>
            <Link
              href="/emergency"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/emergency" ? "bg-red-500/10 text-red-500" : "text-red-500",
                "hover:bg-red-500/10 hover:text-red-400",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
              Emergency Mode
              <span className="sr-only">Emergency Mode</span>
            </Link>
            <div className="px-4 py-1 text-xs text-muted-foreground">
              Instant access to vital information for emergency personnel
            </div>
          </div>

          <div className="px-3 py-2">
            <h3 className="mb-2 px-4 text-xs font-semibold tracking-tight uppercase text-muted-foreground">
              MOBILE ACCESS
            </h3>
            <Link
              href="/mobile-access"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                pathname === "/mobile-access" ? "bg-blue-500/10 text-blue-500" : "text-blue-500",
                "hover:bg-blue-500/10 hover:text-blue-400",
              )}
            >
              <Smartphone className="h-5 w-5" />
              Access on Phone
              <span className="sr-only">Access on Phone</span>
            </Link>
            <div className="px-4 py-1 text-xs text-muted-foreground">Scan QR code to use MediKey on your phone</div>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                {user.profileImage ? (
                  <AvatarImage src={user.profileImage || "/placeholder.svg"} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.initial || user.name.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <Link href="/auth/signout">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground flex items-center gap-1"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign out
                  </Button>
                </Link>
              </div>
              <Link href="/profile" className="ml-auto">
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
