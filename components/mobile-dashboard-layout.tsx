"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, User, CreditCard, Monitor, BookOpen, FileText, Megaphone, LogOut, Menu, X } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"

import { useIsMobile } from "@/hooks/use-mobile"
import Footer from "@/components/footer"
import { createClient } from "@/lib/client"

interface MobileDashboardLayoutProps {
  children: React.ReactNode
}

const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png"

export default function MobileDashboardLayout({ children }: MobileDashboardLayoutProps) {
  const [showProfile, setShowProfile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const router = useRouter()

  // Fetch avatar from students table
  useEffect(() => {
    const fetchAvatar = async () => {
      const supabase = createClient()
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      // Fetch student row for this user
      const { data: students, error: studentError } = await supabase
        .from("students")
        .select("avatar")
        .eq("user_id", user.id)
        .limit(1)
      if (studentError || !students || students.length === 0) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      const student = students[0]
      if (!student.avatar) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      // Get public URL from avatars bucket
      const { data: publicUrlData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(student.avatar)
      if (!publicUrlData?.publicUrl) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
      } else {
        setAvatarUrl(publicUrlData.publicUrl)
      }
    }
    fetchAvatar()
  }, [])

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Get Student Card", href: "/student-card", icon: CreditCard },
    { name: "Online Lectures", href: "/lectures", icon: Monitor },
    { name: "Text Books", href: "/textbooks", icon: BookOpen },
    { name: "Exam", href: "/exam", icon: FileText },
    { name: "Announcements", href: "/announcements", icon: Megaphone },
  ]

  // Fix redirect route: Only redirect to /dashboard if user is on root ("/")
  useEffect(() => {
    if (pathname === "/") {
      router.replace("/dashboard")
    }
  }, [pathname, router])

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-md hover:bg-gray-100 md:hidden"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            {/* Logo */}
            <img src="/Quick%20Tech.png" alt="Quick Tech Logo" className="w-8 h-8 md:w-10 md:h-10" />
            <span className="text-md md:text-sm text-gray-600 max-w-xs md:max-w-md truncate sm:max-w-md hidden sm:block">
              Quick Tech Institute of Information Technology
            </span>
            {/* on small device */}
            <div className="block sm:hidden text-md text-gray-600 max-w-xs truncate">
              Quick Tech Institute
            </div>
          </div>
          {/* Profile Picture Button */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-300 relative flex-shrink-0 overflow-hidden flex items-center justify-center"
          >
            <Avatar>
              <AvatarImage src={avatarUrl} />
             
            </Avatar>
          </button>
        </div>
      </div>

      <div className="flex relative flex-1">
        {/* Mobile Sidebar Overlay */}
        {isMobile && showMobileMenu && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)}>
            <div className="w-64 bg-blue-800 h-full text-white" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-blue-700">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">Menu</span>
                  <button onClick={() => setShowMobileMenu(false)}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setShowMobileMenu(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.name}</span>
                    </Link>
                  )
                })}
              </nav>

              {/* Mobile Sidebar Menu Items */}
              <div className="px-4 py-2 border-t border-blue-700 mt-4">
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-3 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg w-full text-left text-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </Link>
        
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div className="w-64 bg-blue-800 min-h-[calc(100vh-73px)] text-white">
            <nav className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? "bg-blue-700 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Desktop Sidebar Menu Items */}
            <div className="px-4 py-2 border-t border-blue-700 mt-4">
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="flex items-center gap-3 px-3 py-2 text-blue-100 hover:bg-blue-700 hover:text-white rounded-lg w-full text-left text-sm"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Link>
                
               
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 relative">
          <div className="p-4 md:p-6">
            {/* Always render dashboard page content on all devices */}
            {children}
          </div>

        
        </div>
      </div>

      <div className="mt-8" />
      <Footer />
    </div>
  )
}
