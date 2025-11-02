"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"
import { createClient } from "@/lib/client"


import { type User } from "@supabase/supabase-js"

// Dynamically import Toaster to avoid chunk load errors
const Toaster = dynamic(() => import("sonner").then((mod) => mod.Toaster), {
  ssr: false,
})

// Statically import toast
import { toast } from "sonner"

type Semester = {
  id: string
  name: string
  description: string
  status: "Completed" | "In Progress" | "Upcoming"
  batch: string | null
  course_id: string
  course_name: string
  city: string | null
  mode: "Onsite" | "Online"
}

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [semesters, setSemesters] = useState<Semester[]>([])

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

  // Fetch user info (optional, for display only)
  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    async function fetchUser() {
      setLoading(true)
      const { data: { user: supabaseUser } } = await supabase.auth.getUser()
      if (isMounted) setUser(supabaseUser)
      setLoading(false)
    }
    fetchUser()
    return () => { isMounted = false }
  }, [])

  // Fetch semesters (always, regardless of auth)
  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    async function fetchSemesters() {
      setLoading(true)
      const { data: semestersData, error: semestersError } = await supabase
        .from("semesters")
        .select("id, name, description, status, batch, city, mode, course_id, courses(name)")
        .order("created_at", { ascending: true })

      if (semestersError) {
        toast.error?.("Could not fetch semesters.")
        setLoading(false)
        return
      }

      const mappedSemesters: Semester[] = (semestersData || []).map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        status: s.status,
        batch: s.batch,
        course_id: s.course_id,
        course_name: s.courses?.name || "",
        city: s.city,
        mode: s.mode,
      }))

      if (isMounted) setSemesters(mappedSemesters)
      setLoading(false)
    }
    fetchSemesters()
    return () => { isMounted = false }
  }, [])

  const handleOpenPortal = (semesterName: string) => {
    if (user) {
      router.push(`/dashboard?semester=${encodeURIComponent(semesterName)}`)
    } else if (loading) {
      toast.info?.("User information is still loading. Please wait a moment and try again.")
    } else {
      toast.error?.("You are not authorized to access this course portal.")
      // No redirect, just show error
    }
  }

  // While loading, show spinner
  if (loading) {
    return (
      <>
        <Toaster />
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-500">Loading...</div>
        </div>
      </>
    )
  }

  // Always render, even if not logged in
  return (
    <>
      <main>
        <Toaster />
        <Header />

        <div className="p-6 mt-16">
          {/* Announcements */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">📢</span>
            </div>
            <span className="text-red-700 font-medium">Announcements</span>
          </div>
          {/* Contact Information */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-700">Email:</span>
              <a href="mailto:info@quicktech.edu" className="text-blue-600 underline">info@quicktech.com</a>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium text-gray-700">Cell No:</span>
              <a href="tel:+1234567890" className="text-blue-600 underline">+92 21 1234 5678</a>
            </div>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">My Semesters</h1>

          {/* Semester Cards */}
          <div className="flex flex-col items-center gap-8">
            {semesters && semesters.length === 0 ? (
              <div className="text-gray-500">
                No semesters found for your course.
                <br />
                <div className="flex gap-4 mt-4">
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2"
                    onClick={async () => {
                      // Logout reference: sign out and redirect to login
                      const { createClient } = await import("@/lib/client");
                      const supabase = createClient();
                      await supabase.auth.signOut();
                      window.location.href = "/login";
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
                    </svg>
                    Logout
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition flex items-center gap-2"
                    onClick={() => window.location.reload()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M20 20v-5h-.581M5.42 19A9 9 0 1021 12.003M19.418 7A9 9 0 005 12.003" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              semesters.map((semester) => (
                <Card key={semester.id} className="w-full max-w-sm bg-white shadow-lg">
                  <div className="p-6 text-center space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800 leading-tight">
                      {semester.name}  {semester.course_name}
                    </h2>

                    <div className="inline-block">
                      <span
                        className={`${
                          semester.status === "In Progress"
                            ? "bg-green-500"
                            : semester.status === "Completed"
                            ? "bg-yellow-500"
                            : "bg-gray-400"
                        } text-white px-3 py-1 rounded text-sm font-medium`}
                      >
                        {semester.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">{semester.description}</p>

                    <div className="space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Batch:</span> {semester.batch || "-"}{" "}
                        <span className="font-medium">Course:</span> {semester.course_name}{" "}
                        <span className="font-medium">City:</span> {semester.city || "-"}{" "}
                      </div>
                      <div>
                        <span className="font-medium">Currently:</span> {semester.mode}
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center"
                      onClick={() => handleOpenPortal(semester.name)}
                      disabled={loading || !user || semester.status === "Completed"}
                    >
                      {loading ? (
                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                        </svg>
                      ) : null}
                      {loading ? "Loading..." : "Open Portal"}
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
          
        </div>
        
      </main>
      
    </>
  )
}
