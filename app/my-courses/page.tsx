"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function MyCoursesPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-6">
        {/* Announcements Button */}
        <div className="flex justify-center mb-8">
          <Link href="/announcements">
            <Button className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 py-2 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Announcements</span>
            </Button>
          </Link>
        </div>

        {/* My Courses Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 text-center mb-12">My Courses</h1>

        {/* Course Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Certified AI, Metaverse, And Web 3.0 Developer & Solopreneur (WMD)
            </h2>

            <div className="mb-4">
              <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                LEARNING
              </span>
            </div>

            <p className="text-gray-600 text-sm mb-6">A one year Web 3.0 and Metaverse Developer program...</p>

            <div className="space-y-2 text-sm text-gray-700 mb-6">
              <div className="flex justify-between">
                <span className="font-medium">Batch:</span>
                <span>Batch 1</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">City:</span>
                <span>Karachi</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Quarter:</span>
                <span>Q3</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Currently:</span>
                <span>Onsite</span>
              </div>
            </div>

            <Link href="/dashboard">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium">
                Open Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
