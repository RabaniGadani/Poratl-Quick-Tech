"use client"

import { useState, useEffect, useRef } from "react"
import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import { Info } from "lucide-react"
import { createClient } from "@/lib/client"

// Import shadcn avatar components
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

// Only include the following fields in StudentProfile
type StudentProfile = {
  full_name: string
  father_name: string
  student_id: string // Student ID (e.g. registration number)
  city: string
  gender: string
  email: string
  currently: string
  avatar: string // store the path in bucket
  rollNo: string // Roll No (e.g. class roll number)
  course: string
  batch: string
}

// Default avatar URL as per instruction
const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png"

export default function ProfilePage() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editProfile, setEditProfile] = useState<StudentProfile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userSupabaseId, setUserSupabaseId] = useState<string | null>(null) // for user_id column
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)
  const [editAvatarUrl, setEditAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const supabase = createClient()

  // Fetch data from supabase table and get avatar public URL from bucket
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          setError(userError.message)
          setLoading(false)
          return
        }
        if (!user) {
          setError("Not logged in")
          setLoading(false)
          return
        }
        setUserId(user.id)
        setUserSupabaseId(user.id) // user.id is the user's unique id in Supabase

        // Fetch student profile from supabase table
        const { data: studentData, error: studentError } = await supabase
          .from("students")
          .select("full_name, father_name, student_id, rollNo, city, gender, email, currently, avatar, course, batch")
          .eq("user_id", user.id)
          .single()

        if (studentError) {
          if (studentError.code === "PGRST116") {
            // No profile yet, set empty
            setProfile({
              full_name: "",
              father_name: "",
              student_id: "",
              rollNo: "",
              city: "",
              gender: "Male",
              email: user.email ?? "",
              currently: "Onsite",
              avatar: "",
              course: "",
              batch: "",
            })
            setAvatarUrl(DEFAULT_AVATAR_URL)
          } else {
            setError(studentError.message)
          }
        } else if (studentData) {
          setProfile({
            full_name: studentData.full_name ?? "",
            father_name: studentData.father_name ?? "",
            student_id: studentData.student_id ?? "",
            rollNo: studentData.rollNo ?? "",
            city: studentData.city ?? "",
            gender: studentData.gender ?? "",
            email: studentData.email ?? "",
            currently: studentData.currently ?? "",
            avatar: studentData.avatar ?? "",
            course: studentData.course ?? "",
            batch: studentData.batch ?? "",
          })

          // If avatar path exists, get public URL from avatars bucket
          if (studentData.avatar) {
            const { data: publicUrlData } = supabase
              .storage
              .from("avatars")
              .getPublicUrl(studentData.avatar)
            if (!publicUrlData?.publicUrl) {
              setAvatarUrl(DEFAULT_AVATAR_URL)
            } else {
              setAvatarUrl(publicUrlData.publicUrl)
            }
          } else {
            setAvatarUrl(DEFAULT_AVATAR_URL)
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data from supabase table")
        setAvatarUrl(DEFAULT_AVATAR_URL)
      }
      setLoading(false)
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When editProfile.avatar changes, update editAvatarUrl from avatars bucket
  useEffect(() => {
    const fetchEditAvatarUrl = async () => {
      if (editProfile && editProfile.avatar) {
        const { data: publicUrlData } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(editProfile.avatar)
        if (!publicUrlData?.publicUrl) {
          setEditAvatarUrl(DEFAULT_AVATAR_URL)
        } else {
          setEditAvatarUrl(publicUrlData.publicUrl)
        }
      } else {
        setEditAvatarUrl(DEFAULT_AVATAR_URL)
      }
    }
    fetchEditAvatarUrl()
    // Only run when editProfile?.avatar changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editProfile?.avatar])

  const handleEditClick = () => {
    if (profile) {
      setEditProfile(profile)
      setEditMode(true)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditProfile((prev) => {
      if (!prev) return null
      // Map form field names to StudentProfile keys
      let key = name
      if (name === "name") key = "full_name"
      if (name === "fatherName") key = "father_name"
      if (name === "rollNo") key = "rollNo"
      if (name === "student_id") key = "student_id"
      if (name === "course") key = "course"
      if (name === "batch") key = "batch"
      return {
        ...prev,
        [key]: value,
      }
    })
  }

  // Handle avatar file upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setAvatarUploading(true)
    setAvatarUploadError(null)
    try {
      // Generate a unique filename for the user
      const fileExt = file.name.split('.').pop()
      const filePath = `${userId}/${Date.now()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          upsert: true,
          cacheControl: "3600",
        })

      if (uploadError) {
        setAvatarUploadError("Failed to upload avatar. " + uploadError.message)
        setAvatarUploading(false)
        return
      }

      // Set the avatar path in editProfile
      setEditProfile((prev) => prev ? { ...prev, avatar: filePath } : prev)
    } catch (err: any) {
      setAvatarUploadError("Failed to upload avatar. " + (err.message || "Unknown error"))
    }
    setAvatarUploading(false)
  }

  // Save handler: update profile data using server action with updateTag
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editProfile || !userId) return
    setLoading(true)
    setError(null)

    try {
      // Import server action dynamically
      const { updateStudentProfile } = await import('@/lib/actions')
      
      // 1. Update using server action (includes updateTag for immediate cache refresh)
      const updateData = {
        full_name: editProfile.full_name,
        father_name: editProfile.father_name,
        student_id: editProfile.student_id,
        rollNo: editProfile.rollNo,
        city: editProfile.city,
        gender: editProfile.gender,
        email: editProfile.email,
        currently: editProfile.currently,
        avatar: editProfile.avatar, // keep avatar path
        course: editProfile.course,
        batch: editProfile.batch,
      }
      
      await updateStudentProfile(userId, updateData)

      // 2. Refresh data from server (cache is already updated via updateTag)
      // Re-fetch to get latest data
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("full_name, father_name, student_id, rollNo, city, gender, email, currently, avatar, course, batch")
        .eq("user_id", userId)
        .single()

      if (studentError && studentError.code !== "PGRST116") {
        throw studentError
      }

      // 3. Update local state with fresh data
      if (studentData) {
        setProfile({
          full_name: studentData.full_name ?? "",
          father_name: studentData.father_name ?? "",
          student_id: studentData.student_id ?? "",
          rollNo: studentData.rollNo ?? "",
          city: studentData.city ?? "",
          gender: studentData.gender ?? "",
          email: studentData.email ?? "",
          currently: studentData.currently ?? "",
          avatar: studentData.avatar ?? "",
          course: studentData.course ?? "",
          batch: studentData.batch ?? "",
        })
      } else {
        setProfile({
          ...editProfile,
        })
      }

      // Update avatarUrl if avatar path changed
      if (editProfile.avatar) {
        const { data: publicUrlData } = supabase
          .storage
          .from("avatars")
          .getPublicUrl(editProfile.avatar)
        if (!publicUrlData?.publicUrl) {
          setAvatarUrl(DEFAULT_AVATAR_URL)
        } else {
          setAvatarUrl(publicUrlData.publicUrl)
        }
      } else {
        setAvatarUrl(DEFAULT_AVATAR_URL)
      }

      setEditMode(false)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setEditMode(false)
  }

  // Logout function
  const handleLogout = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error: logoutError } = await supabase.auth.signOut()
      if (logoutError) {
        setError(logoutError.message)
      } else {
        // Optionally, redirect to login or home page
        window.location.href = "/login"
      }
    } catch (err: any) {
      setError(err.message || "Failed to logout")
    }
    setLoading(false)
  }

  // Helper for AvatarFallback: get initials from name
  function getInitials(name: string | undefined) {
    if (!name) return "ST"
    const parts = name.trim().split(" ")
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "S"
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <MobileDashboardLayout>
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-full max-w-xs md:w-100 ">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden relative">
                <AvatarImage
                  src={avatarUrl || DEFAULT_AVATAR_URL}
                  alt={profile?.full_name || "Student"}
                  className="w-full h-full rounded-full object-cover"
                />
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                  {getInitials(profile?.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{profile?.full_name|| "Student"}</h3>
                {!editMode && !loading && (
                  <button
                    className="text-xs md:text-sm text-blue-600 hover:underline"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 rounded">
              <Info className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
              <span className="text-gray-700 text-sm md:text-base">Info</span>
              <svg
                className="w-3 h-3 md:w-4 md:h-4 ml-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="bg-gray-50 p-4 border-t border-gray-200">
            {loading ? (
              <div className="text-center text-gray-500 text-sm py-8">Loading profile...</div>
            ) : error ? (
              <div className="text-center text-red-500 text-sm py-8">{error}</div>
            ) : editMode && editProfile ? (
              <form className="space-y-3 text-xs md:text-sm" onSubmit={handleSave}>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="picture">Picture</label>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={editAvatarUrl || DEFAULT_AVATAR_URL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border"
                      />
                      <AvatarFallback className="bg-blue-600 text-white font-bold">
                        {getInitials(editProfile.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      className="ml-2 px-2 py-1 bg-gray-200 rounded text-xs hover:bg-gray-300"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? "Uploading..." : "Upload"}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarFileChange}
                      disabled={avatarUploading}
                    />
                  </div>
                </div>
                {avatarUploadError && (
                  <div className="text-xs text-red-500">{avatarUploadError}</div>
                )}
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.full_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="fatherName">S/O</label>
                  <input
                    id="fatherName"
                    name="fatherName"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.father_name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="rollNo">Roll No</label>
                  <input
                    id="rollNo"
                    name="rollNo"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.rollNo}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="student_id">Student ID</label>
                  <input
                    id="student_id"
                    name="student_id"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.student_id}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="course">Course</label>
                  <input
                    id="course"
                    name="course"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.course}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="batch">Batch</label>
                  <input
                    id="batch"
                    name="batch"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.batch}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="city">City</label>
                  <input
                    id="city"
                    name="city"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="gender">Gender</label>
                  <select
                    id="gender"
                    name="gender"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.gender}
                    onChange={handleInputChange}
                  >
                    <option value="male">male</option>
                    <option value="female">female</option>
                    <option value="other">other</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <label className="text-gray-600" htmlFor="currently">Currently</label>
                  <select
                    id="currently"
                    name="currently"
                    className="text-gray-800 border rounded px-1 py-0.5 w-28 text-xs md:text-sm"
                    value={editProfile.currently}
                    onChange={handleInputChange}
                  >
                    <option value="Onsite">Onsite</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-1 px-2 rounded hover:bg-blue-700 transition-colors text-xs"
                    disabled={loading || avatarUploading}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-300 text-gray-700 py-1 px-2 rounded hover:bg-gray-400 transition-colors text-xs"
                    onClick={handleCancel}
                    disabled={loading || avatarUploading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : profile ? (
              <div className="space-y-3 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="text-gray-800">{profile.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">S/O</span>
                  <span className="text-gray-800">{profile.father_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Roll No</span>
                  <span className="text-gray-800">{profile.rollNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Student ID</span>
                  <span className="text-gray-800">{profile.student_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Course</span>
                  <span className="text-gray-800">{profile.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Batch</span>
                  <span className="text-gray-800">{profile.batch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City</span>
                  <span className="text-gray-800">{profile.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gender</span>
                  <span className="text-gray-800">{profile.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="text-gray-800 break-all">{profile.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Currently</span>
                  <span className="text-gray-800">{profile.currently}</span>
                </div>
              </div>
            ) : null}
          
            <button
              className="w-full mt-4 flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors text-sm"
              onClick={handleLogout}
              disabled={loading}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
