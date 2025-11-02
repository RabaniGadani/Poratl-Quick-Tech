
'use client'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGetStarted = async (e: React.MouseEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate a short delay for UX, or you could remove this if not needed
    setTimeout(() => {
      router.push("/login")
    }, 200)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-6">
        <h1 className="text-2xl font-semibold">Student Portal</h1>
      </div>
      {/* Main Content */}
      <div className="flex items-center justify-center flex-1 p-4">
        <div className="text-center space-y-8">
          <h1 className="text-4xl font-bold text-gray-800">Welcome to Quick Tech Institute</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Access your student portal to view courses, results, and announcements
          </p>
          {/* Logo Picture */}
          <div className="flex justify-center">
            <Image
              src="/Quick Tech.png"
              alt="Funder"
              width={120}
              height={120}
              className="rounded-full mx-auto shadow-lg"
              priority
            />
          </div>
          <div className="space-y-4">
            <Button
              className="w-full mb-2 max-w-xs bg-blue-600 hover:bg-blue-700"
              onClick={handleGetStarted}
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Get Started
                </span>
              ) : (
                "Get Started"
              )}
            </Button>
            <Link href="/register" passHref>
              <Button
                className="w-full max-w-xs bg-green-600 hover:bg-green-700"
                variant="secondary"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-500 text-center py-4 border-t">
      Powered by <Link href="https://www.facebook.com/gadani.baloch.98/" className="underline"> Gadani Essa Baloch </Link>
      </footer>
    </div>
  )
}
