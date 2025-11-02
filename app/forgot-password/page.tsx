"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/client"

// Import toast from sonner
import { toast } from "sonner"

async function resetPassword(email: string) {
  const supabase = createClient()
  // This will send a password reset email using Supabase
  // You may want to customize the redirectTo URL for your app
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return { error }
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const { error: resetError } = await resetPassword(email)

      if (resetError) {
        setError(resetError.message || "Failed to send reset email. Please try again.")
        toast.error(resetError.message || "Failed to send reset email. Please try again.")
      } else {
        setSuccess("Password reset email sent! Please check your inbox.")
        toast.success("Password reset email sent! Please check your inbox.")
      }
    } catch (err: any) {
      let errorMessage = "An unexpected error occurred"
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage += ` (${err.message})`
      }
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-6">
        <h1 className="text-2xl font-semibold">Forgot Password</h1>
      </div>
      {/* Form Section */}
      <div className="flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <img
              src="/Quick Tech.png"
              alt="Quick Tech Logo"
              className="w-32 h-32 mx-auto mb-6"
            />
            <h2 className="text-xl font-semibold text-blue-800 leading-tight">
              Quick Tech Institute of Information Technology
              <br />
            </h2>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md opacity-90 z-10">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md opacity-90 z-10">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-cyan-500 font-medium">
                Enter your email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 h-12 border-gray-300 text-gray-700 placeholder-gray-400"
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-50 rounded-full font-medium"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Remembered your password?{" "}
              <Link href="/login" className="text-cyan-500 font-medium hover:underline">
                Back to Login
              </Link>
            </p>
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
