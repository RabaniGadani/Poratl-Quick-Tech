"use client"

import { useEffect, useState } from "react"
import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import { createClient } from "@/lib/client"

type Lecture = {
  id: string
  title: string
  description: string
  course_name?: string
  video_url?: string
  created_at?: string
}

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    async function fetchLectures() {
      setLoading(true)
      setError(null)
      const { data, error } = await supabase
        .from("lectures")
        .select("*")
        .order("created_at", { ascending: false })
      if (error) {
        setError("Failed to fetch lectures.")
        setLectures([])
      } else {
        setLectures(data || [])
      }
      setLoading(false)
    }
    fetchLectures()
  }, [])

  return (
    <MobileDashboardLayout>
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 md:mb-8">LECTURES</h1>
        {loading ? (
          <div className="text-gray-500">Loading lectures...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : lectures.length === 0 ? (
          <div className="text-gray-500">No lectures found.</div>
        ) : (
          <div className="space-y-6">
            {lectures.map((lecture) => (
              <div key={lecture.id} className="max-w-full md:max-w-md">
                <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
                  <div className="mb-4">
                    <h3 className="text-xs md:text-sm text-gray-500 mb-2">COURSE</h3>
                    <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-2">
                      {lecture.course_name || "Untitled Course"}
                    </h2>
                    <p className="text-xs md:text-sm text-gray-600">{lecture.title}</p>
                    {lecture.description && (
                      <p className="text-xs md:text-sm text-gray-500 mt-2">{lecture.description}</p>
                    )}
                  </div>
                  {lecture.video_url ? (
                    <a
                      href={lecture.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm md:text-base text-center"
                    >
                      VIEW LECTURE
                    </a>
                  ) : (
                    <button
                      className="w-full bg-gray-300 text-gray-600 py-2 px-4 rounded text-sm md:text-base cursor-not-allowed"
                      disabled
                    >
                      No Video Available
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileDashboardLayout>
  )
}




