"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { EyeOff, Eye } from "lucide-react"
import { createClient } from "@/lib/client"

// --- Toast utility (simple) ---
function showToast(message: string, type: "success" | "error" = "success") {
  // Remove any existing toast
  const existing = document.getElementById("custom-toast")
  if (existing) existing.remove()

  const toast = document.createElement("div")
  toast.id = "custom-toast"
  toast.className = `fixed top-6 right-6 z-[9999] px-6 py-4 rounded shadow-lg text-white font-semibold text-base transition-all duration-300 ${
    type === "success"
      ? "bg-green-600 border border-green-700"
      : "bg-red-600 border border-red-700"
  }`
  toast.innerText = message

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => {
      toast.remove()
    }, 400)
  }, 3000)
}

// --- Check if user exists by email (including Gmail) ---
async function userExists(email: string) {
  const supabase = createClient()
  // Helper to get gmail variant
  function getGmailVariant(email: string) {
    if (email.toLowerCase().endsWith("@gmail.com")) return email.toLowerCase()
    const username = email.split("@")[0]
    return `${username}@gmail.com`
  }

  let found = false
  let errorMsg = ""
  try {
    let { data: regData } = await supabase
      .from("registered_students")
      .select("email")
      .or(`email.eq.${email},email.eq.${getGmailVariant(email)}`)
      .maybeSingle()
    if (regData && regData.email) {
      found = true
    }
    if (!found) {
      let { data: stuData } = await supabase
        .from("students")
        .select("email")
        .or(`email.eq.${email},email.eq.${getGmailVariant(email)}`)
        .maybeSingle()
      if (stuData && stuData.email) {
        found = true
      }
    }
  } catch (err: any) {
    errorMsg = err?.message || "Error checking user existence"
  }
  return { exists: found, error: errorMsg }
}

// --- SignUp function (calls Supabase signUp) ---
async function SignUp(email: string, password: string, options?: any) {
  const supabase = createClient()
  const { exists, error } = await userExists(email)
  if (error) {
    return { data: null, error: { message: error } }
  }
  if (exists) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return { data: null, error: { message: "User already exists. Please log in." } }
  }
  return await supabase.auth.signUp({
    email,
    password,
    ...options,
  })
}

// --- Sinup function (wrapper for signUp) ---
async function Sinup(email: string, password: string, options?: any) {
  return await SignUp(email, password, options)
}

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.")
      showToast("Please fill in all fields.", "error")
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      showToast("Passwords do not match.", "error")
      setLoading(false)
      return
    }

    try {
      const { data, error: signUpError } = await Sinup(email, password)

      if (signUpError) {
        let errorMessage = signUpError.message || "Sign up failed. Please try again."
        setError(errorMessage)
        showToast(errorMessage, "error")
        console.error("Supabase signUp error:", signUpError)
        setLoading(false)
        return
      }

      setSuccess("Sign up successful! Please check your email to confirm your account.")
      showToast("Sign up successful! Please check your email to confirm your account.", "success")
      console.log("Supabase signUp response:", data)

      setEmail("")
      setPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      let errorMessage = "An unexpected error occurred during sign up. Please try again."
      if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
        errorMessage += ` (${err.message})`
      }
      setError(errorMessage)
      showToast(errorMessage, "error")
      console.error("Unexpected signUp exception:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-6">
        <h1 className="text-2xl font-semibold">Student Registration</h1>
      </div>
      {/* Sign Up Form */}
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

          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-cyan-500 font-medium">
                Email
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

            <div>
              <Label htmlFor="password" className="text-cyan-500 font-medium">
                Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-gray-300 text-gray-700 placeholder-gray-400 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="text-cyan-500 font-medium">
                Confirm Password
              </Label>
              <div className="relative mt-2">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 border-gray-300 text-gray-700 placeholder-gray-400 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
            // Removed invalid prop 'disable'
              type="submit"
              className="w-full h-12 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-50 rounded-full font-medium"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan-500 font-medium hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white text-gray-500 text-center py-4 border-t">
        Powered by <a href="https://www.facebook.com/gadani.baloch.98/" className="underline"> Gadani Essa Baloch </a>
      </footer>
    </div>
  )
}
