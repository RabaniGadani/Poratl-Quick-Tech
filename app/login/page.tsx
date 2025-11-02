"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EyeOff, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/client"

// Import toast
import { toast } from "react-hot-toast"

async function login(email: string, password: string) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}
// --- End login function ---

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });
  }, [router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const { data, error } = await login(email, password)
      if (error) {
        setError(error.message || "Login failed")
        toast.error(error.message || "Login failed")
        setLoading(false)
        return
      }
      // Success
      toast.success("Login successful!")
      // Optionally redirect to intended page
      const redirectedFrom = searchParams.get("redirectedFrom")
      setTimeout(() => {
        router.push(redirectedFrom || "/courses")
      }, 500)
    } catch (err: any) {
      setError("An unexpected error occurred")
      toast.error("An unexpected error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-6">
        <h1 className="text-2xl font-semibold">Student Login</h1>
      </div>
      {/* Sign In Form */}
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

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm opacity-90 z-10">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6">
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

            <div className="text-right">
              <Link href="/forgot-password" className="text-gray-600 text-sm hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-transparent border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-50 rounded-full font-medium"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="text-center mt-4">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan-500 font-medium hover:underline">
                Register here
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
