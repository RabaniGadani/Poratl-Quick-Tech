import MobileDashboardLayout from "@/components/mobile-dashboard-layout"
import { BookOpen, Download, Eye } from "lucide-react"

export default function TextBooksPage() {
  // You can keep the textbooks array for future use, but for now, we show "Coming Soon"
  // const textbooks = [ ... ]

  return (
    <MobileDashboardLayout>
      <div className="space-y-4 md:space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="mb-4 md:mb-6 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Text Books</h1>
          <p className="text-sm md:text-base text-gray-600">Access your course textbooks and reading materials</p>
        </div>
        <div className="flex flex-col items-center justify-center w-full">
          <span className="inline-block px-6 py-4 bg-yellow-100 text-yellow-800 text-lg font-semibold rounded-lg shadow-md border border-yellow-200">
            📚 Coming Soon
          </span>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
