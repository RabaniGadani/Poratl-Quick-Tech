import MobileDashboardLayout from "@/components/mobile-dashboard-layout"

export default function InfoPage() {
  return (
    <MobileDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold text-blue-800 mb-6">Information</h1>

          <div className="space-y-6">
            {/* Program Information */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Program Information</h2>
              <p className="text-gray-600 text-sm md:text-base">
                Governor Initiative for Artificial Intelligence, Web 3.0 & Metaverse (GOVERNOR INITIATIVE)
              </p>
            </div>

            {/* Contact Information */}
            <div className="border-l-4 border-green-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Contact Information</h2>
              <div className="space-y-2 text-sm md:text-base">
                <p className="text-gray-600">
                  <span className="font-medium">Email:</span> education@governorsindh.com
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Website:</span> www.governorsindh.com
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Address:</span> Governor House Karachi, Sindh, Pakistan
                </p>
              </div>
            </div>

            {/* Important Guidelines */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Important Guidelines</h2>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm md:text-base">
                <li>Regular attendance is mandatory for all students</li>
                <li>Students must complete all assignments on time</li>
                <li>Maintain professional conduct during online lectures</li>
                <li>Keep your student ID card with you at all times</li>
                <li>Check announcements regularly for important updates</li>
              </ul>
            </div>

            {/* Technical Support */}
            <div className="border-l-4 border-purple-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Technical Support</h2>
              <p className="text-gray-600 text-sm md:text-base">
                For technical issues with the portal, please contact our support team at support@governorsindh.com
              </p>
            </div>

            {/* Program Schedule */}
            <div className="border-l-4 border-red-500 pl-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Program Schedule</h2>
              <div className="text-gray-600 text-sm md:text-base">
                <p>
                  <span className="font-medium">Days:</span> Friday
                </p>
                <p>
                  <span className="font-medium">Time:</span> 09:00 AM - 12:00 PM
                </p>
                <p>
                  <span className="font-medium">Location:</span> Governor House Karachi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MobileDashboardLayout>
  )
}
