"use client"
import Image from "next/image"

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <Image
        src="/Quick Tech.png"
        alt="QuickTech Logo"
        width={120}
        height={120}
        className="mb-6"
        priority
      />
      <h1 className="text-4xl font-bold text-blue-700 mb-2">Error 44</h1>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-6 text-center max-w-md">
        We couldn't process your request. Please try again or contact support if the problem persists.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Try Again
      </button>
      <div className="mt-8 text-sm text-gray-400">Error code: 44</div>
    </div>
  )
}
