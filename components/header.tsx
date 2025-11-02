"use client"

import { useEffect, useState } from "react"
import { Avatar,  AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/client"

const DEFAULT_AVATAR_URL = "https://github.com/shadcn.png"

export default function Header() {
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_URL)

  useEffect(() => {
    const fetchAvatar = async () => {
      const supabase = createClient()
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      // Fetch student row for this user
      const { data: students, error: studentError } = await supabase
        .from("students")
        .select("avatar")
        .eq("user_id", user.id)
        .limit(1)
      if (studentError || !students || students.length === 0) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      const student = students[0]
      if (!student.avatar) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
        return
      }
      // Get public URL from avatars bucket
      const { data: publicUrlData } = supabase
        .storage
        .from("avatars")
        .getPublicUrl(student.avatar)
      if (!publicUrlData?.publicUrl) {
        setAvatarUrl(DEFAULT_AVATAR_URL)
      } else {
        setAvatarUrl(publicUrlData.publicUrl)
      }
    }
    fetchAvatar()
  }, [])

  return (
    <div className="bg-white shadow-sm border-b z-4 stacky fixed top-0 left-0 w-full">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <img src="/Quick%20Tech.png" alt="Quick Tech Logo" className="w-10 h-10" />
          <span className="text-sm text-gray-600 max-w-md">
            <span className="block md:hidden">Quick Tech Institute</span>
            <span className="hidden md:block">
              Quick Tech Institute of Information Technology
            </span>
          </span>
        </div>
        <Avatar>
          <AvatarImage src={avatarUrl} />
        
        </Avatar>
      </div>
    </div>
  )
}
