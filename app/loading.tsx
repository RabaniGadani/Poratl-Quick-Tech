"use client"
import Image from "next/image"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <Image
        src="/Quick Tech.png"
        alt="QuickTech Logo"
        width={128}
        height={128}
        className="w-24 h-24 mb-6 animate-pulse"
        priority
      />
      <div className="text-blue-700 text-xl font-semibold mb-2">Loading...</div>
      <div className="w-32 h-2 bg-blue-100 rounded-full overflow-hidden">
        <div className="h-2 bg-blue-500 animate-loading-bar rounded-full" style={{ width: "60%" }} />
      </div>
      <style jsx>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 60%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
