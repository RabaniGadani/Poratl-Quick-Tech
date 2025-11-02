"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/client"
import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileText, CheckCircle } from "lucide-react"

interface Result {
  id: string
  title: string
  semester: string
  subjects: string
  grade: string
  percentile: number
  status: string
  // semester?: string // Uncomment if you want to add semester to the type
}

export default function ExamPage() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(true)




  

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase.from("results").select("*").order("created_at", { ascending: false })
      if (error) {
        console.error("Error fetching results:", error)
      } else {
        setResults(data || [])
      }
      setLoading(false)
    }
    fetchResults()
  }, [])

  return (
    <MobileDashboardLayout>
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Exam Center</h1>
          <p className="text-sm md:text-base text-gray-600">
            View your exam schedule, results, and upcoming assessments
          </p>
        </div>

        {/* Exam Results Section */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Recent Results</h2>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading results...</p>
          ) : results.length === 0 ? (
            <p className="text-gray-500 text-sm">No results available.</p>
          ) : (
            results.map((res) => (
              <Card key={res.id} className={`border-l-4 ${res.status === "Passed" ? "border-l-green-500" : "border-l-red-500"}`}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex flex-col">
                      <CardTitle className="text-base md:text-lg">
                        {res.title || "Untitled Exam"}
                      </CardTitle>
                      <div className="text-xs text-gray-500 flex flex-col sm:flex-row sm:gap-4">
                        <span>
                          Subject: {res.subjects || "N/A"}
                        </span>
                        <span>
                          Semester: {res.semester || "N/A"}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`w-fit ${
                        res.status === "Passed"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {res.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Grade:</span> {res.grade}
                    </div>
                    <div>
                      <span className="font-medium">Percentile:</span> {res.percentile}%
                    </div>
                    <div>
                      <span className="font-medium">Status:</span> {res.status}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Upcoming Exams Section */}
        <div className="space-y-4">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">Upcoming Exams</h2>

          <Card>
            <CardHeader>
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
               Semester-II Exam - Metaverse Development
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Date: March 15, 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Time: 10:00 AM - 12:00 PM</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  View Syllabus
                </Button>
                <Button size="sm" variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Prepared
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exam Guidelines */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base md:text-lg text-blue-800">Exam Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-700 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Arrive 30 minutes before the exam time</li>
              <li>Bring your student ID card and admit card</li>
              <li>Mobile phones are not allowed in the exam hall</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </MobileDashboardLayout>
  )
}
