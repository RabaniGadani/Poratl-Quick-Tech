"use client"

import React, { useState, useEffect, useRef } from "react"
import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/client"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

type Result = {
  id: number
  semester: string
  grade: string
  percentile: number
  status: string
}

type Student = {
  id: number
  full_name: string
  student_id: string
  course: string
  batch: string
  email: string
  currently: string
  avatar: string
  // add more fields as needed
}

const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png"

const NAV_TABS = [
  {
    href: "/textbooks",
    bg: "bg-red-100",
    hover: "hover:bg-red-200",
    iconBg: "bg-red-500",
    icon: "📚",
    text: "Text Books",
    textColor: "text-red-700",
  },
  {
    href: "/exam",
    bg: "bg-blue-100",
    hover: "hover:bg-blue-200",
    iconBg: "bg-blue-500",
    icon: "📊",
    text: "Exam Details",
    textColor: "text-blue-700",
  },
  {
    href: "/announcements",
    bg: "bg-red-100",
    hover: "hover:bg-red-200",
    iconBg: "bg-red-500",
    icon: "📢",
    text: "Announcements",
    textColor: "text-red-700",
  },
]

export default function DashboardPage() {
  const [showMore, setShowMore] = useState<{ [key: number]: boolean }>({})
  const [semesterResults, setSemesterResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [studentLoading, setStudentLoading] = useState(true)
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)
  const [user, setUser] = useState<any>(null)

  const supabase = createClient()
  const router = useRouter();


 // ✅ Client-side session check
 useEffect(() => {
  const supabase = createClient()

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/login") // ✅ use router.push for client redirects
      } else {
        setUser(session.user)
        setLoading(false)
      }
    })
  }, [router])



  // Get userId from Supabase auth
  const [userId, setUserId] = useState<string | null>(null)



  useEffect(() => {
    const getUserId = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (data?.user?.id) {
        setUserId(data.user.id)
      } else {
        setUserId(null)
      }
    }
    getUserId()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch from results table
  useEffect(() => {
    if (!userId) return
    const fetchResults = async () => {
      setLoading(true)
      try {
        // Fetch all results for the current user from the results table
        const { data, error } = await supabase
          .from("results")
          .select("*")
          .order("semester", { ascending: true })

        if (error) {
          console.error("Error fetching results:", error.message)
          setSemesterResults([])
        } else {
          // Ensure data is of type Result[]
          setSemesterResults((data as Result[]) || [])
        }
      } catch (err) {
        console.error("Unexpected error fetching results:", err)
        setSemesterResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // Fetch student and avatar public URL
  useEffect(() => {
    if (!userId) return
    const fetchStudentAndAvatar = async () => {
      setStudentLoading(true)
      // Fetch student by user id
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("user_id", userId)
        .single()

      if (error) {
        console.error("Error fetching student:", error.message)
        setStudent(null)
        setAvatarUrl(DEFAULT_AVATAR_URL)
        setStudentLoading(false)
        return
      }

      setStudent(data)
      // Get avatar public URL from Supabase Storage if avatar field exists
      if (data && data.avatar) {
        // Try to get public URL from avatars bucket
        const { data: publicUrlData } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(data.avatar)
        if (publicUrlData?.publicUrl) {
          setAvatarUrl(publicUrlData.publicUrl)
        } else {
          setAvatarUrl(DEFAULT_AVATAR_URL)
        }
      } else {
        setAvatarUrl(DEFAULT_AVATAR_URL)
      }
      setStudentLoading(false)
    }

    fetchStudentAndAvatar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleShowMore = (semester: number) => {
    setShowMore((prev: Record<number, boolean>) => ({
      ...prev,
      [semester]: !prev[semester],
    }))
  }

  // Carousel logic for navigation tabs (small devices)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const tabCount = NAV_TABS.length
  const carouselRef = useRef<HTMLDivElement>(null)

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev === 0 ? tabCount - 1 : prev - 1))
  }

  const handleNext = () => {
    setCarouselIndex((prev) => (prev === tabCount - 1 ? 0 : prev + 1))
  }

  // Scroll to active tab on carouselIndex change (for smoothness)
  useEffect(() => {
    if (carouselRef.current) {
      const tab = carouselRef.current.querySelector<HTMLDivElement>(
        `[data-carousel-tab="${carouselIndex}"]`
      )
      if (tab) {
        tab.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
      }
    }
  }, [carouselIndex])

  return (
    <MobileDashboardLayout>
      <div className="space-y-4">
        {/* Welcome Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-blue-800 ">
            Welcome to Quick Tech Institute
            <br />
            Student Portal
          </h1>
          <p className="text-md text-gray-600 px-4">
            <span className="block sm:hidden">
              You will be able to view lectures<br />anytime online once they are available on portal
            </span>
            <span className="hidden sm:block">
              You will be able to view lectures anytime online once they are available on portal
            </span>
          </p>
        </div>

        {/* Navigation Tabs */}
        {/* Carousel for small devices, normal flex for sm+ */}
        <div>
          <div className="flex items-center justify-center gap-2 py-4 sm:hidden">
            <button
              aria-label="Previous"
              onClick={handlePrev}
              className="p-1"
              type="button"
            >
              <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
            <div
              className="flex gap-3 min-w-0 overflow-x-auto scrollbar-hide justify-center items-center"
              style={{ width: "260px" }}
              ref={carouselRef}
            >
              {NAV_TABS.map((tab, idx) => (
                <Link href={tab.href} passHref key={tab.text}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition min-w-[160px] max-w-[180px] mx-auto
                      ${tab.bg} ${tab.hover}
                      ${carouselIndex === idx ? "ring-3 ring-blue-400" : ""}
                    `}
                    data-carousel-tab={idx}
                    tabIndex={carouselIndex === idx ? 0 : -1}
                  >
                    <div className={`w-4 h-6 ${tab.iconBg} rounded flex items-center justify-center`}>
                      <span className="text-white text-xs">{tab.icon}</span>
                    </div>
                    <span className={`${tab.textColor} font-medium text-sm`}>{tab.text}</span>
                  </div>
                </Link>
              ))}
            </div>
            <button
              aria-label="Next"
              onClick={handleNext}
              className="p-1"
              type="button"
            >
              <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
          {/* Medium+ devices: show all tabs in a row */}
          <div className="hidden sm:flex items-center justify-center gap-2 py-4 overflow-x-auto">
            <ChevronLeft className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <div className="flex gap-3 min-w-max">
              {NAV_TABS.map((tab) => (
                <Link href={tab.href} passHref key={tab.text}>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition
                      ${tab.bg} ${tab.hover}
                    `}
                  >
                    <div className={`w-6 h-6 ${tab.iconBg} rounded flex items-center justify-center`}>
                      <span className="text-white text-xs">{tab.icon}</span>
                    </div>
                    <span className={`${tab.textColor} font-medium text-sm`}>{tab.text}</span>
                  </div>
                </Link>
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading results...</p>
          ) : semesterResults.length === 0 ? (
            <p className="text-center text-gray-500">No results found.</p>
          ) : (
            semesterResults.map((result) => (
              <div className="text-center" key={result.id}>
                <h2 className="text-xl font-bold text-blue-800 mb-2">
                  {result.semester} Result
                </h2>
                <div className="flex justify-center gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Grade:</span> {result.grade}
                  </div>
                  <div>
                    <span className="font-semibold">Percentile:</span> {result.percentile}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="text-cyan-500">{result.status}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Current Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-800 text-center">Current Status</h2>
          <div className="flex flex-col space-y-3">
            <Card className="p-3 bg-green-50 border-green-200 flex-1">
              <div className="flex items-center gap-3">
                {/* Always show avatar image, fallback to default if not present */}
                <Avatar>
                  <AvatarImage src={avatarUrl} />
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs text-gray-600">
                    {studentLoading ? (
                      <div>Loading student info...</div>
                    ) : student ? (
                      <>
                        <div>Name: {student.full_name}</div>
                        <div>Student ID: {student.student_id}</div>
                        <div>Course: {student.course}</div>
                        <div>Batch: {student.batch}</div>
                        <div>Email: {student.email}</div>
                        <div>Currently: {student.currently}</div>
                        {/* Add more student record fields as needed */}
                      </>
                    ) : (
                      <div>No student info found.</div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
