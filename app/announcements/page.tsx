import MobileDashboardLayout from "@/components/mobile-dashboard-layout"

export default function AnnouncementsPage() {
  const announcements = [
    "Research Symposium Call for Papers",
    "Volunteer Opportunity: Community Cleanup",
    "Career Development Seminar",
    "Student Art Exhibition",
    "Sports Day Registration",
    "Sports Day Registration",
    "Research Symposium Call for Papers",
    "Volunteer Opportunity: Community Cleanup",
    "Career Development Seminar",
    "Student Art Exhibition",
    "Volunteer Opportunity: Community Cleanup",
    "Career Development Seminar",
    "Research Symposium Call for Papers",
    "Sports Day Registration",
    "Student Art Exhibition",
    "Career Development Seminar",
    "Student Art Exhibition",
    "Sports Day Registration",
    "Volunteer Opportunity: Community Cleanup",
  ]

  return (
    <MobileDashboardLayout>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-blue-800 text-center mb-6 md:mb-8">ANNOUNCEMENTS</h1>

        {/* Timeline */}
        <div className="max-w-full md:max-w-2xl mx-auto">
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-3 md:left-4 top-0 bottom-0 w-0.5 bg-blue-400"></div>

            {/* Announcements */}
            <div className="space-y-4 md:space-y-6">
              {announcements.map((announcement, index) => (
                <div key={index} className="relative flex items-center">
                  {/* Timeline Dot */}
                  <div className="absolute left-1.5 md:left-2 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>

                  {/* Date */}
                  <div className="ml-8 md:ml-12 mr-3 md:mr-4 text-xs md:text-sm text-gray-500 w-8 md:w-12 flex-shrink-0">
                    023
                  </div>

                  {/* Announcement Text */}
                  <div className="flex-1 text-sm md:text-base text-gray-700 hover:text-blue-600 cursor-pointer transition-colors">
                    {announcement}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
